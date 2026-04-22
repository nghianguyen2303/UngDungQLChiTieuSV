import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { giaoDichAPI } from '../../src/api/axiosClient';
import Colors from '../../src/theme/colors';

type GiaoDich = {
    maGiaoDich: number;
    soTien: number;
    loaiGiaoDich: string;
    ngayGiaoDich: string;
    ghiChu: string;
    tenDanhMuc: string;
};

const emojiMap: Record<string, string> = {
    'Ăn uống': '🍜', 'Tiền trọ': '🏠', 'Học phí': '🎓',
    'Tài liệu': '📚', 'Di chuyển': '🏍️', 'Giải trí': '🎮',
    'Tiền điện': '⚡', 'Tiền nước': '💧', 'Mua sắm': '🛒',
    'Sức khỏe': '💊', 'Lương làm thêm': '💼', 'Gia đình gửi': '🏦',
    'Học bổng': '🏆', 'Thưởng': '🎁', 'Thu nhập khác': '💰',
};

function getEmoji(name: string, loai: string): string {
    return emojiMap[name] || (loai === 'THU' ? '💰' : '💸');
}

export default function HistoryScreen() {
    const router = useRouter();
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear] = useState(now.getFullYear());
    const [transactions, setTransactions] = useState<GiaoDich[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'THU' | 'CHI'>('ALL');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedMonth])
    );

    async function loadData() {
        setLoading(true);
        try {
            const res = await giaoDichAPI.getByThang(selectedMonth, selectedYear);
            setTransactions(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    function handleDelete(id: number) {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa giao dịch này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await giaoDichAPI.delete(id);
                        setTransactions(prev => prev.filter(t => t.maGiaoDich !== id));
                    } catch (err: any) { Alert.alert('Lỗi', err.message); }
                },
            },
        ]);
    }

    const filtered = transactions.filter(t => filter === 'ALL' || t.loaiGiaoDich === filter);
    const tongThu = transactions.filter(t => t.loaiGiaoDich === 'THU').reduce((s, t) => s + t.soTien, 0);
    const tongChi = transactions.filter(t => t.loaiGiaoDich === 'CHI').reduce((s, t) => s + t.soTien, 0);
    const fmt = (n: number) => Math.abs(n).toLocaleString('vi-VN') + 'đ';

    const formatDate = (d: string) => {
        if (!d) return '';
        const date = new Date(d);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    return (
        <View style={s.container}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.header}
            >
                <Text style={s.headerTitle}>Lịch sử giao dịch</Text>

                {/* Tổng thu/chi */}
                <View style={s.summaryRow}>
                    <View style={s.summaryBox}>
                        <Text style={s.summaryLabel}>Thu</Text>
                        <Text style={s.summaryValue}>+{fmt(tongThu)}</Text>
                    </View>
                    <View style={[s.summaryBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={s.summaryLabel}>Chi</Text>
                        <Text style={s.summaryValue}>-{fmt(tongChi)}</Text>
                    </View>
                </View>

                {/* Month tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.monthScroll}>
                    <View style={s.monthTabs}>
                        {months.map((m, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => setSelectedMonth(i + 1)}
                                style={[s.monthTab, selectedMonth === i + 1 && s.monthTabActive]}
                            >
                                <Text style={[s.monthTabText, selectedMonth === i + 1 && s.monthTabTextActive]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </LinearGradient>

            {/* Filter */}
            <View style={s.filterRow}>
                {(['ALL', 'CHI', 'THU'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[s.filterTab, filter === f && s.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[s.filterTabText, filter === f && s.filterTabTextActive]}>
                            {f === 'ALL' ? 'Tất cả' : f === 'CHI' ? '💸 Chi' : '💰 Thu'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={s.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[Colors.primary]} />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={s.emptyWrap}>
                            <Text style={{ fontSize: 40 }}>📭</Text>
                            <Text style={s.emptyText}>Không có giao dịch nào</Text>
                        </View>
                    ) : (
                        filtered.map(tx => (
                            <TouchableOpacity
                                key={tx.maGiaoDich}
                                style={s.txCard}
                                onPress={() => router.push(`/edit-transaction?id=${tx.maGiaoDich}` as any)}
                                onLongPress={() => handleDelete(tx.maGiaoDich)}
                                activeOpacity={0.7}
                            >
                                <View style={[s.txIcon, { backgroundColor: tx.loaiGiaoDich === 'THU' ? Colors.incomeBg : Colors.expenseBg }]}>
                                    <Text style={{ fontSize: 22 }}>{getEmoji(tx.tenDanhMuc, tx.loaiGiaoDich)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.txName}>{tx.tenDanhMuc || tx.ghiChu || (tx.loaiGiaoDich === 'THU' ? 'Thu nhập' : 'Chi tiêu')}</Text>
                                    <Text style={s.txDate}>{formatDate(tx.ngayGiaoDich)}{tx.ghiChu ? ' • ' + tx.ghiChu : ''}</Text>
                                </View>
                                <Text style={[s.txAmount, { color: tx.loaiGiaoDich === 'THU' ? Colors.income : Colors.expense }]}>
                                    {tx.loaiGiaoDich === 'THU' ? '+' : '-'}{fmt(tx.soTien)}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={{ height: 20 }} />
                </ScrollView>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },
    header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 16 },
    summaryRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, marginBottom: 16 },
    summaryBox: { flex: 1, alignItems: 'center' },
    summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
    summaryValue: { fontSize: 16, fontWeight: '700', color: '#fff' },
    monthScroll: { marginBottom: 4 },
    monthTabs: { flexDirection: 'row', gap: 6 },
    monthTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    monthTabActive: { backgroundColor: '#fff' },
    monthTabText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
    monthTabTextActive: { color: Colors.primary, fontWeight: '700' },
    filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 14, marginBottom: 6 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', elevation: 1 },
    filterTabActive: { backgroundColor: Colors.primary },
    filterTabText: { fontSize: 13, fontWeight: '600', color: Colors.textMedium },
    filterTabTextActive: { color: '#fff' },
    list: { padding: 20 },
    txCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    txIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    txName: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
    txDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    txAmount: { fontSize: 15, fontWeight: '700' },
    emptyWrap: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
});