#include "Config.h"

#include <ArduinoJson.h>

void Config::load() {
    name = "rfkit device";
    hostname = "rfkit";
}

Config::Config() : switches(1) {
    switches[0].codeOn = "000FFFF0FFFFS";
    switches[0].codeOff = "000FFFF0FFF0S";
    switches[0].name = "Nachtischlampe";
    switches[0].pulseLength = 350;
    switches[0].protocol = 1;
    switches[0].repeat = 10;
}

const char* Config::getName() const { return name.c_str(); }

const char* Config::getHostname() const { return hostname.c_str(); }

String Config::serialize() {
    DynamicJsonDocument doc(JSON_DOC_SIZE);

    doc["name"] = name;
    doc["hostname"] = hostname;

    JsonArray serializedSwitches = doc.createNestedArray("switches");
    for (const auto& swtch : switches) {
        JsonObject serializedSwitch = serializedSwitches.createNestedObject();

        serializedSwitch["name"] = swtch.name;
        serializedSwitch["on"] = swtch.codeOn;
        serializedSwitch["off"] = swtch.codeOff;

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
    serializeJson(doc, result);

    return result;
}

bool Config::deserializeFrom(JsonVariant& data) {
    Config config;

    const char* name = data["name"];
    const char* hostname = data["hostname"];

    if (name == nullptr || hostname == nullptr) {
        return false;
    }

    config.name = name;
    config.hostname = hostname;

    JsonArray serializedSwitches = data["switches"].as<JsonArray>();
    if (serializedSwitches.isNull()) {
        return false;
    }

    config.switches.resize(serializedSwitches.size());

    int iSwitch = 0;
    for (const auto& serializedSwitch : serializedSwitches) {
        Switch swtch;

        if (!serializedSwitch["name"].is<const char*>() || !serializedSwitch["on"].is<const char*>() ||
            !serializedSwitch["off"].is<const char*>()) {
            return false;
        }

        swtch.name = serializedSwitch["name"].as<const char*>();
        swtch.codeOn = serializedSwitch["on"].as<const char*>();
        swtch.codeOff = serializedSwitch["off"].as<const char*>();
        swtch.pulseLength = serializedSwitch["pulseLength"].as<uint32_t>();
        swtch.protocol = serializedSwitch["protocol"].as<uint32_t>();
        swtch.repeat = serializedSwitch["repear"].as<uint32_t>();

        config.switches[iSwitch++] = swtch;
    }

    *this = config;
    return true;
}

Config& Config::operator=(const Config& in) {
    name = in.name;
    hostname = in.hostname;

    switches.resize(in.switches.size());
    for (int i = 0; i < switches.size(); i++) {
        switches[i] = in.switches[i];
    }

    return *this;
}
