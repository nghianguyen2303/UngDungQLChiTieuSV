// CHỈ DÙNG NẾU KHÔNG THÊM CỘT MaChiTiet
package com.example.quanlychitieusinhvien.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "CHI_TIET_NGAN_SACH")
@Data
@IdClass(ChiTietNganSach.ChiTietId.class)
public class ChiTietNganSach {

    @Data
    public static class ChiTietId implements Serializable {
        private Integer nganSach;
        private Integer danhMuc;
    }

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaNganSach", nullable = false)
    private NganSach nganSach;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaDanhMuc", nullable = false)
    private DanhMuc danhMuc;

    @Column(name = "SoTienDuKien")
    private BigDecimal soTienDuKien;

    @Column(name = "SoTienDaChi")
    private BigDecimal soTienDaChi;

    @Column(name = "GhiChu", length = 255)
    private String ghiChu;
}