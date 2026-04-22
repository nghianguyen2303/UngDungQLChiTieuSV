package com.example.quanlychitieusinhvien.controller;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thong-ke")
@CrossOrigin("*")
public class ThongKeController {

    @Autowired
    private ThongKeService service;

    // Tổng quan tháng: /api/thong-ke/tong-quan?thang=4&nam=2026
    @GetMapping("/tong-quan")
    public ThongKeTongQuanResponse getTongQuan(
            Authentication auth,
            @RequestParam int thang,
            @RequestParam int nam) {
        return service.getTongQuan(auth.getName(), thang, nam);
    }

    // Tổng quan tất cả (số dư hiện tại): /api/thong-ke/tong-quan-tat-ca
    @GetMapping("/tong-quan-tat-ca")
    public ThongKeTongQuanResponse getTongQuanTatCa(Authentication auth) {
        return service.getTongQuanTatCa(auth.getName());
    }

    // Thống kê theo danh mục: /api/thong-ke/danh-muc?loai=CHI&thang=4&nam=2026
    @GetMapping("/danh-muc")
    public List<ThongKeDanhMucResponse> getTheoDanhMuc(
            Authentication auth,
            @RequestParam String loai,
            @RequestParam int thang,
            @RequestParam int nam) {
        return service.getTheoDanhMuc(auth.getName(), loai, thang, nam);
    }

    // Thống kê theo ngày: /api/thong-ke/theo-ngay?thang=4&nam=2026
    @GetMapping("/theo-ngay")
    public List<ThongKeTheoNgayResponse> getTheoNgay(
            Authentication auth,
            @RequestParam int thang,
            @RequestParam int nam) {
        return service.getTheoNgay(auth.getName(), thang, nam);
    }

    // Xu hướng 6 tháng: /api/thong-ke/xu-huong?thang=4&nam=2026
    @GetMapping("/xu-huong")
    public List<ThongKeXuHuongResponse> getXuHuong(
            Authentication auth,
            @RequestParam int thang,
            @RequestParam int nam) {
        return service.getXuHuong(auth.getName(), thang, nam);
    }
}