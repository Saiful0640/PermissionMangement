package com.permissionmanagement.service.Iservice;

import com.permissionmanagement.Model.Department;

import java.util.List;

public interface IDepartmentService {
    public List<Department> getAllDepartment();
    public Department SaveDepartment(Department department);
}
