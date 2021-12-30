#include <Arduino.h>
#include <HomeSpan.h>
#include <esp_log.h>
#include <nvs_flash.h>

#include "config.h"
#include "config.hxx"
#include "server.hxx"

#define TAG "main"

void setupServer() { server::start(); }

void setup() {
    pinMode(GPIO_RF_SEND, OUTPUT);
    pinMode(GPIO_PROTECT, INPUT_PULLUP);
    digitalWrite(GPIO_RF_SEND, LOW);

    Serial.begin(115200);

    if (nvs_flash_init() != ESP_OK) {
        ESP_LOGE(TAG, "failed to init NVS");
    }

    homeSpan.setHostNameSuffix("");
    homeSpan.setWifiCallback(setupServer);
    homeSpan.setPortNum(8080);

    Config config;
    size_t serializedConfigSize;
    char* serializedConfig = Config::load(serializedConfigSize);

    homeSpan.begin(Category::Lighting, config.getName(), config.getHostname());

    if (serializedConfig) {
        free(serializedConfig);
    }
}

void loop() { homeSpan.poll(); }
