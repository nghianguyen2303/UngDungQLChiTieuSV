package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.SoThongBaoResponse;
import com.example.quanlychitieusinhvien.dto.ThongBaoResponse;
import com.example.quanlychitieusinhvien.entity.NganSach;
import com.example.quanlychitieusinhvien.entity.ChiTietNganSach;
import com.example.quanlychitieusinhvien.entity.NguoiDung;
import com.example.quanlychitieusinhvien.entity.ThongBao;
import com.example.quanlychitieusinhvien.repository.*;
import com.example.quanlychitieusinhvien.service.ThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThongBaoServiceImpl implements ThongBaoService {

    @Autowired
    private ThongBaoRepository thongBaoRepo;

    @Autowired
    private NguoiDungRepository nguoiDungRepo;

    @Autowired
    private NganSachRepository nganSachRepo;

    @Autowired
    private ChiTietNganSachRepository chiTietNganSachRepo;

    @Autowired
    private GiaoDichRepository giaoDichRepo;

    private NguoiDung getUserByEmail(String email) {
        return nguoiDungRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private String getLoaiLabel(String loai) {
        if (loai == null) return "Thông báo";
        switch (loai) {
            case "CANH_BAO_NGAN_SACH": return "Cảnh báo ngân sách";
            case "NHAC_CHI_TIEU": return "Nhắc chi tiêu";
            case "BAT_THUONG": return "Chi tiêu bất thường";
            case "HE_THONG": return "Hệ thống";
            default: return "Thông báo";
        }
    }

    private ThongBaoResponse mapToResponse(ThongBao tb) {
        ThongBaoResponse res = new ThongBaoResponse();
        res.setMaThongBao(tb.getMaThongBao());
        res.setNoiDung(tb.getNoiDung());
        res.setLoaiThongBao(tb.getLoaiThongBao());
        res.setLoaiThongBaoLabel(getLoaiLabel(tb.getLoaiThongBao()));
        res.setTrangThai(tb.getTrangThai());
        res.setDaDoc("DA_DOC".equals(tb.getTrangThai()));
        if (tb.getNgayTao() != null) {
            res.setNgayTao(tb.getNgayTao().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        return res;
    }

    // === LẤY TẤT CẢ ===
    @Override
    public List<ThongBaoResponse> getAllByUser(String email) {
        NguoiDung user = getUserByEmail(email);
        List<ThongBao> list = thongBaoRepo.findByNguoiDung_MaNguoiDungOrderByNgayTaoDesc(
                user.getMaNguoiDung());
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // === LẤY CHƯA ĐỌC ===
    @Override
    public List<ThongBaoResponse> getChuaDoc(String email) {
        NguoiDung user = getUserByEmail(email);
        List<ThongBao> list = thongBaoRepo.findByNguoiDung_MaNguoiDungAndTrangThaiOrderByNgayTaoDesc(
                user.getMaNguoiDung(), "CHUA_DOC");
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // === ĐẾM SỐ THÔNG BÁO ===
    @Override
    public SoThongBaoResponse countByUser(String email) {
        NguoiDung user = getUserByEmail(email);
        long chuaDoc = thongBaoRepo.countByNguoiDung_MaNguoiDungAndTrangThai(
                user.getMaNguoiDung(), "CHUA_DOC");
        long daDoc = thongBaoRepo.countByNguoiDung_MaNguoiDungAndTrangThai(
                user.getMaNguoiDung(), "DA_DOC");

        SoThongBaoResponse res = new SoThongBaoResponse();
        res.setChuaDoc(chuaDoc);
        res.setDaDoc(daDoc);
        res.setTongSo(chuaDoc + daDoc);
        return res;
    }

    // === ĐÁNH DẤU 1 ĐÃ ĐỌC ===
    @Override
    public ThongBaoResponse markAsRead(String email, Integer maThongBao) {
        NguoiDung user = getUserByEmail(email);
        ThongBao tb = thongBaoRepo.findByMaThongBaoAndNguoiDung_MaNguoiDung(
                        maThongBao, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        tb.setTrangThai("DA_DOC");
        thongBaoRepo.save(tb);
        return mapToResponse(tb);
    }

    // === ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC ===
    @Override
    @Transactional
    public String markAllAsRead(String email) {
        NguoiDung user = getUserByEmail(email);
        thongBaoRepo.markAllAsRead(user.getMaNguoiDung());
        return "Đã đánh dấu tất cả đã đọc";
    }

    // === XÓA 1 ===
    @Override
    public String delete(String email, Integer maThongBao) {
        NguoiDung user = getUserByEmail(email);
        ThongBao tb = thongBaoRepo.findByMaThongBaoAndNguoiDung_MaNguoiDung(
                        maThongBao, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        thongBaoRepo.delete(tb);
        return "Xóa thông báo thành công";
    }

    // === XÓA TẤT CẢ ĐÃ ĐỌC ===
    @Override
    @Transactional
    public String deleteAllRead(String email) {
        NguoiDung user = getUserByEmail(email);
        thongBaoRepo.deleteAllRead(user.getMaNguoiDung());
        return "Đã xóa tất cả thông báo đã đọc";
    }

    // === TẠO THÔNG BÁO (NỘI BỘ) ===
    @Override
    public void taoThongBao(Integer maNguoiDung, String noiDung, String loaiThongBao) {
        NguoiDung user = nguoiDungRepo.findById(maNguoiDung)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        ThongBao tb = new ThongBao();
        tb.setNoiDung(noiDung);
        tb.setLoaiThongBao(loaiThongBao);
        tb.setTrangThai("CHUA_DOC");
        tb.setNguoiDung(user);
        thongBaoRepo.save(tb);
    }

    // === KIỂM TRA VÀ TẠO CẢNH BÁO NGÂN SÁCH ===
    @Override
    public void kiemTraNganSach(String email) {
        NguoiDung user = getUserByEmail(email);
        int thang = LocalDateTime.now().getMonthValue();
        int nam = LocalDateTime.now().getYear();

        NganSach ns = nganSachRepo.findByNguoiDung_MaNguoiDungAndThangAndNam(
                user.getMaNguoiDung(), thang, nam).orElse(null);

        if (ns == null) return;

        // Kiểm tra tổng ngân sách
        BigDecimal tongChi = giaoDichRepo.getTongChiTheoThang(user.getMaNguoiDung(), thang, nam);
        if (tongChi == null) tongChi = BigDecimal.ZERO;

        if (ns.getSoTienGioiHan().compareTo(BigDecimal.ZERO) > 0) {
            double phanTram = tongChi.divide(ns.getSoTienGioiHan(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();

            if (phanTram >= 100) {
                taoThongBao(user.getMaNguoiDung(),
                        "Bạn đã vượt ngân sách tháng " + thang + "! Đã chi "
                                + tongChi.toPlainString() + "đ / " + ns.getSoTienGioiHan().toPlainString() + "đ",
                        "CANH_BAO_NGAN_SACH");
            } else if (phanTram >= 80) {
                taoThongBao(user.getMaNguoiDung(),
                        "Bạn đã sử dụng " + Math.round(phanTram) + "% ngân sách tháng " + thang
                                + ". Còn lại " + ns.getSoTienGioiHan().subtract(tongChi).toPlainString() + "đ",
                        "CANH_BAO_NGAN_SACH");
            }
        }

        // Kiểm tra theo danh mục
        List<ChiTietNganSach> chiTietList = chiTietNganSachRepo.findByNganSach_MaNganSach(ns.getMaNganSach());
        for (ChiTietNganSach ct : chiTietList) {
            if (ct.getSoTienDuKien() == null || ct.getSoTienDuKien().compareTo(BigDecimal.ZERO) == 0) continue;

            BigDecimal daChi = giaoDichRepo.getTongChiTheoDanhMuc(
                    user.getMaNguoiDung(), ct.getDanhMuc().getMaDanhMuc(), thang, nam);
            if (daChi == null) daChi = BigDecimal.ZERO;

            double pt = daChi.divide(ct.getSoTienDuKien(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();

            if (pt >= 100) {
                taoThongBao(user.getMaNguoiDung(),
                        ct.getDanhMuc().getTenDanhMuc() + " đã vượt ngân sách! "
                                + daChi.toPlainString() + "đ / " + ct.getSoTienDuKien().toPlainString() + "đ",
                        "CANH_BAO_NGAN_SACH");
            } else if (pt >= 80) {
                taoThongBao(user.getMaNguoiDung(),
                        ct.getDanhMuc().getTenDanhMuc() + " đã sử dụng " + Math.round(pt) + "% ngân sách",
                        "CANH_BAO_NGAN_SACH");
            }
        }
    }
}