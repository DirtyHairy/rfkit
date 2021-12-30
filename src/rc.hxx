#ifndef _RC_HXX_
#define _RC_HXX_

#include <cstdint>

struct RCCommand {
    char code[33];
    uint32_t protocol, pulseLength, repeat;
};

namespace rc {

void start();

void send(RCCommand command);

}  // namespace rc

#endif  // _RC_HXX_
