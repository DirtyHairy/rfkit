#ifndef _CONFIG_H_
#define _CONFIG_H_

#include <ArduinoJson.h>

#include <cstdint>
#include <vector>

namespace config {

class Config;

struct Switch {
    friend Config;

   public:
    const char* getName() const;
    const char* getCodeOn() const;
    const char* getCodeOff() const;
    uint32_t getProtocol() const;
    uint32_t getPulseLength() const;
    uint32_t getRepeat() const;
    uint32_t getId() const;
    void setId(uint32_t id);

   private:
    const char* name{""};
    const char* codeOn{""};
    const char* codeOff{""};

    uint32_t protocol{0};
    uint32_t pulseLength{0};
    uint32_t repeat{0};
    uint32_t id{0};
};

void init();

class Config {
   public:
    friend void config::init();

   public:
    Config() = default;
    bool deserializeFrom(char* buffer, size_t size);

    const char* getName() const;
    const char* getHostname() const;
    const char* getManufacturer() const;
    const char* getSerial() const;
    const char* getModel() const;
    const char* getRevision() const;

    const std::vector<Switch>& getSwitches() const;

    String serialize() const;
    bool deserializeFrom(JsonDocument& data);

   private:
    bool assignIds();

   private:
    const char* name{"RFKit"};
    const char* hostname{"rfkit"};
    const char* manufacturer{"ACME Corp."};
    const char* serial{"0815"};
    const char* model{"0"};
    const char* revision{"0.0.1"};

    std::vector<Switch> switches;
};

char* load(size_t& size);

void save(const Config& config);

const Config& currentConfig();

}  // namespace config

#endif  // _CONFIG_H_
