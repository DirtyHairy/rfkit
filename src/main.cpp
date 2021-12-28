#include <Arduino.h>
#include <HomeSpan.h>

#include "config.h"
#include "server.h"

Config config;

void setupServer() { server::start(&config); }

void setup() {
    Serial.begin(115200);
    config.load();

    homeSpan.setHostNameSuffix("");
    homeSpan.setWifiCallback(setupServer);
    homeSpan.setPortNum(8080);

    homeSpan.begin(Category::Lighting, config.getName(), config.getHostname());
}

void loop() { homeSpan.poll(); }
