package com.example.quanlychitieusinhvien.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ThongKeDanhMucResponse {

    private Integer maDanhMuc;
    private String tenDanhMuc;
    private String loaiDanhMuc;
    private BigDecimal tongTien;
    private double phanTram; // % so với tổng
    private long soGiaoDich;
}