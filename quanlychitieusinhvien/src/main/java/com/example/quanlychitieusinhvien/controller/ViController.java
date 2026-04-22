package com.example.quanlychitieusinhvien.controller;

import com.example.quanlychitieusinhvien.dto.ChuyenTienRequest;
import com.example.quanlychitieusinhvien.dto.ViRequest;
import com.example.quanlychitieusinhvien.dto.ViResponse;
import com.example.quanlychitieusinhvien.service.ViService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vi")
@CrossOrigin("*")
public class ViController {

    @Autowired
    private ViService service;

    // Lấy tất cả ví
    @GetMapping
    public List<ViResponse> getAll(Authentication auth) {
        return service.getAllByUser(auth.getName());
    }

    // Lấy 1 ví
    @GetMapping("/{id}")
    public ViResponse getById(Authentication auth, @PathVariable Integer id) {
        return service.getById(auth.getName(), id);
    }

    // Tạo ví mới
    @PostMapping
    public ViResponse create(Authentication auth,
                             @Valid @RequestBody ViRequest request) {
        return service.create(auth.getName(), request);
    }

    // Sửa ví
    @PutMapping("/{id}")
    public ViResponse update(Authentication auth,
                             @PathVariable Integer id,
                             @Valid @RequestBody ViRequest request) {
        return service.update(auth.getName(), id, request);
    }

    // Xóa ví
    @DeleteMapping("/{id}")
    public String delete(Authentication auth, @PathVariable Integer id) {
        return service.delete(auth.getName(), id);
    }

    // Chuyển tiền giữa các ví
    @PostMapping("/chuyen-tien")
    public String chuyenTien(Authentication auth,
                             @Valid @RequestBody ChuyenTienRequest request) {
        return service.chuyenTien(auth.getName(), request);
    }

    // Tổng số dư tất cả ví
    @GetMapping("/tong-so-du")
    public BigDecimal getTongSoDu(Authentication auth) {
        return service.getTongSoDu(auth.getName());
    }
}