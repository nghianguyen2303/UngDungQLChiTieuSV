package com.example.quanlychitieusinhvien.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GiaoDichRequest {

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal soTien;

    @NotBlank(message = "Loại giao dịch không được để trống")
    @Pattern(regexp = "THU|CHI", message = "Loại giao dịch phải là THU hoặc CHI")
    private String loaiGiaoDich;

    private String ngayGiaoDich; // Format: "yyyy-MM-dd HH:mm:ss" hoặc "yyyy-MM-dd"

    private String ghiChu;

    private Integer maDanhMuc;

    private Integer maVi;
}