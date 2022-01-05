file(GLOB homespan_sources ./Homespan/src/**.cpp)

idf_component_register(SRCS ${homespan_sources}
                INCLUDE_DIRS "./HomeSpan/src"
                REQUIRES arduino libsodium core_version app_update)

target_compile_options(${COMPONENT_LIB} PRIVATE -Wno-format -Wno-switch)
