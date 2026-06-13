import React, {
    createContext,
    useState,
    useEffect,
    useContext,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    authAPI,
    userAPI,
} from '../api/axiosClient';

type User = {
    maNguoiDung?: number;
    hoTen: string;
    email: string;
    soDienThoai?: string;
    trangThai?: string;
    ngayTao?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;

    login: (
        email: string,
        matKhau: string
    ) => Promise<any>;

    verifyLoginOtp: (
        email: string,
        otp: string
    ) => Promise<void>;

    register: (
        data: any
    ) => Promise<any>;

    verifyRegisterOtp: (
        email: string,
        otp: string
    ) => Promise<any>;

    logout: () => Promise<void>;

    updateProfile: (
        data: any
    ) => Promise<any>;

    changePassword: (
        matKhauCu: string,
        matKhauMoi: string
    ) => Promise<any>;

    reloadProfile: () => Promise<void>;
};

const AuthContext =
    createContext<AuthContextType>(
        {} as AuthContextType
    );

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [user, setUser] =
        useState<User | null>(null);

    const [token, setToken] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    // ===== CHECK LOGIN =====
    async function checkLogin() {

        try {

            const saved =
                await AsyncStorage.getItem(
                    'token'
                );

            if (saved) {

                setToken(saved);

                const res =
                    await userAPI.getProfile();

                setUser(res.data);
            }

        } catch {

            await AsyncStorage.removeItem(
                'token'
            );

            setToken(null);

            setUser(null);

        } finally {

            setLoading(false);
        }
    }

    // ===== LOGIN =====
    async function login(
        email: string,
        matKhau: string
    ) {

        const res =
            await authAPI.login(
                email,
                matKhau
            );

        return res.data;
    }

    // ===== VERIFY LOGIN OTP =====
    async function verifyLoginOtp(
        email: string,
        otp: string
    ) {

        const res =
            await authAPI.verifyLoginOtp(
                email,
                otp
            );

        const data = res.data;

        await AsyncStorage.setItem(
            'token',
            data.token
        );

        setToken(data.token);

        setUser({
            hoTen: data.hoTen,
            email: data.email,
        });

        try {

            const profile =
                await userAPI.getProfile();

            setUser(profile.data);

        } catch { }
    }

    // ===== REGISTER =====
    async function register(data: any) {

        const res =
            await authAPI.register(data);

        return res.data;
    }

    // ===== VERIFY REGISTER OTP =====
    async function verifyRegisterOtp(
        email: string,
        otp: string
    ) {

        const res =
            await authAPI.verifyRegisterOtp(
                email,
                otp
            );

        return res.data;
    }

    // ===== LOGOUT =====
    async function logout() {

        await AsyncStorage.removeItem(
            'token'
        );

        setToken(null);

        setUser(null);
    }

    // ===== UPDATE PROFILE =====
    async function updateProfile(
        data: any
    ) {

        const res =
            await userAPI.updateProfile(data);

        setUser(res.data);

        return res.data;
    }

    // ===== CHANGE PASSWORD =====
    async function changePassword(
        matKhauCu: string,
        matKhauMoi: string
    ) {

        const res =
            await userAPI.changePassword(
                matKhauCu,
                matKhauMoi
            );

        return res.data;
    }

    // ===== RELOAD PROFILE =====
    async function reloadProfile() {

        const res =
            await userAPI.getProfile();

        setUser(res.data);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                verifyLoginOtp,
                register,
                verifyRegisterOtp,
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