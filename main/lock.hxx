#ifndef _LOCK_H_
#define _LOCK_H_

#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>

class Lock {
   public:
    Lock(SemaphoreHandle_t);

    ~Lock();

   private:
    SemaphoreHandle_t mutex;
};

#endif
