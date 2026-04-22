package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.ChuyenTienRequest;
import com.example.quanlychitieusinhvien.dto.ViRequest;
import com.example.quanlychitieusinhvien.dto.ViResponse;
import com.example.quanlychitieusinhvien.entity.NguoiDung;
import com.example.quanlychitieusinhvien.entity.Vi;
import com.example.quanlychitieusinhvien.repository.NguoiDungRepository;
import com.example.quanlychitieusinhvien.repository.ViRepository;
import com.example.quanlychitieusinhvien.service.ViService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ViServiceImpl implements ViService {

    @Autowired
    private ViRepository viRepo;

    @Autowired
    private NguoiDungRepository nguoiDungRepo;

    private NguoiDung getUserByEmail(String email) {
        return nguoiDungRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private String getLoaiViLabel(String loaiVi) {
        if (loaiVi == null) return "Khác";
        switch (loaiVi) {
            case "TIEN_MAT": return "Tiền mặt";
            case "NGAN_HANG": return "Ngân hàng";
            case "VI_DIEN_TU": return "Ví điện tử";
            default: return loaiVi;
        }
    }

    private ViResponse mapToResponse(Vi vi) {
        ViResponse res = new ViResponse();
        res.setMaVi(vi.getMaVi());
        res.setTenVi(vi.getTenVi());
        res.setLoaiVi(vi.getLoaiVi());
        res.setLoaiViLabel(getLoaiViLabel(vi.getLoaiVi()));
        res.setSoDu(vi.getSoDu() != null ? vi.getSoDu() : BigDecimal.ZERO);
        res.setMoTa(vi.getMoTa());
        return res;
    }

    // === Lấy tất cả ví ===
    @Override
    public List<ViResponse> getAllByUser(String email) {
        NguoiDung user = getUserByEmail(email);
        List<Vi> list = viRepo.findByNguoiDung_MaNguoiDung(user.getMaNguoiDung());
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // === Lấy 1 ví ===
    @Override
    public ViResponse getById(String email, Integer maVi) {
        NguoiDung user = getUserByEmail(email);
        Vi vi = viRepo.findByMaViAndNguoiDung_MaNguoiDung(maVi, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
        return mapToResponse(vi);
    }

    // === Tạo ví mới ===
    @Override
    public ViResponse create(String email, ViRequest request) {
        NguoiDung user = getUserByEmail(email);

        boolean exists = viRepo.existsByTenViAndNguoiDung_MaNguoiDung(
                request.getTenVi(), user.getMaNguoiDung());
        if (exists) {
            throw new RuntimeException("Ví '" + request.getTenVi() + "' đã tồn tại");
        }

        Vi vi = new Vi();
        vi.setTenVi(request.getTenVi());
        vi.setLoaiVi(request.getLoaiVi());
        vi.setSoDu(request.getSoDu());
        vi.setMoTa(request.getMoTa());
        vi.setNguoiDung(user);

        viRepo.save(vi);
        return mapToResponse(vi);
    }

    // === Sửa ví ===
    @Override
    public ViResponse update(String email, Integer maVi, ViRequest request) {
        NguoiDung user = getUserByEmail(email);

        Vi vi = viRepo.findByMaViAndNguoiDung_MaNguoiDung(maVi, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));

        vi.setTenVi(request.getTenVi());
        vi.setLoaiVi(request.getLoaiVi());
        vi.setSoDu(request.getSoDu());
        vi.setMoTa(request.getMoTa());

        viRepo.save(vi);
        return mapToResponse(vi);
    }

    // === Xóa ví ===
    @Override
    public String delete(String email, Integer maVi) {
        NguoiDung user = getUserByEmail(email);

        Vi vi = viRepo.findByMaViAndNguoiDung_MaNguoiDung(maVi, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));

        viRepo.delete(vi);
        return "Xóa ví thành công";
    }

    // === Chuyển tiền giữa các ví ===
    @Override
    @Transactional
    public String chuyenTien(String email, ChuyenTienRequest request) {
        NguoiDung user = getUserByEmail(email);

        if (request.getMaViNguon().equals(request.getMaViDich())) {
            throw new RuntimeException("Ví nguồn và ví đích không được giống nhau");
        }

        Vi viNguon = viRepo.findByMaViAndNguoiDung_MaNguoiDung(
                        request.getMaViNguon(), user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví nguồn"));

        Vi viDich = viRepo.findByMaViAndNguoiDung_MaNguoiDung(
                        request.getMaViDich(), user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví đích"));

        BigDecimal soDuNguon = viNguon.getSoDu() != null ? viNguon.getSoDu() : BigDecimal.ZERO;

        if (soDuNguon.compareTo(request.getSoTien()) < 0) {
            throw new RuntimeException("Số dư ví '" + viNguon.getTenVi() + "' không đủ. " +
                    "Hiện có: " + soDuNguon.toPlainString() + "đ");
        }

        // Trừ ví nguồn
        viNguon.setSoDu(soDuNguon.subtract(request.getSoTien()));
        viRepo.save(viNguon);

        // Cộng ví đích
        BigDecimal soDuDich = viDich.getSoDu() != null ? viDich.getSoDu() : BigDecimal.ZERO;
        viDich.setSoDu(soDuDich.add(request.getSoTien()));
        viRepo.save(viDich);

        return "Chuyển " + request.getSoTien().toPlainString() + "đ từ '"
                + viNguon.getTenVi() + "' sang '" + viDich.getTenVi() + "' thành công";
    }

    // === Tổng số dư ===
    @Override
    public BigDecimal getTongSoDu(String email) {
        NguoiDung user = getUserByEmail(email);
        List<Vi> list = viRepo.findByNguoiDung_MaNguoiDung(user.getMaNguoiDung());
        return list.stream()
                .map(v -> v.getSoDu() != null ? v.getSoDu() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // === Tạo ví mặc định khi đăng ký ===
    @Override
    public void createDefaultWallets(Integer maNguoiDung) {
        NguoiDung user = nguoiDungRepo.findById(maNguoiDung)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        String[][] defaults = {
                {"Tiền mặt", "TIEN_MAT", "Ví tiền mặt hàng ngày"},
                {"Ngân hàng", "NGAN_HANG", "Tài khoản ngân hàng chính"},
        };

        for (String[] item : defaults) {
            Vi vi = new Vi();
            vi.setTenVi(item[0]);
            vi.setLoaiVi(item[1]);
            vi.setMoTa(item[2]);
            vi.setSoDu(BigDecimal.ZERO);
            vi.setNguoiDung(user);
            viRepo.save(vi);
        }
    }
}