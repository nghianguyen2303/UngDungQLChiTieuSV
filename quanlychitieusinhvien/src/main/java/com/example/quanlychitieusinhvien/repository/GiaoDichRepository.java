package com.example.quanlychitieusinhvien.repository;

import com.example.quanlychitieusinhvien.entity.GiaoDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GiaoDichRepository extends JpaRepository<GiaoDich, Integer> {

    // Lấy tất cả giao dịch của user (còn active), sắp xếp mới nhất trước
    List<GiaoDich> findByNguoiDung_MaNguoiDungAndTrangThaiOrderByNgayGiaoDichDesc(
            Integer maNguoiDung, String trangThai);

    // Lấy giao dịch theo loại (THU/CHI)
    List<GiaoDich> findByNguoiDung_MaNguoiDungAndLoaiGiaoDichAndTrangThaiOrderByNgayGiaoDichDesc(
            Integer maNguoiDung, String loaiGiaoDich, String trangThai);

    // Lấy giao dịch theo danh mục
    List<GiaoDich> findByNguoiDung_MaNguoiDungAndDanhMuc_MaDanhMucAndTrangThaiOrderByNgayGiaoDichDesc(
            Integer maNguoiDung, Integer maDanhMuc, String trangThai);

    // Lấy giao dịch theo khoảng thời gian
    @Query("SELECT g FROM GiaoDich g WHERE g.nguoiDung.maNguoiDung = :userId " +
            "AND g.trangThai = 'ACTIVE' " +
            "AND g.ngayGiaoDich BETWEEN :tuNgay AND :denNgay " +
            "ORDER BY g.ngayGiaoDich DESC")
    List<GiaoDich> findByUserAndDateRange(
            @Param("userId") Integer userId,
            @Param("tuNgay") LocalDateTime tuNgay,
            @Param("denNgay") LocalDateTime denNgay);

    // Lấy giao dịch theo tháng/năm
    @Query("SELECT g FROM GiaoDich g WHERE g.nguoiDung.maNguoiDung = :userId " +
            "AND g.trangThai = 'ACTIVE' " +
            "AND MONTH(g.ngayGiaoDich) = :thang AND YEAR(g.ngayGiaoDich) = :nam " +
            "ORDER BY g.ngayGiaoDich DESC")
    List<GiaoDich> findByUserAndMonth(
            @Param("userId") Integer userId,
            @Param("thang") int thang,
            @Param("nam") int nam);

    // Lấy 1 giao dịch theo ID + user
    Optional<GiaoDich> findByMaGiaoDichAndNguoiDung_MaNguoiDung(
            Integer maGiaoDich, Integer maNguoiDung);

    // Tổng thu theo tháng
    @Query("SELECT COALESCE(SUM(g.soTien), 0) FROM GiaoDich g " +
            "WHERE g.nguoiDung.maNguoiDung = :userId " +
            "AND g.loaiGiaoDich = 'THU' AND g.trangThai = 'ACTIVE' " +
            "AND MONTH(g.ngayGiaoDich) = :thang AND YEAR(g.ngayGiaoDich) = :nam")
    BigDecimal getTongThuTheoThang(
            @Param("userId") Integer userId,
            @Param("thang") int thang,
            @Param("nam") int nam);

    // Tổng chi theo tháng
    @Query("SELECT COALESCE(SUM(g.soTien), 0) FROM GiaoDich g " +
            "WHERE g.nguoiDung.maNguoiDung = :userId " +
            "AND g.loaiGiaoDich = 'CHI' AND g.trangThai = 'ACTIVE' " +
            "AND MONTH(g.ngayGiaoDich) = :thang AND YEAR(g.ngayGiaoDich) = :nam")
    BigDecimal getTongChiTheoThang(
            @Param("userId") Integer userId,
            @Param("thang") int thang,
            @Param("nam") int nam);

    // Tổng chi theo danh mục trong tháng
    @Query("SELECT COALESCE(SUM(g.soTien), 0) FROM GiaoDich g " +
            "WHERE g.nguoiDung.maNguoiDung = :userId " +
            "AND g.danhMuc.maDanhMuc = :maDanhMuc " +
            "AND g.loaiGiaoDich = 'CHI' AND g.trangThai = 'ACTIVE' " +
            "AND MONTH(g.ngayGiaoDich) = :thang AND YEAR(g.ngayGiaoDich) = :nam")
    BigDecimal getTongChiTheoDanhMuc(
            @Param("userId") Integer userId,
            @Param("maDanhMuc") Integer maDanhMuc,
            @Param("thang") int thang,
            @Param("nam") int nam);

    // Tổng tiền theo danh mục trong tháng (cho thống kê danh mục)
    @Query("SELECT g.danhMuc.maDanhMuc, g.danhMuc.tenDanhMuc, g.danhMuc.loaiDanhMuc, " +
            "SUM(g.soTien), COUNT(g) " +
            "FROM GiaoDich g " +
            "WHERE g.nguoiDung.maNguoiDung = :userId " +
            "AND g.trangThai = 'ACTIVE' " +
            "AND g.loaiGiaoDich = :loai " +
            "AND MONTH(g.ngayGiaoDich) = :thang AND YEAR(g.ngayGiaoDich) = :nam " +
            "AND g.danhMuc IS NOT NULL " +
            "GROUP BY g.danhMuc.maDanhMuc, g.danhMuc.tenDanhMuc, g.danhMuc.loaiDanhMuc " +
            "ORDER BY SUM(g.soTien) DESC")
    List<Object[]> thongKeTheoDanhMuc(
            @Param("userId") Integer userId,
            @Param("loai") String loai,
            @Param("thang") int thang,
            @Param("nam") int nam);

    // Tổng tiền theo ngày trong tháng
    @Query("SELECT CAST(g.ngayGiaoDich AS date), g.loaiGiaoDich, SUM(g.soTien) " +
            "FROM GiaoDich g " +
            "WHERE g.nguoiDung.maNguoiDung = :userId " +
            "AND g.trangThai = 'ACTIVE' " +
            "AND MONTH(g.ngayGiaoDich) = :thang AND YEAR(g.ngayGiaoDich) = :nam " +
            "GROUP BY CAST(g.ngayGiaoDich AS date), g.loaiGiaoDich " +
            "ORDER BY CAST(g.ngayGiaoDich AS date)")
    List<Object[]> thongKeTheoNgay(
            @Param("userId") Integer userId,
            @Param("thang") int thang,
            @Param("nam") int nam);

    // Đếm giao dịch trong tháng
    @Query("SELECT COUNT(g) FROM GiaoDich g " +
            "WHERE g.nguoiDung.maNguoiDung = :userId " +
            "AND g.trangThai = 'ACTIVE' " +
            "AND MONTH(g.ngayGiaoDich) = :thang AND YEAR(g.ngayGiaoDich) = :nam")
    long countByUserAndMonth(
            @Param("userId") Integer userId,
            @Param("thang") int thang,
            @Param("nam") int nam);
    // Đếm tổng giao dịch active của user
    long countByNguoiDung_MaNguoiDungAndTrangThai(Integer maNguoiDung, String trangThai);
}