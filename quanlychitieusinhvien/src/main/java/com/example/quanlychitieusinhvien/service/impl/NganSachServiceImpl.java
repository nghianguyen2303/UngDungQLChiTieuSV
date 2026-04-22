package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.*;
import com.example.quanlychitieusinhvien.entity.*;
import com.example.quanlychitieusinhvien.repository.*;
import com.example.quanlychitieusinhvien.service.NganSachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NganSachServiceImpl implements NganSachService {

    @Autowired
    private NganSachRepository nganSachRepo;

    @Autowired
    private ChiTietNganSachRepository chiTietRepo;

    @Autowired
    private NguoiDungRepository nguoiDungRepo;

    @Autowired
    private DanhMucRepository danhMucRepo;

    @Autowired
    private GiaoDichRepository giaoDichRepo;

    private NguoiDung getUserByEmail(String email) {
        return nguoiDungRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    // === MAP RESPONSE ===
    private NganSachResponse mapToResponse(NganSach ns, Integer userId) {
        NganSachResponse res = new NganSachResponse();
        res.setMaNganSach(ns.getMaNganSach());
        res.setThang(ns.getThang());
        res.setNam(ns.getNam());
        res.setSoTienGioiHan(ns.getSoTienGioiHan());

        if (ns.getNgayTao() != null) {
            res.setNgayTao(ns.getNgayTao().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }

        // Tính tổng đã chi từ giao dịch thực tế
        BigDecimal tongChi = giaoDichRepo.getTongChiTheoThang(userId, ns.getThang(), ns.getNam());
        if (tongChi == null) tongChi = BigDecimal.ZERO;

        res.setTongDaChi(tongChi);
        res.setConLai(ns.getSoTienGioiHan().subtract(tongChi));

        // Tính % đã chi
        if (ns.getSoTienGioiHan().compareTo(BigDecimal.ZERO) > 0) {
            double phanTram = tongChi.divide(ns.getSoTienGioiHan(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            res.setPhanTramDaChi(Math.round(phanTram * 10.0) / 10.0);
        }

        // Trạng thái
        if (res.getPhanTramDaChi() >= 100) {
            res.setTrangThai("VUOT_NGAN_SACH");
        } else if (res.getPhanTramDaChi() >= 80) {
            res.setTrangThai("CANH_BAO");
        } else {
            res.setTrangThai("AN_TOAN");
        }

        // Chi tiết theo danh mục
        List<ChiTietNganSach> chiTietList = chiTietRepo.findByNganSach_MaNganSach(ns.getMaNganSach());
        List<ChiTietNganSachResponse> chiTietRes = chiTietList.stream().map(ct -> {
            ChiTietNganSachResponse ctRes = new ChiTietNganSachResponse();
            ctRes.setMaDanhMuc(ct.getDanhMuc().getMaDanhMuc());
            ctRes.setTenDanhMuc(ct.getDanhMuc().getTenDanhMuc());
            ctRes.setSoTienDuKien(ct.getSoTienDuKien() != null ? ct.getSoTienDuKien() : BigDecimal.ZERO);
            ctRes.setGhiChu(ct.getGhiChu());

            // Tính số tiền đã chi thực tế theo danh mục
            BigDecimal daChi = giaoDichRepo.getTongChiTheoDanhMuc(
                    userId, ct.getDanhMuc().getMaDanhMuc(), ns.getThang(), ns.getNam());
            if (daChi == null) daChi = BigDecimal.ZERO;

            ctRes.setSoTienDaChi(daChi);
            ctRes.setConLai(ctRes.getSoTienDuKien().subtract(daChi));

            // % đã chi
            if (ctRes.getSoTienDuKien().compareTo(BigDecimal.ZERO) > 0) {
                double pt = daChi.divide(ctRes.getSoTienDuKien(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
                ctRes.setPhanTramDaChi(Math.round(pt * 10.0) / 10.0);
            }

            // Trạng thái
            if (ctRes.getPhanTramDaChi() >= 100) {
                ctRes.setTrangThai("VUOT");
            } else if (ctRes.getPhanTramDaChi() >= 80) {
                ctRes.setTrangThai("CANH_BAO");
            } else {
                ctRes.setTrangThai("AN_TOAN");
            }

            return ctRes;
        }).collect(Collectors.toList());

        res.setChiTiet(chiTietRes);
        return res;
    }

    // === LẤY TẤT CẢ ===
    @Override
    public List<NganSachResponse> getAllByUser(String email) {
        NguoiDung user = getUserByEmail(email);
        List<NganSach> list = nganSachRepo.findByNguoiDung_MaNguoiDungOrderByNamDescThangDesc(
                user.getMaNguoiDung());
        return list.stream().map(ns -> mapToResponse(ns, user.getMaNguoiDung()))
                .collect(Collectors.toList());
    }

    // === LẤY THEO THÁNG ===
    @Override
    public NganSachResponse getByThang(String email, int thang, int nam) {
        NguoiDung user = getUserByEmail(email);
        NganSach ns = nganSachRepo.findByNguoiDung_MaNguoiDungAndThangAndNam(
                        user.getMaNguoiDung(), thang, nam)
                .orElseThrow(() -> new RuntimeException("Chưa thiết lập ngân sách cho tháng " + thang + "/" + nam));
        return mapToResponse(ns, user.getMaNguoiDung());
    }

    // === LẤY THEO ID ===
    @Override
    public NganSachResponse getById(String email, Integer id) {
        NguoiDung user = getUserByEmail(email);
        NganSach ns = nganSachRepo.findByMaNganSachAndNguoiDung_MaNguoiDung(id, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngân sách"));
        return mapToResponse(ns, user.getMaNguoiDung());
    }

    // === TẠO MỚI ===
    @Override
    @Transactional
    public NganSachResponse create(String email, NganSachRequest request) {
        NguoiDung user = getUserByEmail(email);

        // Kiểm tra đã có ngân sách tháng này chưa
        boolean exists = nganSachRepo.existsByNguoiDung_MaNguoiDungAndThangAndNam(
                user.getMaNguoiDung(), request.getThang(), request.getNam());
        if (exists) {
            throw new RuntimeException("Đã có ngân sách cho tháng " + request.getThang() + "/" + request.getNam());
        }

        NganSach ns = new NganSach();
        ns.setThang(request.getThang());
        ns.setNam(request.getNam());
        ns.setSoTienGioiHan(request.getSoTienGioiHan());
        ns.setNguoiDung(user);

        nganSachRepo.save(ns);

        // Tạo chi tiết nếu có
        if (request.getChiTiet() != null && !request.getChiTiet().isEmpty()) {
            for (ChiTietNganSachRequest ct : request.getChiTiet()) {
                DanhMuc dm = danhMucRepo.findById(ct.getMaDanhMuc())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục ID: " + ct.getMaDanhMuc()));

                ChiTietNganSach chiTiet = new ChiTietNganSach();
                chiTiet.setNganSach(ns);
                chiTiet.setDanhMuc(dm);
                chiTiet.setSoTienDuKien(ct.getSoTienDuKien());
                chiTiet.setSoTienDaChi(BigDecimal.ZERO);
                chiTiet.setGhiChu(ct.getGhiChu());

                chiTietRepo.save(chiTiet);
            }
        }

        return mapToResponse(ns, user.getMaNguoiDung());
    }

    // === CẬP NHẬT ===
    @Override
    @Transactional
    public NganSachResponse update(String email, Integer id, NganSachRequest request) {
        NguoiDung user = getUserByEmail(email);

        NganSach ns = nganSachRepo.findByMaNganSachAndNguoiDung_MaNguoiDung(id, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngân sách"));

        ns.setSoTienGioiHan(request.getSoTienGioiHan());
        nganSachRepo.save(ns);

        // Xóa chi tiết cũ, tạo chi tiết mới
        chiTietRepo.deleteByNganSach_MaNganSach(ns.getMaNganSach());

        if (request.getChiTiet() != null && !request.getChiTiet().isEmpty()) {
            for (ChiTietNganSachRequest ct : request.getChiTiet()) {
                DanhMuc dm = danhMucRepo.findById(ct.getMaDanhMuc())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục ID: " + ct.getMaDanhMuc()));

                ChiTietNganSach chiTiet = new ChiTietNganSach();
                chiTiet.setNganSach(ns);
                chiTiet.setDanhMuc(dm);
                chiTiet.setSoTienDuKien(ct.getSoTienDuKien());
                chiTiet.setSoTienDaChi(BigDecimal.ZERO);
                chiTiet.setGhiChu(ct.getGhiChu());

                chiTietRepo.save(chiTiet);
            }
        }

        return mapToResponse(ns, user.getMaNguoiDung());
    }

    // === XÓA ===
    @Override
    @Transactional
    public String delete(String email, Integer id) {
        NguoiDung user = getUserByEmail(email);

        NganSach ns = nganSachRepo.findByMaNganSachAndNguoiDung_MaNguoiDung(id, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngân sách"));

        chiTietRepo.deleteByNganSach_MaNganSach(ns.getMaNganSach());
        nganSachRepo.delete(ns);

        return "Xóa ngân sách thành công";
    }

    // === CẢNH BÁO NGÂN SÁCH ===
    @Override
    public List<CanhBaoNganSachResponse> getCanhBao(String email, int thang, int nam) {
        NguoiDung user = getUserByEmail(email);
        List<CanhBaoNganSachResponse> canhBaoList = new ArrayList<>();

        NganSach ns = nganSachRepo.findByNguoiDung_MaNguoiDungAndThangAndNam(
                user.getMaNguoiDung(), thang, nam).orElse(null);

        if (ns == null) return canhBaoList;

        // Cảnh báo tổng
        BigDecimal tongChi = giaoDichRepo.getTongChiTheoThang(user.getMaNguoiDung(), thang, nam);
        if (tongChi == null) tongChi = BigDecimal.ZERO;

        if (ns.getSoTienGioiHan().compareTo(BigDecimal.ZERO) > 0) {
            double phanTram = tongChi.divide(ns.getSoTienGioiHan(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            phanTram = Math.round(phanTram * 10.0) / 10.0;

            if (phanTram >= 80) {
                CanhBaoNganSachResponse cb = new CanhBaoNganSachResponse();
                cb.setLoaiCanhBao("TONG");
                cb.setGioiHan(ns.getSoTienGioiHan());
                cb.setDaChi(tongChi);
                cb.setPhanTram(phanTram);

                if (phanTram >= 100) {
                    cb.setTrangThai("VUOT_NGAN_SACH");
                    cb.setNoiDung("Bạn đã vượt ngân sách tháng " + thang + "! Đã chi "
                            + tongChi.toPlainString() + "đ / " + ns.getSoTienGioiHan().toPlainString() + "đ");
                } else {
                    cb.setTrangThai("CANH_BAO");
                    cb.setNoiDung("Bạn đã sử dụng " + phanTram + "% ngân sách tháng " + thang
                            + ". Còn lại " + ns.getSoTienGioiHan().subtract(tongChi).toPlainString() + "đ");
                }
                canhBaoList.add(cb);
            }
        }

        // Cảnh báo theo danh mục
        List<ChiTietNganSach> chiTietList = chiTietRepo.findByNganSach_MaNganSach(ns.getMaNganSach());
        for (ChiTietNganSach ct : chiTietList) {
            if (ct.getSoTienDuKien() == null || ct.getSoTienDuKien().compareTo(BigDecimal.ZERO) == 0) continue;

            BigDecimal daChi = giaoDichRepo.getTongChiTheoDanhMuc(
                    user.getMaNguoiDung(), ct.getDanhMuc().getMaDanhMuc(), thang, nam);
            if (daChi == null) daChi = BigDecimal.ZERO;

            double pt = daChi.divide(ct.getSoTienDuKien(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            pt = Math.round(pt * 10.0) / 10.0;

            if (pt >= 80) {
                CanhBaoNganSachResponse cb = new CanhBaoNganSachResponse();
                cb.setLoaiCanhBao("DANH_MUC");
                cb.setTenDanhMuc(ct.getDanhMuc().getTenDanhMuc());
                cb.setGioiHan(ct.getSoTienDuKien());
                cb.setDaChi(daChi);
                cb.setPhanTram(pt);

                if (pt >= 100) {
                    cb.setTrangThai("VUOT_NGAN_SACH");
                    cb.setNoiDung(ct.getDanhMuc().getTenDanhMuc() + " đã vượt ngân sách! "
                            + daChi.toPlainString() + "đ / " + ct.getSoTienDuKien().toPlainString() + "đ");
                } else {
                    cb.setTrangThai("CANH_BAO");
                    cb.setNoiDung(ct.getDanhMuc().getTenDanhMuc() + " đã sử dụng " + pt + "% ngân sách");
                }
                canhBaoList.add(cb);
            }
        }

        return canhBaoList;
    }
}