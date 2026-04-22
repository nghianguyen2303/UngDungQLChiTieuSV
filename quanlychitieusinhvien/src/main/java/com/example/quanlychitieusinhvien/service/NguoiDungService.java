package com.example.quanlychitieusinhvien.service;

import com.example.quanlychitieusinhvien.dto.*;

public interface NguoiDungService {

    UserResponse getProfile(String email);

    UserResponse updateProfile(String email, UpdateProfileRequest request);

    String changePassword(String email, ChangePasswordRequest request);
}