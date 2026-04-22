import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { nganSachAPI } from '../src/api/axiosClient';
import Colors from '../src/theme/colors';

type ChiTiet = {
    maDanhMuc: number;
    tenDanhMuc: string;
    soTienDuKien: number;
    soTienDaChi: number;
    phanTramDaChi: number;
    trangThai: string;
};

type NganSach = {
    maNganSach: number;
    thang: number;
    nam: number;
    soTienGioiHan: number;
    tongDaChi: number;
    conLai: number;
    phanTramDaChi: number;
    trangThai: string;
    chiTiet: ChiTiet[];
};

type CanhBao = {
    loaiCanhBao: string;
    tenDanhMuc: string;
    phanTram: number;
    trangThai: string;
    noiDung: string;
};

export default function BudgetsScreen() {
    const router = useRouter();
    const now = new Date();
    const [thang, setThang] = useState(now.getMonth() + 1);
    const [nam] = useState(now.getFullYear());
    const [budget, setBudget] = useState<NganSach | null>(null);
    const [canhBao, setCanhBao] = useState<CanhBao[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [noBudget, setNoBudget] = useState(false);

    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [thang])
    );

    async function loadData() {
        setLoading(true);
        setNoBudget(false);
        try {
            const [nsRes, cbRes] = await Promise.all([
                nganSachAPI.getByThang(thang, nam).catch(() => null),
                nganSachAPI.canhBao(thang, nam).catch(() => ({ data: [] })),
            ]);
            if (nsRes && nsRes.data) {
                setBudget(nsRes.data);
                setNoBudget(false);
            } else {
                setBudget(null);
                setNoBudget(true);
            }
            setCanhBao(cbRes?.data || []);
        } catch {
            setBudget(null);
            setNoBudget(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    function handleDelete() {
        if (!budget) return;
        Alert.alert('Xác nhận', `Xóa ngân sách tháng ${thang}/${nam}?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await nganSachAPI.delete(budget.maNganSach);
                        setBudget(null);
                        setNoBudget(true);
                        setCanhBao([]);
                    } catch (err: any) {
                        Alert.alert('Lỗi', err.message);
                    }
                },
            },
        ]);
    }

    const fmt = (n: number) => Math.abs(n).toLocaleString('vi-VN') + 'đ';

    function getStatusColor(trangThai: string) {
        switch (trangThai) {
            case 'VUOT_NGAN_SACH': case 'VUOT': return Colors.expense;
            case 'CANH_BAO': return '#f97316';
            default: return Colors.income;
        }
    }

    function getStatusBg(trangThai: string) {
        switch (trangThai) {
            case 'VUOT_NGAN_SACH': case 'VUOT': return Colors.expenseBg;
            case 'CANH_BAO': return '#fff7ed';
            default: return Colors.incomeBg;
        }
    }

    function getStatusLabel(trangThai: string) {
        switch (trangThai) {
            case 'VUOT_NGAN_SACH': case 'VUOT': return 'Vượt ngân sách';
            case 'CANH_BAO': return 'Cảnh báo';
            default: return 'An toàn';
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgLight }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={s.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[Colors.primary]} />
                }
            >
                {/* Header */}
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.header}
                >
                    <View style={s.headerRow}>
                        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={26} color="#fff" />
                        </TouchableOpacity>
                        <Text style={s.headerTitle}>Ngân sách</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Month selector */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={s.monthTabs}>
                            {months.map((m, i) => (
                                <TouchableOpacity
                                    key={i} onPress={() => setThang(i + 1)}
                                    style={[s.monthTab, thang === i + 1 && s.monthTabActive]}
                                >
                                    <Text style={[s.monthTabText, thang === i + 1 && s.monthTabTextActive]}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Tổng quan */}
                    {budget && (
                        <View style={s.overviewCard}>
                            <View style={s.overviewTop}>
                                <View>
                                    <Text style={s.overviewLabel}>Giới hạn tháng {thang}</Text>
                                    <Text style={s.overviewAmount}>{fmt(budget.soTienGioiHan)}</Text>
                                </View>
                                <View style={[s.statusBadge, { backgroundColor: getStatusBg(budget.trangThai) }]}>
                                    <Text style={[s.statusText, { color: getStatusColor(budget.trangThai) }]}>
                                        {getStatusLabel(budget.trangThai)}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress bar */}
                            <View style={s.progressBg}>
                                <View style={[
                                    s.progressFill,
                                    {
                                        width: `${Math.min(budget.phanTramDaChi, 100)}%`,
                                        backgroundColor: getStatusColor(budget.trangThai),
                                    },
                                ]} />
                            </View>

                            <View style={s.overviewBottom}>
                                <Text style={s.overviewSub}>Đã chi: {fmt(budget.tongDaChi)}</Text>
                                <Text style={s.overviewSub}>Còn lại: {fmt(Math.max(budget.conLai, 0))}</Text>
                            </View>
                            <Text style={[s.overviewPercent, { color: getStatusColor(budget.trangThai) }]}>
                                {budget.phanTramDaChi}%
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Cảnh báo */}
                {canhBao.length > 0 && (
                    <View style={s.section}>
                        {canhBao.map((cb, i) => (
                            <View key={i} style={[s.alertCard, {
                                backgroundColor: cb.trangThai === 'VUOT_NGAN_SACH' ? Colors.expenseBg : '#fff7ed',
                                borderColor: cb.trangThai === 'VUOT_NGAN_SACH' ? '#fecaca' : '#fed7aa',
                            }]}>
                                <Text style={{ fontSize: 22 }}>
                                    {cb.trangThai === 'VUOT_NGAN_SACH' ? '🚨' : '⚠️'}
                                </Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.alertTitle, {
                                        color: cb.trangThai === 'VUOT_NGAN_SACH' ? Colors.expense : '#c2410c',
                                    }]}>
                                        {cb.trangThai === 'VUOT_NGAN_SACH' ? 'Vượt ngân sách!' : 'Cảnh báo'}
                                    </Text>
                                    <Text style={[s.alertText, {
                                        color: cb.trangThai === 'VUOT_NGAN_SACH' ? '#b91c1c' : '#ea580c',
                                    }]}>{cb.noiDung}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Chưa có ngân sách */}
                {noBudget && (
                    <View style={s.emptySection}>
                        <Text style={{ fontSize: 48 }}>📋</Text>
                        <Text style={s.emptyTitle}>Chưa có ngân sách</Text>
                        <Text style={s.emptySubtext}>Thiết lập ngân sách cho tháng {thang}/{nam} để kiểm soát chi tiêu</Text>
                        <TouchableOpacity
                            onPress={() => router.push(`/add-budget?thang=${thang}&nam=${nam}` as any)}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[Colors.primary, Colors.secondary]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={s.emptyBtn}
                            >
                                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                                <Text style={s.emptyBtnText}>Tạo ngân sách</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Chi tiết theo danh mục */}
                {budget && budget.chiTiet && budget.chiTiet.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Chi tiết theo danh mục</Text>
                        {budget.chiTiet.map((ct, i) => (
                            <View key={i} style={s.catCard}>
                                <View style={s.catHeader}>
                                    <View style={s.catLeft}>
                                        <View style={[s.catIcon, { backgroundColor: getStatusBg(ct.trangThai) }]}>
                                            <Ionicons name="pricetag" size={18} color={getStatusColor(ct.trangThai)} />
                                        </View>
                                        <View>
                                            <Text style={s.catName}>{ct.tenDanhMuc}</Text>
                                            <Text style={s.catSub}>
                                                {fmt(ct.soTienDaChi)} / {fmt(ct.soTienDuKien)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[s.catPercent, { color: getStatusColor(ct.trangThai) }]}>
                                            {ct.phanTramDaChi}%
                                        </Text>
                                        <View style={[s.catBadge, { backgroundColor: getStatusBg(ct.trangThai) }]}>
                                            <Text style={[s.catBadgeText, { color: getStatusColor(ct.trangThai) }]}>
                                                {getStatusLabel(ct.trangThai)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={s.catProgressBg}>
                                    <View style={[s.catProgressFill, {
                                        width: `${Math.min(ct.phanTramDaChi, 100)}%`,
                                        backgroundColor: getStatusColor(ct.trangThai),
                                    }]} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Nút sửa / xóa */}
                {budget && (
                    <View style={s.actionSection}>
                        <TouchableOpacity
                            style={s.editBtn}
                            onPress={() => router.push(`/edit-budget?id=${budget.maNganSach}` as any)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="create-outline" size={20} color={Colors.primary} />
                            <Text style={s.editBtnText}>Sửa ngân sách</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={s.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
                            <Ionicons name="trash-outline" size={20} color={Colors.expense} />
                            <Text style={s.deleteBtnText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    monthTabs: { flexDirection: 'row', gap: 6, marginBottom: 16 },
    monthTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    monthTabActive: { backgroundColor: '#fff' },
    monthTabText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
    monthTabTextActive: { color: Colors.primary, fontWeight: '700' },
    overviewCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 18 },
    overviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
    overviewLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    overviewAmount: { fontSize: 24, fontWeight: '800', color: '#fff' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700' },
    progressBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
    progressFill: { height: '100%', borderRadius: 5 },
    overviewBottom: { flexDirection: 'row', justifyContent: 'space-between' },
    overviewSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    overviewPercent: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginTop: 6 },
    // Alerts
    section: { paddingHorizontal: 20, marginTop: 20 },
    alertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
    alertTitle: { fontSize: 13, fontWeight: '600' },
    alertText: { fontSize: 12, marginTop: 2 },
    // Empty
    emptySection: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginTop: 16 },
    emptySubtext: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 24 },
    emptyBtn: { height: 50, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingHorizontal: 28, elevation: 6 },
    emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    // Category detail
    sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark, marginBottom: 14 },
    catCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    catLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    catIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    catName: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
    catSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    catPercent: { fontSize: 16, fontWeight: '800' },
    catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
    catBadgeText: { fontSize: 10, fontWeight: '700' },
    catProgressBg: { height: 8, backgroundColor: Colors.divider, borderRadius: 4, overflow: 'hidden' },
    catProgressFill: { height: '100%', borderRadius: 4 },
    // Actions
    actionSection: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 24 },
    editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.primary, borderRadius: 14, padding: 14 },
    editBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 2, borderColor: '#fecaca', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
    deleteBtnText: { fontSize: 14, fontWeight: '700', color: Colors.expense },
});