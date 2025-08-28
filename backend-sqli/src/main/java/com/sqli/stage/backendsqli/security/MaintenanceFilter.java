package com.sqli.stage.backendsqli.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sqli.stage.backendsqli.dto.MaintenanceStatusDto;
import com.sqli.stage.backendsqli.service.MaintenanceService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class MaintenanceFilter extends OncePerRequestFilter {

    private final MaintenanceService maintenanceService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        
        // URLs toujours autorisées
        if (isAlwaysAllowed(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Vérifier si la maintenance est activée
        if (maintenanceService.isMaintenanceEnabled()) {
            // Vérifier si l'utilisateur est ADMIN
            if (isAdminUser()) {
                log.debug("Admin user bypassing maintenance mode: {}", requestURI);
                filterChain.doFilter(request, response);
                return;
            }

            // Bloquer la requête avec 503
            log.info("Request blocked by maintenance mode: {} {}", request.getMethod(), requestURI);
            sendMaintenanceResponse(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAlwaysAllowed(String requestURI) {
        return requestURI.startsWith("/api/auth/") ||
               requestURI.startsWith("/api/maintenance/status") ||
               requestURI.equals("/api/maintenance/disable") ||
               requestURI.equals("/api/contact/send") ||
               requestURI.equals("/api/contact/types") ||
               requestURI.startsWith("/api/projects/") && requestURI.contains("/public") ||
               requestURI.startsWith("/api/qrcode/") ||
               requestURI.startsWith("/api/projects/public/");
    }

    private boolean isAdminUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
            log.debug("User {} has admin role: {}", userDetails.getUsername(), isAdmin);
            return isAdmin;
        }

        log.debug("Authentication principal is not UserDetails: {}", authentication.getPrincipal());
        return false;
    }

    private void sendMaintenanceResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "300"); // 5 minutes

        MaintenanceStatusDto status = maintenanceService.getMaintenanceStatus();
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Service Temporarily Unavailable");
        errorResponse.put("message", "The service is currently under maintenance");
        errorResponse.put("maintenance", status);
        errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        errorResponse.put("retryAfter", 300);

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
