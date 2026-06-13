import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { viAPI } from '../src/api/axiosClient';
import Colors from '../src/theme/colors';

type Vi = {
    maVi: number;
    tenVi: string;
    loaiVi: string;
    loaiViLabel: string;
    soDu: number;
    moTa: string;
};

function getWalletIcon(loaiVi: string) {
    switch (loaiVi) {
        case 'TIEN_MAT': return '💵';
        case 'NGAN_HANG': return '🏦';
        case 'VI_DIEN_TU': return '📱';
        default: return '💰';
    }
}

function getWalletColor(loaiVi: string) {
    switch (loaiVi) {
        case 'TIEN_MAT': return ['#10b981', '#059669'];
        case 'NGAN_HANG': return ['#3b82f6', '#2563eb'];
        case 'VI_DIEN_TU': return ['#8b5cf6', '#7c3aed'];
        default: return [Colors.primary, Colors.secondary];
    }
}

export default function WalletsScreen() {
    const router = useRouter();
    const [wallets, setWallets] = useState<Vi[]>([]);
    const [tongSoDu, setTongSoDu] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    async function loadData() {
        try {
            const [wRes, tRes] = await Promise.all([
                viAPI.getAll(),
                viAPI.tongSoDu(),
            ]);
            setWallets(wRes.data);
            setTongSoDu(tRes.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    function handleDelete(item: Vi) {
        Alert.alert('Xác nhận', `Xóa ví "${item.tenVi}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await viAPI.delete(item.maVi);
                        setWallets(prev => prev.filter(w => w.maVi !== item.maVi));
                    } catch (err: any) {
                        Alert.alert('Lỗi', err.message);
                    }
                },
            },
        ]);
    }

    const fmt = (n: number) => Math.abs(n).toLocaleString('vi-VN') + 'đ';

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
                        <Text style={s.headerTitle}>Nguồn tiền</Text>
                        <TouchableOpacity style={s.addBtnHeader} onPress={() => router.push('/add-wallet' as any)}>
                            <Ionicons name="add" size={26} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Tổng số dư */}
                    <View style={s.totalCard}>
                        <Text style={s.totalLabel}>Tổng số dư</Text>
                        <Text style={s.totalAmount}>{fmt(tongSoDu)}</Text>
                        <Text style={s.totalSub}>{wallets.length} nguồn tiền</Text>
                    </View>
                </LinearGradient>

                {/* Nút chuyển tiền */}
                {wallets.length >= 2 && (
                    <TouchableOpacity
                        style={s.transferBtnWrap}
                        onPress={() => router.push('/transfer' as any)}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#8b5cf6', '#6366f1']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={s.transferBtn}
                        >
                            <Ionicons name="swap-horizontal" size={22} color="#fff" />
                            <Text style={s.transferBtnText}>Chuyển tiền giữa các ví</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Danh sách ví */}
                <View style={s.section}>
                    {wallets.length === 0 ? (
                        <View style={s.emptyWrap}>
                            <Text style={{ fontSize: 48 }}>💳</Text>
                            <Text style={s.emptyTitle}>Chưa có ví nào</Text>
                            <Text style={s.emptySubtext}>Tạo ví để quản lý nguồn tiền</Text>
                        </View>
                    ) : (
                        wallets.map((w) => (
                            <TouchableOpacity
                                key={w.maVi}
                                style={s.walletCard}
                                onPress={() => router.push(`/edit-wallet?id=${w.maVi}` as any)}
                                onLongPress={() => handleDelete(w)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={getWalletColor(w.loaiVi) as [string, string]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={s.walletGradient}
                                >
                                    <View style={s.walletTop}>
                                        <View style={s.walletIconWrap}>
                                            <Text style={{ fontSize: 28 }}>{getWalletIcon(w.loaiVi)}</Text>
                                        </View>
                                        <View style={s.walletTypeBadge}>
                                            <Text style={s.walletTypeText}>{w.loaiViLabel}</Text>
                                        </View>
                                    </View>

                                    <Text style={s.walletName}>{w.tenVi}</Text>
                                    {w.moTa ? <Text style={s.walletDesc}>{w.moTa}</Text> : null}

                                    <View style={s.walletBottom}>
                                        <Text style={s.walletBalanceLabel}>Số dư</Text>
                                        <Text style={s.walletBalance}>{fmt(w.soDu)}</Text>
                                    </View>

                                    {/* Trang trí */}
                                    <View style={s.walletCircle1} />
                                    <View style={s.walletCircle2} />
                                </LinearGradient>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Gợi ý */}
                <View style={s.tipCard}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                    <Text style={s.tipText}>
                        Nhấn vào ví để sửa • Giữ lâu để xóa • Mỗi giao dịch có thể gắn với 1 ví
                    </Text>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    addBtnHeader: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    totalCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, padding: 20, alignItems: 'center' },
    totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
    totalAmount: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -1 },
    totalSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    transferBtnWrap: { marginHorizontal: 20, marginTop: 20 },
    transferBtn: { height: 50, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 6 },
    transferBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    section: { paddingHorizontal: 20, marginTop: 20 },
    walletCard: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
    walletGradient: { padding: 20, position: 'relative', overflow: 'hidden' },
    walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    walletIconWrap: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    walletTypeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    walletTypeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
    walletName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
    walletDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
    walletBottom: { marginTop: 8 },
    walletBalanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    walletBalance: { fontSize: 24, fontWeight: '800', color: '#fff' },
    walletCircle1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', top: -30, right: -20 },
    walletCircle2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: -10 },
    emptyWrap: { alignItems: 'center', marginTop: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textDark, marginTop: 16 },
    emptySubtext: { fontSize: 13, color: Colors.textMuted, marginTop: 8 },
    tipCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: '#f0f7ff' },
    tipText: { flex: 1, fontSize: 12, color: Colors.textMedium, lineHeight: 18 },
});