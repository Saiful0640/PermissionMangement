package com.permissionmanagement.controller;

import com.permissionmanagement.Model.Department;
import com.permissionmanagement.repository.DepartmentRepository;
import com.permissionmanagement.service.DepartmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/department")
@CrossOrigin(origins = "http://localhost:4200")
class DepartmentController {

    private static final Logger logger = LoggerFactory.getLogger(DepartmentController.class);
    @Autowired
    private DepartmentService departmentService;

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Department>> getAllDepartments() {
        try {
            logger.info("Fetching all departments");
            List<Department> departments = departmentRepository.findAll();
            logger.info("Returning {} departments", departments.size());
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            logger.error("Error fetching departments", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<Department> saveDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentService.SaveDepartment(department));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department department) {
        if (!departmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        department.setId(id);
        Department updatedDepartment = departmentRepository.save(department);
        return ResponseEntity.ok(updatedDepartment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        if (!departmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        departmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}