package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.entity.Enums.Role;

import java.util.List;

public interface UserService {
    List<UserResponse> getUsersByRole(Role role);
}
