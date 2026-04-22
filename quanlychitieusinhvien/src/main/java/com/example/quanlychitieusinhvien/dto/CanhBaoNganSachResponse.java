package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CanhBaoNganSachResponse {

    private String loaiCanhBao; // "TONG" hoặc "DANH_MUC"
    private String tenDanhMuc; // null nếu loại = TONG
    private BigDecimal gioiHan;
    private BigDecimal daChi;
    private double phanTram;
    private String trangThai; // "CANH_BAO", "VUOT_NGAN_SACH"
    private String noiDung; // Message hiển thị
}