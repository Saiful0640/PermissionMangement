package com.permissionmanagement.service;

import com.permissionmanagement.Model.Department;
import com.permissionmanagement.repository.DepartmentRepository;
import com.permissionmanagement.service.Iservice.IDepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService implements IDepartmentService {
    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> getAllDepartment(){
        return departmentRepository.findAll();
    }

    public Department SaveDepartment(Department department){
        return departmentRepository.save(department);
    }

}
