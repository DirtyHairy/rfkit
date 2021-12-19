#ifndef _CONFIG_H_
#define _CONFIG_H_

#include <Arduino.h>
#include <ArduinoJson.h>

#include <vector>

class Config {
   public:
    static constexpr size_t JSON_DOC_SIZE = 32 * 1024;

   public:
    struct Switch {
       public:
        String name;
        String codeOn;
        String codeOff;
        uint32_t protocol;
        uint32_t pulseLength;
        uint32_t repeat;
    };

   public:
    Config();

    Config& operator=(const Config&);

    void load();

    const char* getName() const;
    const char* getHostname() const;

    String serialize();
    bool deserializeFrom(JsonVariant& data);

   private:
    String name;
    String hostname;
    std::vector<Switch> switches;
};

#endif  // _CONFIG_H_
