package com.example.quanlychitieusinhvien.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ThongKeTheoNgayResponse {

    private String ngay;
    private BigDecimal tongThu;
    private BigDecimal tongChi;
}