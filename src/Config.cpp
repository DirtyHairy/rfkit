#include "Config.h"

#include <ArduinoJson.h>

void Config::load() {
    name = "rfkit device";
    hostname = "rfkit";
}

const char* Config::getName() const { return name.c_str(); }

const char* Config::getHostname() const { return hostname.c_str(); }

String Config::serialize() {
    DynamicJsonDocument doc(JSON_DOC_SIZE);

    doc["name"] = name;
    doc["hostname"] = hostname;

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

    *this = config;

    return true;
}

Config& Config::operator=(const Config& in) {
    name = in.name;
    hostname = in.hostname;
}
