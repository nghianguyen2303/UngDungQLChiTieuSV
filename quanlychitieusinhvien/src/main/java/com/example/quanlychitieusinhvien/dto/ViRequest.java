package com.example.quanlychitieusinhvien.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ViRequest {

    @NotBlank(message = "Tên ví không được để trống")
    private String tenVi;

    @NotBlank(message = "Loại ví không được để trống")
    private String loaiVi; // "TIEN_MAT", "NGAN_HANG", "VI_DIEN_TU"

    @NotNull(message = "Số dư không được để trống")
    @PositiveOrZero(message = "Số dư phải >= 0")
    private BigDecimal soDu;

    private String moTa;
}