package com.permissionmanagement.controller;

import com.permissionmanagement.DTO.PermissionDTO;
import com.permissionmanagement.repository.PermissionRepository;
import com.permissionmanagement.service.PermissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.permissionmanagement.Model.Permission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<List<PermissionDTO>> getPermissions(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long designationId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long userId) {
        try {
            logger.info("Received request for permissions: departmentId={}, designationId={}, role={}, userId={}",
                    departmentId, designationId, role, userId);
            List<Permission> permissions = permissionRepository.findAll(); // Fetch all for flexibility
            List<PermissionDTO> dtos = permissions.stream()
                    .filter(p -> (departmentId == null || p.getDepartment() != null && p.getDepartment().getId().equals(departmentId)))
                    .filter(p -> (designationId == null || p.getDesignation() != null && p.getDesignation().getId().equals(designationId)))
                    .filter(p -> (role == null || (p.getRole() != null && p.getRole().equals(role))))
                    .filter(p -> (userId == null || p.getUserId() != null && p.getUserId().equals(userId)))
                    .map(p -> {
                        PermissionDTO dto = new PermissionDTO();
                        dto.setId(p.getId());
                        dto.setMenuId(p.getMenu() != null ? p.getMenu().getId() : null);
                        if (p.getMenu() != null) {
                            if (p.getMenu().getParentMenu() != null) {
                                dto.setMenuName(p.getMenu().getParentMenu().getMenuName());
                                dto.setSubMenu(p.getMenu().getMenuName());
                            } else {
                                dto.setMenuName(p.getMenu().getMenuName());
                                dto.setSubMenu(null);
                            }
                            dto.setLink(p.getMenu().getLink());
                        }
                        dto.setDepartmentId(p.getDepartment() != null ? p.getDepartment().getId() : null);
                        dto.setDesignationId(p.getDesignation() != null ? p.getDesignation().getId() : null);
                        dto.setRole(p.getRole());
                        dto.setUserId(p.getUserId());
                        dto.setActive(p.isActive());
                        dto.setCanView(p.isCanView());
                        dto.setCanCreate(p.isCanCreate());
                        dto.setCanEdit(p.isCanEdit());
                        dto.setCanDelete(p.isCanDelete());
                        return dto;
                    })
                    .toList();
            logger.info("Returning {} permissions", dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching permissions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<Permission> addPermission(@RequestBody PermissionDTO dto) {
        Permission savedPermission = permissionRepository.save(permissionService.savePermission(dto));
        return ResponseEntity.ok(savedPermission);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        if (!permissionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        permissionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}