package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.GiaoDichRequest;
import com.example.quanlychitieusinhvien.dto.GiaoDichResponse;
import com.example.quanlychitieusinhvien.dto.ThongKeThangResponse;

import java.util.List;

public interface GiaoDichService {

    // Lấy tất cả giao dịch
    List<GiaoDichResponse> getAllByUser(String email);

    // Lấy theo loại THU/CHI
    List<GiaoDichResponse> getByLoai(String email, String loaiGiaoDich);

    // Lấy theo danh mục
    List<GiaoDichResponse> getByDanhMuc(String email, Integer maDanhMuc);

    // Lấy theo tháng/năm
    List<GiaoDichResponse> getByThang(String email, int thang, int nam);

    // Lấy 1 giao dịch
    GiaoDichResponse getById(String email, Integer maGiaoDich);

    // Thêm giao dịch
    GiaoDichResponse create(String email, GiaoDichRequest request);

    // Sửa giao dịch
    GiaoDichResponse update(String email, Integer maGiaoDich, GiaoDichRequest request);

    // Xóa giao dịch (soft delete)
    String delete(String email, Integer maGiaoDich);

    // Thống kê theo tháng
    ThongKeThangResponse getThongKeThang(String email, int thang, int nam);
}