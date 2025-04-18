package com.permissionmanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
class TestController {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/hash")
    public String hashPassword(@RequestParam String password) {
        return passwordEncoder.encode(password);
    }

    @GetMapping("/verify")
    public boolean verifyPassword(@RequestParam String password, @RequestParam String hash) {
        return passwordEncoder.matches(password, hash);
    }
}