package com.permissionmanagement.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/role")
@CrossOrigin(origins = "http://localhost:4200")
public class RoleController {

    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<String>> getAllRoles() {
        try {
            logger.info("Fetching all roles");
            // Replace with actual role fetching logic if you have a Role entity/repository
            List<String> roles = Arrays.asList("ROLE_ADMIN", "ROLE_USER", "ROLE_MANAGER");
            logger.info("Returning {} roles", roles.size());
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            logger.error("Error fetching roles", e);
            return ResponseEntity.status(500).build();
        }
    }
}