import React, { useState } from 'react';

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../src/theme/colors';

import { useAuth } from '../src/context/AuthContext';

export default function OtpRegisterScreen() {

    const router = useRouter();

    const { email } = useLocalSearchParams<{
        email: string;
    }>();

    const { verifyRegisterOtp } = useAuth();

    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);

    async function handleVerifyOtp() {

        if (!otp.trim()) {

            Alert.alert(
                'Thông báo',
                'Vui lòng nhập OTP'
            );

            return;
        }

        setLoading(true);

        try {

            await verifyRegisterOtp(
                email,
                otp.trim()
            );

            Alert.alert(
                'Thành công',
                'Đăng ký thành công',
                [
                    {
                        text: 'Đăng nhập',
                        onPress: () =>
                            router.replace('/login' as any),
                    },
                ]
            );

        } catch (err: any) {

            Alert.alert(
                'Lỗi',
                err.message || 'OTP không đúng'
            );
        }

        setLoading(false);
    }

    return (
        <View style={styles.container}>

            <LinearGradient
                colors={[
                    Colors.secondary,
                    Colors.primary,
                ]}
                style={styles.header}
            >
                <Text style={styles.title}>
                    Xác thực đăng ký
                </Text>

                <Text style={styles.subtitle}>
                    OTP đã gửi tới:
                </Text>

                <Text style={styles.email}>
                    {email}
                </Text>
            </LinearGradient>

            <View style={styles.form}>

                <Text style={styles.label}>
                    Nhập mã OTP
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="6 chữ số"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                />

                <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[
                            Colors.secondary,
                            Colors.primary,
                        ]}
                        style={styles.button}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                Xác nhận OTP
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    header: {
        paddingTop: 100,
        paddingBottom: 60,
        alignItems: 'center',
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 12,
    },

    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
    },

    email: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginTop: 6,
    },

    form: {
        padding: 28,
        marginTop: 30,
    },

    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
        color: Colors.textDark,
    },

    input: {
        height: 56,
        borderWidth: 2,
        borderColor: Colors.inputBorder,
        borderRadius: 16,
        paddingHorizontal: 18,
        fontSize: 22,
        textAlign: 'center',
        letterSpacing: 10,
        marginBottom: 24,
    },

    button: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
});