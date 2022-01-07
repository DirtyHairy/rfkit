#include "homespan.hxx"

#include <HomeSpan.h>
#include <freertos/FreeRTOS.h>

#include <vector>

#include "config.h"
#include "config.hxx"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "server.hxx"
#include "service.hxx"

namespace {

constexpr size_t OOB_COMMAND_QUEUE_SIZE = 5;

Config config;

TaskHandle_t homespanTaskHandle;
QueueHandle_t oobCommandQueue;

std::vector<SwitchService*> serviceInstances;

void _homespanTask() {
    while (true) {
        homeSpan.poll();

        RCCommand command;
        while (xQueueReceive(oobCommandQueue, &command, 0) == pdTRUE) {
            for (SwitchService* service : serviceInstances) {
                service->updateFromCommand(command);
            }
        }
    }
}

void homespanTask(void*) {
    _homespanTask();
    vTaskDelete(nullptr);
}

void createAcessory(const char* name) {
    new SpanAccessory();
    new Service::AccessoryInformation();
    new Characteristic::Name(name);
    new Characteristic::Manufacturer(config.getManufacturer());
    new Characteristic::SerialNumber(config.getSerial());
    new Characteristic::Model(config.getModel());
    new Characteristic::FirmwareRevision(config.getRevision());
    new Characteristic::Identify();
    new Service::HAPProtocolInformation();
    new Characteristic::Version("1.1.0");
}

}  // namespace

void homespan::start() {
    homeSpan.setHostNameSuffix("");
    homeSpan.setWifiCallback(server::start);
    homeSpan.setPortNum(8080);

    size_t serializedConfigSize;
    char* serializedConfig = Config::load(serializedConfigSize);
    if (serializedConfig) {
        config.deserializeFrom(serializedConfig, serializedConfigSize);
    }

    homeSpan.setMaxConnections(MAX_CONNECTIONS_HOMESPAN);
    homeSpan.begin(Category::Bridges, config.getName(), config.getHostname());

    createAcessory(config.getName());

    serviceInstances.reserve(config.getSwitches().size());

    for (const Config::Switch& swtch : config.getSwitches()) {
        createAcessory(swtch.getName());
        serviceInstances.push_back(new SwitchService(swtch));
    }

    oobCommandQueue = xQueueCreate(OOB_COMMAND_QUEUE_SIZE, sizeof(RCCommand));

    xTaskCreatePinnedToCore(homespanTask, "homespan", STACK_HOMESPAN_TASK, nullptr, PRIORITY_HOMESPAN_TASK,
                            &homespanTaskHandle, CORE_HOMESPAN_TASK);
}

void homespan::updateFromCommand(RCCommand command) { xQueueSend(oobCommandQueue, &command, portMAX_DELAY); }
