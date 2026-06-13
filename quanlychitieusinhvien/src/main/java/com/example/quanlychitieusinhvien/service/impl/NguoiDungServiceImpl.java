package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.entity.NguoiDung;
import com.example.quanlychitieusinhvien.repository.NguoiDungRepository;
import com.example.quanlychitieusinhvien.service.NguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class NguoiDungServiceImpl implements NguoiDungService {

    @Autowired
    private NguoiDungRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getProfile(String email) {

        NguoiDung user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        return mapToResponse(user);
    }

    @Override
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {

        NguoiDung user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        user.setHoTen(request.getHoTen());
        user.setSoDienThoai(request.getSoDienThoai());

        repo.save(user);

        return mapToResponse(user);
    }

    @Override
    public String changePassword(String email, ChangePasswordRequest request) {

        NguoiDung user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        // check mật khẩu cũ
        if (!passwordEncoder.matches(request.getMatKhauCu(), user.getMatKhau())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        // set mật khẩu mới
        user.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        repo.save(user);

        return "Đổi mật khẩu thành công";
    }

    private UserResponse mapToResponse(NguoiDung user) {
        UserResponse res = new UserResponse();
        res.setMaNguoiDung(user.getMaNguoiDung());
        res.setHoTen(user.getHoTen());
        res.setEmail(user.getEmail());
        res.setSoDienThoai(user.getSoDienThoai());
        res.setTrangThai(user.getTrangThai());
        if (user.getNgayTao() != null) {
            res.setNgayTao(user.getNgayTao().toString());
        }
        return res;
    }
}