package com.sqli.stage.backendsqli.service;

import com.sqli.stage.backendsqli.dto.CreateAdminDTO;
import com.sqli.stage.backendsqli.dto.CreateUserRequest;
import com.sqli.stage.backendsqli.dto.UpdateUserRequest;
import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.entity.Enums.Role;

import java.util.List;

public interface AdminService {

    UserResponse createUser(CreateUserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(int id);

    UserResponse updateUser(int id, UpdateUserRequest request);

    void deleteUser(int id);

    UserResponse assignRoleToUser(int id, Role role);

    UserResponse enableUser(int id);

    UserResponse disableUser(int id);

    UserResponse createNewAdmin(CreateAdminDTO request);
}
