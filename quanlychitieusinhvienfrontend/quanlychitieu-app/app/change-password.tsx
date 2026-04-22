import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import Colors from '../src/theme/colors';

export default function ChangePasswordScreen() {
    const { changePassword } = useAuth();
    const router = useRouter();
    const [matKhauCu, setMatKhauCu] = useState('');
    const [matKhauMoi, setMatKhauMoi] = useState('');
    const [xacNhan, setXacNhan] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleChange() {
        if (!matKhauCu || !matKhauMoi || !xacNhan) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ');
            return;
        }
        if (matKhauMoi.length < 6) {
            Alert.alert('Thông báo', 'Mật khẩu mới ít nhất 6 ký tự');
            return;
        }
        if (matKhauMoi !== xacNhan) {
            Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        try {
            await changePassword(matKhauCu, matKhauMoi);
            Alert.alert('Thành công', 'Đổi mật khẩu thành công!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message);
        }
        setLoading(false);
    }

    const fields = [
        {
            label: 'Mật khẩu hiện tại',
            ph: 'Nhập mật khẩu cũ',
            val: matKhauCu,
            set: setMatKhauCu,
        },
        {
            label: 'Mật khẩu mới',
            ph: 'Nhập mật khẩu mới',
            val: matKhauMoi,
            set: setMatKhauMoi,
        },
        {
            label: 'Xác nhận mật khẩu',
            ph: 'Nhập lại mật khẩu mới',
            val: xacNhan,
            set: setXacNhan,
        },
    ];

    return (
        <View style={s.container}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.header}
            >
                <TouchableOpacity
                    style={s.backBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Đổi mật khẩu</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={s.form}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={s.card}>
                        <View style={s.lockIcon}>
                            <Ionicons
                                name="lock-closed"
                                size={28}
                                color={Colors.primary}
                            />
                        </View>
                        <Text style={s.desc}>
                            Mật khẩu mới phải có ít nhất 6 ký tự và khác mật khẩu
                            cũ.
                        </Text>

                        {fields.map((f, i) => (
                            <View key={i}>
                                <Text style={s.label}>{f.label}</Text>
                                <View style={s.inputWrap}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color={Colors.textMuted}
                                    />
                                    <TextInput
                                        style={s.input}
                                        placeholder={f.ph}
                                        placeholderTextColor={Colors.textMuted}
                                        secureTextEntry
                                        value={f.val}
                                        onChangeText={f.set}
                                    />
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            onPress={handleChange}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[Colors.primary, Colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[s.btn, loading && { opacity: 0.7 }]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={s.btnText}>Đổi mật khẩu</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    form: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
    },
    lockIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#f0f7ff',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 12,
    },
    desc: {
        fontSize: 13,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
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
        marginTop: 6,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});