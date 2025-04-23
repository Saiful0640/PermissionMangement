package com.permissionmanagement.controller;

import com.permissionmanagement.Model.User;
import com.permissionmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200")
class TestController {
    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/check-user")
    public String checkUser(@RequestParam String username) {
        logger.info("Checking user: {}", username);
        User user = userRepository.findByUsername(username);
        return user != null ? "User found: " + user.getUsername() : "User not found: " + username;
    }

    @GetMapping("/verify-password")
    public String verifyPassword(@RequestParam String username, @RequestParam String password) {
        logger.info("Verifying password for user: {}, password: {}", username, password);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            logger.warn("User not found: {}", username);
            return "User not found: " + username;
        }
        boolean matches = passwordEncoder.matches(password, user.getPassword());
        logger.info("Password match result for {}: {}", username, matches);
        return "Password match for " + username + ": " + matches;
    }

    @GetMapping("/hash-password")
    public String hashPassword(@RequestParam String password) {
        logger.info("Generating hash for password: {}", password);
        String hash = passwordEncoder.encode(password);
        logger.info("Generated hash: {}", hash);
        return hash;
    }
}