package com.permissionmanagement.service;

import com.permissionmanagement.DTO.PermissionDTO;
import com.permissionmanagement.repository.DepartmentRepository;
import com.permissionmanagement.repository.DesignationRepository;
import com.permissionmanagement.repository.MenuRepository;
import com.permissionmanagement.service.Iservice.PermissionIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.permissionmanagement.Model.Permission;
import com.permissionmanagement.repository.PermissionRepository;
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

    public List<PermissionDTO> getPermissions(Long departmentId, Long designationId) {
        logger.info("Fetching permissions for departmentId: {}, designationId: {}", departmentId, designationId);
        List<Permission> permissions = permissionRepository.findByDepartmentIdAndDesignationId(departmentId, designationId);
        List<PermissionDTO> dtos = new ArrayList<>();
        for (Permission p : permissions) {
            PermissionDTO dto = new PermissionDTO();
            dto.setId(p.getId());
            dto.setMenuId(p.getMenu().getId());
            dto.setMenuName(p.getMenu().getMenuName());
            dto.setSubMenu(p.getMenu().getSubMenu());
            dto.setLink(p.getMenu().getLink());
            dto.setStatus(p.getStatus());
            dto.setCanView(p.isCanView());
            dto.setCanCreate(p.isCanCreate());
            dto.setCanEdit(p.isCanEdit());
            dto.setCanDelete(p.isCanDelete());
            dto.setDepartmentId(p.getDepartment().getId());
            dto.setDesignationId(p.getDesignation().getId());
            dtos.add(dto);
        }
        logger.info("Found {} permissions", dtos.size());
        return dtos;
    }


    public Permission savePermission(PermissionDTO dto) {
        Permission permission = new Permission();
        permission.setId(dto.getId());
        permission.setMenu(menuRepository.findById(dto.getMenuId()).orElseThrow());
        permission.setDepartment(departmentRepository.findById(dto.getDepartmentId()).orElseThrow());
        permission.setDesignation(designationRepository.findById(dto.getDesignationId()).orElseThrow());
        permission.setStatus(dto.getStatus());
        permission.setCanView(dto.isCanView());
        permission.setCanCreate(dto.isCanCreate());
        permission.setCanEdit(dto.isCanEdit());
        permission.setCanDelete(dto.isCanDelete());
        return permissionRepository.save(permission);
    }
}
