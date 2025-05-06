package com.permissionmanagement.service.Iservice;

import com.permissionmanagement.DTO.PermissionDTO;
import com.permissionmanagement.Model.Menu;
import com.permissionmanagement.Model.Permission;

import java.util.List;
import java.util.Set;

public interface PermissionIService {

    List<PermissionDTO> getPermissions(Long departmentId, Long designationId);

    Permission savePermission(PermissionDTO dto);
}
