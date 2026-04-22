package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.*;

public interface AuthService {

    String register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

}