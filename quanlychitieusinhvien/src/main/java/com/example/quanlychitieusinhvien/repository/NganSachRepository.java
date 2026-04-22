package com.example.quanlychitieusinhvien.repository;

import com.example.quanlychitieusinhvien.entity.NganSach;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NganSachRepository extends JpaRepository<NganSach, Integer> {

    // Lấy ngân sách theo tháng/năm của user
    Optional<NganSach> findByNguoiDung_MaNguoiDungAndThangAndNam(
            Integer maNguoiDung, Integer thang, Integer nam);

    // Lấy tất cả ngân sách của user
    List<NganSach> findByNguoiDung_MaNguoiDungOrderByNamDescThangDesc(
            Integer maNguoiDung);

    // Lấy ngân sách theo ID + user
    Optional<NganSach> findByMaNganSachAndNguoiDung_MaNguoiDung(
            Integer maNganSach, Integer maNguoiDung);

    // Kiểm tra đã có ngân sách tháng này chưa
    boolean existsByNguoiDung_MaNguoiDungAndThangAndNam(
            Integer maNguoiDung, Integer thang, Integer nam);
}