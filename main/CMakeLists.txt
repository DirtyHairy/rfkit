set(srcs
    config.cxx
    gpio.cxx
    homespan.cxx
    lock.cxx
    main.cxx
    rc.cxx
    server.cxx
    service.cxx
    persistence.cxx
    crc32.cxx
)

idf_component_register(SRCS ${srcs}
    INCLUDE_DIRS "")

target_compile_options(${COMPONENT_LIB} PRIVATE -Wno-format -Wno-switch)

add_custom_command(OUTPUT index_html.h
     COMMAND python ${COMPONENT_DIR}/../generate_index_html.py)

add_custom_target(index_html DEPENDS index_html.h)

add_dependencies(${COMPONENT_LIB} index_html)
