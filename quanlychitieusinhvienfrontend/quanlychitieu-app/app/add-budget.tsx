import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { nganSachAPI, danhMucAPI } from '../src/api/axiosClient';
import Colors from '../src/theme/colors';

type DanhMuc = { maDanhMuc: number; tenDanhMuc: string; loaiDanhMuc: string };
type ChiTietInput = { maDanhMuc: number; tenDanhMuc: string; soTienDuKien: string; ghiChu: string };

export default function AddBudgetScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ thang: string; nam: string }>();
    const [thang] = useState(Number(params.thang) || new Date().getMonth() + 1);
    const [nam] = useState(Number(params.nam) || new Date().getFullYear());
    const [soTienGioiHan, setSoTienGioiHan] = useState('');
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [chiTiet, setChiTiet] = useState<ChiTietInput[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            const res = await danhMucAPI.getByLoai('CHI');
            setCategories(res.data);
        } catch { }
    }

    function toggleCategory(dm: DanhMuc) {
        const exists = chiTiet.find(c => c.maDanhMuc === dm.maDanhMuc);
        if (exists) {
            setChiTiet(prev => prev.filter(c => c.maDanhMuc !== dm.maDanhMuc));
        } else {
            setChiTiet(prev => [...prev, { maDanhMuc: dm.maDanhMuc, tenDanhMuc: dm.tenDanhMuc, soTienDuKien: '', ghiChu: '' }]);
        }
    }

    function updateChiTiet(maDanhMuc: number, field: string, value: string) {
        setChiTiet(prev => prev.map(c =>
            c.maDanhMuc === maDanhMuc ? { ...c, [field]: value } : c
        ));
    }

    async function handleSave() {
        if (!soTienGioiHan.trim() || Number(soTienGioiHan) <= 0) {
            Alert.alert('Thông báo', 'Vui lòng nhập tổng ngân sách hợp lệ');
            return;
        }
        setLoading(true);
        try {
            await nganSachAPI.create({
                thang,
                nam,
                soTienGioiHan: Number(soTienGioiHan),
                chiTiet: chiTiet
                    .filter(c => c.soTienDuKien && Number(c.soTienDuKien) > 0)
                    .map(c => ({
                        maDanhMuc: c.maDanhMuc,
                        soTienDuKien: Number(c.soTienDuKien),
                        ghiChu: c.ghiChu,
                    })),
            });
            Alert.alert('Thành công', `Tạo ngân sách tháng ${thang}/${nam} thành công!`, [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message);
        }
        setLoading(false);
    }

    const fmt = (n: string) => n ? Number(n).toLocaleString('vi-VN') + 'đ' : '';

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
                    <Text style={s.headerTitle}>Tạo ngân sách</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={s.monthBadge}>
                    <Ionicons name="calendar" size={18} color="#fff" />
                    <Text style={s.monthText}>Tháng {thang}/{nam}</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
                    {/* Tổng ngân sách */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>💰 Tổng ngân sách tháng</Text>
                        <View style={s.moneyInputWrap}>
                            <TextInput
                                style={s.moneyInput}
                                placeholder="0"
                                placeholderTextColor={Colors.textMuted}
                                keyboardType="numeric"
                                value={soTienGioiHan}
                                onChangeText={t => setSoTienGioiHan(t.replace(/[^0-9]/g, ''))}
                            />
                            <Text style={s.moneySuffix}>đ</Text>
                        </View>
                        {soTienGioiHan ? <Text style={s.moneyDisplay}>{fmt(soTienGioiHan)}</Text> : null}
                    </View>

                    {/* Phân bổ theo danh mục */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>📊 Phân bổ theo danh mục (tùy chọn)</Text>
                        <Text style={s.cardSubtitle}>Chọn danh mục và nhập ngân sách dự kiến</Text>

                        {categories.map(dm => {
                            const selected = chiTiet.find(c => c.maDanhMuc === dm.maDanhMuc);
                            return (
                                <View key={dm.maDanhMuc}>
                                    <TouchableOpacity
                                        style={[s.catRow, selected && s.catRowActive]}
                                        onPress={() => toggleCategory(dm)}
                                    >
                                        <Ionicons
                                            name={selected ? 'checkbox' : 'square-outline'}
                                            size={22}
                                            color={selected ? Colors.primary : Colors.textMuted}
                                        />
                                        <Text style={s.catName}>{dm.tenDanhMuc}</Text>
                                    </TouchableOpacity>

                                    {selected && (
                                        <View style={s.catInput}>
                                            <TextInput
                                                style={s.catInputField}
                                                placeholder="Ngân sách dự kiến"
                                                placeholderTextColor={Colors.textMuted}
                                                keyboardType="numeric"
                                                value={selected.soTienDuKien}
                                                onChangeText={v => updateChiTiet(dm.maDanhMuc, 'soTienDuKien', v.replace(/[^0-9]/g, ''))}
                                            />
                                            <Text style={s.catInputSuffix}>đ</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Nút lưu */}
                    <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={[s.saveBtn, loading && { opacity: 0.7 }]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                                    <Text style={s.saveBtnText}>Tạo ngân sách</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    monthBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'center' },
    monthText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    form: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
    cardSubtitle: { fontSize: 12, color: Colors.textMuted, marginBottom: 16 },
    moneyInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg, borderWidth: 2, borderColor: Colors.inputBorder, borderRadius: 14, paddingHorizontal: 16, height: 56, marginTop: 12 },
    moneyInput: { flex: 1, fontSize: 24, fontWeight: '800', color: Colors.textDark },
    moneySuffix: { fontSize: 18, fontWeight: '600', color: Colors.textMuted },
    moneyDisplay: { fontSize: 13, color: Colors.primary, marginTop: 8, fontWeight: '600' },
    catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
    catRowActive: { borderBottomColor: Colors.primary },
    catName: { fontSize: 14, fontWeight: '500', color: Colors.textDark },
    catInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg, borderRadius: 12, paddingHorizontal: 14, height: 44, marginBottom: 8, marginLeft: 32 },
    catInputField: { flex: 1, fontSize: 15, color: Colors.textDark },
    catInputSuffix: { fontSize: 14, color: Colors.textMuted },
    saveBtn: { height: 54, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8, elevation: 8 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});