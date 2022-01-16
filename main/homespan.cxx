#include "homespan.hxx"

#include <HomeSpan.h>
#include <freertos/FreeRTOS.h>

#include <vector>

#include "config.h"
#include "config.hxx"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "persistence.hxx"
#include "server.hxx"
#include "service.hxx"

namespace {

constexpr size_t OOB_COMMAND_QUEUE_SIZE = 5;

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

void createAcessory(const char* name, uint32_t aid, const config::Config& config) {
    new SpanAccessory(aid);
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

bool initialValue(uint32_t id) {
    static bool persistenceValid = persistence::isValid();
    if (!persistenceValid) return false;

    size_t numPersistentSwitches = persistence::switchCount();
    for (size_t i = 0; i < numPersistentSwitches; i++) {
        persistence::SwitchState state = persistence::getState(i);

        if (state.id == id) return state.state;
    }

    return false;
}

}  // namespace

void homespan::start() {
    homeSpan.setHostNameSuffix("");
    homeSpan.setWifiCallback(server::start);
    homeSpan.setPortNum(8080);

    const config::Config& config = config::currentConfig();

    homeSpan.setMaxConnections(MAX_CONNECTIONS_HOMESPAN);
    homeSpan.begin(Category::Bridges, config.getName(), config.getHostname());

    createAcessory(config.getName(), 1, config);

    serviceInstances.reserve(config.getSwitches().size());

    size_t idx = 0;
    for (const config::Switch& swtch : config.getSwitches()) {
        createAcessory(swtch.getName(), swtch.getId(), config);

        serviceInstances.push_back(new SwitchService(swtch, idx++, initialValue(swtch.getId())));
    }

    persistence::reset(config.getSwitches().size());

    idx = 0;
    for (const config::Switch& swtch : config.getSwitches()) {
        persistence::setState(idx, swtch.getId(), serviceInstances[idx]->getValue());

        ESP_LOGI("rfkit", "switch %u has initial state %u", idx, (uint32_t)serviceInstances[idx]->getValue());

        idx++;
    }

    oobCommandQueue = xQueueCreate(OOB_COMMAND_QUEUE_SIZE, sizeof(RCCommand));

    xTaskCreatePinnedToCore(homespanTask, "homespan", STACK_HOMESPAN_TASK, nullptr, PRIORITY_HOMESPAN_TASK,
                            &homespanTaskHandle, CORE_HOMESPAN_TASK);
}

void homespan::updateFromCommand(RCCommand command) { xQueueSend(oobCommandQueue, &command, portMAX_DELAY); }
