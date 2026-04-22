package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

@Data
public class DanhMucResponse {

    private Integer maDanhMuc;
    private String tenDanhMuc;
    private String loaiDanhMuc;
    private String moTa;
    private boolean isSystem;
}