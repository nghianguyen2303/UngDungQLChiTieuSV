package com.example.quanlychitieusinhvien.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DanhMucRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    private String tenDanhMuc;

    @NotBlank(message = "Loại danh mục không được để trống")
    @Pattern(regexp = "THU|CHI", message = "Loại danh mục phải là THU hoặc CHI")
    private String loaiDanhMuc;

    private String moTa;
}