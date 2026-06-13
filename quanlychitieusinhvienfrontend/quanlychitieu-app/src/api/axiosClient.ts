import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.0.177:8080/api';

const axiosClient = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn JWT token vào header mỗi request
axiosClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý lỗi từ server
axiosClient.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response) {
            const msg =
                error.response.data?.message ||
                error.response.data ||
                'Đã xảy ra lỗi';
            return Promise.reject(new Error(String(msg)));
        }
        return Promise.reject(new Error('Không thể kết nối tới server'));
    }
);

//AuthController: /api/auth/login, /api/auth/register
export const authAPI = {

    login: (email: string, matKhau: string) =>
        axiosClient.post('/auth/login', {
            email,
            matKhau,
        }),

    register: (data: any) =>
        axiosClient.post('/auth/register', data),

    verifyLoginOtp: (
        email: string,
        otp: string
    ) =>
        axiosClient.post(
            '/auth/verify-login-otp',
            {
                email,
                otp,
            }
        ),

    verifyRegisterOtp: (
        email: string,
        otp: string
    ) =>
        axiosClient.post(
            '/auth/verify-register-otp',
            {
                email,
                otp,
            }
        ),
};

//NguoiDungController: /api/user/profile, /api/user/change-password
export const userAPI = {
    getProfile: () =>
        axiosClient.get('/user/profile'),

    updateProfile: (data: any) =>
        axiosClient.put('/user/profile', data),

    changePassword: (matKhauCu: string, matKhauMoi: string) =>
        axiosClient.put('/user/change-password', { matKhauCu, matKhauMoi }),
};

export const danhMucAPI = {
    getAll: () =>
        axiosClient.get('/danh-muc'),

    getByLoai: (loai: string) =>
        axiosClient.get(`/danh-muc/loai/${loai}`),

    search: (keyword: string) =>
        axiosClient.get('/danh-muc/search', { params: { keyword } }),

    getById: (id: number) =>
        axiosClient.get(`/danh-muc/${id}`),

    create: (data: { tenDanhMuc: string; loaiDanhMuc: string; moTa?: string }) =>
        axiosClient.post('/danh-muc', data),

    update: (id: number, data: { tenDanhMuc: string; loaiDanhMuc: string; moTa?: string }) =>
        axiosClient.put(`/danh-muc/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/danh-muc/${id}`),
};

export const giaoDichAPI = {
    getAll: () =>
        axiosClient.get('/giao-dich'),

    getByLoai: (loai: string) =>
        axiosClient.get(`/giao-dich/loai/${loai}`),

    getByDanhMuc: (maDanhMuc: number) =>
        axiosClient.get(`/giao-dich/danh-muc/${maDanhMuc}`),

    getByThang: (thang: number, nam: number) =>
        axiosClient.get('/giao-dich/thang', { params: { thang, nam } }),

    getById: (id: number) =>
        axiosClient.get(`/giao-dich/${id}`),

    create: (data: {
        soTien: number;
        loaiGiaoDich: string;
        ngayGiaoDich?: string;
        ghiChu?: string;
        maDanhMuc?: number;
        maVi?: number;
    }) => axiosClient.post('/giao-dich', data),

    update: (id: number, data: any) =>
        axiosClient.put(`/giao-dich/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/giao-dich/${id}`),

    thongKe: (thang: number, nam: number) =>
        axiosClient.get('/giao-dich/thong-ke', { params: { thang, nam } }),
};

// --- THỐNG KÊ API ---
export const thongKeAPI = {
    tongQuan: (thang: number, nam: number) =>
        axiosClient.get('/thong-ke/tong-quan', { params: { thang, nam } }),

    tongQuanTatCa: () =>
        axiosClient.get('/thong-ke/tong-quan-tat-ca'),

    theoDanhMuc: (loai: string, thang: number, nam: number) =>
        axiosClient.get('/thong-ke/danh-muc', { params: { loai, thang, nam } }),

    theoNgay: (thang: number, nam: number) =>
        axiosClient.get('/thong-ke/theo-ngay', { params: { thang, nam } }),

    xuHuong: (thang: number, nam: number) =>
        axiosClient.get('/thong-ke/xu-huong', { params: { thang, nam } }),
};

// --- NGÂN SÁCH API ---
export const nganSachAPI = {
    getAll: () =>
        axiosClient.get('/ngan-sach'),

    getByThang: (thang: number, nam: number) =>
        axiosClient.get('/ngan-sach/thang', { params: { thang, nam } }),

    getById: (id: number) =>
        axiosClient.get(`/ngan-sach/${id}`),

    create: (data: any) =>
        axiosClient.post('/ngan-sach', data),

    update: (id: number, data: any) =>
        axiosClient.put(`/ngan-sach/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/ngan-sach/${id}`),

    canhBao: (thang: number, nam: number) =>
        axiosClient.get('/ngan-sach/canh-bao', { params: { thang, nam } }),
};

// --- VÍ API ---
export const viAPI = {
    getAll: () =>
        axiosClient.get('/vi'),

    getById: (id: number) =>
        axiosClient.get(`/vi/${id}`),

    create: (data: { tenVi: string; loaiVi: string; soDu: number; moTa?: string }) =>
        axiosClient.post('/vi', data),

    update: (id: number, data: { tenVi: string; loaiVi: string; soDu: number; moTa?: string }) =>
        axiosClient.put(`/vi/${id}`, data),

    delete: (id: number) =>
        axiosClient.delete(`/vi/${id}`),

    chuyenTien: (data: { maViNguon: number; maViDich: number; soTien: number; ghiChu?: string }) =>
        axiosClient.post('/vi/chuyen-tien', data),

    tongSoDu: () =>
        axiosClient.get('/vi/tong-so-du'),
};

// --- THÔNG BÁO API ---
export const thongBaoAPI = {
    getAll: () =>
        axiosClient.get('/thong-bao'),

    getChuaDoc: () =>
        axiosClient.get('/thong-bao/chua-doc'),

    count: () =>
        axiosClient.get('/thong-bao/count'),

    markAsRead: (id: number) =>
        axiosClient.put(`/thong-bao/${id}/doc`),

    markAllAsRead: () =>
        axiosClient.put('/thong-bao/doc-tat-ca'),

    delete: (id: number) =>
        axiosClient.delete(`/thong-bao/${id}`),

    deleteAllRead: () =>
        axiosClient.delete('/thong-bao/da-doc'),

    kiemTraNganSach: () =>
        axiosClient.post('/thong-bao/kiem-tra-ngan-sach'),
};

export default axiosClient;