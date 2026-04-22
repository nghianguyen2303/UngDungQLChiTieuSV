package com.example.quanlychitieusinhvien.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank
    private String matKhauCu;

    @NotBlank
    private String matKhauMoi;
}