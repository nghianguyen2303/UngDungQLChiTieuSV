package com.example.quanlychitieusinhvien.repository;

import com.example.quanlychitieusinhvien.entity.DanhMuc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DanhMucRepository extends JpaRepository<DanhMuc, Integer> {

    List<DanhMuc> findByNguoiDung_MaNguoiDung(Integer maNguoiDung);

    List<DanhMuc> findByNguoiDung_MaNguoiDungAndLoaiDanhMuc(Integer maNguoiDung, String loaiDanhMuc);

    List<DanhMuc> findByNguoiDung_MaNguoiDungAndTenDanhMucContainingIgnoreCase(Integer maNguoiDung, String tenDanhMuc);

    Optional<DanhMuc> findByMaDanhMucAndNguoiDung_MaNguoiDung(Integer maDanhMuc, Integer maNguoiDung);

    boolean existsByTenDanhMucAndLoaiDanhMucAndNguoiDung_MaNguoiDung(String tenDanhMuc, String loaiDanhMuc, Integer maNguoiDung);
}