import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { thongKeAPI } from '../../src/api/axiosClient';
import Colors from '../../src/theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

type TongQuan = {
    thang: number;
    nam: number;
    tongThu: number;
    tongChi: number;
    soDu: number;
    soGiaoDich: number;
    phanTramThuThayDoi: number;
    phanTramChiThayDoi: number;
};

type DanhMucTK = {
    maDanhMuc: number;
    tenDanhMuc: string;
    loaiDanhMuc: string;
    tongTien: number;
    phanTram: number;
    soGiaoDich: number;
};

type XuHuong = {
    thang: number;
    nam: number;
    label: string;
    tongThu: number;
    tongChi: number;
};

type TheoNgay = {
    ngay: string;
    tongThu: number;
    tongChi: number;
};

const emojiMap: Record<string, string> = {
    'Ăn uống': '🍜',
    'Tiền trọ': '🏠',
    'Học phí': '🎓',
    'Tài liệu': '📚',
    'Di chuyển': '🏍️',
    'Giải trí': '🎮',
    'Tiền điện': '⚡',
    'Tiền nước': '💧',
    'Mua sắm': '🛒',
    'Sức khỏe': '💊',
    'Lương làm thêm': '💼',
    'Gia đình gửi': '🏦',
    'Học bổng': '🏆',
    'Thưởng': '🎁',
    'Thu nhập khác': '💰',
    'Tiền lương': '💼',
    'Lương thực tập': '💼',
    'Tiền tiêu vặt': '🍭',
    'Tiền đi chơi': '🎯',
};

const catColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e', '#0ea5e9'];

function getEmoji(name: string): string {
    return emojiMap[name] || '💸';
}

export default function StatsScreen() {
    const now = new Date();
    const [thang, setThang] = useState(now.getMonth() + 1);
    const [nam] = useState(now.getFullYear());
    const [tongQuan, setTongQuan] = useState<TongQuan | null>(null);
    const [danhMucChi, setDanhMucChi] = useState<DanhMucTK[]>([]);
    const [danhMucThu, setDanhMucThu] = useState<DanhMucTK[]>([]);
    const [xuHuong, setXuHuong] = useState<XuHuong[]>([]);
    const [theoNgay, setTheoNgay] = useState<TheoNgay[]>([]);
    const [tabLoai, setTabLoai] = useState<'CHI' | 'THU'>('CHI');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [thang])
    );

    async function loadData() {
        try {
            const [tqRes, chiRes, thuRes, xhRes, ngayRes] = await Promise.all([
                thongKeAPI.tongQuan(thang, nam),
                thongKeAPI.theoDanhMuc('CHI', thang, nam),
                thongKeAPI.theoDanhMuc('THU', thang, nam),
                thongKeAPI.xuHuong(thang, nam),
                thongKeAPI.theoNgay(thang, nam),
            ]);
            setTongQuan(tqRes.data);
            setDanhMucChi(chiRes.data);
            setDanhMucThu(thuRes.data);
            setXuHuong(xhRes.data);
            setTheoNgay(ngayRes.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const fmt = (n: number) => Math.abs(n).toLocaleString('vi-VN') + 'đ';
    const currentDanhMuc = tabLoai === 'CHI' ? danhMucChi : danhMucThu;

    // Tìm giá trị max cho biểu đồ xu hướng
    const maxXuHuong = Math.max(...xuHuong.map(x => Math.max(x.tongThu, x.tongChi)), 1);

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
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); loadData(); }}
                        colors={[Colors.primary]}
                    />
                }
            >
                {/* ===== HEADER ===== */}
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.header}
                >
                    <Text style={s.headerTitle}>Báo cáo tài chính</Text>

                    {/* Month selector */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.monthScroll}>
                        <View style={s.monthTabs}>
                            {months.map((m, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setThang(i + 1)}
                                    style={[s.monthTab, thang === i + 1 && s.monthTabActive]}
                                >
                                    <Text style={[s.monthTabText, thang === i + 1 && s.monthTabTextActive]}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Tổng quan */}
                    {tongQuan && (
                        <View style={s.overviewRow}>
                            <View style={s.overviewBox}>
                                <Text style={s.overviewLabel}>Thu nhập</Text>
                                <Text style={s.overviewValue}>+{fmt(tongQuan.tongThu)}</Text>
                                <View style={s.changeRow}>
                                    <Ionicons
                                        name={tongQuan.phanTramThuThayDoi >= 0 ? 'trending-up' : 'trending-down'}
                                        size={14}
                                        color={tongQuan.phanTramThuThayDoi >= 0 ? '#a7f3d0' : '#fecaca'}
                                    />
                                    <Text style={[s.changeText, { color: tongQuan.phanTramThuThayDoi >= 0 ? '#a7f3d0' : '#fecaca' }]}>
                                        {tongQuan.phanTramThuThayDoi >= 0 ? '+' : ''}{tongQuan.phanTramThuThayDoi}%
                                    </Text>
                                </View>
                            </View>
                            <View style={[s.overviewBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)' }]}>
                                <Text style={s.overviewLabel}>Chi tiêu</Text>
                                <Text style={s.overviewValue}>-{fmt(tongQuan.tongChi)}</Text>
                                <View style={s.changeRow}>
                                    <Ionicons
                                        name={tongQuan.phanTramChiThayDoi <= 0 ? 'trending-down' : 'trending-up'}
                                        size={14}
                                        color={tongQuan.phanTramChiThayDoi <= 0 ? '#a7f3d0' : '#fecaca'}
                                    />
                                    <Text style={[s.changeText, { color: tongQuan.phanTramChiThayDoi <= 0 ? '#a7f3d0' : '#fecaca' }]}>
                                        {tongQuan.phanTramChiThayDoi >= 0 ? '+' : ''}{tongQuan.phanTramChiThayDoi}%
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Số dư + số giao dịch */}
                    {tongQuan && (
                        <View style={s.balanceRow}>
                            <View style={s.balanceBox}>
                                <Text style={s.balanceLabel}>Số dư tháng</Text>
                                <Text style={[s.balanceValue, { color: tongQuan.soDu >= 0 ? '#a7f3d0' : '#fecaca' }]}>
                                    {tongQuan.soDu >= 0 ? '+' : '-'}{fmt(tongQuan.soDu)}
                                </Text>
                            </View>
                            <View style={s.balanceBox}>
                                <Text style={s.balanceLabel}>Giao dịch</Text>
                                <Text style={s.balanceValue}>{tongQuan.soGiaoDich}</Text>
                            </View>
                        </View>
                    )}
                </LinearGradient>

                {/* ===== XU HƯỚNG 6 THÁNG ===== */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Xu hướng 6 tháng</Text>
                    <View style={s.chartCard}>
                        <View style={s.chartLegend}>
                            <View style={s.legendItem}>
                                <View style={[s.legendDot, { backgroundColor: Colors.income }]} />
                                <Text style={s.legendText}>Thu nhập</Text>
                            </View>
                            <View style={s.legendItem}>
                                <View style={[s.legendDot, { backgroundColor: Colors.expense }]} />
                                <Text style={s.legendText}>Chi tiêu</Text>
                            </View>
                        </View>

                        <View style={s.barChart}>
                            {xuHuong.map((item, i) => {
                                const thuHeight = maxXuHuong > 0 ? (item.tongThu / maxXuHuong) * 100 : 0;
                                const chiHeight = maxXuHuong > 0 ? (item.tongChi / maxXuHuong) * 100 : 0;
                                return (
                                    <View key={i} style={s.barGroup}>
                                        <View style={s.barPair}>
                                            <View style={[s.bar, { height: Math.max(thuHeight, 4), backgroundColor: Colors.income }]} />
                                            <View style={[s.bar, { height: Math.max(chiHeight, 4), backgroundColor: Colors.expense }]} />
                                        </View>
                                        <Text style={s.barLabel}>{item.label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* ===== DANH MỤC ===== */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Chi tiết theo danh mục</Text>

                    {/* Tab CHI / THU */}
                    <View style={s.tabRow}>
                        <TouchableOpacity
                            style={[s.tab, tabLoai === 'CHI' && s.tabActiveChi]}
                            onPress={() => setTabLoai('CHI')}
                        >
                            <Text style={[s.tabText, tabLoai === 'CHI' && { color: Colors.expense }]}>
                                💸 Chi tiêu ({danhMucChi.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.tab, tabLoai === 'THU' && s.tabActiveThu]}
                            onPress={() => setTabLoai('THU')}
                        >
                            <Text style={[s.tabText, tabLoai === 'THU' && { color: Colors.income }]}>
                                💰 Thu nhập ({danhMucThu.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Biểu đồ tròn đơn giản */}
                    {currentDanhMuc.length > 0 && (
                        <View style={s.pieCard}>
                            <View style={s.pieChart}>
                                {currentDanhMuc.map((item, i) => (
                                    <View key={i} style={s.pieRow}>
                                        <View style={[s.pieDot, { backgroundColor: catColors[i % catColors.length] }]} />
                                        <Text style={s.pieName}>{item.tenDanhMuc}</Text>
                                        <Text style={s.piePercent}>{item.phanTram}%</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Thanh progress tổng hợp */}
                            <View style={s.pieBar}>
                                {currentDanhMuc.map((item, i) => (
                                    <View
                                        key={i}
                                        style={{
                                            width: `${item.phanTram}%`,
                                            height: '100%',
                                            backgroundColor: catColors[i % catColors.length],
                                        }}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Danh sách danh mục */}
                    {currentDanhMuc.length === 0 ? (
                        <View style={s.emptyWrap}>
                            <Text style={{ fontSize: 40 }}>📊</Text>
                            <Text style={s.emptyText}>Chưa có dữ liệu</Text>
                        </View>
                    ) : (
                        currentDanhMuc.map((item, i) => (
                            <View key={item.maDanhMuc} style={s.catCard}>
                                <View style={s.catHeader}>
                                    <View style={s.catLeft}>
                                        <View style={[s.catIcon, { backgroundColor: tabLoai === 'CHI' ? Colors.expenseBg : Colors.incomeBg }]}>
                                            <Text style={{ fontSize: 22 }}>{getEmoji(item.tenDanhMuc)}</Text>
                                        </View>
                                        <View>
                                            <Text style={s.catName}>{item.tenDanhMuc}</Text>
                                            <Text style={s.catCount}>{item.soGiaoDich} giao dịch</Text>
                                        </View>
                                    </View>
                                    <View style={s.catRight}>
                                        <Text style={[s.catAmount, { color: tabLoai === 'CHI' ? Colors.expense : Colors.income }]}>
                                            {tabLoai === 'CHI' ? '-' : '+'}{fmt(item.tongTien)}
                                        </Text>
                                        <Text style={s.catPercent}>{item.phanTram}%</Text>
                                    </View>
                                </View>
                                <View style={s.progressBg}>
                                    <View
                                        style={[
                                            s.progressFill,
                                            {
                                                width: `${item.phanTram}%`,
                                                backgroundColor: catColors[i % catColors.length],
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* ===== CHI TIÊU THEO NGÀY ===== */}
                {theoNgay.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Chi tiêu theo ngày</Text>
                        {theoNgay.map((item, i) => {
                            const date = new Date(item.ngay);
                            const dayStr = `${date.getDate()}/${date.getMonth() + 1}`;
                            return (
                                <View key={i} style={s.dayCard}>
                                    <View style={s.dayLeft}>
                                        <View style={s.dayBadge}>
                                            <Text style={s.dayBadgeText}>{date.getDate()}</Text>
                                            <Text style={s.dayBadgeMonth}>T{date.getMonth() + 1}</Text>
                                        </View>
                                        <Text style={s.dayDate}>{dayStr}</Text>
                                    </View>
                                    <View style={s.dayRight}>
                                        {item.tongThu > 0 && (
                                            <Text style={[s.dayAmount, { color: Colors.income }]}>+{fmt(item.tongThu)}</Text>
                                        )}
                                        {item.tongChi > 0 && (
                                            <Text style={[s.dayAmount, { color: Colors.expense }]}>-{fmt(item.tongChi)}</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },

    // Header
    header: {
        paddingTop: 52,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
    },
    monthScroll: { marginBottom: 16 },
    monthTabs: { flexDirection: 'row', gap: 6 },
    monthTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    monthTabActive: { backgroundColor: '#fff' },
    monthTabText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
    monthTabTextActive: { color: Colors.primary, fontWeight: '700' },

    // Overview
    overviewRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    overviewBox: { flex: 1, alignItems: 'center' },
    overviewLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    overviewValue: { fontSize: 17, fontWeight: '700', color: '#fff' },
    changeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
    changeText: { fontSize: 11, fontWeight: '600' },

    // Balance
    balanceRow: {
        flexDirection: 'row',
        gap: 12,
    },
    balanceBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
    },
    balanceLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    balanceValue: { fontSize: 16, fontWeight: '700', color: '#fff' },

    // Section
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark, marginBottom: 14 },

    // Chart card
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    chartLegend: { flexDirection: 'row', gap: 20, marginBottom: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: Colors.textMuted },

    // Bar chart
    barChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barGroup: { flex: 1, alignItems: 'center' },
    barPair: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 3,
        height: 100,
    },
    bar: { width: 14, borderRadius: 4, minHeight: 4 },
    barLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },

    // Tab
    tabRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.inputBorder,
    },
    tabActiveChi: { borderColor: Colors.expense, backgroundColor: Colors.expenseBg },
    tabActiveThu: { borderColor: Colors.income, backgroundColor: Colors.incomeBg },
    tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMedium },

    // Pie chart
    pieCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    pieChart: { gap: 8, marginBottom: 14 },
    pieRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pieDot: { width: 12, height: 12, borderRadius: 6 },
    pieName: { flex: 1, fontSize: 13, color: Colors.textMedium },
    piePercent: { fontSize: 13, fontWeight: '700', color: Colors.textDark },
    pieBar: {
        flexDirection: 'row',
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: Colors.divider,
    },

    // Category card
    catCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    catHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    catLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    catIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    catName: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
    catCount: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    catRight: { alignItems: 'flex-end' },
    catAmount: { fontSize: 15, fontWeight: '700' },
    catPercent: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    progressBg: {
        height: 8,
        backgroundColor: Colors.divider,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 4 },

    // Day card
    dayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    dayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dayBadge: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: Colors.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayBadgeText: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
    dayBadgeMonth: { fontSize: 10, color: Colors.textMuted },
    dayDate: { fontSize: 14, fontWeight: '500', color: Colors.textMedium },
    dayRight: { alignItems: 'flex-end', gap: 2 },
    dayAmount: { fontSize: 14, fontWeight: '700' },

    // Empty
    emptyWrap: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
    emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 12 },
});