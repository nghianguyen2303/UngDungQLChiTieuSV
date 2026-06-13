package com.example.quanlychitieusinhvien.controller;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService service;

    // 🔥 ĐĂNG KÝ
    @PostMapping("/register")
    public String register(@Valid @RequestBody RegisterRequest request) {
        return service.register(request);
    }

    @PostMapping("/login")
    public String login(
            @Valid @RequestBody LoginRequest request
    ) {
        return service.login(request);
    }

    // 🔥 LOGOUT
    @PostMapping("/logout")
    public String logout() {
        return "Đăng xuất thành công";
    }

    @PostMapping("/verify-register-otp")
    public String verifyRegisterOtp(
            @RequestBody VerifyOtpRequest request
    ) {
        return service.verifyRegisterOtp(request);
    }

    @PostMapping("/verify-login-otp")
    public AuthResponse verifyLoginOtp(
            @RequestBody VerifyOtpRequest request
    ) {
        return service.verifyLoginOtp(request);
    }
}