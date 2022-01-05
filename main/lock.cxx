#include "Lock.hxx"

Lock::Lock(SemaphoreHandle_t mutex) : mutex(mutex) { xSemaphoreTake(mutex, portMAX_DELAY); }

Lock::~Lock() { xSemaphoreGive(mutex); }
