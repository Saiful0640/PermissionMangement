package com.permissionmanagement.controller;

import com.permissionmanagement.Model.Department;
import com.permissionmanagement.Model.Designation;
import com.permissionmanagement.Model.User;
import com.permissionmanagement.repository.DepartmentRepository;
import com.permissionmanagement.repository.DesignationRepository;
import com.permissionmanagement.repository.UserRepository;
import com.permissionmanagement.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private DesignationRepository designationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


/*
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Fetching all users");
        List<User> users = userRepository.findAll();
        logger.info("Returning {} users", users.size());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")  // Restrict to ADMIN role
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        logger.info("Creating user: {}", user.getUsername());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        logger.info("User created with ID: {}", savedUser.getId());
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")  // Restrict to ADMIN role
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        logger.info("Updating user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            logger.warn("User with ID {} not found", id);
            return ResponseEntity.notFound().build();
        }
        user.setId(id);
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            User existingUser = userRepository.findById(id).orElseThrow();
            user.setPassword(existingUser.getPassword());
        }
        User updatedUser = userRepository.save(user);
        logger.info("User updated with ID: {}", updatedUser.getId());
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")  // Restrict to ADMIN role
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        logger.info("Deleting user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            logger.warn("User with ID {} not found", id);
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        logger.info("User deleted with ID: {}", id);
        return ResponseEntity.ok().build();
    }*/

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        logger.info("Fetching all users");
        List<User> users = userRepository.findAll();
        logger.info("Returning {} users", users.size());
        return ResponseEntity.ok(users);
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@Valid @RequestBody User user, Principal principal) {
        logger.info("Attempting to create user: {}, authenticated user: {}", user.getUsername(), principal != null ? principal.getName() : "null");
        if (principal == null) {
            logger.error("No authenticated principal found");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        logger.info("Authenticated authorities: {}", SecurityContextHolder.getContext().getAuthentication().getAuthorities());

        // Fetch Department and Designation based on IDs
        if (user.getDepartmentId() != null) {
            Department department = departmentRepository.findById(user.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + user.getDepartmentId()));
            user.setDepartment(department);
        } else {
            throw new IllegalArgumentException("Department ID must not be null");
        }

        if (user.getDesignationId() != null) {
            Designation designation = designationRepository.findById(user.getDesignationId())
                    .orElseThrow(() -> new IllegalArgumentException("Designation not found with ID: " + user.getDesignationId()));
            user.setDesignation(designation);
        } else {
            throw new IllegalArgumentException("Designation ID must not be null");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_" + user.getRole());
        User savedUser = userRepository.save(user);
        logger.info("User created with ID: {}", savedUser.getId());
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        logger.info("Updating user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            logger.warn("User with ID {} not found", id);
            return ResponseEntity.notFound().build();
        }

        // Fetch Department and Designation based on IDs
        if (user.getDepartmentId() != null) {
            Department department = departmentRepository.findById(user.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found with ID: " + user.getDepartmentId()));
            user.setDepartment(department);
        } else {
            throw new IllegalArgumentException("Department ID must not be null");
        }

        if (user.getDesignationId() != null) {
            Designation designation = designationRepository.findById(user.getDesignationId())
                    .orElseThrow(() -> new IllegalArgumentException("Designation not found with ID: " + user.getDesignationId()));
            user.setDesignation(designation);
        } else {
            throw new IllegalArgumentException("Designation ID must not be null");
        }

        user.setId(id);
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            User existingUser = userRepository.findById(id).orElseThrow();
            user.setPassword(existingUser.getPassword());
        }
        User updatedUser = userRepository.save(user);
        logger.info("User updated with ID: {}", updatedUser.getId());
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        logger.info("Deleting user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            logger.warn("User with ID {} not found", id);
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        logger.info("User deleted with ID: {}", id);
        return ResponseEntity.ok().build();
    }
}