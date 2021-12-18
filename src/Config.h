#ifndef _CONFIG_H_
#define _CONFIG_H_

#include <Arduino.h>
#include <ArduinoJson.h>

class Config {
   public:
    static constexpr size_t JSON_DOC_SIZE = 32 * 1024;

   public:
    Config() = default;

    Config& operator=(const Config&);

    void load();

    const char* getName() const;
    const char* getHostname() const;

    String serialize();
    bool deserializeFrom(JsonVariant& data);

   private:
    String name;
    String hostname;
};

#endif  // _CONFIG_H_
