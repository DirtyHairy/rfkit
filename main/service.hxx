#ifndef _SERVICE_HXX_
#define _SERVICE_HXX_

#include <HomeSpan.h>

#include "config.hxx"
#include "rc.hxx"

struct SwitchService : Service::LightBulb {
   public:
    SwitchService(const config::Switch swtch);
    virtual ~SwitchService();

    bool update() override;

    void updateFromCommand(RCCommand& command);

   private:
    const config::Switch swtch;
    SpanCharacteristic* power;
};

#endif  // _SERVICE_HXX_
