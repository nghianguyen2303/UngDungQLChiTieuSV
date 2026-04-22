import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userAPI } from '../api/axiosClient';

type User = {
    maNguoiDung?: number;
    hoTen: string;
    email: string;
    soDienThoai?: string;
    trangThai?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, matKhau: string) => Promise<void>;
    register: (data: any) => Promise<any>;
    logout: () => Promise<void>;
    updateProfile: (data: any) => Promise<any>;
    changePassword: (matKhauCu: string, matKhauMoi: string) => Promise<any>;
    reloadProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    async function checkLogin() {
        try {
            const saved = await AsyncStorage.getItem('token');
            if (saved) {
                setToken(saved);
                const res = await userAPI.getProfile();
                setUser(res.data);
            }
        } catch {
            await AsyncStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, matKhau: string) {
        // Gọi POST /api/auth/login -> trả về AuthResponse {token, email, hoTen}
        const res = await authAPI.login(email, matKhau);
        const data = res.data;
        await AsyncStorage.setItem('token', data.token);
        setToken(data.token);
        setUser({ hoTen: data.hoTen, email: data.email });
        // Load full profile từ GET /api/user/profile -> UserResponse
        try {
            const profile = await userAPI.getProfile();
            setUser(profile.data);
        } catch { }
    }

    async function register(data: any) {
        // Gọi POST /api/auth/register -> trả về String "Đăng ký thành công"
        const res = await authAPI.register(data);
        return res.data;
    }

    async function logout() {
        await AsyncStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }

    async function updateProfile(data: any) {
        // Gọi PUT /api/user/profile -> trả về UserResponse
        const res = await userAPI.updateProfile(data);
        setUser(res.data);
        return res.data;
    }

    async function changePassword(matKhauCu: string, matKhauMoi: string) {
        // Gọi PUT /api/user/change-password -> trả về String
        const res = await userAPI.changePassword(matKhauCu, matKhauMoi);
        return res.data;
    }

    async function reloadProfile() {
        const res = await userAPI.getProfile();
        setUser(res.data);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                updateProfile,
                changePassword,
                reloadProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}