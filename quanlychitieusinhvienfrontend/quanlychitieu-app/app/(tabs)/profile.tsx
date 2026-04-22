import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Colors from '../../src/theme/colors';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    function handleLogout() {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: logout },
        ]);
    }

    const menuItems = [
        {
            icon: 'pricetags-outline' as const,
            label: 'Quản lý danh mục',
            onPress: () => router.push('/categories' as any),
        },
        {
            icon: 'create-outline' as const,
            label: 'Chỉnh sửa hồ sơ',
            onPress: () => router.push('/edit-profile' as any),
        },
        {
            icon: 'lock-closed-outline' as const,
            label: 'Đổi mật khẩu',
            onPress: () => router.push('/change-password' as any),
        },
        {
            icon: 'wallet-outline' as const,
            label: 'Quản lý ngân sách',
            onPress: () => router.push('/budgets' as any),
        },
    ];

    return (
        <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.header}
            >
                <Text style={s.headerTitle}>Cá nhân</Text>
                <View style={s.avatar}>
                    <Ionicons name="person" size={40} color="rgba(255,255,255,0.7)" />
                </View>
                <Text style={s.name}>{user?.hoTen || 'Sinh viên'}</Text>
                <Text style={s.email}>{user?.email || ''}</Text>
            </LinearGradient>

            <View style={s.content}>
                {/* Menu */}
                <View style={s.menuCard}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[
                                s.menuItem,
                                i < menuItems.length - 1 && s.menuItemBorder,
                            ]}
                            onPress={item.onPress}
                            activeOpacity={0.6}
                        >
                            <View style={s.menuIconBox}>
                                <Ionicons name={item.icon} size={20} color={Colors.primary} />
                            </View>
                            <Text style={s.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stats */}
                <View style={s.statsRow}>
                    {[
                        { label: 'Ngày sử dụng', value: '32', emoji: '📅' },
                        { label: 'Giao dịch', value: '48', emoji: '📊' },
                    ].map((st, i) => (
                        <View key={i} style={s.statCard}>
                            <Text style={{ fontSize: 28 }}>{st.emoji}</Text>
                            <Text style={s.statValue}>{st.value}</Text>
                            <Text style={s.statLabel}>{st.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Info */}
                <View style={s.infoCard}>
                    <View style={s.infoRow}>
                        <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                        <Text style={s.infoLabel}>Email</Text>
                        <Text style={s.infoValue}>{user?.email || '—'}</Text>
                    </View>
                    <View style={[s.infoRow, { borderTopWidth: 1, borderTopColor: Colors.divider }]}>
                        <Ionicons name="call-outline" size={18} color={Colors.textMuted} />
                        <Text style={s.infoLabel}>SĐT</Text>
                        <Text style={s.infoValue}>{user?.soDienThoai || 'Chưa cập nhật'}</Text>
                    </View>
                    <View style={[s.infoRow, { borderTopWidth: 1, borderTopColor: Colors.divider }]}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} />
                        <Text style={s.infoLabel}>Trạng thái</Text>
                        <View style={s.statusBadge}>
                            <Text style={s.statusText}>{user?.trangThai || 'ACTIVE'}</Text>
                        </View>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={22} color={Colors.expense} />
                    <Text style={s.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bgLight },
    header: {
        paddingTop: 52,
        paddingBottom: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    name: { fontSize: 20, fontWeight: '700', color: '#fff' },
    email: { fontSize: 13.5, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    content: { paddingHorizontal: 20, marginTop: -20 },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 14,
        gap: 14,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    menuIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#f0f7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 14.5,
        fontWeight: '600',
        color: Colors.textDark,
    },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textDark,
        marginTop: 6,
        marginBottom: 2,
    },
    statLabel: { fontSize: 12, color: Colors.textMuted },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 4,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    infoLabel: { fontSize: 13, color: Colors.textMuted, width: 60 },
    infoValue: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textDark,
        textAlign: 'right',
    },
    statusBadge: {
        backgroundColor: Colors.incomeBg,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 'auto',
    },
    statusText: { fontSize: 12, fontWeight: '700', color: Colors.income },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#fecaca',
        borderRadius: 16,
        padding: 16,
        shadowColor: Colors.expense,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    logoutText: { fontSize: 15, fontWeight: '700', color: Colors.expense },
});