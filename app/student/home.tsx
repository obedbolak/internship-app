import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, RefreshControl, SafeAreaView, StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { api } from '@/lib/api'
import { Colors, Radius, Font } from '@/constants/theme'

const FIELDS = [
  { id: '1', label: 'Engineering',   icon: '⚙️', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: '2', label: 'Business',      icon: '💼', bg: '#F0FDF4', border: '#BBF7D0' },
  { id: '3', label: 'IT',            icon: '💻', bg: '#FFF7ED', border: '#FED7AA' },
  { id: '4', label: 'Health',        icon: '🏥', bg: '#FFF1F2', border: '#FECDD3' },
  { id: '5', label: 'Law',           icon: '⚖️', bg: '#FAF5FF', border: '#E9D5FF' },
  { id: '6', label: 'Arts & Design', icon: '🎨', bg: '#FFFBEB', border: '#FDE68A' },
]

interface Internship {
  id: string; title: string; location: string; isPaid: boolean
  salary?: number; duration: string; fieldOfStudy: string; deadline: string
  company: { id: string; name: string; industry: string }
}

export default function StudentHome() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [search, setSearch]           = useState('')
  const [selectedField, setField]     = useState<string | null>(null)
  const [internships, setInternships] = useState<Internship[]>([])
  const [unread, setUnread]           = useState(0)
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search)        params.set('search', search)
      if (selectedField) params.set('field', selectedField)
      const [{ internships: list }, { notifications }] = await Promise.all([
        api.get<any>(`/api/internships?${params}`),
        api.get<any>('/api/notifications'),
      ])
      setInternships(list ?? [])
      setUnread((notifications ?? []).filter((n: any) => !n.isRead).length)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search, selectedField])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={s.sub}>Find your perfect internship</Text>
        </View>
        <TouchableOpacity style={s.bell} onPress={() => router.push('/student/notifications')}>
          <Text style={{ fontSize: 22 }}>🔔</Text>
          {unread > 0 && (
            <View style={s.badge}><Text style={s.badgeText}>{unread}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData() }} />}
      >
        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search internships, companies..."
            placeholderTextColor={Colors.textHint}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={fetchData}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: Colors.textHint, fontSize: 14, padding: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fields grid 2×3 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Browse by Field</Text>
          <View style={s.grid}>
            {FIELDS.map(f => (
              <TouchableOpacity
                key={f.id}
                style={[s.fieldCard, { backgroundColor: f.bg, borderColor: f.border },
                  selectedField === f.id && s.fieldCardActive]}
                onPress={() => setField(selectedField === f.id ? null : f.id)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</Text>
                <Text style={[s.fieldLabel, selectedField === f.id && { color: Colors.primary }]}
                  numberOfLines={2}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Internship listings */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              {selectedField
                ? `${FIELDS.find(f => f.id === selectedField)?.label} Internships`
                : 'Featured Internships'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/student/all-internships')}>
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading
            ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
            : internships.length === 0
              ? <View style={s.empty}>
                  <Text style={{ fontSize: 36, marginBottom: 10 }}>🔍</Text>
                  <Text style={s.emptyText}>No internships found</Text>
                  <Text style={s.emptySub}>Try a different search or field</Text>
                </View>
              : internships.map(item => (
                  <View key={item.id} style={s.card}>
                    <View style={s.cardTop}>
                      <View style={s.companyLogo}>
                        <Text style={s.companyLogoText}>{item.company.name.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.companyName}>{item.company.name}</Text>
                        <Text style={s.companyIndustry}>{item.company.industry}</Text>
                      </View>
                      <View style={[s.paidBadge,
                        { backgroundColor: item.isPaid ? '#DCFCE7' : '#F1F5F9' }]}>
                        <Text style={[s.paidText,
                          { color: item.isPaid ? Colors.success : Colors.textMuted }]}>
                          {item.isPaid ? '💰 Paid' : 'Unpaid'}
                        </Text>
                      </View>
                    </View>

                    <Text style={s.internTitle}>{item.title}</Text>
                    <Text style={s.fieldText}>{item.fieldOfStudy}</Text>

                    <View style={s.meta}>
                      <Text style={s.metaText}>📍 {item.location}</Text>
                      <Text style={s.metaText}>⏱ {item.duration}</Text>
                      <Text style={s.metaText}>
                        📅 {new Date(item.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>

                    <TouchableOpacity style={s.applyBtn}
                      onPress={() => router.push(`/student/apply/${item.id}`)}>
                      <Text style={s.applyText}>Apply Now →</Text>
                    </TouchableOpacity>
                  </View>
                ))
          }
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={s.nav}>
        <NavItem icon="🏠" label="Home" active />
        <NavItem icon="📋" label="Applications" onPress={() => router.push('/student/applications')} />
        <NavItem icon="👤" label="Profile"      onPress={() => router.push('/student/profile')} />
        <NavItem icon="🚪" label="Logout"       onPress={logout} />
      </View>
    </SafeAreaView>
  )
}

function NavItem({ icon, label, active, onPress }: {
  icon: string; label: string; active?: boolean; onPress?: () => void
}) {
  return (
    <TouchableOpacity style={s.navItem} onPress={onPress}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[s.navLabel, active && { color: Colors.primary, fontWeight: '600' }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  topBar:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
             paddingHorizontal: 20, paddingVertical: 16 },
  greeting:{ fontSize: Font.xl, fontWeight: '800', color: Colors.text },
  sub:     { fontSize: Font.sm, color: Colors.textMuted, marginTop: 2 },
  bell:    { position: 'relative', padding: 8 },
  badge:   { position: 'absolute', top: 4, right: 4, backgroundColor: '#EF4444',
             borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
                marginHorizontal: 20, borderRadius: Radius.lg, paddingHorizontal: 14,
                paddingVertical: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  searchInput:{ flex: 1, fontSize: Font.md, color: Colors.text },

  section:       { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { fontSize: Font.lg, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  seeAll:        { fontSize: Font.sm, color: Colors.primary, fontWeight: '600' },

  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fieldCard: { width: '31%', borderWidth: 1.5, borderRadius: Radius.lg, padding: 12,
               alignItems: 'center', justifyContent: 'center', minHeight: 82 },
  fieldCardActive: { borderWidth: 2, borderColor: Colors.primary },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: Colors.text, textAlign: 'center' },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 16,
          marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  cardTop:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  companyLogo:  { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight,
                  alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  companyLogoText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  companyName:  { fontSize: Font.base, fontWeight: '700', color: Colors.text },
  companyIndustry: { fontSize: Font.sm, color: Colors.textMuted },
  paidBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  paidText:  { fontSize: 11, fontWeight: '600' },
  internTitle: { fontSize: Font.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  fieldText:   { fontSize: Font.sm, color: Colors.textMuted, marginBottom: 12 },
  meta:        { flexDirection: 'row', gap: 12, marginBottom: 14, flexWrap: 'wrap' },
  metaText:    { fontSize: Font.sm, color: Colors.textMuted },
  applyBtn:    { backgroundColor: Colors.primary, borderRadius: Radius.md,
                 paddingVertical: 10, alignItems: 'center' },
  applyText:   { color: '#fff', fontSize: Font.base, fontWeight: '700' },

  empty:     { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: Font.md, fontWeight: '600', color: Colors.text },
  emptySub:  { fontSize: Font.sm, color: Colors.textHint, marginTop: 4 },

  nav:      { flexDirection: 'row', backgroundColor: Colors.surface,
              borderTopWidth: 1, borderTopColor: Colors.border,
              paddingVertical: 10, paddingBottom: 20,
              position: 'absolute', bottom: 0, left: 0, right: 0 },
  navItem:  { flex: 1, alignItems: 'center', gap: 4 },
  navLabel: { fontSize: 11, color: Colors.textHint },
})

