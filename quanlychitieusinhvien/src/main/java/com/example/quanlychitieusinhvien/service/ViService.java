package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.ChuyenTienRequest;
import com.example.quanlychitieusinhvien.dto.ViRequest;
import com.example.quanlychitieusinhvien.dto.ViResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ViService {

    List<ViResponse> getAllByUser(String email);

    ViResponse getById(String email, Integer maVi);

    ViResponse create(String email, ViRequest request);

    ViResponse update(String email, Integer maVi, ViRequest request);

    String delete(String email, Integer maVi);

    // Chuyển tiền giữa các ví
    String chuyenTien(String email, ChuyenTienRequest request);

    // Tổng số dư tất cả ví
    BigDecimal getTongSoDu(String email);

    // Tạo ví mặc định khi đăng ký
    void createDefaultWallets(Integer maNguoiDung);
}