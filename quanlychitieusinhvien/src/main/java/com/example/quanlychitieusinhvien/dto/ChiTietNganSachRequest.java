package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChiTietNganSachRequest {

    private Integer maDanhMuc;
    private BigDecimal soTienDuKien;
    private String ghiChu;
}