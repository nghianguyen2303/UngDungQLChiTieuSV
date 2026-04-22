package com.example.quanlychitieusinhvien.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChuyenTienRequest {

    @NotNull(message = "Ví nguồn không được để trống")
    private Integer maViNguon;

    @NotNull(message = "Ví đích không được để trống")
    private Integer maViDich;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal soTien;

    private String ghiChu;
}