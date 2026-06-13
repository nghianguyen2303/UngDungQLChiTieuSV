package com.example.quanlychitieusinhvien.controller;

import com.example.quanlychitieusinhvien.dto.SoThongBaoResponse;
import com.example.quanlychitieusinhvien.dto.ThongBaoResponse;
import com.example.quanlychitieusinhvien.service.ThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thong-bao")
@CrossOrigin("*")
public class ThongBaoController {

    @Autowired
    private ThongBaoService service;

    // Lấy tất cả thông báo
    @GetMapping
    public List<ThongBaoResponse> getAll(Authentication auth) {
        return service.getAllByUser(auth.getName());
    }

    // Lấy thông báo chưa đọc
    @GetMapping("/chua-doc")
    public List<ThongBaoResponse> getChuaDoc(Authentication auth) {
        return service.getChuaDoc(auth.getName());
    }

    // Đếm số thông báo
    @GetMapping("/count")
    public SoThongBaoResponse count(Authentication auth) {
        return service.countByUser(auth.getName());
    }

    // Đánh dấu 1 đã đọc
    @PutMapping("/{id}/doc")
    public ThongBaoResponse markAsRead(Authentication auth, @PathVariable Integer id) {
        return service.markAsRead(auth.getName(), id);
    }

    // Đánh dấu tất cả đã đọc
    @PutMapping("/doc-tat-ca")
    public String markAllAsRead(Authentication auth) {
        return service.markAllAsRead(auth.getName());
    }

    // Xóa 1 thông báo
    @DeleteMapping("/{id}")
    public String delete(Authentication auth, @PathVariable Integer id) {
        return service.delete(auth.getName(), id);
    }

    // Xóa tất cả đã đọc
    @DeleteMapping("/da-doc")
    public String deleteAllRead(Authentication auth) {
        return service.deleteAllRead(auth.getName());
    }

    // Kiểm tra và tạo cảnh báo ngân sách
    @PostMapping("/kiem-tra-ngan-sach")
    public String kiemTraNganSach(Authentication auth) {
        service.kiemTraNganSach(auth.getName());
        return "Đã kiểm tra ngân sách";
    }
}