#include "config.hxx"

#include <ArduinoJson.h>
#include <FreeRTOS.h>
#include <esp_log.h>
#include <freertos/semphr.h>
#include <nvs.h>

#include <cstring>

#include "guard.hxx"
#include "lock.hxx"

#define TAG "cfg"

namespace {

const char* NVS_NAMESPACE = "rfkit";
const char* NVS_KEY = "config";

SemaphoreHandle_t nvsMutex{nullptr};

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

}  // namespace

const char* Config::getName() const { return name; }

const char* Config::getHostname() const { return hostname; }

const char* Config::getManufacturer() const { return manufacturer; }

const char* Config::getSerial() const { return serial; }

const char* Config::getModel() const { return model; }

const char* Config::getRevision() const { return revision; }

const std::vector<Config::Switch>& Config::getSwitches() const { return switches; }

String Config::serialize() {
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
        return false;
    }

    JsonArray serializedSwitches = json["switches"].as<JsonArray>();
    if (serializedSwitches.isNull()) {
        return false;
    }

    for (const auto& serializedSwitch : serializedSwitches) {
        if (isEmpty(serializedSwitch["name"].as<const char*>()) || isEmpty(serializedSwitch["on"].as<const char*>()) ||
            isEmpty(serializedSwitch["off"].as<const char*>())) {
            return false;
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

        switches[iSwitch++] = swtch;
    }

    return true;
}

char* Config::load(size_t& size) {
    if (!nvsMutex) {
        nvsMutex = xSemaphoreCreateMutex();
    }
    Lock lock(nvsMutex);

    nvs_handle handle;
    if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK) {
        ESP_LOGE(TAG, "failed to open NVS namespace");
        return nullptr;
    }

    Guard closeNvsGuard([=] { nvs_close(handle); });

    if (nvs_get_blob(handle, NVS_KEY, nullptr, &size) != ESP_OK) {
        return nullptr;
    }

    void* buffer = malloc(size);
    if (!buffer) {
        ESP_LOGE(TAG, "failed to allocate buffer for reading from NVS");
        return nullptr;
    }

    if (nvs_get_blob(handle, NVS_KEY, buffer, &size) != ESP_OK) {
        free(buffer);
        return nullptr;
    }

    return (char*)buffer;
}

void Config::save(const char* serializedData, size_t size) {
    if (!nvsMutex) {
        nvsMutex = xSemaphoreCreateMutex();
    }

    Lock lock(nvsMutex);

    nvs_handle handle;
    if (nvs_open(NVS_NAMESPACE, NVS_READWRITE, &handle) != ESP_OK) {
        ESP_LOGE(TAG, "failed to open NVS namespace");
        return;
    }

    Guard closeNvsGuard([=] { nvs_close(handle); });

    if (nvs_set_blob(handle, NVS_KEY, serializedData, size) != ESP_OK || nvs_commit(handle) != ESP_OK) {
        ESP_LOGE(TAG, "failed to write config");
        return;
    }
}

const char* Config::Switch::getName() const { return name; }

const char* Config::Switch::getCodeOn() const { return codeOn; }

const char* Config::Switch::getCodeOff() const { return codeOff; }

uint32_t Config::Switch::getProtocol() const { return protocol; }

uint32_t Config::Switch::getPulseLength() const { return pulseLength; }

uint32_t Config::Switch::getRepeat() const { return repeat; }
