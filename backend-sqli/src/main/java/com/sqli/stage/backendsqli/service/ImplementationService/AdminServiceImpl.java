package com.sqli.stage.backendsqli.service.ImplementationService;

import com.sqli.stage.backendsqli.dto.*;
import com.sqli.stage.backendsqli.entity.Enums.Role;
import com.sqli.stage.backendsqli.entity.User;
import com.sqli.stage.backendsqli.exception.EmailAlreadyExistsException;
import com.sqli.stage.backendsqli.exception.ResourceNotFoundException;
import com.sqli.stage.backendsqli.exception.WeakPasswordException;
import com.sqli.stage.backendsqli.repository.UserRepository;
import com.sqli.stage.backendsqli.repository.ProjetRepository;
import com.sqli.stage.backendsqli.repository.TaskRepository;
import com.sqli.stage.backendsqli.repository.HistoriqueRepository;
import com.sqli.stage.backendsqli.entity.Historique;
import com.sqli.stage.backendsqli.entity.Task;
import com.sqli.stage.backendsqli.service.AdminService;
import com.sqli.stage.backendsqli.validation.StrongPasswordValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import com.sqli.stage.backendsqli.entity.Project;
import com.sqli.stage.backendsqli.service.HistoriqueService;
import com.sqli.stage.backendsqli.dto.HistoriqueDTO.LogRequest;
import com.sqli.stage.backendsqli.entity.Enums.EntityName;
import com.sqli.stage.backendsqli.entity.Enums.TypeOperation;

@RequiredArgsConstructor
@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StrongPasswordValidator strongPasswordValidator;
    private final ProjetRepository projetRepository;
    private final TaskRepository taskRepository;
    private final HistoriqueRepository historiqueRepository;
    private final HistoriqueService historiqueService;

    private String generateUsername(String nom, Role role) {
        String username = "";
        int attempts = 0;
        do {
            String cleanNom = Normalizer.normalize(nom.split(" ")[1], Normalizer.Form.NFD)
                    .replaceAll("[^\\p{ASCII}]", "")
                    .replaceAll("[^a-zA-Z]", "")
                    .toLowerCase();

            String roleCode = switch (role) {
                case CHEF_DE_PROJET -> "cp";
                case DEVELOPPEUR -> "dev";
                case CLIENT -> "cli";
                case ADMIN -> "adm";
                case STAGIAIRE -> "stg";
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
        // Utiliser le rôle envoyé depuis le frontend au lieu d'inférer
        Role role = request.getRole() != null ? request.getRole() : Role.DEVELOPPEUR;
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        user.setRole(role);
        user.setUsername(generateUsername(request.getNom(), role));
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
                savedUser.getRole(),
                savedUser.getJobTitle(),
                savedUser.getDepartment(),
                savedUser.getPhone(),
                savedUser.isEnabled()
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
                        user.getRole(),
                        user.getJobTitle(),
                        user.getDepartment(),
                        user.getPhone(),
                        user.isEnabled()
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
                user.getRole(),
                user.getJobTitle(),
                user.getDepartment(),
                user.getPhone(),
                user.isEnabled()
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
        
        // Permettre la modification du statut enabled
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
            
            // Log de l'action de changement de statut
            if (request.getEnabled()) {
                historiqueService.logAction(new LogRequest(
                    TypeOperation.ENABLE_USER,
                    "Utilisateur activé via update : " + user.getUsername(),
                    user.getId(),
                    EntityName.USER
                ));
            } else {
                historiqueService.logAction(new LogRequest(
                    TypeOperation.DISABLE_USER,
                    "Utilisateur désactivé via update : " + user.getUsername(),
                    user.getId(),
                    EntityName.USER
                ));
            }
        }

        User updatedUser = userRepository.save(user);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getNom(),
                updatedUser.getRole(),
                updatedUser.getJobTitle(),
                updatedUser.getDepartment(),
                updatedUser.getPhone(),
                updatedUser.isEnabled()
        );
    }

    @Override
    public void deleteUser(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id : " + id));

        // Vérifier si l'utilisateur est un admin (empêcher la suppression d'admin)
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Impossible de supprimer un administrateur");
        }

        // NOUVELLE APPROCHE: Désactiver l'utilisateur au lieu de le supprimer
        // Cela préserve l'intégrité des données historiques et évite les erreurs de contraintes
        try {
            // Désactiver l'utilisateur pour qu'il ne puisse plus se connecter
            user.setEnabled(false);
            
            // Optionnel: marquer le nom d'utilisateur comme supprimé pour éviter les conflits
            String originalUsername = user.getUsername();
            user.setUsername(originalUsername + "_DELETED_" + System.currentTimeMillis());
            user.setEmail("deleted_" + System.currentTimeMillis() + "@deleted.com");
            
            // Sauvegarder les changements
            userRepository.save(user);
            
            // Logger l'action
            historiqueService.logAction(new LogRequest(
                TypeOperation.DISABLE_USER,
                "Utilisateur supprimé (désactivé) : " + originalUsername,
                user.getId(),
                EntityName.USER
            ));
            
            System.out.println("Utilisateur " + originalUsername + " désactivé avec succès au lieu d'être supprimé");
            
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la désactivation de l'utilisateur : " + e.getMessage());
        }
    }

    // Méthode pour forcer la suppression complète (à utiliser avec précaution)
    public void forceDeleteUser(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id : " + id));

        // Vérifier si l'utilisateur est un admin (empêcher la suppression d'admin)
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Impossible de supprimer un administrateur");
        }

        try {
            System.out.println("=== FORCE DELETE: Suppression complète de l'utilisateur " + user.getUsername() + " ===");
            
            // 1. D'abord, retirer l'utilisateur de tous les projets
            List<Project> allProjects = projetRepository.findAll();
            for (Project project : allProjects) {
                if (project.getDeveloppeurs() != null && project.getDeveloppeurs().contains(user)) {
                    project.getDeveloppeurs().remove(user);
                    projetRepository.save(project);
                    System.out.println("Utilisateur retiré du projet: " + project.getTitre());
                }
            }
            
            // 2. Supprimer toutes les tâches assignées à cet utilisateur
            List<Task> userTasks = taskRepository.findByDeveloppeurId(id);
            if (!userTasks.isEmpty()) {
                taskRepository.deleteAll(userTasks);
                System.out.println("Supprimé " + userTasks.size() + " tâches");
            }
            
            // 3. Supprimer les enregistrements d'historique associés à l'utilisateur
            List<Historique> historiques = historiqueRepository.findByUserId(id);
            if (!historiques.isEmpty()) {
                historiqueRepository.deleteAll(historiques);
                System.out.println("Supprimé " + historiques.size() + " entrées d'historique");
            }
            
            // 4. Si c'est un client, gérer ses projets
            if (user.getRole() == Role.CLIENT) {
                List<Project> clientProjects = projetRepository.findByClientId(id);
                if (!clientProjects.isEmpty()) {
                    for (Project project : clientProjects) {
                        // Supprimer d'abord toutes les tâches de ces projets
                        List<Task> projectTasks = taskRepository.findByProjectId(project.getId());
                        if (!projectTasks.isEmpty()) {
                            taskRepository.deleteAll(projectTasks);
                        }
                    }
                    // Puis supprimer les projets
                    projetRepository.deleteAll(clientProjects);
                    System.out.println("Supprimé " + clientProjects.size() + " projets du client");
                }
            }
            
            // 5. Maintenant supprimer l'utilisateur
            userRepository.deleteById(id);
            System.out.println("=== FORCE DELETE: Utilisateur " + user.getUsername() + " supprimé avec succès ===");
            
        } catch (Exception e) {
            System.out.println("=== FORCE DELETE: Erreur lors de la suppression: " + e.getMessage() + " ===");
            throw new RuntimeException("Erreur lors de la suppression forcée de l'utilisateur : " + e.getMessage());
        }
    }

    @Override
    public UserResponse assignRole(int id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id : " + id));

        user.setRole(role);
        User updatedUser = userRepository.save(user);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getNom(),
                updatedUser.getRole(),
                updatedUser.getJobTitle(),
                updatedUser.getDepartment(),
                updatedUser.getPhone(),
                updatedUser.isEnabled()
        );
    }

    @Override
    public UserResponse enableUser(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id : " + id));

        user.setEnabled(true);
        User enabledUser = userRepository.save(user);

        // Log de l'action
        historiqueService.logAction(new LogRequest(
                TypeOperation.ENABLE_USER,
                "Utilisateur activé : " + enabledUser.getUsername(),
                enabledUser.getId(),
                EntityName.USER
        ));

        return new UserResponse(
                enabledUser.getId(),
                enabledUser.getUsername(),
                enabledUser.getEmail(),
                enabledUser.getNom(),
                enabledUser.getRole(),
                enabledUser.getJobTitle(),
                enabledUser.getDepartment(),
                enabledUser.getPhone(),
                enabledUser.isEnabled()
        );
    }

    @Override
    public UserResponse disableUser(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id : " + id));

        user.setEnabled(false);
        User disabledUser = userRepository.save(user);

        // Log de l'action
        historiqueService.logAction(new LogRequest(
                TypeOperation.DISABLE_USER,
                "Utilisateur désactivé : " + disabledUser.getUsername(),
                disabledUser.getId(),
                EntityName.USER
        ));

        return new UserResponse(
                disabledUser.getId(),
                disabledUser.getUsername(),
                disabledUser.getEmail(),
                disabledUser.getNom(),
                disabledUser.getRole(),
                disabledUser.getJobTitle(),
                disabledUser.getDepartment(),
                disabledUser.getPhone(),
                disabledUser.isEnabled()
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
                savedAdmin.getRole(),
                savedAdmin.getJobTitle(),
                savedAdmin.getDepartment(),
                savedAdmin.getPhone(),
                savedAdmin.isEnabled()
        );
    }

    @Override
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == role)
                .map(UserResponse::from)   // conversion User -> UserResponse
                .collect(Collectors.toList());
    }



    @Override
    public List<UserSkillResponse> getUserSkills(int userId) {
        return List.of();
    }

    @Override
    public UserAvailabilityResponse getAvailability(int userId) {
        return null;
    }

    public Role inferRoleFromJobTitle(String jobTitle) {
        if (jobTitle == null) return Role.DEVELOPPEUR;

        jobTitle = jobTitle.toLowerCase();

        if (jobTitle.contains("stagiaire")) return Role.STAGIAIRE;
        if (jobTitle.contains("chef") || jobTitle.contains("projet")) return Role.CHEF_DE_PROJET;
        if (jobTitle.contains("cto") || jobTitle.contains("directeur")) return Role.ADMIN;
        if (jobTitle.contains("fullstack") || jobTitle.contains("dev")) return Role.DEVELOPPEUR;

        return Role.DEVELOPPEUR;
    }

}
