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

export default function EditProfileScreen() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    const [hoTen, setHoTen] = useState(user?.hoTen || '');
    const [soDienThoai, setSoDienThoai] = useState(
        user?.soDienThoai || ''
    );
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (!hoTen.trim()) {
            Alert.alert('Thông báo', 'Họ tên không được để trống');
            return;
        }
        setLoading(true);
        try {
            await updateProfile({
                hoTen: hoTen.trim(),
                soDienThoai: soDienThoai.trim(),
            });
            Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message);
        }
        setLoading(false);
    }

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
                <Text style={s.headerTitle}>Chỉnh sửa hồ sơ</Text>
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
                        <Text style={s.label}>Họ và tên</Text>
                        <View style={s.inputWrap}>
                            <Ionicons
                                name="person-outline"
                                size={20}
                                color={Colors.textMuted}
                            />
                            <TextInput
                                style={s.input}
                                placeholder="Nhập họ tên"
                                placeholderTextColor={Colors.textMuted}
                                value={hoTen}
                                onChangeText={setHoTen}
                            />
                        </View>

                        <Text style={s.label}>Số điện thoại</Text>
                        <View style={s.inputWrap}>
                            <Ionicons
                                name="call-outline"
                                size={20}
                                color={Colors.textMuted}
                            />
                            <TextInput
                                style={s.input}
                                placeholder="Nhập SĐT"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="phone-pad"
                                value={soDienThoai}
                                onChangeText={setSoDienThoai}
                            />
                        </View>

                        <Text style={s.label}>Email</Text>
                        <View
                            style={[s.inputWrap, { backgroundColor: '#f1f5f9' }]}
                        >
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={Colors.textMuted}
                            />
                            <Text style={[s.input, { color: Colors.textMuted }]}>
                                {user?.email}
                            </Text>
                        </View>
                        <Text style={s.hint}>Email không thể thay đổi</Text>

                        <TouchableOpacity
                            onPress={handleSave}
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
                                    <Text style={s.btnText}>Lưu thay đổi</Text>
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
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMedium,
        marginBottom: 8,
        marginLeft: 2,
        marginTop: 4,
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
    hint: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: -10,
        marginBottom: 24,
        marginLeft: 4,
    },
    btn: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});