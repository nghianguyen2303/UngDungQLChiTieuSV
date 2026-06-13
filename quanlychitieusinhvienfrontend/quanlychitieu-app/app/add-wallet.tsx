import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { viAPI } from '../src/api/axiosClient';
import Colors from '../src/theme/colors';

const walletTypes = [
    { value: 'TIEN_MAT', label: 'Tiền mặt', icon: '💵' },
    { value: 'NGAN_HANG', label: 'Ngân hàng', icon: '🏦' },
    { value: 'VI_DIEN_TU', label: 'Ví điện tử', icon: '📱' },
];

export default function AddWalletScreen() {
    const router = useRouter();
    const [tenVi, setTenVi] = useState('');
    const [loaiVi, setLoaiVi] = useState('TIEN_MAT');
    const [soDu, setSoDu] = useState('');
    const [moTa, setMoTa] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (!tenVi.trim()) {
            Alert.alert('Thông báo', 'Tên ví không được để trống');
            return;
        }
        setLoading(true);
        try {
            await viAPI.create({
                tenVi: tenVi.trim(),
                loaiVi,
                soDu: Number(soDu) || 0,
                moTa: moTa.trim(),
            });
            Alert.alert('Thành công', 'Tạo ví thành công!', [
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
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.header}
            >
                <View style={s.headerRow}>
                    <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Tạo ví mới</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
                    <View style={s.card}>
                        {/* Loại ví */}
                        <Text style={s.label}>Loại ví</Text>
                        <View style={s.typeRow}>
                            {walletTypes.map(t => (
                                <TouchableOpacity
                                    key={t.value}
                                    style={[s.typeBtn, loaiVi === t.value && s.typeBtnActive]}
                                    onPress={() => setLoaiVi(t.value)}
                                >
                                    <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                                    <Text style={[s.typeText, loaiVi === t.value && s.typeTextActive]}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Tên ví */}
                        <Text style={s.label}>Tên ví</Text>
                        <View style={s.inputWrap}>
                            <Ionicons name="wallet-outline" size={20} color={Colors.textMuted} />
                            <TextInput
                                style={s.input} placeholder="Ví dụ: Tiền mặt, Vietcombank..."
                                placeholderTextColor={Colors.textMuted}
                                value={tenVi} onChangeText={setTenVi}
                            />
                        </View>

                        {/* Số dư ban đầu */}
                        <Text style={s.label}>Số dư ban đầu</Text>
                        <View style={s.inputWrap}>
                            <Ionicons name="cash-outline" size={20} color={Colors.textMuted} />
                            <TextInput
                                style={s.input} placeholder="0"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                                value={soDu} onChangeText={t => setSoDu(t.replace(/[^0-9]/g, ''))}
                            />
                            <Text style={s.suffix}>đ</Text>
                        </View>
                        {soDu ? <Text style={s.display}>{Number(soDu).toLocaleString('vi-VN')}đ</Text> : null}

                        {/* Mô tả */}
                        <Text style={s.label}>Mô tả (tùy chọn)</Text>
                        <View style={[s.inputWrap, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                            <Ionicons name="document-text-outline" size={20} color={Colors.textMuted} style={{ marginTop: 2 }} />
                            <TextInput
                                style={[s.input, { textAlignVertical: 'top' }]}
                                placeholder="Ghi chú về ví..."
                                placeholderTextColor={Colors.textMuted}
                                value={moTa} onChangeText={setMoTa}
                                multiline numberOfLines={3}
                            />
                        </View>

                        {/* Nút tạo */}
                        <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                            <LinearGradient
                                colors={[Colors.primary, Colors.secondary]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={[s.btn, loading && { opacity: 0.7 }]}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={22} color="#fff" />
                                        <Text style={s.btnText}>Tạo ví</Text>
                                    </>
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
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'column' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    form: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
    label: { fontSize: 13, fontWeight: '600', color: Colors.textMedium, marginBottom: 10, marginLeft: 2, marginTop: 4 },
    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    typeBtn: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.inputBg, borderWidth: 2, borderColor: Colors.inputBorder },
    typeBtnActive: { borderColor: Colors.primary, backgroundColor: '#f0f7ff' },
    typeText: { fontSize: 12, fontWeight: '600', color: Colors.textMedium },
    typeTextActive: { color: Colors.primary },
    inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.inputBg, borderWidth: 2, borderColor: Colors.inputBorder, borderRadius: 14, paddingHorizontal: 14, height: 52, marginBottom: 18 },
    input: { flex: 1, fontSize: 15, color: Colors.textDark },
    suffix: { fontSize: 16, fontWeight: '600', color: Colors.textMuted },
    display: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: -12, marginBottom: 16, marginLeft: 4 },
    btn: { height: 54, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8, elevation: 8 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});