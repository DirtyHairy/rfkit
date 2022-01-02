#ifndef _CONFIG_H_
#define _CONFIG_H_

#include <ArduinoJson.h>

#include <cstdint>
#include <vector>

class Config {
   public:
    static constexpr size_t JSON_DOC_SIZE = 2 * 1024;

   public:
    struct Switch {
        friend Config;

       public:
        const char* getName() const;
        const char* getCodeOn() const;
        const char* getCodeOff() const;
        uint32_t getProtocol() const;
        uint32_t getPulseLength() const;
        uint32_t getRepeat() const;

       private:
        const char* name;
        const char* codeOn;
        const char* codeOff;

        uint32_t protocol;
        uint32_t pulseLength;
        uint32_t repeat;
    };

   public:
    Config() = default;
    bool deserializeFrom(char* buffer, size_t size);

    static char* load(size_t& size);
    static void save(const char* serializedData, size_t size);

    const char* getName() const;
    const char* getHostname() const;
    const char* getManufacturer() const;
    const char* getSerial() const;
    const char* getModel() const;
    const char* getRevision() const;

    const std::vector<Switch>& getSwitches() const;

    String serialize();
    bool deserializeFrom(JsonDocument& data);

   private:
    const char* name{"RFKit"};
    const char* hostname{"rfkit"};
    const char* manufacturer{"ACME Corp."};
    const char* serial{"0815"};
    const char* model{"0"};
    const char* revision{"0.0.1"};

    std::vector<Switch> switches;
};

#endif  // _CONFIG_H_
