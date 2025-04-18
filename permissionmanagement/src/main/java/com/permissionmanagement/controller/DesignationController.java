package com.permissionmanagement.controller;

import com.permissionmanagement.Model.Designation;
import com.permissionmanagement.service.DesignationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designations")
@CrossOrigin(origins = "http://localhost:4200")
class DesignationController {
    @Autowired
    private DesignationService designationService;

    @GetMapping
    public ResponseEntity<List<Designation>> getAllDesignations() {
        return ResponseEntity.ok(designationService.getAllDesignation());
    }

    @PostMapping
    public ResponseEntity<Designation> saveDesignation(@RequestBody Designation designation) {
        return ResponseEntity.ok(designationService.saveDesignation(designation));
    }
}