package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.LoginDTO.LoginRequest;
import com.sqli.stage.backendsqli.dto.LoginDTO.LoginResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.net.InterfaceAddress;

public interface AuthService {
    LoginResponse login(LoginRequest request);

    String extractTokenFromHeader(HttpServletRequest request);
    String extractUsernameFromToken(String token);
    Integer extractIdUserFromToken(String token);

}
