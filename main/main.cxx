#include <Arduino.h>
#include <HomeSpan.h>
#include <esp_log.h>
#include <nvs_flash.h>

#include "config.h"
#include "homespan.hxx"
#include "rc.hxx"

#define TAG "main"

extern "C" void app_main(void) {
    initArduino();

    pinMode(GPIO_RC_TRANSMIT, OUTPUT);
    pinMode(GPIO_PROTECT, INPUT_PULLUP);
    digitalWrite(GPIO_RC_TRANSMIT, LOW);

    Serial.begin(115200);

    ESP_LOGI(TAG, "rkit starting");
    ESP_LOGI(TAG, "running at %u MHz", getCpuFrequencyMhz());

    if (nvs_flash_init() != ESP_OK) {
        ESP_LOGE(TAG, "failed to init NVS");
    }

    rc::start();
    homespan::start();
}
