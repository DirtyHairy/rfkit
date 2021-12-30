#include "gpio.hxx"

#include <Arduino.h>

#include "config.h"

bool gpio::protectOn() { return digitalRead(GPIO_PROTECT); }
