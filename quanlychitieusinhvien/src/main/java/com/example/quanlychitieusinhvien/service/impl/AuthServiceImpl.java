package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.entity.NguoiDung;
import com.example.quanlychitieusinhvien.repository.NguoiDungRepository;
import com.example.quanlychitieusinhvien.security.JwtUtil;
import com.example.quanlychitieusinhvien.service.AuthService;
import com.example.quanlychitieusinhvien.service.DanhMucService;
import com.example.quanlychitieusinhvien.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.quanlychitieusinhvien.service.ViService;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired  
    private NguoiDungRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private DanhMucService danhMucService;

    @Autowired
    private ViService viService;

    @Autowired
    private OtpService otpService;

    @Override
    public String register(RegisterRequest request) {

        if (repo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        otpService.savePendingRegister(
                request.getEmail(),
                request
        );

        otpService.generateAndSendOtp(
                request.getEmail()
        );

        return "OTP đăng ký đã gửi";
    }

    // 🔥 ĐĂNG NHẬP
    @Override
    public String login(LoginRequest request) {

        NguoiDung user = repo.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Email không tồn tại"));

        if (!passwordEncoder.matches(
                request.getMatKhau(),
                user.getMatKhau()
        )) {

            throw new RuntimeException("Sai mật khẩu");
        }

        otpService.generateAndSendOtp(
                request.getEmail()
        );

        return "OTP đăng nhập đã gửi";
    }

    @Override
    public String verifyRegisterOtp(
            VerifyOtpRequest request
    ) {

        boolean valid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        if(!valid) {
            throw new RuntimeException("OTP không đúng");
        }

        RegisterRequest pending =
                otpService.getPendingRegister(
                        request.getEmail()
                );

        if(pending == null) {
            throw new RuntimeException("Không tìm thấy đăng ký");
        }

        NguoiDung user = new NguoiDung();

        user.setHoTen(pending.getHoTen());

        user.setEmail(pending.getEmail());

        user.setMatKhau(
                passwordEncoder.encode(
                        pending.getMatKhau()
                )
        );

        user.setSoDienThoai(
                pending.getSoDienThoai()
        );

        user.setTrangThai("ACTIVE");

        repo.save(user);

        danhMucService.createDefaultCategories(
                user.getMaNguoiDung()
        );

        otpService.removePendingRegister(
                request.getEmail()
        );

        return "Đăng ký thành công";
    }

    @Override
    public AuthResponse verifyLoginOtp(
            VerifyOtpRequest request
    ) {

        boolean valid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        if(!valid) {
            throw new RuntimeException("OTP không đúng");
        }

        NguoiDung user = repo.findByEmail(
                request.getEmail()
        ).orElseThrow();

        String token =
                jwtUtil.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getHoTen()
        );
    }
}