package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.CreateAdminDTO;
import com.sqli.stage.backendsqli.dto.CreateUserRequest;
import com.sqli.stage.backendsqli.dto.UpdateUserRequest;
import com.sqli.stage.backendsqli.dto.UserResponse;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.EmailAlreadyExistsException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.exception.WeakPasswordException;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.service.AdminService;
import com.sqli.stage.backendsqli.validation.StrongPasswordValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StrongPasswordValidator strongPasswordValidator;

    private String generateUsername(String nom, Role role) {
        String username = "";
        int attempts = 0;
        do {
            String cleanNom = Normalizer.normalize(nom, Normalizer.Form.NFD)
                    .replaceAll("[^\\p{ASCII}]", "")
                    .replaceAll("[^a-zA-Z]", "")
                    .toLowerCase();

            String roleCode = switch (role) {
                case CHEF_DE_PROJET -> "cp";
                case DEVELOPPEUR -> "dev";
                case CLIENT -> "cli";
                case ADMIN -> "adm";
                default -> "usr";
            };

            int random = ThreadLocalRandom.current().nextInt(1000, 10000);
            username = cleanNom + "." + roleCode + "-sqli" + random;
            attempts++;
            if (attempts > 10) {
                throw new RuntimeException("Impossible de générer un username unique");
            }
        } while (userRepository.findByUsername(username).isPresent());
        return username;
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email déjà utilisé");
        }

        if (!strongPasswordValidator.isValid(request.getMotDePasse(), null)) {
            throw new WeakPasswordException("Le mot de passe est trop faible : il doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
        }

        User user = new User();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        user.setRole(request.getRole());
        user.setUsername(generateUsername(request.getNom(), request.getRole()));
        user.setEnabled(true);
        user.setJobTitle(request.getJobTitle());
        user.setDepartment(request.getDepartment());
        user.setPhone(request.getPhone());

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
        return userRepository.findAll().stream()
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
        if (request.getMotDePasse() != null)
            user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getJobTitle() != null) user.setJobTitle(request.getJobTitle());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

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
    public UserResponse enableUser(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id : " + id));

        user.setEnabled(true);
        User enabledUser = userRepository.save(user);

        return new UserResponse(
                enabledUser.getId(),
                enabledUser.getUsername(),
                enabledUser.getEmail(),
                enabledUser.getNom(),
                enabledUser.getRole()
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

    @Override
    public UserResponse createNewAdmin(CreateAdminDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email déjà utilisé");
        }

        User user = new User();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        user.setRole(Role.ADMIN);
        user.setUsername(generateUsername(request.getNom(), Role.ADMIN));
        user.setEnabled(true);
        user.setJobTitle(request.getJobTitle());
        user.setDepartment(request.getDepartment());
        user.setPhone(request.getPhone());

        User savedAdmin = userRepository.save(user);

        return new UserResponse(
                savedAdmin.getId(),
                savedAdmin.getUsername(),
                savedAdmin.getEmail(),
                savedAdmin.getNom(),
                savedAdmin.getRole()
        );
    }
}
