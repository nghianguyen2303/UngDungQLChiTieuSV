package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

@Data
public class UserResponse {
    private Integer maNguoiDung;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private String trangThai;
}