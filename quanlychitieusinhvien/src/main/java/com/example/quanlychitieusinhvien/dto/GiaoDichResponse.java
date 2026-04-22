package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GiaoDichResponse {

    private Integer maGiaoDich;
    private BigDecimal soTien;
    private String loaiGiaoDich;
    private String ngayGiaoDich;
    private String ghiChu;
    private String trangThai;

    // Thông tin danh mục
    private Integer maDanhMuc;
    private String tenDanhMuc;

    // Thông tin ví
    private Integer maVi;
}