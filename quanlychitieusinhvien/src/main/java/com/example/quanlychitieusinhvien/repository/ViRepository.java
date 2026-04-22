package com.example.quanlychitieusinhvien.repository;

import com.example.quanlychitieusinhvien.entity.Vi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ViRepository extends JpaRepository<Vi, Integer> {

    // Lấy tất cả ví của user
    List<Vi> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);

    // Lấy ví theo loại
    List<Vi> findByNguoiDung_MaNguoiDungAndLoaiVi(Integer maNguoiDung, String loaiVi);

    // Lấy 1 ví theo ID + user
    Optional<Vi> findByMaViAndNguoiDung_MaNguoiDung(Integer maVi, Integer maNguoiDung);

    // Kiểm tra trùng tên ví
    boolean existsByTenViAndNguoiDung_MaNguoiDung(String tenVi, Integer maNguoiDung);
}