#include "config.hxx"

#include <ArduinoJson.h>
#include <esp_log.h>
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>
#include <nvs.h>

#include <cstring>

#include "guard.hxx"
#include "lock.hxx"

#define TAG "cfg"

namespace {

constexpr size_t JSON_DOC_SIZE = 2 * 1024;

const char* NVS_NAMESPACE = "rfkit";
const char* NVS_KEY_CONFIG = "config";
const char* NVS_KEY_NEXT_ID = "next_id";

SemaphoreHandle_t nvsMutex{nullptr};

config::Config currentConfig;
bool configInitialized{false};

bool isEmpty(const char* str) {
    if (!str) {
        return true;
    }

    int i = 0;
    while (true) {
        switch (str[i++]) {
            case '\t':
            case '\n':
            case '\r':
            case ' ':
                continue;

            case '\0':
                return true;

            default:
                return false;
        }
    };
}

bool isValidId(uint32_t id) {
    if (id == 0 || !configInitialized) return true;
    if (id == 1) return false;

    for (const auto& swtch : currentConfig.getSwitches()) {
        if (swtch.getId() == id) return true;
    }

    return false;
}

}  // namespace

namespace config {

const char* Config::getName() const { return name; }

const char* Config::getHostname() const { return hostname; }

const char* Config::getManufacturer() const { return manufacturer; }

const char* Config::getSerial() const { return serial; }

const char* Config::getModel() const { return model; }

const char* Config::getRevision() const { return revision; }

const std::vector<Switch>& Config::getSwitches() const { return switches; }

String Config::serialize() const {
    DynamicJsonDocument json(JSON_DOC_SIZE);

    json["name"] = (const char*)name;
    json["hostname"] = (const char*)hostname;
    json["manufacturer"] = (const char*)manufacturer;
    json["serial"] = (const char*)serial;
    json["model"] = (const char*)model;
    json["revision"] = (const char*)revision;

    JsonArray serializedSwitches = json.createNestedArray("switches");
    for (const auto& swtch : switches) {
        JsonObject serializedSwitch = serializedSwitches.createNestedObject();

        serializedSwitch["name"] = (const char*)swtch.name;
        serializedSwitch["on"] = (const char*)swtch.codeOn;
        serializedSwitch["off"] = (const char*)swtch.codeOff;

        if (swtch.pulseLength > 0) {
            serializedSwitch["pulseLength"] = swtch.pulseLength;
        }

        if (swtch.protocol > 0) {
            serializedSwitch["protocol"] = swtch.protocol;
        }

        if (swtch.repeat > 0) {
            serializedSwitch["repeat"] = swtch.repeat;
        }

        serializedSwitch["id"] = swtch.id;
    }

    String result;
    serializeJson(json, result);

    return result;
}

bool Config::deserializeFrom(char* buffer, size_t size) {
    DynamicJsonDocument json(JSON_DOC_SIZE);

    if (deserializeJson(json, buffer, size) != DeserializationError::Ok) {
        return false;
    }

    if (isEmpty(json["name"].as<const char*>()) || isEmpty(json["hostname"].as<const char*>()) ||
        isEmpty(json["manufacturer"].as<const char*>()) || isEmpty(json["serial"].as<const char*>()) ||
        isEmpty(json["model"].as<const char*>()) || isEmpty(json["revision"].as<const char*>())) {
        ESP_LOGE(TAG, "invalid JSON: required field missing");

        return false;
    }

    JsonArray serializedSwitches = json["switches"].as<JsonArray>();
    if (serializedSwitches.isNull()) {
        ESP_LOGE(TAG, "invalid JSON: switches is not an array");

        return false;
    }

    if (serializedSwitches.size() > MAX_SWITCHES) {
        ESP_LOGE(TAG, "invalid JSON: too many switches");

        return false;
    }

    for (const auto& serializedSwitch : serializedSwitches) {
        if (isEmpty(serializedSwitch["name"].as<const char*>()) || isEmpty(serializedSwitch["on"].as<const char*>()) ||
            isEmpty(serializedSwitch["off"].as<const char*>())) {
            ESP_LOGE(TAG, "invalid JSON: switch is missing a required field");
            return false;
        }
    }

    for (auto s1 = serializedSwitches.begin(); s1 != serializedSwitches.end(); ++s1) {
        uint32_t id1 = (*s1)["id"].as<uint32_t>();

        if (!isValidId(id1)) {
            ESP_LOGE(TAG, "invalid JSON: invalid switch ID %u", id1);

            return false;
        }

        auto s2 = s1;
        ++s2;

        for (; s2 != serializedSwitches.end(); ++s2) {
            if (strcmp((*s1)["name"].as<const char*>(), (*s2)["name"].as<const char*>()) == 0) {
                ESP_LOGE(TAG, "invalid JSON: duplicate switch name %s", (*s1)["name"].as<const char*>());

                return false;
            }

            if (id1 != 0 && id1 == (*s2)["id"].as<uint32_t>()) {
                ESP_LOGE(TAG, "invalid JSON: duplicate switch ID %u", id1);
            }
        }
    }

    name = json["name"].as<const char*>();
    hostname = json["hostname"].as<const char*>();
    manufacturer = json["manufacturer"].as<const char*>();
    serial = json["serial"].as<const char*>();
    model = json["model"].as<const char*>();
    revision = json["revision"].as<const char*>();

    switches.resize(serializedSwitches.size());

    int iSwitch = 0;
    for (const auto& serializedSwitch : serializedSwitches) {
        Switch swtch;

        swtch.name = serializedSwitch["name"].as<const char*>();
        swtch.codeOn = serializedSwitch["on"].as<const char*>();
        swtch.codeOff = serializedSwitch["off"].as<const char*>();
        swtch.pulseLength = serializedSwitch["pulseLength"].as<uint32_t>();
        swtch.protocol = serializedSwitch["protocol"].as<uint32_t>();
        swtch.repeat = serializedSwitch["repeat"].as<uint32_t>();
        swtch.id = serializedSwitch["id"].as<uint32_t>();

        switches[iSwitch++] = swtch;
    }

    return true;
}

bool Config::assignIds() {
    Lock lock(nvsMutex);

    nvs_handle handle;
    if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK) {
        ESP_LOGE(TAG, "failed to open NVS namespace");
        return false;
    }

    Guard closeNvsGuard([=] { nvs_close(handle); });

    uint32_t nextId;
    if (nvs_get_u32(handle, NVS_KEY_NEXT_ID, &nextId) != ESP_OK) {
        nextId = 2;
    }

    const uint32_t nextIdInitial = nextId;

    for (auto& swtch : switches) {
        const uint32_t id = swtch.getId();

        if (id == 0 || id >= nextId) swtch.setId(nextId++);
    }

    if (nextId != nextIdInitial) {
        if (nvs_set_u32(handle, NVS_KEY_NEXT_ID, nextId) != ESP_OK || nvs_commit(handle) != ESP_OK) {
            ESP_LOGE(TAG, "failed to write next ID to NVS");
        }

        return true;
    }

    return false;
}

const char* Switch::getName() const { return name; }

const char* Switch::getCodeOn() const { return codeOn; }

const char* Switch::getCodeOff() const { return codeOff; }

uint32_t Switch::getProtocol() const { return protocol; }

uint32_t Switch::getPulseLength() const { return pulseLength; }

uint32_t Switch::getRepeat() const { return repeat; }

uint32_t Switch::getId() const { return id; }

void Switch::setId(uint32_t id) { this->id = id; }

char* load(size_t& size) {
    Lock lock(nvsMutex);

    nvs_handle handle;
    if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK) {
        ESP_LOGE(TAG, "failed to open NVS namespace");
        return nullptr;
    }

    Guard closeNvsGuard([=] { nvs_close(handle); });

    if (nvs_get_blob(handle, NVS_KEY_CONFIG, nullptr, &size) != ESP_OK) {
        return nullptr;
    }

    void* buffer = malloc(size);
    if (!buffer) {
        ESP_LOGE(TAG, "failed to allocate buffer for reading from NVS");
        return nullptr;
    }

    if (nvs_get_blob(handle, NVS_KEY_CONFIG, buffer, &size) != ESP_OK) {
        free(buffer);
        return nullptr;
    }

    return (char*)buffer;
}

void save(const Config& config) {
    String serializedConfig = config.serialize();

    Lock lock(nvsMutex);

    nvs_handle handle;
    if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK) {
        ESP_LOGE(TAG, "failed to open NVS namespace");
        return;
    }

    Guard closeNvsGuard([=] { nvs_close(handle); });

    if (nvs_set_blob(handle, NVS_KEY_CONFIG, serializedConfig.c_str(), serializedConfig.length()) != ESP_OK ||
        nvs_commit(handle) != ESP_OK) {
        ESP_LOGE(TAG, "failed to write config");
        return;
    }
}

void init() {
    nvsMutex = xSemaphoreCreateMutex();

    size_t serializedConfigSize;
    char* serializedConfig = load(serializedConfigSize);

    if (serializedConfig) {
        ::currentConfig.deserializeFrom(serializedConfig, serializedConfigSize);
    }

    if (::currentConfig.assignIds()) {
        save(::currentConfig);
    }

    configInitialized = true;
}

const Config& currentConfig() { return ::currentConfig; }

}  // namespace config
