#include "persistence.hxx"

#include <esp_log.h>
#include <esp_system.h>

#include <algorithm>

#include "config.hxx"
#include "crc32.hxx"

namespace {

struct State {
    size_t numSwitches;
    persistence::SwitchState switches[config::MAX_SWITCHES];
};

RTC_NOINIT_ATTR uint32_t checksum;
RTC_NOINIT_ATTR State state;

}  // namespace

bool persistence::isValid() { return crc32(&state, sizeof(state)) == checksum; }

size_t persistence::switchCount() { return state.numSwitches; }

void persistence::reset(size_t nSwitches) {
    memset(&state, 0, sizeof(state));
    state.numSwitches = std::min(nSwitches, config::MAX_SWITCHES);

    checksum = crc32(&state, sizeof(state));
}

persistence::SwitchState persistence::getState(size_t idx) {
    return state.switches[std::min(idx, config::MAX_SWITCHES - 1)];
}

void persistence::setState(size_t idx, uint32_t id, bool switchState) {
    if (idx >= config::MAX_SWITCHES) return;

    state.switches[idx] = {.id = id, .state = switchState};

    checksum = crc32(&state, sizeof(state));
}
