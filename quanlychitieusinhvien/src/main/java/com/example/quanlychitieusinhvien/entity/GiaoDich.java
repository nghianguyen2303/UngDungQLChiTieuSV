package com.example.quanlychitieusinhvien.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "GIAO_DICH")
@Data
public class GiaoDich {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaGiaoDich")
    private Integer maGiaoDich;

    @Column(name = "SoTien", nullable = false)
    private BigDecimal soTien;

    @Column(name = "LoaiGiaoDich", nullable = false, length = 20)
    private String loaiGiaoDich;

    @Column(name = "NgayGiaoDich", nullable = false)
    private LocalDateTime ngayGiaoDich;

    @Column(name = "GhiChu", length = 255)
    private String ghiChu;

    @Column(name = "TrangThai", length = 20)
    private String trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNguoiDung", nullable = false)
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDanhMuc")
    private DanhMuc danhMuc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaVi")
    private Vi vi;
}