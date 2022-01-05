#include "service.hxx"

#include "rc.hxx"

SwitchService::SwitchService(const Config::Switch swtch) : swtch(swtch) { power = new Characteristic::On(); }

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
