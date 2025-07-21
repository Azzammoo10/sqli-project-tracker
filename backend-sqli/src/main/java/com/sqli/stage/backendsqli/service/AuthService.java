package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.LoginDTO.LoginRequest;
import com.sqli.stage.backendsqli.dto.LoginDTO.LoginResponse;

import java.net.InterfaceAddress;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
