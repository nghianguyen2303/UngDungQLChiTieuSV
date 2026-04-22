package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.entity.NguoiDung;
import com.example.quanlychitieusinhvien.repository.NguoiDungRepository;
import com.example.quanlychitieusinhvien.security.JwtUtil;
import com.example.quanlychitieusinhvien.service.AuthService;
import com.example.quanlychitieusinhvien.service.DanhMucService;
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

    // 🔥 ĐĂNG KÝ
    @Override
    public String register(RegisterRequest request) {

        // check email tồn tại
        if (repo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // tạo user
        NguoiDung user = new NguoiDung();
        user.setHoTen(request.getHoTen());
        user.setEmail(request.getEmail());
        user.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        user.setSoDienThoai(request.getSoDienThoai());
        user.setTrangThai("ACTIVE");

        repo.save(user);

        danhMucService.createDefaultCategories(user.getMaNguoiDung());

        viService.createDefaultWallets(user.getMaNguoiDung());

        return "Đăng ký thành công";
    }

    // 🔥 ĐĂNG NHẬP
    @Override
    public AuthResponse login(LoginRequest request) {

        // tìm user
        NguoiDung user = repo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        // check password
        if (!passwordEncoder.matches(request.getMatKhau(), user.getMatKhau())) {
            throw new RuntimeException("Sai mật khẩu");
        }

        // tạo token
        String token = jwtUtil.generateToken(user.getEmail());

        // trả về
        AuthResponse res = new AuthResponse();
        res.setToken(token);
        res.setEmail(user.getEmail());
        res.setHoTen(user.getHoTen());

        return res;
    }
}