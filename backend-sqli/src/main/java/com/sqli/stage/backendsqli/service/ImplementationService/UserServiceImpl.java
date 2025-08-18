package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role)
                .stream()
                .map(UserResponse::from)
                .toList();
    }
}

