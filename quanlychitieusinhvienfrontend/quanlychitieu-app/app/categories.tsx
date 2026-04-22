import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { danhMucAPI } from '../src/api/axiosClient';
import Colors from '../src/theme/colors';

type DanhMuc = {
    maDanhMuc: number;
    tenDanhMuc: string;
    loaiDanhMuc: string;
    moTa: string;
    system: boolean;
};

// Map tên danh mục -> emoji
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
};

function getEmoji(name: string, loai: string): string {
    if (emojiMap[name]) return emojiMap[name];
    return loai === 'THU' ? '💰' : '💸';
}

export default function CategoriesScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState<DanhMuc[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'THU' | 'CHI'>('ALL');
    const [searchText, setSearchText] = useState('');

    // Load lại khi quay về màn hình
    useFocusEffect(
        useCallback(() => {
            loadCategories();
        }, [])
    );

    async function loadCategories() {
        try {
            const res = await danhMucAPI.getAll();
            setCategories(res.data);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    async function handleDelete(item: DanhMuc) {
        if (item.system) {
            Alert.alert('Thông báo', 'Không thể xóa danh mục mặc định');
            return;
        }
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa danh mục "${item.tenDanhMuc}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await danhMucAPI.delete(item.maDanhMuc);
                            setCategories((prev) =>
                                prev.filter((c) => c.maDanhMuc !== item.maDanhMuc)
                            );
                        } catch (err: any) {
                            Alert.alert('Lỗi', err.message);
                        }
                    },
                },
            ]
        );
    }

    // Lọc danh mục
    const filtered = categories.filter((c) => {
        const matchFilter = filter === 'ALL' || c.loaiDanhMuc === filter;
        const matchSearch =
            searchText === '' ||
            c.tenDanhMuc.toLowerCase().includes(searchText.toLowerCase());
        return matchFilter && matchSearch;
    });

    const chiCount = categories.filter((c) => c.loaiDanhMuc === 'CHI').length;
    const thuCount = categories.filter((c) => c.loaiDanhMuc === 'THU').length;

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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.header}
            >
                <View style={s.headerRow}>
                    <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Danh mục chi tiêu</Text>
                    <TouchableOpacity
                        style={s.addBtnHeader}
                        onPress={() => router.push('/add-category' as any)}
                    >
                        <Ionicons name="add" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Thống kê */}
                <View style={s.statsRow}>
                    <View style={s.statBox}>
                        <Text style={s.statValue}>{chiCount}</Text>
                        <Text style={s.statLabel}>Chi tiêu</Text>
                    </View>
                    <View style={[s.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={s.statValue}>{thuCount}</Text>
                        <Text style={s.statLabel}>Thu nhập</Text>
                    </View>
                    <View style={[s.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={s.statValue}>{categories.length}</Text>
                        <Text style={s.statLabel}>Tổng cộng</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Tìm kiếm */}
            <View style={s.searchWrap}>
                <View style={s.searchBox}>
                    <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Tìm kiếm danh mục..."
                        placeholderTextColor={Colors.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText !== '' && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter tabs */}
            <View style={s.filterRow}>
                {(['ALL', 'CHI', 'THU'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[s.filterTab, filter === f && s.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text
                            style={[
                                s.filterTabText,
                                filter === f && s.filterTabTextActive,
                            ]}
                        >
                            {f === 'ALL' ? 'Tất cả' : f === 'CHI' ? '💸 Chi tiêu' : '💰 Thu nhập'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Danh sách */}
            <ScrollView
                contentContainerStyle={s.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            loadCategories();
                        }}
                        colors={[Colors.primary]}
                    />
                }
            >
                {filtered.length === 0 ? (
                    <View style={s.emptyWrap}>
                        <Text style={{ fontSize: 48 }}>📂</Text>
                        <Text style={s.emptyText}>Không tìm thấy danh mục</Text>
                    </View>
                ) : (
                    filtered.map((item) => (
                        <TouchableOpacity
                            key={item.maDanhMuc}
                            style={s.card}
                            onPress={() => {
                                if (!item.system) {
                                    router.push(`/edit-category?id=${item.maDanhMuc}` as any);
                                }
                            }}
                            activeOpacity={item.system ? 1 : 0.7}
                        >
                            <View
                                style={[
                                    s.cardIcon,
                                    {
                                        backgroundColor:
                                            item.loaiDanhMuc === 'THU'
                                                ? Colors.incomeBg
                                                : Colors.expenseBg,
                                    },
                                ]}
                            >
                                <Text style={{ fontSize: 24 }}>
                                    {getEmoji(item.tenDanhMuc, item.loaiDanhMuc)}
                                </Text>
                            </View>

                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={s.cardName}>{item.tenDanhMuc}</Text>
                                    {item.system && (
                                        <View style={s.systemBadge}>
                                            <Text style={s.systemBadgeText}>Mặc định</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={s.cardDesc} numberOfLines={1}>
                                    {item.moTa || 'Không có mô tả'}
                                </Text>
                            </View>

                            <View style={s.cardRight}>
                                <View
                                    style={[
                                        s.loaiBadge,
                                        {
                                            backgroundColor:
                                                item.loaiDanhMuc === 'THU'
                                                    ? Colors.incomeBg
                                                    : Colors.expenseBg,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            s.loaiBadgeText,
                                            {
                                                color:
                                                    item.loaiDanhMuc === 'THU'
                                                        ? Colors.income
                                                        : Colors.expense,
                                            },
                                        ]}
                                    >
                                        {item.loaiDanhMuc}
                                    </Text>
                                </View>

                                {!item.system && (
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item)}
                                        style={s.deleteBtn}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={Colors.expense} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
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
    addBtnHeader: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 14,
    },
    statBox: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    searchWrap: { paddingHorizontal: 20, marginTop: 16 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    searchInput: { flex: 1, fontSize: 14, color: Colors.textDark },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        marginTop: 14,
        marginBottom: 6,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    filterTabActive: {
        backgroundColor: Colors.primary,
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMedium,
    },
    filterTabTextActive: {
        color: '#fff',
    },
    list: { padding: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardName: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
    cardDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
    cardRight: { alignItems: 'flex-end', gap: 8 },
    loaiBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    loaiBadgeText: { fontSize: 11, fontWeight: '700' },
    systemBadge: {
        backgroundColor: '#f0f7ff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    systemBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.primary },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: Colors.expenseBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyWrap: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textMuted,
        marginTop: 12,
    },
});