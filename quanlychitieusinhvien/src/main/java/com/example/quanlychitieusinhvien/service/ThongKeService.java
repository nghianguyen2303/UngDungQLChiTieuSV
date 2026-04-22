package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.*;

import java.util.List;

public interface ThongKeService {

    // Tổng quan tháng (thu/chi/số dư + so sánh tháng trước)
    ThongKeTongQuanResponse getTongQuan(String email, int thang, int nam);

    // Chi tiêu theo danh mục trong tháng
    List<ThongKeDanhMucResponse> getTheoDanhMuc(String email, String loai, int thang, int nam);

    // Chi tiêu theo ngày trong tháng
    List<ThongKeTheoNgayResponse> getTheoNgay(String email, int thang, int nam);

    // Xu hướng 6 tháng gần nhất
    List<ThongKeXuHuongResponse> getXuHuong(String email, int thang, int nam);

    // Tổng quan tất cả (số dư hiện tại)
    ThongKeTongQuanResponse getTongQuanTatCa(String email);
}