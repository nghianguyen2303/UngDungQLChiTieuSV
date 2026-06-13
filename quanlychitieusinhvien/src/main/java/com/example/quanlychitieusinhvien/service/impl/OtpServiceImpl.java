package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.RegisterRequest;
import com.example.quanlychitieusinhvien.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {

    private final Map<String, String> otpStorage =
            new ConcurrentHashMap<>();

    private final Map<String, LocalDateTime> otpExpiry =
            new ConcurrentHashMap<>();

    private final Map<String, RegisterRequest> pendingRegister =
            new ConcurrentHashMap<>();

    @Autowired
    private JavaMailSender mailSender;

    // ===== GENERATE OTP =====
    @Override
    public void generateAndSendOtp(String email) {

        String otp = generateOtp();

        otpStorage.put(email, otp);

        otpExpiry.put(
                email,
                LocalDateTime.now().plusMinutes(5)
        );

        sendEmail(email, otp);
    }

    // ===== VERIFY OTP =====
    @Override
    public boolean verifyOtp(String email, String otp) {

        String savedOtp = otpStorage.get(email);

        LocalDateTime expiry = otpExpiry.get(email);

        if(savedOtp == null || expiry == null) {
            return false;
        }

        if(LocalDateTime.now().isAfter(expiry)) {

            otpStorage.remove(email);
            otpExpiry.remove(email);

            return false;
        }

        boolean valid = savedOtp.equals(otp);

        if(valid) {

            otpStorage.remove(email);
            otpExpiry.remove(email);
        }

        return valid;
    }

    // ===== GENERATE RANDOM OTP =====
    private String generateOtp() {

        Random random = new Random();

        int otp = 100000 + random.nextInt(900000);

        return String.valueOf(otp);
    }

    // ===== SEND EMAIL =====
    private void sendEmail(String to, String otp) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(to);

        message.setSubject("Mã OTP");

        message.setText(
                "Mã OTP của bạn là: " + otp
        );

        mailSender.send(message);
    }

    // ===== PENDING REGISTER =====
    @Override
    public void savePendingRegister(
            String email,
            RegisterRequest request
    ) {
        pendingRegister.put(email, request);
    }

    @Override
    public RegisterRequest getPendingRegister(
            String email
    ) {
        return pendingRegister.get(email);
    }

    @Override
    public void removePendingRegister(
            String email
    ) {
        pendingRegister.remove(email);
    }
}