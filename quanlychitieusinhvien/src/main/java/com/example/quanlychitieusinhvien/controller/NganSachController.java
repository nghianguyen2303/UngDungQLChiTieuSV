package com.example.quanlychitieusinhvien.controller;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.service.NganSachService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ngan-sach")
@CrossOrigin("*")
public class NganSachController {

    @Autowired
    private NganSachService service;

    // Lấy tất cả ngân sách
    @GetMapping
    public List<NganSachResponse> getAll(Authentication auth) {
        return service.getAllByUser(auth.getName());
    }

    // Lấy theo tháng: /api/ngan-sach/thang?thang=4&nam=2026
    @GetMapping("/thang")
    public NganSachResponse getByThang(Authentication auth,
                                       @RequestParam int thang,
                                       @RequestParam int nam) {
        return service.getByThang(auth.getName(), thang, nam);
    }

    // Lấy theo ID
    @GetMapping("/{id}")
    public NganSachResponse getById(Authentication auth,
                                    @PathVariable Integer id) {
        return service.getById(auth.getName(), id);
    }

    // Tạo ngân sách
    @PostMapping
    public NganSachResponse create(Authentication auth,
                                   @Valid @RequestBody NganSachRequest request) {
        return service.create(auth.getName(), request);
    }

    // Sửa ngân sách
    @PutMapping("/{id}")
    public NganSachResponse update(Authentication auth,
                                   @PathVariable Integer id,
                                   @Valid @RequestBody NganSachRequest request) {
        return service.update(auth.getName(), id, request);
    }

    // Xóa ngân sách
    @DeleteMapping("/{id}")
    public String delete(Authentication auth,
                         @PathVariable Integer id) {
        return service.delete(auth.getName(), id);
    }

    // Cảnh báo ngân sách: /api/ngan-sach/canh-bao?thang=4&nam=2026
    @GetMapping("/canh-bao")
    public List<CanhBaoNganSachResponse> getCanhBao(Authentication auth,
                                                    @RequestParam int thang,
                                                    @RequestParam int nam) {
        return service.getCanhBao(auth.getName(), thang, nam);
    }
}