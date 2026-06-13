package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.*;

public interface AuthService {

    String register(RegisterRequest request);

    String verifyRegisterOtp(VerifyOtpRequest request);

    AuthResponse verifyLoginOtp(VerifyOtpRequest request);

    String login(LoginRequest request);

}