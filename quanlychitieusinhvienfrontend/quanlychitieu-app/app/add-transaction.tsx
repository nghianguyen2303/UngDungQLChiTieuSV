import React, { useState, useEffect } from 'react';
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
    Modal,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { giaoDichAPI, danhMucAPI } from '../src/api/axiosClient';
import Colors from '../src/theme/colors';

type DanhMuc = {
    maDanhMuc: number;
    tenDanhMuc: string;
    loaiDanhMuc: string;
    moTa: string;
};

export default function AddTransactionScreen() {
    const router = useRouter();
    const [loai, setLoai] = useState<'CHI' | 'THU'>('CHI');
    const [soTien, setSoTien] = useState('');
    const [ghiChu, setGhiChu] = useState('');
    const [ngay, setNgay] = useState(formatDate(new Date()));
    const [selectedDM, setSelectedDM] = useState<DanhMuc | null>(null);
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, [loai]);

    async function loadCategories() {
        try {
            const res = await danhMucAPI.getByLoai(loai);
            setCategories(res.data);
            setSelectedDM(null);
        } catch (err: any) {
            console.log(err.message);
        }
    }

    function formatDate(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    async function handleSave() {
        if (!soTien.trim() || Number(soTien) <= 0) {
            Alert.alert('Thông báo', 'Vui lòng nhập số tiền hợp lệ');
            return;
        }
        setLoading(true);
        try {
            await giaoDichAPI.create({
                soTien: Number(soTien),
                loaiGiaoDich: loai,
                ngayGiaoDich: ngay + ' 00:00:00',
                ghiChu: ghiChu.trim(),
                maDanhMuc: selectedDM?.maDanhMuc,
            });
            Alert.alert('Thành công', 'Thêm giao dịch thành công!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message);
        }
        setLoading(false);
    }

    function formatMoneyInput(text: string): string {
        const num = text.replace(/[^0-9]/g, '');
        return num;
    }

    function displayMoney(text: string): string {
        if (!text) return '';
        return Number(text).toLocaleString('vi-VN');
    }

    return (
        <View style={s.container}>
            {/* Header */}
            <LinearGradient
                colors={loai === 'CHI' ? ['#ef4444', '#f97316'] : ['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.header}
            >
                <View style={s.headerRow}>
                    <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Thêm giao dịch</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Toggle THU/CHI */}
                <View style={s.toggleRow}>
                    <TouchableOpacity
                        style={[s.toggleBtn, loai === 'CHI' && s.toggleBtnActive]}
                        onPress={() => setLoai('CHI')}
                    >
                        <Text style={{ fontSize: 18 }}>💸</Text>
                        <Text style={[s.toggleText, loai === 'CHI' && s.toggleTextActive]}>Chi tiêu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.toggleBtn, loai === 'THU' && s.toggleBtnActive]}
                        onPress={() => setLoai('THU')}
                    >
                        <Text style={{ fontSize: 18 }}>💰</Text>
                        <Text style={[s.toggleText, loai === 'THU' && s.toggleTextActive]}>Thu nhập</Text>
                    </TouchableOpacity>
                </View>

                {/* Số tiền */}
                <View style={s.moneyWrap}>
                    <Text style={s.moneyLabel}>Số tiền</Text>
                    <View style={s.moneyRow}>
                        <TextInput
                            style={s.moneyInput}
                            placeholder="0"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            keyboardType="numeric"
                            value={soTien}
                            onChangeText={(t) => setSoTien(formatMoneyInput(t))}
                        />
                        <Text style={s.moneyCurrency}>đ</Text>
                    </View>
                    {soTien ? (
                        <Text style={s.moneyDisplay}>{displayMoney(soTien)} VNĐ</Text>
                    ) : null}
                </View>
            </LinearGradient>

            {/* Form */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
                    <View style={s.card}>
                        {/* Danh mục */}
                        <Text style={s.label}>Danh mục</Text>
                        <TouchableOpacity style={s.selectWrap} onPress={() => setShowPicker(true)}>
                            <Ionicons name="pricetag-outline" size={20} color={Colors.textMuted} />
                            <Text style={[s.selectText, !selectedDM && { color: Colors.textMuted }]}>
                                {selectedDM ? selectedDM.tenDanhMuc : 'Chọn danh mục'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>

                        {/* Ngày */}
                        <Text style={s.label}>Ngày giao dịch</Text>
                        <View style={s.inputWrap}>
                            <Ionicons name="calendar-outline" size={20} color={Colors.textMuted} />
                            <TextInput
                                style={s.input}
                                placeholder="yyyy-MM-dd"
                                placeholderTextColor={Colors.textMuted}
                                value={ngay}
                                onChangeText={setNgay}
                            />
                        </View>

                        {/* Ghi chú */}
                        <Text style={s.label}>Ghi chú (tùy chọn)</Text>
                        <View style={[s.inputWrap, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                            <Ionicons name="document-text-outline" size={20} color={Colors.textMuted} style={{ marginTop: 2 }} />
                            <TextInput
                                style={[s.input, { textAlignVertical: 'top' }]}
                                placeholder="Nhập ghi chú..."
                                placeholderTextColor={Colors.textMuted}
                                value={ghiChu}
                                onChangeText={setGhiChu}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Nút lưu */}
                        <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                            <LinearGradient
                                colors={loai === 'CHI' ? ['#ef4444', '#f97316'] : ['#10b981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[s.btn, loading && { opacity: 0.7 }]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={22} color="#fff" />
                                        <Text style={s.btnText}>Thêm giao dịch</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal chọn danh mục */}
            <Modal visible={showPicker} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Chọn danh mục</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Ionicons name="close" size={24} color={Colors.textDark} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => String(item.maDanhMuc)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        s.modalItem,
                                        selectedDM?.maDanhMuc === item.maDanhMuc && s.modalItemActive,
                                    ]}
                                    onPress={() => {
                                        setSelectedDM(item);
                                        setShowPicker(false);
                                    }}
                                >
                                    <Text style={s.modalItemText}>{item.tenDanhMuc}</Text>
                                    {selectedDM?.maDanhMuc === item.maDanhMuc && (
                                        <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={s.modalEmpty}>Không có danh mục nào</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },
    header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 },
    headerRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    toggleRow: {
        flexDirection: 'row', gap: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14, padding: 4, marginBottom: 20,
    },
    toggleBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 11,
    },
    toggleBtnActive: { backgroundColor: '#fff' },
    toggleText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
    toggleTextActive: { color: '#333' },
    moneyWrap: { alignItems: 'center' },
    moneyLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
    moneyRow: { flexDirection: 'row', alignItems: 'baseline' },
    moneyInput: {
        fontSize: 40, fontWeight: '800', color: '#fff',
        minWidth: 80, textAlign: 'center',
    },
    moneyCurrency: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginLeft: 4 },
    moneyDisplay: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    form: { padding: 20 },
    card: {
        backgroundColor: '#fff', borderRadius: 20, padding: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, shadowRadius: 10, elevation: 4,
    },
    label: {
        fontSize: 13, fontWeight: '600', color: Colors.textMedium,
        marginBottom: 8, marginLeft: 2, marginTop: 4,
    },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.inputBg, borderWidth: 2,
        borderColor: Colors.inputBorder, borderRadius: 14,
        paddingHorizontal: 14, height: 52, marginBottom: 18,
    },
    input: { flex: 1, fontSize: 15, color: Colors.textDark },
    selectWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.inputBg, borderWidth: 2,
        borderColor: Colors.inputBorder, borderRadius: 14,
        paddingHorizontal: 14, height: 52, marginBottom: 18,
    },
    selectText: { flex: 1, fontSize: 15, color: Colors.textDark },
    btn: {
        height: 54, borderRadius: 16, flexDirection: 'row',
        justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 24,
        borderTopRightRadius: 24, maxHeight: '60%', padding: 20,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark },
    modalItem: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingVertical: 14,
        paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
    },
    modalItemActive: { backgroundColor: '#f0f7ff' },
    modalItemText: { fontSize: 15, fontWeight: '500', color: Colors.textDark },
    modalEmpty: {
        textAlign: 'center', color: Colors.textMuted,
        fontSize: 14, marginTop: 20,
    },
});