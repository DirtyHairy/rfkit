#ifndef GUARD_HXX
#define GUARD_HXX

#include <functional>

class Guard {
   public:
    using FinalizerT = std::function<void()>;

   public:
    Guard(FinalizerT finalizer) : finalizer(finalizer) {}

    ~Guard() { finalizer(); }

   private:
    FinalizerT finalizer;
};

#endif  // GUARD_HXX
