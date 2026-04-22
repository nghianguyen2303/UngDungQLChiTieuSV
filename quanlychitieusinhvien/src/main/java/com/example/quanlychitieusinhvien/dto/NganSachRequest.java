package com.example.quanlychitieusinhvien.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class NganSachRequest {

    @NotNull(message = "Tháng không được để trống")
    private Integer thang;

    @NotNull(message = "Năm không được để trống")
    private Integer nam;

    @NotNull(message = "Số tiền giới hạn không được để trống")
    @Positive(message = "Số tiền giới hạn phải lớn hơn 0")
    private BigDecimal soTienGioiHan;

    // Danh sách chi tiết ngân sách theo danh mục (tùy chọn)
    private List<ChiTietNganSachRequest> chiTiet;
}