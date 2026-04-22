package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.entity.NguoiDung;
import com.example.quanlychitieusinhvien.repository.GiaoDichRepository;
import com.example.quanlychitieusinhvien.repository.NguoiDungRepository;
import com.example.quanlychitieusinhvien.service.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ThongKeServiceImpl implements ThongKeService {

    @Autowired
    private GiaoDichRepository giaoDichRepo;

    @Autowired
    private NguoiDungRepository nguoiDungRepo;

    private NguoiDung getUserByEmail(String email) {
        return nguoiDungRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    // === TỔNG QUAN THÁNG ===
    @Override
    public ThongKeTongQuanResponse getTongQuan(String email, int thang, int nam) {
        NguoiDung user = getUserByEmail(email);
        Integer userId = user.getMaNguoiDung();

        BigDecimal tongThu = giaoDichRepo.getTongThuTheoThang(userId, thang, nam);
        BigDecimal tongChi = giaoDichRepo.getTongChiTheoThang(userId, thang, nam);
        long soGiaoDich = giaoDichRepo.countByUserAndMonth(userId, thang, nam);

        if (tongThu == null) tongThu = BigDecimal.ZERO;
        if (tongChi == null) tongChi = BigDecimal.ZERO;

        // Tính tháng trước
        int thangTruoc = thang == 1 ? 12 : thang - 1;
        int namTruoc = thang == 1 ? nam - 1 : nam;

        BigDecimal thuThangTruoc = giaoDichRepo.getTongThuTheoThang(userId, thangTruoc, namTruoc);
        BigDecimal chiThangTruoc = giaoDichRepo.getTongChiTheoThang(userId, thangTruoc, namTruoc);

        if (thuThangTruoc == null) thuThangTruoc = BigDecimal.ZERO;
        if (chiThangTruoc == null) chiThangTruoc = BigDecimal.ZERO;

        // Tính % thay đổi
        double phanTramThu = tinhPhanTramThayDoi(thuThangTruoc, tongThu);
        double phanTramChi = tinhPhanTramThayDoi(chiThangTruoc, tongChi);

        ThongKeTongQuanResponse res = new ThongKeTongQuanResponse();
        res.setThang(thang);
        res.setNam(nam);
        res.setTongThu(tongThu);
        res.setTongChi(tongChi);
        res.setSoDu(tongThu.subtract(tongChi));
        res.setSoGiaoDich(soGiaoDich);
        res.setPhanTramThuThayDoi(phanTramThu);
        res.setPhanTramChiThayDoi(phanTramChi);

        return res;
    }

    // === TỔNG QUAN TẤT CẢ (SỐ DƯ HIỆN TẠI) ===
    @Override
    public ThongKeTongQuanResponse getTongQuanTatCa(String email) {
        NguoiDung user = getUserByEmail(email);
        Integer userId = user.getMaNguoiDung();

        List<com.example.quanlychitieusinhvien.entity.GiaoDich> allTx =
                giaoDichRepo.findByNguoiDung_MaNguoiDungAndTrangThaiOrderByNgayGiaoDichDesc(
                        userId, "ACTIVE");

        BigDecimal tongThu = BigDecimal.ZERO;
        BigDecimal tongChi = BigDecimal.ZERO;

        for (var tx : allTx) {
            if ("THU".equals(tx.getLoaiGiaoDich())) {
                tongThu = tongThu.add(tx.getSoTien());
            } else {
                tongChi = tongChi.add(tx.getSoTien());
            }
        }

        ThongKeTongQuanResponse res = new ThongKeTongQuanResponse();
        res.setThang(0); // 0 = tất cả
        res.setNam(0);
        res.setTongThu(tongThu);
        res.setTongChi(tongChi);
        res.setSoDu(tongThu.subtract(tongChi));
        res.setSoGiaoDich(allTx.size());
        res.setPhanTramThuThayDoi(0);
        res.setPhanTramChiThayDoi(0);

        return res;
    }

    // === THỐNG KÊ THEO DANH MỤC ===
    @Override
    public List<ThongKeDanhMucResponse> getTheoDanhMuc(String email, String loai, int thang, int nam) {
        NguoiDung user = getUserByEmail(email);

        List<Object[]> results = giaoDichRepo.thongKeTheoDanhMuc(
                user.getMaNguoiDung(), loai.toUpperCase(), thang, nam);

        // Tính tổng
        BigDecimal tong = BigDecimal.ZERO;
        for (Object[] row : results) {
            tong = tong.add((BigDecimal) row[3]);
        }

        final BigDecimal tongFinal = tong;

        return results.stream().map(row -> {
            ThongKeDanhMucResponse res = new ThongKeDanhMucResponse();
            res.setMaDanhMuc((Integer) row[0]);
            res.setTenDanhMuc((String) row[1]);
            res.setLoaiDanhMuc((String) row[2]);
            res.setTongTien((BigDecimal) row[3]);
            res.setSoGiaoDich((Long) row[4]);

            // Tính %
            if (tongFinal.compareTo(BigDecimal.ZERO) > 0) {
                double phanTram = ((BigDecimal) row[3])
                        .divide(tongFinal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
                res.setPhanTram(Math.round(phanTram * 10.0) / 10.0);
            } else {
                res.setPhanTram(0);
            }

            return res;
        }).collect(Collectors.toList());
    }

    // === THỐNG KÊ THEO NGÀY ===
    @Override
    public List<ThongKeTheoNgayResponse> getTheoNgay(String email, int thang, int nam) {
        NguoiDung user = getUserByEmail(email);

        List<Object[]> results = giaoDichRepo.thongKeTheoNgay(
                user.getMaNguoiDung(), thang, nam);

        // Gom theo ngày
        Map<String, ThongKeTheoNgayResponse> map = new LinkedHashMap<>();

        for (Object[] row : results) {
            String ngay;
            if (row[0] instanceof java.sql.Date) {
                ngay = row[0].toString();
            } else if (row[0] instanceof LocalDate) {
                ngay = row[0].toString();
            } else {
                ngay = row[0].toString().substring(0, 10);
            }

            String loai = (String) row[1];
            BigDecimal tien = (BigDecimal) row[2];

            ThongKeTheoNgayResponse item = map.getOrDefault(ngay, new ThongKeTheoNgayResponse());
            item.setNgay(ngay);
            if (item.getTongThu() == null) item.setTongThu(BigDecimal.ZERO);
            if (item.getTongChi() == null) item.setTongChi(BigDecimal.ZERO);

            if ("THU".equals(loai)) {
                item.setTongThu(item.getTongThu().add(tien));
            } else {
                item.setTongChi(item.getTongChi().add(tien));
            }

            map.put(ngay, item);
        }

        return new ArrayList<>(map.values());
    }

    // === XU HƯỚNG 6 THÁNG ===
    @Override
    public List<ThongKeXuHuongResponse> getXuHuong(String email, int thang, int nam) {
        NguoiDung user = getUserByEmail(email);
        Integer userId = user.getMaNguoiDung();

        List<ThongKeXuHuongResponse> result = new ArrayList<>();
        String[] labels = {"Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"};

        int currentThang = thang;
        int currentNam = nam;

        // Lấy 6 tháng gần nhất (bao gồm tháng hiện tại)
        for (int i = 0; i < 6; i++) {
            BigDecimal thu = giaoDichRepo.getTongThuTheoThang(userId, currentThang, currentNam);
            BigDecimal chi = giaoDichRepo.getTongChiTheoThang(userId, currentThang, currentNam);

            ThongKeXuHuongResponse item = new ThongKeXuHuongResponse();
            item.setThang(currentThang);
            item.setNam(currentNam);
            item.setLabel(labels[currentThang - 1]);
            item.setTongThu(thu != null ? thu : BigDecimal.ZERO);
            item.setTongChi(chi != null ? chi : BigDecimal.ZERO);

            result.add(item);

            // Lùi 1 tháng
            currentThang--;
            if (currentThang == 0) {
                currentThang = 12;
                currentNam--;
            }
        }

        // Đảo ngược: tháng cũ nhất trước
        Collections.reverse(result);
        return result;
    }

    // === TÍNH % THAY ĐỔI ===
    private double tinhPhanTramThayDoi(BigDecimal cu, BigDecimal moi) {
        if (cu == null || cu.compareTo(BigDecimal.ZERO) == 0) {
            if (moi != null && moi.compareTo(BigDecimal.ZERO) > 0) {
                return 100.0;
            }
            return 0.0;
        }
        double thayDoi = moi.subtract(cu)
                .divide(cu, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
        return Math.round(thayDoi * 10.0) / 10.0;
    }
}