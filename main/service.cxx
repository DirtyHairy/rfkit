#include "service.hxx"

#include <cstring>

#include "rc.hxx"

SwitchService::SwitchService(const config::Switch swtch) : swtch(swtch) { power = new Characteristic::On(); }

SwitchService::~SwitchService() { delete power; }

bool SwitchService::update() {
    RCCommand command;

    strncpy(command.code, power->getNewVal<bool>() ? swtch.getCodeOn() : swtch.getCodeOff(), 32);
    command.code[32] = '\0';
    command.protocol = swtch.getProtocol();
    command.pulseLength = swtch.getPulseLength();
    command.repeat = swtch.getRepeat();

    rc::send(command);

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
