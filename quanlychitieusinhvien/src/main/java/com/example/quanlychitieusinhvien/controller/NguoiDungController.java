package com.example.quanlychitieusinhvien.controller;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.service.NguoiDungService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class NguoiDungController {

    @Autowired
    private NguoiDungService service;

    @GetMapping("/profile")
    public UserResponse getProfile(Authentication authentication) {
        String email = authentication.getName();
        return service.getProfile(email);
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(Authentication authentication,
                                      @Valid @RequestBody UpdateProfileRequest request) {
        String email = authentication.getName();
        return service.updateProfile(email, request);
    }

    @PutMapping("/change-password")
    public String changePassword(Authentication authentication,
                                 @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        return service.changePassword(email, request);
    }
}