#ifndef _CONFIG_H_
#define _CONFIG_H_

#include <Arduino.h>
#include <ArduinoJson.h>

#include <vector>

class Config {
   public:
    static constexpr size_t JSON_DOC_SIZE = 16 * 1024;

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
    const char* getManufacturer() const;
    const char* getSerial() const;
    const char* getModel() const;
    const char* getRevision() const;

    String serialize();
    bool deserializeFrom(JsonDocument& data);

   private:
    String name{"RFKit"};
    String hostname{"rfkit"};
    String manufacturer{"ACME Corp."};
    String serial{"0815"};
    String model{"0"};
    String revision{"0.0.1"};
    std::vector<Switch> switches;
};

#endif  // _CONFIG_H_
