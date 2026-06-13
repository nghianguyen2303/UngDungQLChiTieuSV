package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.GiaoDichRequest;
import com.example.quanlychitieusinhvien.dto.GiaoDichResponse;
import com.example.quanlychitieusinhvien.dto.ThongKeThangResponse;
import com.example.quanlychitieusinhvien.entity.DanhMuc;
import com.example.quanlychitieusinhvien.entity.GiaoDich;
import com.example.quanlychitieusinhvien.entity.NguoiDung;
import com.example.quanlychitieusinhvien.entity.Vi;
import com.example.quanlychitieusinhvien.repository.DanhMucRepository;
import com.example.quanlychitieusinhvien.repository.GiaoDichRepository;
import com.example.quanlychitieusinhvien.repository.NguoiDungRepository;
import com.example.quanlychitieusinhvien.repository.ViRepository;
import com.example.quanlychitieusinhvien.service.GiaoDichService;
import com.example.quanlychitieusinhvien.service.ThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GiaoDichServiceImpl implements GiaoDichService {

    @Autowired
    private GiaoDichRepository giaoDichRepo;

    @Autowired
    private NguoiDungRepository nguoiDungRepo;

    @Autowired
    private DanhMucRepository danhMucRepo;

    @Autowired
    private ViRepository viRepo;

    @Autowired
    private ThongBaoService thongBaoService;

    private NguoiDung getUserByEmail(String email) {
        return nguoiDungRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private GiaoDichResponse mapToResponse(GiaoDich gd) {
        GiaoDichResponse res = new GiaoDichResponse();
        res.setMaGiaoDich(gd.getMaGiaoDich());
        res.setSoTien(gd.getSoTien());
        res.setLoaiGiaoDich(gd.getLoaiGiaoDich());
        res.setGhiChu(gd.getGhiChu());
        res.setTrangThai(gd.getTrangThai());

        if (gd.getVi() != null) {
            res.setMaVi(gd.getVi().getMaVi());
        }

        // Format ngày
        if (gd.getNgayGiaoDich() != null) {
            res.setNgayGiaoDich(gd.getNgayGiaoDich()
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }

        // Thông tin danh mục
        if (gd.getDanhMuc() != null) {
            res.setMaDanhMuc(gd.getDanhMuc().getMaDanhMuc());
            res.setTenDanhMuc(gd.getDanhMuc().getTenDanhMuc());
        }

        return res;
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return LocalDateTime.now();
        }
        try {
            // Thử format đầy đủ: yyyy-MM-dd HH:mm:ss
            return LocalDateTime.parse(dateStr,
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e1) {
            try {
                // Thử format ngắn: yyyy-MM-dd
                return LocalDateTime.parse(dateStr + " 00:00:00",
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            } catch (Exception e2) {
                return LocalDateTime.now();
            }
        }
    }

    // === Lấy tất cả giao dịch ===
    @Override
    public List<GiaoDichResponse> getAllByUser(String email) {
        NguoiDung user = getUserByEmail(email);
        List<GiaoDich> list = giaoDichRepo
                .findByNguoiDung_MaNguoiDungAndTrangThaiOrderByNgayGiaoDichDesc(
                        user.getMaNguoiDung(), "ACTIVE");
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // === Lấy theo loại THU/CHI ===
    @Override
    public List<GiaoDichResponse> getByLoai(String email, String loaiGiaoDich) {
        NguoiDung user = getUserByEmail(email);
        List<GiaoDich> list = giaoDichRepo
                .findByNguoiDung_MaNguoiDungAndLoaiGiaoDichAndTrangThaiOrderByNgayGiaoDichDesc(
                        user.getMaNguoiDung(), loaiGiaoDich.toUpperCase(), "ACTIVE");
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // === Lấy theo danh mục ===
    @Override
    public List<GiaoDichResponse> getByDanhMuc(String email, Integer maDanhMuc) {
        NguoiDung user = getUserByEmail(email);
        List<GiaoDich> list = giaoDichRepo
                .findByNguoiDung_MaNguoiDungAndDanhMuc_MaDanhMucAndTrangThaiOrderByNgayGiaoDichDesc(
                        user.getMaNguoiDung(), maDanhMuc, "ACTIVE");
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // === Lấy theo tháng/năm ===
    @Override
    public List<GiaoDichResponse> getByThang(String email, int thang, int nam) {
        NguoiDung user = getUserByEmail(email);
        List<GiaoDich> list = giaoDichRepo.findByUserAndMonth(
                user.getMaNguoiDung(), thang, nam);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // === Lấy 1 giao dịch ===
    @Override
    public GiaoDichResponse getById(String email, Integer maGiaoDich) {
        NguoiDung user = getUserByEmail(email);
        GiaoDich gd = giaoDichRepo.findByMaGiaoDichAndNguoiDung_MaNguoiDung(
                        maGiaoDich, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));
        return mapToResponse(gd);
    }

    // === Thêm giao dịch ===
    @Override
    @Transactional
    public GiaoDichResponse create(String email, GiaoDichRequest request) {
        NguoiDung user = getUserByEmail(email);

        GiaoDich gd = new GiaoDich();
        gd.setSoTien(request.getSoTien());
        gd.setLoaiGiaoDich(request.getLoaiGiaoDich().toUpperCase());
        gd.setNgayGiaoDich(parseDate(request.getNgayGiaoDich()));
        gd.setGhiChu(request.getGhiChu());
        gd.setTrangThai("ACTIVE");
        gd.setNguoiDung(user);

        // Gắn danh mục nếu có
        if (request.getMaDanhMuc() != null) {
            DanhMuc dm = danhMucRepo.findById(request.getMaDanhMuc())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            gd.setDanhMuc(dm);
        }

        // Gắn ví + cập nhật số dư ví
        if (request.getMaVi() != null) {
            Vi vi = viRepo.findById(request.getMaVi())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
            gd.setVi(vi);

            BigDecimal soDu = vi.getSoDu() != null ? vi.getSoDu() : BigDecimal.ZERO;

            if ("CHI".equals(gd.getLoaiGiaoDich())) {
                // Chi tiêu → trừ tiền ví
                if (soDu.compareTo(request.getSoTien()) < 0) {
                    throw new RuntimeException("Số dư ví '" + vi.getTenVi() + "' không đủ. Hiện có: " + soDu.toPlainString() + "đ");
                }
                vi.setSoDu(soDu.subtract(request.getSoTien()));
            } else {
                // Thu nhập → cộng tiền ví
                vi.setSoDu(soDu.add(request.getSoTien()));
            }
            viRepo.save(vi);
        }
        // Không chọn ví → chỉ ghi nhận giao dịch, không ảnh hưởng ví nào

        giaoDichRepo.save(gd);

        // Kiểm tra ngân sách
        if ("CHI".equals(gd.getLoaiGiaoDich())) {
            try {
                thongBaoService.kiemTraNganSach(email);
            } catch (Exception e) {}
        }

        return mapToResponse(gd);
    }

    // === Sửa giao dịch ===
    @Override
    @Transactional
    public GiaoDichResponse update(String email, Integer maGiaoDich, GiaoDichRequest request) {
        NguoiDung user = getUserByEmail(email);

        GiaoDich gd = giaoDichRepo.findByMaGiaoDichAndNguoiDung_MaNguoiDung(
                        maGiaoDich, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));

        // Hoàn tiền ví cũ (nếu có)
        if (gd.getVi() != null) {
            Vi viCu = gd.getVi();
            BigDecimal soDuCu = viCu.getSoDu() != null ? viCu.getSoDu() : BigDecimal.ZERO;

            if ("CHI".equals(gd.getLoaiGiaoDich())) {
                // Giao dịch chi cũ → cộng lại tiền
                viCu.setSoDu(soDuCu.add(gd.getSoTien()));
            } else {
                // Giao dịch thu cũ → trừ lại tiền
                viCu.setSoDu(soDuCu.subtract(gd.getSoTien()));
            }
            viRepo.save(viCu);
        }

        // Cập nhật thông tin giao dịch
        gd.setSoTien(request.getSoTien());
        gd.setLoaiGiaoDich(request.getLoaiGiaoDich().toUpperCase());
        gd.setNgayGiaoDich(parseDate(request.getNgayGiaoDich()));
        gd.setGhiChu(request.getGhiChu());

        // Cập nhật danh mục
        if (request.getMaDanhMuc() != null) {
            DanhMuc dm = danhMucRepo.findById(request.getMaDanhMuc())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            gd.setDanhMuc(dm);
        } else {
            gd.setDanhMuc(null);
        }

        // Cập nhật ví mới + trừ/cộng tiền
        if (request.getMaVi() != null) {
            Vi viMoi = viRepo.findById(request.getMaVi())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
            gd.setVi(viMoi);

            BigDecimal soDuMoi = viMoi.getSoDu() != null ? viMoi.getSoDu() : BigDecimal.ZERO;

            if ("CHI".equals(gd.getLoaiGiaoDich())) {
                if (soDuMoi.compareTo(request.getSoTien()) < 0) {
                    throw new RuntimeException("Số dư ví '" + viMoi.getTenVi() + "' không đủ");
                }
                viMoi.setSoDu(soDuMoi.subtract(request.getSoTien()));
            } else {
                viMoi.setSoDu(soDuMoi.add(request.getSoTien()));
            }
            viRepo.save(viMoi);
        } else {
            gd.setVi(null);
        }

        giaoDichRepo.save(gd);
        return mapToResponse(gd);
    }

    // === Xóa giao dịch (soft delete) ===
    @Override
    public String delete(String email, Integer maGiaoDich) {
        NguoiDung user = getUserByEmail(email);

        GiaoDich gd = giaoDichRepo.findByMaGiaoDichAndNguoiDung_MaNguoiDung(
                        maGiaoDich, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));

        gd.setTrangThai("DELETED");
        giaoDichRepo.save(gd);
        return "Xóa giao dịch thành công";
    }

    // === Thống kê theo tháng ===
    @Override
    public ThongKeThangResponse getThongKeThang(String email, int thang, int nam) {
        NguoiDung user = getUserByEmail(email);
        Integer userId = user.getMaNguoiDung();

        BigDecimal tongThu = giaoDichRepo.getTongThuTheoThang(userId, thang, nam);
        BigDecimal tongChi = giaoDichRepo.getTongChiTheoThang(userId, thang, nam);
        long soGiaoDich = giaoDichRepo.countByNguoiDung_MaNguoiDungAndTrangThai(userId, "ACTIVE");

        ThongKeThangResponse res = new ThongKeThangResponse();
        res.setThang(thang);
        res.setNam(nam);
        res.setTongThu(tongThu != null ? tongThu : BigDecimal.ZERO);
        res.setTongChi(tongChi != null ? tongChi : BigDecimal.ZERO);
        res.setSoDu(res.getTongThu().subtract(res.getTongChi()));
        res.setSoGiaoDich(soGiaoDich);

        return res;
    }
}