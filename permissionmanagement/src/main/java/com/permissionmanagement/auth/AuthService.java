package com.permissionmanagement.auth;

import com.permissionmanagement.Model.User;
import com.permissionmanagement.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final String SECRET_KEY = "your-very-secure-and-long-secret-key-for-jwt-signing-1234567890abcdef";
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final Key jwtSecret;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtSecret = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public LoginResponse authenticate(LoginRequest request) throws AuthenticationException {
        logger.info("Authenticating user: {}", request.getUsername());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername());
        if (user == null) {
            logger.error("User not found: {}", request.getUsername());
            throw new AuthenticationException("User not found") {};
        }

        String role = normalizeRole(user.getRole());
        String token = Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(jwtSecret)
                .compact();

        logger.info("Generated JWT token for user {} with role {}: {}", user.getUsername(), role, token);
        return new LoginResponse(token, user.getId(), user.getUsername(),
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getDesignation() != null ? user.getDesignation().getId() : null);
    }

    private String normalizeRole(String role) {
        if (role == null) return "ROLE_USER";
        while (role.startsWith("ROLE_") && role.indexOf("ROLE_", 5) != -1) {
            role = role.substring(0, 5) + role.substring(role.indexOf("ROLE_", 5) + 5);
        }
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }
}