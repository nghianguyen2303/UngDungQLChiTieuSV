package com.example.quanlychitieusinhvien.dto;

import lombok.Data;

@Data
public class ThongBaoResponse {

    private Integer maThongBao;
    private String noiDung;
    private String loaiThongBao;
    private String loaiThongBaoLabel;
    private String ngayTao;
    private String trangThai;
    private boolean daDoc;
}