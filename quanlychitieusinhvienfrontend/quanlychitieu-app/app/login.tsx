import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import Colors from '../src/theme/colors';

export default function LoginScreen() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email.trim() || !matKhau.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }
        setLoading(true);
        try {
            await login(
                email.trim(),
                matKhau
            );

            router.push({
                pathname: '/otp-login',
                params: {
                    email: email.trim(),
                },
            } as any);
        } catch (err: any) {
            Alert.alert(
                'Đăng nhập thất bại',
                err.message || 'Sai email hoặc mật khẩu'
            );
        }
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary, '#0fb981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View
                    style={[
                        styles.circle,
                        { width: 280, height: 280, top: -80, right: -60 },
                    ]}
                />
                <View
                    style={[
                        styles.circle,
                        { width: 180, height: 180, top: 120, left: -50 },
                    ]}
                />
                <View
                    style={[
                        styles.circle,
                        { width: 100, height: 100, bottom: 30, right: 20 },
                    ]}
                />

                <View style={styles.logoBox}>
                    <Text style={styles.logoEmoji}>💰</Text>
                </View>
                <Text style={styles.appName}>Chi Tiêu SV</Text>
                <Text style={styles.appSlogan}>
                    Quản lý chi tiêu thông minh cho sinh viên
                </Text>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.formWrap}
            >
                <ScrollView
                    contentContainerStyle={styles.formInner}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.formTitle}>Đăng nhập</Text>
                    <Text style={styles.formSubtitle}>
                        Chào mừng bạn quay trở lại!
                    </Text>

                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={Colors.textMuted}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="email@example.com"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <Text style={styles.label}>Mật khẩu</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={Colors.textMuted}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mật khẩu"
                            placeholderTextColor={Colors.textMuted}
                            secureTextEntry={!showPass}
                            value={matKhau}
                            onChangeText={setMatKhau}
                        />
                        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                            <Ionicons
                                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color={Colors.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.btn, loading && { opacity: 0.7 }]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>Đăng nhập</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>Chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => router.push('/register' as any)}>
                            <Text style={styles.switchLink}>Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgWhite },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    logoBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoEmoji: { fontSize: 32 },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    appSlogan: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    formWrap: {
        flex: 1,
        backgroundColor: Colors.bgWhite,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -24,
        overflow: 'hidden',
    },
    formInner: { padding: 28, paddingTop: 32 },
    formTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: 6,
    },
    formSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 28,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMedium,
        marginBottom: 8,
        marginLeft: 2,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.inputBg,
        borderWidth: 2,
        borderColor: Colors.inputBorder,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 52,
        marginBottom: 18,
    },
    input: { flex: 1, fontSize: 15, color: Colors.textDark },
    btn: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    btnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 28,
    },
    switchText: { fontSize: 14, color: Colors.textLight },
    switchLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});