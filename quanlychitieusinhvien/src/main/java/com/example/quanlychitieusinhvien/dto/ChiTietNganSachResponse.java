package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChiTietNganSachResponse {

    private Integer maDanhMuc;
    private String tenDanhMuc;
    private BigDecimal soTienDuKien;
    private BigDecimal soTienDaChi; // Tính từ giao dịch thực tế
    private BigDecimal conLai;
    private double phanTramDaChi;
    private String trangThai; // "AN_TOAN", "CANH_BAO", "VUOT"
    private String ghiChu;
}