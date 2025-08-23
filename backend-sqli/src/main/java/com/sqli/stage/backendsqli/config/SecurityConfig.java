package com.sqli.stage.backendsqli.config;

import com.sqli.stage.backendsqli.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true) // ✅ au lieu de EnableGlobalMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {}) // ✅ active CORS avec le bean ci‑dessous
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/contact/send").permitAll() // Endpoint de contact public
                        .requestMatchers("/api/contact/types").permitAll() // Types de contact publics
                        .requestMatchers("/api/projects/*/public").permitAll() // Endpoint projet public
                        .requestMatchers("/api/projects/*/pdf").permitAll() // Endpoint PDF public
                        .requestMatchers("/api/qrcode/**").permitAll() // Endpoints QR Code
                        .requestMatchers("/api/projects/public/**").permitAll()
                        .requestMatchers("/api/admin/users/by-role/**").hasAnyRole("ADMIN", "CHEF_DE_PROJET")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN") // nécessite ROLE_ADMIN côté user

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // préflight

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Origines exactes du front
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));

        // Tu peux élargir si besoin: "X-Requested-With", "Origin"
        config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));

        // Si tu veux que le front lise certains headers de réponse:
        config.setExposedHeaders(List.of("Authorization"));

        // Si tu n'utilises pas de cookies, tu peux laisser false. (true n’est utile que pour cookie/sessions)
        config.setAllowCredentials(true);

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
