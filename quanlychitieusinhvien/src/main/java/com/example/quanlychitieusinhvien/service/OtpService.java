package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.RegisterRequest;

public interface OtpService {

    void generateAndSendOtp(String email);

    boolean verifyOtp(String email, String otp);

    void savePendingRegister(
            String email,
            RegisterRequest request
    );

    RegisterRequest getPendingRegister(
            String email
    );

    void removePendingRegister(
            String email
    );
}