import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { giaoDichAPI, nganSachAPI } from '../../src/api/axiosClient';
import Colors from '../../src/theme/colors';
import { thongBaoAPI } from '../../src/api/axiosClient';

type GiaoDich = {
  maGiaoDich: number;
  soTien: number;
  loaiGiaoDich: string;
  ngayGiaoDich: string;
  ghiChu: string;
  tenDanhMuc: string;
};

type ThongKe = {
  tongThu: number;
  tongChi: number;
  soDu: number;
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

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<GiaoDich[]>([]);
  const [thongKe, setThongKe] = useState<ThongKe>({ tongThu: 0, tongChi: 0, soDu: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canhBao, setCanhBao] = useState<any[]>([]);
  const [soChuaDoc, setSoChuaDoc] = useState(0);

  const now = new Date();
  const thang = now.getMonth() + 1;
  const nam = now.getFullYear();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const txRes = await giaoDichAPI.getAll();
      const allTx = txRes.data;
      setTransactions(allTx);

      let tongThu = 0;
      let tongChi = 0;
      allTx.forEach((tx: any) => {
        if (tx.loaiGiaoDich === 'THU') tongThu += tx.soTien;
        else tongChi += tx.soTien;
      });
      setThongKe({ tongThu, tongChi, soDu: tongThu - tongChi });

      // Load số thông báo chưa đọc
      try {
        const countRes = await thongBaoAPI.count();
        setSoChuaDoc(countRes.data.chuaDoc);
      } catch { }

      // Load cảnh báo ngân sách
      try {
        const cbRes = await nganSachAPI.canhBao(thang, nam);
        setCanhBao(cbRes.data);
      } catch { }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const fmt = (n: number) => Math.abs(n).toLocaleString('vi-VN') + 'đ';

  const formatDate = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const recentTx = transactions.slice(0, 8);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgLight }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[Colors.primary]} />
      }
    >
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={s.circleDecor} />
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>{greet()}</Text>
            <Text style={s.userName}>{user?.hoTen || 'Sinh viên'}</Text>
          </View>
          <TouchableOpacity style={s.notifBtn} onPress={() => router.push('/notifications' as any)}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            {soChuaDoc > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{soChuaDoc > 9 ? '9+' : soChuaDoc}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={s.balanceCard}>
          <Text style={s.balanceLabel}>Số dư hiện tại</Text>
          <Text style={s.balanceAmount}>
            {fmt(thongKe.soDu)} <Text style={s.balanceCur}>đ</Text>
          </Text>
        </View>
      </LinearGradient>

      {/* Thu / Chi */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <View style={s.summaryIconWrap}>
            <View style={[s.summaryIcon, { backgroundColor: Colors.incomeBg }]}>
              <Ionicons name="trending-up" size={20} color={Colors.income} />
            </View>
            <Text style={s.summaryLabel}>Thu nhập</Text>
          </View>
          <Text style={[s.summaryAmount, { color: Colors.income }]}>+{fmt(thongKe.tongThu)}</Text>
        </View>
        <View style={s.summaryCard}>
          <View style={s.summaryIconWrap}>
            <View style={[s.summaryIcon, { backgroundColor: Colors.expenseBg }]}>
              <Ionicons name="trending-down" size={20} color={Colors.expense} />
            </View>
            <Text style={s.summaryLabel}>Chi tiêu</Text>
          </View>
          <Text style={[s.summaryAmount, { color: Colors.expense }]}>-{fmt(thongKe.tongChi)}</Text>
        </View>
      </View>

      {/* Cảnh báo ngân sách */}
      {canhBao.length > 0 && canhBao.map((cb: any, i: number) => (
        <TouchableOpacity
          key={i}
          style={[s.warningCard, {
            backgroundColor: cb.trangThai === 'VUOT_NGAN_SACH' ? Colors.expenseBg : '#fff7ed',
            borderColor: cb.trangThai === 'VUOT_NGAN_SACH' ? '#fecaca' : '#fed7aa',
          }]}
          onPress={() => router.push('/budgets' as any)}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 22 }}>{cb.trangThai === 'VUOT_NGAN_SACH' ? '🚨' : '⚠️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.warningTitle, {
              color: cb.trangThai === 'VUOT_NGAN_SACH' ? Colors.expense : '#c2410c',
            }]}>
              {cb.trangThai === 'VUOT_NGAN_SACH' ? 'Vượt ngân sách!' : 'Cảnh báo ngân sách'}
            </Text>
            <Text style={[s.warningText, {
              color: cb.trangThai === 'VUOT_NGAN_SACH' ? '#b91c1c' : '#ea580c',
            }]}>{cb.noiDung}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      ))}

      {/* Nút thêm giao dịch */}
      <TouchableOpacity
        style={s.addBtnWrap}
        onPress={() => router.push('/add-transaction' as any)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.addBtn}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={s.addBtnText}>Thêm giao dịch mới</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Giao dịch gần đây */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Giao dịch gần đây</Text>
          <Text style={s.seeAll}>{transactions.length} giao dịch</Text>
        </View>

        {recentTx.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={{ fontSize: 40 }}>📝</Text>
            <Text style={s.emptyText}>Chưa có giao dịch nào</Text>
            <Text style={s.emptySubtext}>Nhấn nút "Thêm giao dịch mới" để bắt đầu</Text>
          </View>
        ) : (
          recentTx.map((tx) => (
            <TouchableOpacity
              key={tx.maGiaoDich}
              style={s.txCard}
              onPress={() => router.push(`/edit-transaction?id=${tx.maGiaoDich}` as any)}
              activeOpacity={0.7}
            >
              <View style={[s.txIcon, { backgroundColor: tx.loaiGiaoDich === 'THU' ? Colors.incomeBg : Colors.expenseBg }]}>
                <Text style={{ fontSize: 22 }}>{getEmoji(tx.tenDanhMuc, tx.loaiGiaoDich)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.txName}>{tx.tenDanhMuc || tx.ghiChu || (tx.loaiGiaoDich === 'THU' ? 'Thu nhập' : 'Chi tiêu')}</Text>
                <Text style={s.txTime}>{formatDate(tx.ngayGiaoDich)}{tx.ghiChu ? ' • ' + tx.ghiChu : ''}</Text>
              </View>
              <Text style={[s.txAmount, { color: tx.loaiGiaoDich === 'THU' ? Colors.income : Colors.expense }]}>
                {tx.loaiGiaoDich === 'THU' ? '+' : '-'}{fmt(tx.soTien)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgLight },
  header: { paddingTop: 52, paddingHorizontal: 24, paddingBottom: 70, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, position: 'relative', overflow: 'hidden' },
  circleDecor: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 13.5, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  notifBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  balanceCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 20 },
  balanceLabel: { fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  balanceAmount: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  balanceCur: { fontSize: 16, fontWeight: '500' },
  summaryRow: { flexDirection: 'row', gap: 14, marginHorizontal: 20, marginTop: -36 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  summaryIconWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  summaryIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: Colors.textLight },
  summaryAmount: { fontSize: 17, fontWeight: '700' },
  warningCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginTop: 20, padding: 14, borderRadius: 16, borderWidth: 1 },
  warningTitle: { fontSize: 13, fontWeight: '600' },
  warningText: { fontSize: 12, marginTop: 2 },
  addBtnWrap: { marginHorizontal: 20, marginTop: 20 },
  addBtn: { height: 50, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textDark },
  seeAll: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  txCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  txIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  txName: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  txTime: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textMedium, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.expense, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
});