#include <Arduino.h>
#include <AsyncJson.h>
#include <ESPAsyncWebServer.h>
#include <FreeRTOS.h>
#include <HomeSpan.h>
#include <esp_log.h>
#include <freertos/semphr.h>
#include <nvs_flash.h>

#include "Config.h"
#include "Lock.h"
#include "index_html.h"

#define NVS_NAMESPACE_CONFIG "CONFIG"
#define NVS_KEY_CONFIG "CFG"

AsyncWebServer server(8080);
SemaphoreHandle_t config_mutex;
Config config;

void setupServer() {
    config_mutex = xSemaphoreCreateMutex();

    server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
        AsyncWebServerResponse* response =
            request->beginResponse_P(200, "text/html", &web_dist_index_html_gz[0], web_dist_index_html_gz_len);

        response->addHeader("Content-Encoding", "gzip");

        request->send(response);
    });

    server.on("/config", HTTP_GET, [](AsyncWebServerRequest* request) {
        String serializedConfig = config.serialize();

        request->send(200, "application/json", serializedConfig);
    });

    AsyncCallbackJsonWebHandler* configPostHandler = new AsyncCallbackJsonWebHandler(
        "/config",
        [](AsyncWebServerRequest* request, JsonVariant& json) {
            if (config.deserializeFrom(json)) {
                request->send(200);
            } else {
                request->send(400);
            }
        },
        Config::JSON_DOC_SIZE);
    server.addHandler(configPostHandler);

    server.onNotFound([](AsyncWebServerRequest* request) { request->send(404, "text/plain", "not found"); });

    server.begin();
}

void setup() {
    Serial.begin(115200);
    config.load();

    homeSpan.setHostNameSuffix("");
    homeSpan.setWifiCallback(setupServer);

    homeSpan.begin(Category::Lighting, config.getName(), config.getHostname());
}

void loop() { homeSpan.poll(); }
