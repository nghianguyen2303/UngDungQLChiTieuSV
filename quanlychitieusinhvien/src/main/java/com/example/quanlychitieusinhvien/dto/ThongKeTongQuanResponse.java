package com.example.quanlychitieusinhvien.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ThongKeTongQuanResponse {

    private int thang;
    private int nam;
    private BigDecimal tongThu;
    private BigDecimal tongChi;
    private BigDecimal soDu;
    private long soGiaoDich;

    // So sánh với tháng trước (%)
    private double phanTramThuThayDoi;  // +10.5 hoặc -5.2
    private double phanTramChiThayDoi;
}