#include "server.hxx"

#include <Arduino.h>
#include <ArduinoJson.h>
#include <esp_http_server.h>
#include <esp_log.h>
#include <freertos/FreeRTOS.h>
#include <freertos/timers.h>

#include <cstring>

#include "config.h"
#include "config.hxx"
#include "gpio.hxx"
#include "guard.hxx"
#include "homespan.hxx"
#include "index_html.h"
#include "rc.hxx"

#define TAG "srv"

namespace {

constexpr size_t POST_CONFIG_LIMIT = 16 * 1024;
constexpr size_t POST_SEND_LIMIT = 128;
constexpr size_t JSON_DOC_SEND_SIZE = 128;

httpd_handle_t httpd_handle;

void rebootTimerCallback(TimerHandle_t) { esp_restart(); }

esp_err_t send_400(httpd_req_t* req) {
    httpd_resp_set_status(req, "400 Bad Request");
    httpd_resp_send(req, nullptr, 0);

    return ESP_OK;
}

esp_err_t send_403(httpd_req_t* req) {
    httpd_resp_set_status(req, "403 Forbidden");
    httpd_resp_send(req, nullptr, 0);

    return ESP_OK;
}

esp_err_t send_500(httpd_req_t* req) {
    httpd_resp_set_status(req, "500 Internal Server Error");
    httpd_resp_send(req, nullptr, 0);

    return ESP_OK;
}

esp_err_t handler_index(httpd_req_t* req) {
    httpd_resp_set_hdr(req, "Content-Type", "text/html; charset=utf-8");
    httpd_resp_set_hdr(req, "Content-Encoding", "gzip");
    httpd_resp_send(req, web_dist_index_html_gz, web_dist_index_html_gz_len);

    return ESP_OK;
}

esp_err_t handler_status(httpd_req_t* req) {
    StaticJsonDocument<1024> json;

    json["uptime"] = (int32_t)(esp_timer_get_time() / 1000000);
    json["heap"] = esp_get_free_heap_size();
    json["protect"] = gpio::protectOn();

    String serializedJson;
    serializeJson(json, serializedJson);

    httpd_resp_set_hdr(req, "Content-Type", "application/json");
    httpd_resp_send(req, serializedJson.c_str(), serializedJson.length());

    return ESP_OK;
}

esp_err_t handler_config_get(httpd_req_t* req) {
    size_t len;
    char* buffer = config::load(len);

    httpd_resp_set_hdr(req, "Content-Type", "application/json");

    if (buffer) {
        httpd_resp_send(req, buffer, len);
        free(buffer);
    } else {
        config::Config defaultConfig;
        String serializedConfig = defaultConfig.serialize();

        httpd_resp_send(req, serializedConfig.c_str(), serializedConfig.length());
    }

    return ESP_OK;
}

esp_err_t handler_config_post(httpd_req_t* req) {
    if (gpio::protectOn()) {
        return send_403(req);
    }

    if (req->content_len > POST_CONFIG_LIMIT) {
        return send_400(req);
    }

    char* buffer = (char*)malloc(req->content_len);
    if (!buffer) {
        ESP_LOGE(TAG, "failed to allocate buffer for POST body");
        return send_500(req);
    }

    Guard free_buffer_guard([=] { free(buffer); });

    ssize_t recv_result = httpd_req_recv(req, buffer, req->content_len);

    if (recv_result == HTTPD_SOCK_ERR_TIMEOUT) {
        httpd_resp_send_408(req);

        return ESP_OK;
    }

    if (recv_result < 0) {
        ESP_LOGE(TAG, "failed to receive POST body");
        return ESP_FAIL;
    }

    config::Config config;

    if (!config.deserializeFrom(buffer, recv_result)) {
        return send_400(req);
    }

    config::save(config);

    httpd_resp_send(req, nullptr, 0);

    return ESP_OK;
}

esp_err_t handler_reboot(httpd_req_t* req) {
    httpd_resp_send(req, nullptr, 0);

    TimerHandle_t rebootTimer = xTimerCreate("reboot", pdMS_TO_TICKS(250), pdFALSE, nullptr, rebootTimerCallback);
    xTimerStart(rebootTimer, 0);

    return ESP_OK;
}

esp_err_t handler_send(httpd_req_t* req) {
    if (req->content_len > POST_SEND_LIMIT) {
        return send_400(req);
    }

    char buffer[req->content_len];
    ssize_t recv_result = httpd_req_recv(req, buffer, req->content_len);

    if (recv_result == HTTPD_SOCK_ERR_TIMEOUT) {
        httpd_resp_send_408(req);

        return ESP_OK;
    }

    if (recv_result < 0) {
        ESP_LOGE(TAG, "failed to receive POST body");
        return ESP_FAIL;
    }

    StaticJsonDocument<JSON_DOC_SEND_SIZE> json;
    if (deserializeJson(json, buffer, recv_result) != DeserializationError::Ok) {
        return send_400(req);
    }

    const char* code = json["code"].as<const char*>();
    if (!code) {
        return send_400(req);
    }

    RCCommand command;
    strncpy(command.code, code, 32);
    command.code[32] = '\0';
    command.protocol = json["protocol"].as<uint32_t>();
    command.pulseLength = json["pulseLength"].as<uint32_t>();
    command.repeat = json["repeat"].as<uint32_t>();

    homespan::updateFromCommand(command);
    rc::send(command);

    httpd_resp_send(req, nullptr, 0);

    return ESP_OK;
}

}  // namespace

void server::start() {
    httpd_config_t cfg = HTTPD_DEFAULT_CONFIG();
    cfg.lru_purge_enable = true;
    cfg.max_open_sockets = MAX_CONNECTIONS_WEBSERVER;

    if (httpd_start(&httpd_handle, &cfg) != ESP_OK) {
        ESP_LOGE(TAG, "failed to start HTTP server");
        return;
    }

    httpd_uri_t uri = {.uri = "/", .method = HTTP_GET, .handler = handler_index, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/status", .method = HTTP_GET, .handler = handler_status, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/config", .method = HTTP_GET, .handler = handler_config_get, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/config", .method = HTTP_POST, .handler = handler_config_post, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/reboot", .method = HTTP_POST, .handler = handler_reboot, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/send", .method = HTTP_POST, .handler = handler_send, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);
}
