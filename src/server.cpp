#include "server.h"

#include <Arduino.h>
#include <AsyncJson.h>
#include <ESPAsyncWebServer.h>
#include <FreeRTOS.h>
#include <freertos/timers.h>

#include "config.h"
#include "index_html.h"

namespace {

AsyncWebServer serverInstance(80);

void rebootTimerCallback(TimerHandle_t) { esp_restart(); }

}  // namespace

void server::start(Config* config) {
    serverInstance.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
        AsyncWebServerResponse* response = request->beginResponse_P(
            200, "text/html; charset=utf-8", &web_dist_index_html_gz[0], web_dist_index_html_gz_len);

        response->addHeader("Content-Encoding", "gzip");

        request->send(response);
    });

    serverInstance.on("/api/config", HTTP_GET, [=](AsyncWebServerRequest* request) {
        String serializedConfig = config->serialize();

        request->send(200, "application/json", serializedConfig);
    });

    AsyncCallbackJsonWebHandler* configPostHandler = new AsyncCallbackJsonWebHandler(
        "/api/config",
        [=](AsyncWebServerRequest* request, JsonVariant& json) {
            if (config->deserializeFrom(json)) {
                request->send(200);
            } else {
                request->send(400);
            }
        },
        Config::JSON_DOC_SIZE);
    serverInstance.addHandler(configPostHandler);

    serverInstance.on("/api/reboot", HTTP_POST, [](AsyncWebServerRequest* request) {
        request->send(200);

        TimerHandle_t rebootTimer = xTimerCreate("reboot", pdMS_TO_TICKS(250), pdFALSE, nullptr, rebootTimerCallback);
        xTimerStart(rebootTimer, 0);
    });

    serverInstance.on("/api/status", HTTP_GET, [](AsyncWebServerRequest* request) {
        StaticJsonDocument<1024> json;

        json["uptime"] = (int32_t)(esp_timer_get_time() / 1000000);
        json["heap"] = esp_get_free_heap_size();

        String serializedJson;
        serializeJson(json, serializedJson);

        request->send(200, "application/json", serializedJson);
    });

    serverInstance.onNotFound([](AsyncWebServerRequest* request) { request->send(404, "text/plain", "not found"); });

    serverInstance.begin();
}
