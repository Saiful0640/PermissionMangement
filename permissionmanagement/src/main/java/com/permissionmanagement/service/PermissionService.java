package com.permissionmanagement.service;

import com.permissionmanagement.DTO.PermissionDTO;
import com.permissionmanagement.Model.Menu;
import com.permissionmanagement.Model.Permission;
import com.permissionmanagement.repository.DepartmentRepository;
import com.permissionmanagement.repository.DesignationRepository;
import com.permissionmanagement.repository.MenuRepository;
import com.permissionmanagement.service.Iservice.PermissionIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.permissionmanagement.repository.PermissionRepository;
import com.permissionmanagement.util.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PermissionService implements PermissionIService {

    private static final Logger logger = LoggerFactory.getLogger(PermissionService.class);

    @Autowired
    private PermissionRepository permissionRepository;
    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private DesignationRepository designationRepository;
    @Autowired
    private MenuRepository menuRepository;

    @Override
    public List<PermissionDTO> getPermissions(Long departmentId, Long designationId) {
        logger.info("Fetching permissions for departmentId: {}, designationId: {}", departmentId, designationId);
        List<Permission> permissions = permissionRepository.findByDepartmentIdAndDesignationId(departmentId, designationId);
        logger.info("Raw permissions from repository: {}", permissions);
        List<PermissionDTO> dtos = new ArrayList<>();

        for (Permission p : permissions) {
            if (!p.isActive()) continue;

            PermissionDTO dto = new PermissionDTO();
            dto.setId(p.getId());
            dto.setDepartmentId(p.getDepartment() != null ? p.getDepartment().getId() : null);
            dto.setDesignationId(p.getDesignation() != null ? p.getDesignation().getId() : null);
            dto.setRole(p.getRole());
            dto.setUserId(p.getUserId());

            Menu menu = p.getMenu();
            if (menu != null) {
                dto.setMenuId(menu.getId());
                if (menu.getParentMenu() != null) {
                    dto.setMenuName(menu.getParentMenu().getMenuName());
                    dto.setSubMenu(menu.getMenuName());
                } else {
                    dto.setMenuName(menu.getMenuName());
                    dto.setSubMenu(null);
                }
                dto.setLink(menu.getLink());
            } else {
                logger.warn("Menu is null for permission ID: {}", p.getId());
                dto.setMenuId(null);
                dto.setMenuName(null);
                dto.setSubMenu(null);
                dto.setLink(null);
            }

            dto.setActive(p.isActive());
            dto.setCanView(p.isCanView());
            dto.setCanCreate(p.isCanCreate());
            dto.setCanEdit(p.isCanEdit());
            dto.setCanDelete(p.isCanDelete());

            dtos.add(dto);
        }

        logger.info("Found {} permissions", dtos.size());
        return dtos;
    }

    @Override
    public Permission savePermission(PermissionDTO dto) {
        Permission permission = (dto.getId() != null && dto.getId() != 0)
                ? permissionRepository.findById(dto.getId()).orElseThrow(() -> new ResourceNotFoundException("Permission not found with id: " + dto.getId()))
                : new Permission();

        permission.setMenu(menuRepository.findById(dto.getMenuId()).orElseThrow(() -> new ResourceNotFoundException("Menu not found with id: " + dto.getMenuId())));
        permission.setDepartment(dto.getDepartmentId() != null ? departmentRepository.findById(dto.getDepartmentId()).orElse(null) : null);
        permission.setDesignation(dto.getDesignationId() != null ? designationRepository.findById(dto.getDesignationId()).orElse(null) : null);
        permission.setRole(dto.getRole());
        permission.setUserId(dto.getUserId());
        permission.setActive(dto.isActive());
        permission.setCanView(dto.isCanView());
        permission.setCanCreate(dto.isCanCreate());
        permission.setCanEdit(dto.isCanEdit());
        permission.setCanDelete(dto.isCanDelete());

        return permissionRepository.save(permission);
    }



}