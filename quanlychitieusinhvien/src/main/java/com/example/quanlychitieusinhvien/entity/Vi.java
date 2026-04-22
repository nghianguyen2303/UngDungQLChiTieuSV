package com.example.quanlychitieusinhvien.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "VI")
@Data
public class Vi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaVi")
    private Integer maVi;

    @NotBlank(message = "Tên ví không được để trống")
    @Column(name = "TenVi", nullable = false, length = 100)
    private String tenVi;

    @Column(name = "LoaiVi", length = 50)
    private String loaiVi; // "TIEN_MAT", "NGAN_HANG", "VI_DIEN_TU"

    @Column(name = "SoDu")
    private BigDecimal soDu;

    @Column(name = "MoTa", length = 255)
    private String moTa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNguoiDung", nullable = false)
    private NguoiDung nguoiDung;
}