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

export default function RegisterScreen() {
    const { register } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        hoTen: '',
        email: '',
        matKhau: '',
        soDienThoai: '',
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (k: string, v: string) =>
        setForm((prev) => ({ ...prev, [k]: v }));

    async function handleRegister() {
        if (!form.hoTen.trim() || !form.email.trim() || !form.matKhau.trim()) {
            Alert.alert(
                'Thông báo',
                'Vui lòng nhập đầy đủ họ tên, email và mật khẩu'
            );
            return;
        }
        if (form.matKhau.length < 6) {
            Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        setLoading(true);
        try {
            await register({
                hoTen: form.hoTen.trim(),
                email: form.email.trim(),
                matKhau: form.matKhau,
                soDienThoai: form.soDienThoai.trim(),
            });
            router.push({
                pathname: '/otp-register',
                params: {
                    email: form.email.trim(),
                },
            } as any);
        } catch (err: any) {
            Alert.alert('Đăng ký thất bại', err.message || 'Có lỗi xảy ra');
        }
        setLoading(false);
    }

    const fields = [
        {
            key: 'hoTen',
            label: 'Họ và tên',
            placeholder: 'Nguyễn Văn A',
            icon: 'person-outline' as const,
            kb: 'default' as const,
        },
        {
            key: 'email',
            label: 'Email',
            placeholder: 'email@example.com',
            icon: 'mail-outline' as const,
            kb: 'email-address' as const,
        },
        {
            key: 'soDienThoai',
            label: 'Số điện thoại (tùy chọn)',
            placeholder: '0912345678',
            icon: 'call-outline' as const,
            kb: 'phone-pad' as const,
        },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.secondary, Colors.primary, Colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View
                    style={[
                        styles.circle,
                        { width: 220, height: 220, bottom: -40, left: -60 },
                    ]}
                />
                <View
                    style={[
                        styles.circle,
                        { width: 140, height: 140, top: 40, right: -30 },
                    ]}
                />

                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={26} color="#fff" />
                </TouchableOpacity>

                <View style={styles.logoBox}>
                    <Text style={styles.logoEmoji}>📝</Text>
                </View>
                <Text style={styles.appName}>Tạo tài khoản</Text>
                <Text style={styles.appSlogan}>
                    Bắt đầu quản lý chi tiêu ngay hôm nay
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
                    {fields.map((f) => (
                        <View key={f.key}>
                            <Text style={styles.label}>{f.label}</Text>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name={f.icon}
                                    size={20}
                                    color={Colors.textMuted}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder={f.placeholder}
                                    placeholderTextColor={Colors.textMuted}
                                    keyboardType={f.kb}
                                    autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                                    value={(form as any)[f.key]}
                                    onChangeText={(v) => set(f.key, v)}
                                />
                            </View>
                        </View>
                    ))}

                    <Text style={styles.label}>Mật khẩu</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={Colors.textMuted}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Tối thiểu 6 ký tự"
                            placeholderTextColor={Colors.textMuted}
                            secureTextEntry={!showPass}
                            value={form.matKhau}
                            onChangeText={(v) => set('matKhau', v)}
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
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={[Colors.secondary, Colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.btn, loading && { opacity: 0.7 }]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>Đăng ký</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>Đã có tài khoản? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.switchLink}>Đăng nhập</Text>
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
        paddingTop: 56,
        paddingBottom: 36,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoBox: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    logoEmoji: { fontSize: 28 },
    appName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    appSlogan: { fontSize: 13.5, color: 'rgba(255,255,255,0.8)' },
    formWrap: {
        flex: 1,
        backgroundColor: Colors.bgWhite,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -24,
        overflow: 'hidden',
    },
    formInner: { padding: 28, paddingBottom: 40 },
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
        marginBottom: 16,
    },
    input: { flex: 1, fontSize: 15, color: Colors.textDark },
    btn: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    switchText: { fontSize: 14, color: Colors.textLight },
    switchLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});