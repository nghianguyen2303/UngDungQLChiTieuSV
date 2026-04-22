package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class NganSachResponse {

    private Integer maNganSach;
    private Integer thang;
    private Integer nam;
    private BigDecimal soTienGioiHan;
    private String ngayTao;

    // Tính từ giao dịch thực tế
    private BigDecimal tongDaChi;
    private BigDecimal conLai;
    private double phanTramDaChi; // 0 - 100
    private String trangThai; // "AN_TOAN", "CANH_BAO", "VUOT_NGAN_SACH"

    // Chi tiết theo danh mục
    private List<ChiTietNganSachResponse> chiTiet;
}