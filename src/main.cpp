#include <Arduino.h>
#include <HomeSpan.h>

void setup() {
    Serial.begin(115200);
    // Serial.println("Hello world");

    homeSpan.begin(Category::Lighting);
}

void loop() {
    homeSpan.poll();
}
