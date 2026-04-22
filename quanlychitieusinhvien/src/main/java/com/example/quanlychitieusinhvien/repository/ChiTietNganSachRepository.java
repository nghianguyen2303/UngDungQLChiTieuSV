package com.example.quanlychitieusinhvien.repository;

import com.example.quanlychitieusinhvien.entity.ChiTietNganSach;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChiTietNganSachRepository extends JpaRepository<ChiTietNganSach, Integer> {

    // Lấy chi tiết theo ngân sách
    List<ChiTietNganSach> findByNganSach_MaNganSach(Integer maNganSach);

    // Xóa tất cả chi tiết của 1 ngân sách
    void deleteByNganSach_MaNganSach(Integer maNganSach);
}