package com.permissionmanagement.controller;

import com.permissionmanagement.Model.Designation;
import com.permissionmanagement.repository.DesignationRepository;
import com.permissionmanagement.service.DesignationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designation")
@CrossOrigin(origins = "http://localhost:4200")
class DesignationController {

    private static final Logger logger = LoggerFactory.getLogger(DesignationController.class);
    @Autowired
    private DesignationService designationService;
    @Autowired
    private DesignationRepository designationRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<List<Designation>> getAllDesignations() {
        try {
            logger.info("Fetching all designations");
            List<Designation> designations = designationRepository.findAll();
            logger.info("Returning {} designations", designations.size());
            return ResponseEntity.ok(designations);
        } catch (Exception e) {
            logger.error("Error fetching designations", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<Designation> saveDesignation(@RequestBody Designation designation) {
        return ResponseEntity.ok(designationService.saveDesignation(designation));
    }
}