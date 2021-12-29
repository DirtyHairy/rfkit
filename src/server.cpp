#include "server.hxx"

#include <Arduino.h>
#include <ArduinoJson.h>
#include <FreeRTOS.h>
#include <esp_http_server.h>
#include <esp_log.h>
#include <freertos/timers.h>

#include "config.hxx"
#include "guard.hxx"
#include "index_html.h"

namespace {

constexpr int POST_LIMIT = 16 * 1024;
constexpr int JSON_DOC_SIZE = 2048;

httpd_handle_t httpd_handle;

void rebootTimerCallback(TimerHandle_t) { esp_restart(); }

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

    String serializedJson;
    serializeJson(json, serializedJson);

    httpd_resp_set_hdr(req, "Content-Type", "application/json");
    httpd_resp_send(req, serializedJson.c_str(), serializedJson.length());

    return ESP_OK;
}

esp_err_t handler_config_get(httpd_req_t* req) {
    String serializedConfig = ((Config*)req->user_ctx)->serialize();

    httpd_resp_set_hdr(req, "Content-Type", "application/json");
    httpd_resp_send(req, serializedConfig.c_str(), serializedConfig.length());

    return ESP_OK;
}

esp_err_t handler_config_post(httpd_req_t* req) {
    if (req->content_len > POST_LIMIT) {
        httpd_resp_set_status(req, "400 Bad Request");
        httpd_resp_send(req, nullptr, 0);

        return ESP_OK;
    }

    char* buffer = (char*)malloc(req->content_len);
    if (!buffer) {
        ESP_LOGE("failed to allocate buffer for POST body");

        httpd_resp_set_status(req, "500 Internal Server Error");
        httpd_resp_send(req, nullptr, 0);

        return ESP_OK;
    }

    Guard free_buffer_guard([=] { free(buffer); });

    int recv_result = httpd_req_recv(req, buffer, req->content_len);

    if (recv_result < HTTPD_SOCK_ERR_TIMEOUT) {
        httpd_resp_send_408(req);

        return ESP_OK;
    }

    if (recv_result < 0) {
        ESP_LOGE("failed to receive POST body");
        return ESP_FAIL;
    }

    DynamicJsonDocument json(JSON_DOC_SIZE);
    if (deserializeJson(json, buffer) != DeserializationError::Ok) {
        httpd_resp_set_status(req, "400 Bad Request");
        httpd_resp_send(req, nullptr, 0);

        return ESP_OK;
    };

    ((Config*)req->user_ctx)->deserializeFrom(json);

    httpd_resp_send(req, nullptr, 0);

    return ESP_OK;
}

esp_err_t handler_reboot(httpd_req_t* req) {
    httpd_resp_send(req, nullptr, 0);

    TimerHandle_t rebootTimer = xTimerCreate("reboot", pdMS_TO_TICKS(250), pdFALSE, nullptr, rebootTimerCallback);
    xTimerStart(rebootTimer, 0);

    return ESP_OK;
}

}  // namespace

void server::start(Config* config) {
    httpd_config_t cfg = HTTPD_DEFAULT_CONFIG();
    cfg.lru_purge_enable = true;

    if (httpd_start(&httpd_handle, &cfg) != ESP_OK) {
        ESP_LOGE("failed to start HTTP server");
        return;
    }

    httpd_uri_t uri = {.uri = "/", .method = HTTP_GET, .handler = handler_index, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/status", .method = HTTP_GET, .handler = handler_status, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/config", .method = HTTP_GET, .handler = handler_config_get, .user_ctx = config};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/config", .method = HTTP_POST, .handler = handler_config_post, .user_ctx = config};
    httpd_register_uri_handler(httpd_handle, &uri);

    uri = {.uri = "/api/reboot", .method = HTTP_POST, .handler = handler_reboot, .user_ctx = nullptr};
    httpd_register_uri_handler(httpd_handle, &uri);
}
