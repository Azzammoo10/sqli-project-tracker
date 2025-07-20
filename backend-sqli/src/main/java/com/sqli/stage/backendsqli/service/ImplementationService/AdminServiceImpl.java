package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.CreateUserRequest;
import com.sqli.stage.backendsqli.dto.UpdateUserRequest;
import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.EmailAlreadyExistsException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;


@RequiredArgsConstructor
@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    private String generateUsername(String nom) {
        int random = new Random().nextInt(9000) + 1000; // nombre entre 1000 et 9999
        return nom.toLowerCase().replaceAll("\\s+", "") + ".sqli-" + random;
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email déjà utilisé");
        }


        User user = new User();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setMotDePasse(request.getMotDePasse());
        user.setRole(request.getRole());
        user.setUsername(generateUsername(request.getNom()));
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getNom(),
                savedUser.getRole()
        );
    }





    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getNom(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'id : " + id));

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getNom(),
                user.getRole()
        );
    }

    @Override
    public UserResponse updateUser(int id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec id : " + id));

        if (request.getNom() != null) user.setNom(request.getNom());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getMotDePasse() != null) user.setMotDePasse(request.getMotDePasse());
        if (request.getRole() != null) user.setRole(request.getRole());

        User updatedUser = userRepository.save(user);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getNom(),
                updatedUser.getRole()
        );
    }


    @Override
    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserResponse assignRoleToUser(int id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id : " + id));

        user.setRole(role);
        User updatedUser = userRepository.save(user);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getNom(),
                updatedUser.getRole()
        );
    }


    @Override
    public UserResponse disableUser(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id : " + id));

        user.setEnabled(false);
        User disabledUser = userRepository.save(user);

        return new UserResponse(
                disabledUser.getId(),
                disabledUser.getUsername(),
                disabledUser.getEmail(),
                disabledUser.getNom(),
                disabledUser.getRole()
        );
    }

}
