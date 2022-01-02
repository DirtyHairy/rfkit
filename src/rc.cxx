#include "rc.hxx"

#include <FreeRTOS.h>
#include <RCSwitch.h>
#include <esp_log.h>
#include <freertos/queue.h>
#include <freertos/task.h>

#include <algorithm>

#include "config.h"

namespace {

constexpr size_t COMMAND_QUEUE_SIZE = 10;

TaskHandle_t rcTaskHandle;
QueueHandle_t rcCommandQueue;

RCSwitch swtch;

bool isTriState(const char* code) {
    for (int i = 0; code[i] != '\0'; i++) {
        if (code[i] == 'S' || code[i] == 'F') {
            return true;
        }
    }

    return false;
}

void _rcTask() {
    while (true) {
        RCCommand command;
        if (xQueueReceive(rcCommandQueue, &command, portMAX_DELAY) != pdTRUE) {
            continue;
        }

        swtch.setProtocol(command.protocol);

        if (command.pulseLength > 0) {
            swtch.setPulseLength(std::min(command.pulseLength, 1000u));
        }

        swtch.setRepeatTransmit(command.repeat > 0 ? min(command.repeat, 100u) : 10);

        if (isTriState(command.code)) {
            swtch.sendTriState(command.code);
        } else {
            swtch.send(command.code);
        }
    }
}

void rcTask(void*) {
    _rcTask();
    vTaskDelete(nullptr);
}

}  // namespace

void rc::start() {
    swtch.enableTransmit(GPIO_RC_TRANSMIT);
    rcCommandQueue = xQueueCreate(COMMAND_QUEUE_SIZE, sizeof(RCCommand));
    xTaskCreatePinnedToCore(rcTask, "rc-transmit", STACK_RC_TASK, nullptr, PRIORITY_RC_TASK, &rcTaskHandle,
                            CORE_RC_TASK);
}

void rc::send(RCCommand command) { xQueueSend(rcCommandQueue, &command, portMAX_DELAY); }
