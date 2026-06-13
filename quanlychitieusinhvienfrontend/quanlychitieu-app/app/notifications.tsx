import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { thongBaoAPI } from '../src/api/axiosClient';
import Colors from '../src/theme/colors';

type ThongBao = {
    maThongBao: number;
    noiDung: string;
    loaiThongBao: string;
    loaiThongBaoLabel: string;
    ngayTao: string;
    trangThai: string;
    daDoc: boolean;
};

type Count = { tongSo: number; chuaDoc: number; daDoc: number };

function getIcon(loai: string) {
    switch (loai) {
        case 'CANH_BAO_NGAN_SACH': return { icon: '⚠️', color: '#f97316', bg: '#fff7ed' };
        case 'NHAC_CHI_TIEU': return { icon: '📝', color: Colors.primary, bg: '#f0f7ff' };
        case 'BAT_THUONG': return { icon: '🚨', color: Colors.expense, bg: Colors.expenseBg };
        case 'HE_THONG': return { icon: '🔔', color: '#8b5cf6', bg: '#f5f3ff' };
        default: return { icon: '📢', color: Colors.textMedium, bg: Colors.bgLight };
    }
}

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    if (diff < 604800) return Math.floor(diff / 86400) + ' ngày trước';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<ThongBao[]>([]);
    const [count, setCount] = useState<Count>({ tongSo: 0, chuaDoc: 0, daDoc: 0 });
    const [filter, setFilter] = useState<'ALL' | 'CHUA_DOC' | 'DA_DOC'>('ALL');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    async function loadData() {
        try {
            const [nRes, cRes] = await Promise.all([
                thongBaoAPI.getAll(),
                thongBaoAPI.count(),
            ]);
            setNotifications(nRes.data);
            setCount(cRes.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    async function handleMarkRead(id: number) {
        try {
            await thongBaoAPI.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.maThongBao === id ? { ...n, trangThai: 'DA_DOC', daDoc: true } : n)
            );
            setCount(prev => ({
                ...prev,
                chuaDoc: Math.max(prev.chuaDoc - 1, 0),
                daDoc: prev.daDoc + 1,
            }));
        } catch (err: any) {
            Alert.alert('Lỗi', err.message);
        }
    }

    async function handleMarkAllRead() {
        Alert.alert('Xác nhận', 'Đánh dấu tất cả đã đọc?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đồng ý', onPress: async () => {
                    try {
                        await thongBaoAPI.markAllAsRead();
                        loadData();
                    } catch (err: any) { Alert.alert('Lỗi', err.message); }
                },
            },
        ]);
    }

    async function handleDelete(id: number) {
        try {
            await thongBaoAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.maThongBao !== id));
        } catch (err: any) {
            Alert.alert('Lỗi', err.message);
        }
    }

    async function handleDeleteAllRead() {
        Alert.alert('Xác nhận', 'Xóa tất cả thông báo đã đọc?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive', onPress: async () => {
                    try {
                        await thongBaoAPI.deleteAllRead();
                        loadData();
                    } catch (err: any) { Alert.alert('Lỗi', err.message); }
                },
            },
        ]);
    }

    const filtered = notifications.filter(n => {
        if (filter === 'ALL') return true;
        if (filter === 'CHUA_DOC') return n.trangThai === 'CHUA_DOC';
        return n.trangThai === 'DA_DOC';
    });

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgLight }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={s.container}>
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
                    <Text style={s.headerTitle}>Thông báo</Text>
                    <TouchableOpacity style={s.backBtn} onPress={handleMarkAllRead}>
                        <Ionicons name="checkmark-done" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Thống kê */}
                <View style={s.statsRow}>
                    <View style={s.statBox}>
                        <Text style={s.statValue}>{count.chuaDoc}</Text>
                        <Text style={s.statLabel}>Chưa đọc</Text>
                    </View>
                    <View style={[s.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={s.statValue}>{count.daDoc}</Text>
                        <Text style={s.statLabel}>Đã đọc</Text>
                    </View>
                    <View style={[s.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={s.statValue}>{count.tongSo}</Text>
                        <Text style={s.statLabel}>Tổng</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Filter */}
            <View style={s.filterRow}>
                {([
                    { key: 'ALL', label: 'Tất cả' },
                    { key: 'CHUA_DOC', label: '🔵 Chưa đọc' },
                    { key: 'DA_DOC', label: '✓ Đã đọc' },
                ] as const).map(f => (
                    <TouchableOpacity
                        key={f.key}
                        style={[s.filterTab, filter === f.key && s.filterTabActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[s.filterTabText, filter === f.key && s.filterTabTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <ScrollView
                contentContainerStyle={s.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[Colors.primary]} />
                }
            >
                {filtered.length === 0 ? (
                    <View style={s.emptyWrap}>
                        <Text style={{ fontSize: 48 }}>🔔</Text>
                        <Text style={s.emptyText}>Không có thông báo</Text>
                    </View>
                ) : (
                    filtered.map(n => {
                        const style = getIcon(n.loaiThongBao);
                        return (
                            <TouchableOpacity
                                key={n.maThongBao}
                                style={[s.notiCard, !n.daDoc && s.notiCardUnread]}
                                onPress={() => { if (!n.daDoc) handleMarkRead(n.maThongBao); }}
                                onLongPress={() => handleDelete(n.maThongBao)}
                                activeOpacity={0.7}
                            >
                                <View style={[s.notiIcon, { backgroundColor: style.bg }]}>
                                    <Text style={{ fontSize: 22 }}>{style.icon}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={s.notiHeaderRow}>
                                        <Text style={[s.notiType, { color: style.color }]}>{n.loaiThongBaoLabel}</Text>
                                        {!n.daDoc && <View style={s.unreadDot} />}
                                    </View>
                                    <Text style={s.notiContent}>{n.noiDung}</Text>
                                    <Text style={s.notiTime}>{timeAgo(n.ngayTao)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                {/* Nút xóa đã đọc */}
                {count.daDoc > 0 && (
                    <TouchableOpacity style={s.clearBtn} onPress={handleDeleteAllRead}>
                        <Ionicons name="trash-outline" size={18} color={Colors.expense} />
                        <Text style={s.clearBtnText}>Xóa tất cả đã đọc</Text>
                    </TouchableOpacity>
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
    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 14 },
    statBox: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 16, marginBottom: 6 },
    filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', elevation: 1 },
    filterTabActive: { backgroundColor: Colors.primary },
    filterTabText: { fontSize: 13, fontWeight: '600', color: Colors.textMedium },
    filterTabTextActive: { color: '#fff' },
    list: { padding: 20 },
    notiCard: { flexDirection: 'row', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    notiCardUnread: { backgroundColor: '#f8faff', borderLeftWidth: 3, borderLeftColor: Colors.primary },
    notiIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    notiHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    notiType: { fontSize: 12, fontWeight: '700' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
    notiContent: { fontSize: 14, fontWeight: '500', color: Colors.textDark, lineHeight: 20, marginBottom: 6 },
    notiTime: { fontSize: 12, color: Colors.textMuted },
    emptyWrap: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
    clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, padding: 14, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#fecaca' },
    clearBtnText: { fontSize: 14, fontWeight: '600', color: Colors.expense },
});