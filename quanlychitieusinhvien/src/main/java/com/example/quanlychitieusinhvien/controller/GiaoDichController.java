package com.example.quanlychitieusinhvien.controller;

import com.example.quanlychitieusinhvien.dto.GiaoDichRequest;
import com.example.quanlychitieusinhvien.dto.GiaoDichResponse;
import com.example.quanlychitieusinhvien.dto.ThongKeThangResponse;
import com.example.quanlychitieusinhvien.service.GiaoDichService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/giao-dich")
@CrossOrigin("*")
public class GiaoDichController {

    @Autowired
    private GiaoDichService service;

    // Lấy tất cả giao dịch
    @GetMapping
    public List<GiaoDichResponse> getAll(Authentication auth) {
        return service.getAllByUser(auth.getName());
    }

    // Lấy theo loại: /api/giao-dich/loai/THU hoặc /api/giao-dich/loai/CHI
    @GetMapping("/loai/{loai}")
    public List<GiaoDichResponse> getByLoai(Authentication auth,
                                            @PathVariable String loai) {
        return service.getByLoai(auth.getName(), loai);
    }

    // Lấy theo danh mục: /api/giao-dich/danh-muc/1
    @GetMapping("/danh-muc/{maDanhMuc}")
    public List<GiaoDichResponse> getByDanhMuc(Authentication auth,
                                               @PathVariable Integer maDanhMuc) {
        return service.getByDanhMuc(auth.getName(), maDanhMuc);
    }

    // Lấy theo tháng: /api/giao-dich/thang?thang=4&nam=2025
    @GetMapping("/thang")
    public List<GiaoDichResponse> getByThang(Authentication auth,
                                             @RequestParam int thang,
                                             @RequestParam int nam) {
        return service.getByThang(auth.getName(), thang, nam);
    }

    // Lấy 1 giao dịch
    @GetMapping("/{id}")
    public GiaoDichResponse getById(Authentication auth,
                                    @PathVariable Integer id) {
        return service.getById(auth.getName(), id);
    }

    // Thêm giao dịch
    @PostMapping
    public GiaoDichResponse create(Authentication auth,
                                   @Valid @RequestBody GiaoDichRequest request) {
        return service.create(auth.getName(), request);
    }

    // Sửa giao dịch
    @PutMapping("/{id}")
    public GiaoDichResponse update(Authentication auth,
                                   @PathVariable Integer id,
                                   @Valid @RequestBody GiaoDichRequest request) {
        return service.update(auth.getName(), id, request);
    }

    // Xóa giao dịch
    @DeleteMapping("/{id}")
    public String delete(Authentication auth,
                         @PathVariable Integer id) {
        return service.delete(auth.getName(), id);
    }

    // Thống kê theo tháng: /api/giao-dich/thong-ke?thang=4&nam=2025
    @GetMapping("/thong-ke")
    public ThongKeThangResponse getThongKe(Authentication auth,
                                           @RequestParam int thang,
                                           @RequestParam int nam) {
        return service.getThongKeThang(auth.getName(), thang, nam);
    }
}