#pragma once

#include <string>

typedef unsigned int uint32_t;

bool is_port_open(const std::string& ip, uint32_t port, int timeout_sec = 2);