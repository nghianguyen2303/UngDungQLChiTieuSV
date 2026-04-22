package com.example.quanlychitieusinhvien.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "NGAN_SACH")
@Data
public class NganSach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaNganSach")
    private Integer maNganSach;

    @Column(name = "Thang", nullable = false)
    private Integer thang;

    @Column(name = "Nam", nullable = false)
    private Integer nam;

    @Column(name = "SoTienGioiHan", nullable = false)
    private BigDecimal soTienGioiHan;

    @Column(name = "NgayTao", insertable = false, updatable = false)
    private LocalDateTime ngayTao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNguoiDung", nullable = false)
    private NguoiDung nguoiDung;

    @OneToMany(mappedBy = "nganSach", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChiTietNganSach> chiTietNganSach;
}