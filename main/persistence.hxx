#ifndef _PERSISTENCE_HXX_
#define _PERSISTENCE_HXX_

#include <cstddef>
#include <cstdint>

namespace persistence {

struct SwitchState {
    uint32_t id;
    bool state;
};

bool isValid();

size_t switchCount();

void reset(size_t switchCount);

SwitchState getState(size_t idx);

void setState(size_t idx, uint32_t id, bool switchState);

}  // namespace persistence

#endif  // _PERSISTENCE_HXX_
