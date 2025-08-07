package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.*;
import com.sqli.stage.backendsqli.entity.Enums.Role;

import java.util.List;

public interface AdminService {
    UserResponse createUser(CreateUserRequest request);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(int id);
    UserResponse updateUser(int id, UpdateUserRequest request);
    void deleteUser(int id);
    UserResponse assignRole(int id, Role role);
    UserResponse enableUser(int id);
    UserResponse disableUser(int id);
    UserResponse createNewAdmin(CreateAdminDTO request);

    // New Fonctionnaliter  ----------------------------------
    List<UserResponse> getUsersByRole(Role role);
    List<UserSkillResponse> getUserSkills(int userId);
    UserAvailabilityResponse getAvailability(int userId);
}
