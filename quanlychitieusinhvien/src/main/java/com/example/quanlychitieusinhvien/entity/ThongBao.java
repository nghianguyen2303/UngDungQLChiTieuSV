package com.example.quanlychitieusinhvien.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "THONG_BAO")
@Data
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaThongBao")
    private Integer maThongBao;

    @Column(name = "NoiDung", nullable = false, length = 500)
    private String noiDung;

    @Column(name = "LoaiThongBao", length = 50)
    private String loaiThongBao; // "CANH_BAO_NGAN_SACH", "NHAC_CHI_TIEU", "BAT_THUONG", "HE_THONG"

    @Column(name = "NgayTao", insertable = false, updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "TrangThai", length = 20)
    private String trangThai; // "CHUA_DOC", "DA_DOC"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNguoiDung", nullable = false)
    private NguoiDung nguoiDung;
}