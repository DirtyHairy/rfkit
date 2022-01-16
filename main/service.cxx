#include "service.hxx"

#include <cstring>

#include "persistence.hxx"
#include "rc.hxx"

SwitchService::SwitchService(const config::Switch& swtch, size_t index, boolean state) : swtch(swtch), index(index) {
    power = new Characteristic::On(state);
}

SwitchService::~SwitchService() { delete power; }

bool SwitchService::update() {
    RCCommand command;
    boolean value = power->getNewVal<bool>();

    strncpy(command.code, value ? swtch.getCodeOn() : swtch.getCodeOff(), 32);
    command.code[32] = '\0';
    command.protocol = swtch.getProtocol();
    command.pulseLength = swtch.getPulseLength();
    command.repeat = swtch.getRepeat();

    rc::send(command);
    persistence::setState(index, swtch.getId(), value);

    return true;
}

void SwitchService::updateFromCommand(RCCommand& command) {
    if (command.protocol != swtch.getProtocol()) {
        return;
    }

    if (strcmp(command.code, swtch.getCodeOn()) == 0) {
        power->setVal(true);
    } else if (strcmp(command.code, swtch.getCodeOff()) == 0) {
        power->setVal(false);
    }
}

bool SwitchService::getValue() { return power->getVal<boolean>(); }
