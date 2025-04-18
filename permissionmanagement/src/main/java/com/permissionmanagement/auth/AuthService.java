package com.permissionmanagement.auth;

import com.permissionmanagement.Model.User;
import com.permissionmanagement.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    private final Key jwtSecret = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    private final long jwtExpirationMs = 86400000; // 24 hours

    public LoginResponse authenticate(LoginRequest request) {
        try {
            logger.info("Attempting authentication for user: {}", request.getUsername());
            // Verify user exists
            User user = userRepository.findByUsername(request.getUsername());
            if (user == null) {
                logger.error("User not found in database: {}", request.getUsername());
                throw new UsernameNotFoundException("User not found: " + request.getUsername());
            }
            logger.info("User found: {}, department_id: {}, designation_id: {}",
                    user.getUsername(),
                    user.getDepartment() != null ? user.getDepartment().getId() : "null",
                    user.getDesignation() != null ? user.getDesignation().getId() : "null");
            // Attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            logger.info("Authentication successful for user: {}", request.getUsername());
            String jwt = Jwts.builder()
                    .setSubject(user.getUsername())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(new Date().getTime() + jwtExpirationMs))
                    .signWith(jwtSecret, SignatureAlgorithm.HS512)
                    .compact();
            return new LoginResponse(jwt, user.getId(), user.getUsername(),
                    user.getDepartment().getId(), user.getDesignation().getId());
        } catch (AuthenticationException e) {
            logger.error("Authentication failed for user {}: {}", request.getUsername(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during authentication for user {}: {}", request.getUsername(), e.getMessage());
            throw e;
        }
    }
}