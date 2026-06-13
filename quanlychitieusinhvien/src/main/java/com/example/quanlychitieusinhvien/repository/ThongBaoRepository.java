package com.example.quanlychitieusinhvien.repository;

import com.example.quanlychitieusinhvien.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ThongBaoRepository extends JpaRepository<ThongBao, Integer> {

    // Lấy tất cả thông báo của user, mới nhất trước
    List<ThongBao> findByNguoiDung_MaNguoiDungOrderByNgayTaoDesc(Integer maNguoiDung);

    // Lấy thông báo chưa đọc
    List<ThongBao> findByNguoiDung_MaNguoiDungAndTrangThaiOrderByNgayTaoDesc(
            Integer maNguoiDung, String trangThai);

    // Đếm thông báo chưa đọc
    long countByNguoiDung_MaNguoiDungAndTrangThai(Integer maNguoiDung, String trangThai);

    // Lấy 1 thông báo theo ID + user
    Optional<ThongBao> findByMaThongBaoAndNguoiDung_MaNguoiDung(
            Integer maThongBao, Integer maNguoiDung);

    // Đánh dấu tất cả đã đọc
    @Modifying
    @Query("UPDATE ThongBao t SET t.trangThai = 'DA_DOC' WHERE t.nguoiDung.maNguoiDung = :userId AND t.trangThai = 'CHUA_DOC'")
    void markAllAsRead(@Param("userId") Integer userId);

    // Xóa tất cả thông báo đã đọc
    @Modifying
    @Query("DELETE FROM ThongBao t WHERE t.nguoiDung.maNguoiDung = :userId AND t.trangThai = 'DA_DOC'")
    void deleteAllRead(@Param("userId") Integer userId);
}