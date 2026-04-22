package com.example.quanlychitieusinhvien.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ThongKeXuHuongResponse {

    private int thang;
    private int nam;
    private String label;
    private BigDecimal tongThu;
    private BigDecimal tongChi;
}