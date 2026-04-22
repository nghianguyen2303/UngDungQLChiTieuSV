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
import { danhMucAPI } from '../src/api/axiosClient';
import Colors from '../src/theme/colors';

export default function AddCategoryScreen() {
    const router = useRouter();
    const [tenDanhMuc, setTenDanhMuc] = useState('');
    const [loaiDanhMuc, setLoaiDanhMuc] = useState<'CHI' | 'THU'>('CHI');
    const [moTa, setMoTa] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        if (!tenDanhMuc.trim()) {
            Alert.alert('Thông báo', 'Tên danh mục không được để trống');
            return;
        }
        setLoading(true);
        try {
            await danhMucAPI.create({
                tenDanhMuc: tenDanhMuc.trim(),
                loaiDanhMuc,
                moTa: moTa.trim(),
            });
            Alert.alert('Thành công', 'Thêm danh mục thành công!', [
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
                <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Thêm danh mục</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
                    <View style={s.card}>
                        {/* Loại danh mục */}
                        <Text style={s.label}>Loại danh mục</Text>
                        <View style={s.toggleRow}>
                            <TouchableOpacity
                                style={[
                                    s.toggleBtn,
                                    loaiDanhMuc === 'CHI' && s.toggleBtnActiveChi,
                                ]}
                                onPress={() => setLoaiDanhMuc('CHI')}
                            >
                                <Text style={{ fontSize: 18 }}>💸</Text>
                                <Text
                                    style={[
                                        s.toggleText,
                                        loaiDanhMuc === 'CHI' && { color: Colors.expense },
                                    ]}
                                >
                                    Chi tiêu
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    s.toggleBtn,
                                    loaiDanhMuc === 'THU' && s.toggleBtnActiveThu,
                                ]}
                                onPress={() => setLoaiDanhMuc('THU')}
                            >
                                <Text style={{ fontSize: 18 }}>💰</Text>
                                <Text
                                    style={[
                                        s.toggleText,
                                        loaiDanhMuc === 'THU' && { color: Colors.income },
                                    ]}
                                >
                                    Thu nhập
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tên danh mục */}
                        <Text style={s.label}>Tên danh mục</Text>
                        <View style={s.inputWrap}>
                            <Ionicons name="pricetag-outline" size={20} color={Colors.textMuted} />
                            <TextInput
                                style={s.input}
                                placeholder="Ví dụ: Ăn uống, Tiền trọ..."
                                placeholderTextColor={Colors.textMuted}
                                value={tenDanhMuc}
                                onChangeText={setTenDanhMuc}
                            />
                        </View>

                        {/* Mô tả */}
                        <Text style={s.label}>Mô tả (tùy chọn)</Text>
                        <View style={[s.inputWrap, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                            <Ionicons name="document-text-outline" size={20} color={Colors.textMuted} style={{ marginTop: 2 }} />
                            <TextInput
                                style={[s.input, { textAlignVertical: 'top' }]}
                                placeholder="Mô tả ngắn về danh mục..."
                                placeholderTextColor={Colors.textMuted}
                                value={moTa}
                                onChangeText={setMoTa}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Nút lưu */}
                        <TouchableOpacity onPress={handleSave} disabled={loading} activeOpacity={0.85}>
                            <LinearGradient
                                colors={[Colors.primary, Colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[s.btn, loading && { opacity: 0.7 }]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={22} color="#fff" />
                                        <Text style={s.btnText}>Thêm danh mục</Text>
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
        marginBottom: 10,
        marginLeft: 2,
        marginTop: 4,
    },
    toggleRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: Colors.inputBg,
        borderWidth: 2,
        borderColor: Colors.inputBorder,
    },
    toggleBtnActiveChi: {
        borderColor: Colors.expense,
        backgroundColor: Colors.expenseBg,
    },
    toggleBtnActiveThu: {
        borderColor: Colors.income,
        backgroundColor: Colors.incomeBg,
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textMedium,
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});