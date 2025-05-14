package com.permissionmanagement.controller;


import com.permissionmanagement.Model.Menu;
import com.permissionmanagement.repository.MenuRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "http://localhost:4200")
public class MenuController {

    private static final Logger logger = LoggerFactory.getLogger(MenuController.class);

    @Autowired
    private MenuRepository menuRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ResponseEntity<List<Menu>> getAllMenus() {
        try {
            logger.info("Fetching all menus");
            List<Menu> menus = menuRepository.findAll();
            logger.info("Returning {} menus", menus.size());
            return ResponseEntity.ok(menus);
        } catch (Exception e) {
            logger.error("Error fetching menus", e);
            return ResponseEntity.status(500).build();
        }
    }
}