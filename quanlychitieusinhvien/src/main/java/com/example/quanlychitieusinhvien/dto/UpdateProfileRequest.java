package com.example.quanlychitieusinhvien.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    private String soDienThoai;
}