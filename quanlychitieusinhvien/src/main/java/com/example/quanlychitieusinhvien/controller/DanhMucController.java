package com.example.quanlychitieusinhvien.controller;

import com.example.quanlychitieusinhvien.dto.DanhMucRequest;
import com.example.quanlychitieusinhvien.dto.DanhMucResponse;
import com.example.quanlychitieusinhvien.service.DanhMucService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc")
@CrossOrigin("*")
public class DanhMucController {

    @Autowired
    private DanhMucService service;

    @GetMapping
    public List<DanhMucResponse> getAll(Authentication auth) {
        return service.getAllByUser(auth.getName());
    }

    @GetMapping("/loai/{loai}")
    public List<DanhMucResponse> getByLoai(Authentication auth,
                                           @PathVariable String loai) {
        return service.getByLoai(auth.getName(), loai);
    }

    @GetMapping("/search")
    public List<DanhMucResponse> search(Authentication auth,
                                        @RequestParam String keyword) {
        return service.searchByTen(auth.getName(), keyword);
    }

    @GetMapping("/{id}")
    public DanhMucResponse getById(Authentication auth,
                                   @PathVariable Integer id) {
        return service.getById(auth.getName(), id);
    }

    @PostMapping
    public DanhMucResponse create(Authentication auth,
                                  @Valid @RequestBody DanhMucRequest request) {
        return service.create(auth.getName(), request);
    }

    @PutMapping("/{id}")
    public DanhMucResponse update(Authentication auth,
                                  @PathVariable Integer id,
                                  @Valid @RequestBody DanhMucRequest request) {
        return service.update(auth.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public String delete(Authentication auth,
                         @PathVariable Integer id) {
        return service.delete(auth.getName(), id);
    }
}