package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.*;

import java.util.List;

public interface NganSachService {

    // Lấy tất cả ngân sách của user
    List<NganSachResponse> getAllByUser(String email);

    // Lấy ngân sách theo tháng/năm
    NganSachResponse getByThang(String email, int thang, int nam);

    // Lấy ngân sách theo ID
    NganSachResponse getById(String email, Integer id);

    // Tạo ngân sách mới
    NganSachResponse create(String email, NganSachRequest request);

    // Cập nhật ngân sách
    NganSachResponse update(String email, Integer id, NganSachRequest request);

    // Xóa ngân sách
    String delete(String email, Integer id);

    // Lấy cảnh báo ngân sách tháng hiện tại
    List<CanhBaoNganSachResponse> getCanhBao(String email, int thang, int nam);
}