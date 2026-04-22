package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ViResponse {

    private Integer maVi;
    private String tenVi;
    private String loaiVi;
    private String loaiViLabel; // "Tiền mặt", "Ngân hàng", "Ví điện tử"
    private BigDecimal soDu;
    private String moTa;
}