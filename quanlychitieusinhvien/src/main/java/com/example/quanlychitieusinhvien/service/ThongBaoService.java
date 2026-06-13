package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.SoThongBaoResponse;
import com.example.quanlychitieusinhvien.dto.ThongBaoResponse;

import java.util.List;

public interface ThongBaoService {

    // Lấy tất cả thông báo
    List<ThongBaoResponse> getAllByUser(String email);

    // Lấy thông báo chưa đọc
    List<ThongBaoResponse> getChuaDoc(String email);

    // Đếm số thông báo
    SoThongBaoResponse countByUser(String email);

    // Đánh dấu 1 thông báo đã đọc
    ThongBaoResponse markAsRead(String email, Integer maThongBao);

    // Đánh dấu tất cả đã đọc
    String markAllAsRead(String email);

    // Xóa 1 thông báo
    String delete(String email, Integer maThongBao);

    // Xóa tất cả đã đọc
    String deleteAllRead(String email);

    // Tạo thông báo (dùng nội bộ)
    void taoThongBao(Integer maNguoiDung, String noiDung, String loaiThongBao);

    // Kiểm tra và tạo cảnh báo ngân sách
    void kiemTraNganSach(String email);
}