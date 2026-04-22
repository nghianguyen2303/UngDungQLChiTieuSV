package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.DanhMucRequest;
import com.example.quanlychitieusinhvien.dto.DanhMucResponse;

import java.util.List;

public interface DanhMucService {

    List<DanhMucResponse> getAllByUser(String email);

    List<DanhMucResponse> getByLoai(String email, String loaiDanhMuc);

    List<DanhMucResponse> searchByTen(String email, String keyword);

    DanhMucResponse getById(String email, Integer maDanhMuc);

    DanhMucResponse create(String email, DanhMucRequest request);

    DanhMucResponse update(String email, Integer maDanhMuc, DanhMucRequest request);

    String delete(String email, Integer maDanhMuc);

    void createDefaultCategories(Integer maNguoiDung);
}