#include <Arduino.h>
#include <ESPAsyncWebServer.h>
#include <HomeSpan.h>

#include "index_html.h"

AsyncWebServer server(8080);

void setupServer() {
    server.on("/", HTTP_GET, [](AsyncWebServerRequest* request) {
        request->send_P(200, "text/html", &web_index_html[0], web_index_html_len);
    });

    server.onNotFound([](AsyncWebServerRequest* request) { request->send(404, "text/plain", "not found"); });

    server.begin();
}

void setup() {
    Serial.begin(115200);

    homeSpan.setHostNameSuffix("");
    homeSpan.setWifiCallback(setupServer);

    homeSpan.begin(Category::Lighting, "rfkit", "rfkit");
}

void loop() { homeSpan.poll(); }
