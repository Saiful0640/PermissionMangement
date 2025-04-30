package com.permissionmanagement.controller;

import com.permissionmanagement.DTO.PermissionDTO;
import com.permissionmanagement.Model.Menu;
import com.permissionmanagement.repository.PermissionRepository;
import com.permissionmanagement.service.PermissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.permissionmanagement.Model.Permission;
import com.permissionmanagement.service.Iservice.PermissionIService;
import com.permissionmanagement.util.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/permission")
@CrossOrigin(origins = "http://localhost:4200")
class PermissionController {
    private static final Logger logger = LoggerFactory.getLogger(PermissionController.class);

    @Autowired
    private PermissionService permissionService;
    @Autowired
    private PermissionRepository permissionRepository;

    @GetMapping
    public ResponseEntity<List<PermissionDTO>> getPermissions(
            @RequestParam Long departmentId,
            @RequestParam Long designationId) {
        try {
            logger.info("Received request for permissions: departmentId={}, designationId={}", departmentId, designationId);
            List<PermissionDTO> permissions = permissionService.getPermissions(departmentId, designationId);
            logger.info("Returning {} permissions", permissions.size());
            return ResponseEntity.ok(permissions);
        } catch (Exception e) {
            logger.error("Error fetching permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<Permission> updatePermission(@PathVariable Long id, @RequestBody PermissionDTO dto) {
        try {
            dto.setId(id);
            Permission permission = permissionService.savePermission(dto);
            return ResponseEntity.ok(permission);
        } catch (Exception e) {
            logger.error("Error updating permission", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @PostMapping
    public ResponseEntity<Permission> addPermission(@RequestBody Permission permission) {
        Permission savedPermission = permissionRepository.save(permission);
        return ResponseEntity.ok(savedPermission);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        if (!permissionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        permissionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}