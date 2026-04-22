package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ThongKeThangResponse {

    private int thang;
    private int nam;
    private BigDecimal tongThu;
    private BigDecimal tongChi;
    private BigDecimal soDu; // tongThu - tongChi
    private long soGiaoDich;
}