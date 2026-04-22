package com.example.quanlychitieusinhvien.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Table(name = "DANH_MUC")
@Data
public class DanhMuc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDanhMuc")
    private Integer maDanhMuc;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Column(name = "TenDanhMuc", nullable = false, length = 100)
    private String tenDanhMuc;

    @Column(name = "LoaiDanhMuc", length = 20)
    private String loaiDanhMuc;

    @Column(name = "MoTa", length = 255)
    private String moTa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNguoiDung", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "IsSystem")
    private Integer isSystem;
}