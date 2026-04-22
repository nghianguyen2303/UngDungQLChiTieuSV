package com.example.quanlychitieusinhvien.service.impl;

import com.example.quanlychitieusinhvien.dto.DanhMucRequest;
import com.example.quanlychitieusinhvien.dto.DanhMucResponse;
import com.example.quanlychitieusinhvien.entity.DanhMuc;
import com.example.quanlychitieusinhvien.entity.NguoiDung;
import com.example.quanlychitieusinhvien.repository.DanhMucRepository;
import com.example.quanlychitieusinhvien.repository.NguoiDungRepository;
import com.example.quanlychitieusinhvien.service.DanhMucService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DanhMucServiceImpl implements DanhMucService {

    @Autowired
    private DanhMucRepository danhMucRepo;

    @Autowired
    private NguoiDungRepository nguoiDungRepo;

    private NguoiDung getUserByEmail(String email) {
        return nguoiDungRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private DanhMucResponse mapToResponse(DanhMuc dm) {
        DanhMucResponse res = new DanhMucResponse();
        res.setMaDanhMuc(dm.getMaDanhMuc());
        res.setTenDanhMuc(dm.getTenDanhMuc());
        res.setLoaiDanhMuc(dm.getLoaiDanhMuc());
        res.setMoTa(dm.getMoTa());
        res.setSystem(dm.getIsSystem() != null && dm.getIsSystem() == 1);
        return res;
    }

    @Override
    public List<DanhMucResponse> getAllByUser(String email) {
        NguoiDung user = getUserByEmail(email);
        List<DanhMuc> list = danhMucRepo.findByNguoiDung_MaNguoiDung(user.getMaNguoiDung());
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<DanhMucResponse> getByLoai(String email, String loaiDanhMuc) {
        NguoiDung user = getUserByEmail(email);
        List<DanhMuc> list = danhMucRepo.findByNguoiDung_MaNguoiDungAndLoaiDanhMuc(
                user.getMaNguoiDung(), loaiDanhMuc.toUpperCase());
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<DanhMucResponse> searchByTen(String email, String keyword) {
        NguoiDung user = getUserByEmail(email);
        List<DanhMuc> list = danhMucRepo.findByNguoiDung_MaNguoiDungAndTenDanhMucContainingIgnoreCase(
                user.getMaNguoiDung(), keyword);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public DanhMucResponse getById(String email, Integer maDanhMuc) {
        NguoiDung user = getUserByEmail(email);
        DanhMuc dm = danhMucRepo.findByMaDanhMucAndNguoiDung_MaNguoiDung(maDanhMuc, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        return mapToResponse(dm);
    }

    @Override
    public DanhMucResponse create(String email, DanhMucRequest request) {
        NguoiDung user = getUserByEmail(email);

        boolean exists = danhMucRepo.existsByTenDanhMucAndLoaiDanhMucAndNguoiDung_MaNguoiDung(
                request.getTenDanhMuc(), request.getLoaiDanhMuc().toUpperCase(), user.getMaNguoiDung());
        if (exists) {
            throw new RuntimeException("Danh mục '" + request.getTenDanhMuc() + "' đã tồn tại");
        }

        DanhMuc dm = new DanhMuc();
        dm.setTenDanhMuc(request.getTenDanhMuc());
        dm.setLoaiDanhMuc(request.getLoaiDanhMuc().toUpperCase());
        dm.setMoTa(request.getMoTa());
        dm.setNguoiDung(user);
        dm.setIsSystem(0);

        danhMucRepo.save(dm);
        return mapToResponse(dm);
    }

    @Override
    public DanhMucResponse update(String email, Integer maDanhMuc, DanhMucRequest request) {
        NguoiDung user = getUserByEmail(email);

        DanhMuc dm = danhMucRepo.findByMaDanhMucAndNguoiDung_MaNguoiDung(maDanhMuc, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        if (dm.getIsSystem() != null && dm.getIsSystem() == 1) {
            throw new RuntimeException("Không thể sửa danh mục mặc định");
        }

        dm.setTenDanhMuc(request.getTenDanhMuc());
        dm.setLoaiDanhMuc(request.getLoaiDanhMuc().toUpperCase());
        dm.setMoTa(request.getMoTa());

        danhMucRepo.save(dm);
        return mapToResponse(dm);
    }

    @Override
    public String delete(String email, Integer maDanhMuc) {
        NguoiDung user = getUserByEmail(email);

        DanhMuc dm = danhMucRepo.findByMaDanhMucAndNguoiDung_MaNguoiDung(maDanhMuc, user.getMaNguoiDung())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        if (dm.getIsSystem() != null && dm.getIsSystem() == 1) {
            throw new RuntimeException("Không thể xóa danh mục mặc định");
        }

        danhMucRepo.delete(dm);
        return "Xóa danh mục thành công";
    }

    @Override
    public void createDefaultCategories(Integer maNguoiDung) {
        NguoiDung user = nguoiDungRepo.findById(maNguoiDung)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        String[][] chiDefaults = {
                {"Ăn uống", "Chi phí ăn uống hàng ngày"},
                {"Tiền trọ", "Tiền thuê nhà trọ hàng tháng"},
                {"Học phí", "Chi phí học tập"},
                {"Tài liệu", "Mua sách vở, tài liệu"},
                {"Di chuyển", "Chi phí đi lại, xăng xe"},
                {"Giải trí", "Chi phí giải trí, vui chơi"},
                {"Tiền điện", "Tiền điện hàng tháng"},
                {"Tiền nước", "Tiền nước hàng tháng"},
                {"Mua sắm", "Mua đồ dùng cá nhân"},
                {"Sức khỏe", "Chi phí khám bệnh, thuốc"},
        };

        for (String[] item : chiDefaults) {
            DanhMuc dm = new DanhMuc();
            dm.setTenDanhMuc(item[0]);
            dm.setMoTa(item[1]);
            dm.setLoaiDanhMuc("CHI");
            dm.setNguoiDung(user);
            dm.setIsSystem(1);
            danhMucRepo.save(dm);
        }

        String[][] thuDefaults = {
                {"Lương làm thêm", "Thu nhập từ công việc part-time"},
                {"Gia đình gửi", "Tiền gia đình hỗ trợ hàng tháng"},
                {"Học bổng", "Tiền học bổng"},
                {"Thưởng", "Tiền thưởng các loại"},
                {"Thu nhập khác", "Các khoản thu nhập khác"},
        };

        for (String[] item : thuDefaults) {
            DanhMuc dm = new DanhMuc();
            dm.setTenDanhMuc(item[0]);
            dm.setMoTa(item[1]);
            dm.setLoaiDanhMuc("THU");
            dm.setNguoiDung(user);
            dm.setIsSystem(1);
            danhMucRepo.save(dm);
        }
    }
}