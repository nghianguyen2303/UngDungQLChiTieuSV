package com.example.quanlychitieusinhvien.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "NGUOI_DUNG",
        uniqueConstraints = @UniqueConstraint(columnNames = "Email"))
@Data
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaNguoiDung")
    private Integer maNguoiDung;

    @NotBlank(message = "Họ tên không được để trống")
    @Column(name = "HoTen", nullable = false, length = 100)
    private String hoTen;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    @Column(name = "Email", nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @NotBlank(message = "Mật khẩu không được để trống")
    @Column(name = "MatKhau", nullable = false)
    private String matKhau;

    @Column(name = "SoDienThoai")
    private String soDienThoai;

    @Column(name = "NgayTao", insertable = false, updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "TrangThai")
    private String trangThai;
}