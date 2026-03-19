import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
         RefreshControl, SafeAreaView, StatusBar } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { api } from '@/lib/api'
import { Colors, Radius, Font } from '@/constants/theme'

type AppStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
const STATUS: Record<AppStatus, { label: string; bg: string; color: string }> = {
  PENDING:  { label: 'Pending',  bg: '#FFF7ED', color: Colors.warning },
  REVIEWED: { label: 'Reviewed', bg: '#EFF6FF', color: Colors.info    },
  ACCEPTED: { label: 'Accepted', bg: '#F0FDF4', color: Colors.success  },
  REJECTED: { label: 'Rejected', bg: '#FFF1F2', color: Colors.danger   },
}

interface Application {
  id: string; status: AppStatus; createdAt: string; coverLetter?: string
  student: { id: string; firstName: string; lastName: string; university: string; fieldOfStudy: string }
  internship: { id: string; title: string }
}
interface Company {
  id: string; name: string; industry: string; description: string
  location: string; website?: string; isVerified: boolean
  internships: { id: string; title: string; isActive: boolean; _count: { applications: number } }[]
}

export default function CompanyDashboard() {
  const { logout } = useAuth()
  const router = useRouter()
  const [company, setCompany]       = useState<Company | null>(null)
  const [apps, setApps]             = useState<Application[]>([])
  const [tab, setTab]               = useState<'listings' | 'applicants'>('listings')
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [cp, ap] = await Promise.all([
        api.get<any>('/api/company/profile'),
        api.get<any>('/api/company/applications'),
      ])
      setCompany(cp.company)
      setApps(ap.applications ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id: string, status: AppStatus) => {
    setUpdatingId(id)
    try {
      await api.patch(`/api/applications/${id}/status`, { status })
      setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (e) { console.error(e) }
    finally { setUpdatingId(null) }
  }

  const pending = apps.filter(a => a.status === 'PENDING').length

  if (loading) return <SafeAreaView style={s.safe}><ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} /></SafeAreaView>

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.topBar}>
        <Text style={s.screenTitle}>Dashboard</Text>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData() }} />}>

        {/* Profile card */}
        {company && (
          <View style={s.profileCard}>
            <View style={s.profileTop}>
              <View style={s.profileLogo}><Text style={s.profileLogoText}>{company.name.charAt(0)}</Text></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <Text style={s.profileName}>{company.name}</Text>
                  {company.isVerified && <View style={s.verifiedBadge}><Text style={s.verifiedText}>✓ Verified</Text></View>}
                </View>
                <Text style={s.profileIndustry}>{company.industry}</Text>
                <Text style={s.profileLocation}>📍 {company.location}</Text>
              </View>
            </View>
            <Text style={s.profileDesc}>{company.description}</Text>
            {company.website && <Text style={s.profileWeb}>🌐 {company.website}</Text>}
            <View style={s.statsRow}>
              {[
                { label: 'Listings',   value: company.internships.length, color: Colors.text },
                { label: 'Applicants', value: apps.length,                color: Colors.text },
                { label: 'Pending',    value: pending,                    color: pending > 0 ? Colors.warning : Colors.text },
              ].map((st, i) => (
                <React.Fragment key={st.label}>
                  {i > 0 && <View style={s.statDiv} />}
                  <View style={s.statBox}>
                    <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
            <TouchableOpacity style={s.postBtn} onPress={() => router.push('/company/post-internship')}>
              <Text style={s.postBtnText}>+ Post New Internship</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab toggle */}
        <View style={s.tabRow}>
          {(['listings', 'applicants'] as const).map(t => (
            <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {t === 'listings' ? 'My Listings' : `Applicants${pending > 0 ? ` (${pending})` : ''}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Listings tab */}
          {tab === 'listings' && (
            company?.internships.length === 0
              ? <Empty icon="📋" text="No internships posted yet" sub="Post your first listing to attract students" />
              : company?.internships.map(i => (
                  <TouchableOpacity key={i.id} style={s.listingCard}
                    onPress={() => router.push(`/company/internship/${i.id}`)}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={s.listingTitle}>{i.title}</Text>
                      <View style={[s.activeBadge, { backgroundColor: i.isActive ? '#F0FDF4' : '#F1F5F9' }]}>
                        <Text style={[s.activeBadgeText, { color: i.isActive ? Colors.success : Colors.textMuted }]}>
                          {i.isActive ? 'Active' : 'Closed'}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: Font.sm, color: Colors.textMuted }}>
                      👥 {i._count.applications} applicant{i._count.applications !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))
          )}

          {/* Applicants tab */}
          {tab === 'applicants' && (
            apps.length === 0
              ? <Empty icon="👥" text="No applications yet" sub="Applications will appear here once students apply" />
              : apps.map(app => {
                  const cfg = STATUS[app.status]
                  return (
                    <View key={app.id} style={s.appCard}>
                      <View style={s.appTop}>
                        <View style={s.appAvatar}>
                          <Text style={s.appAvatarText}>{app.student.firstName.charAt(0)}{app.student.lastName.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.appName}>{app.student.firstName} {app.student.lastName}</Text>
                          <Text style={s.appUni}>{app.student.university}</Text>
                          <Text style={s.appField}>{app.student.fieldOfStudy}</Text>
                        </View>
                        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                      </View>
                      <Text style={s.appliedFor}>For: <Text style={{ fontWeight: '700', color: Colors.text }}>{app.internship.title}</Text></Text>
                      {app.coverLetter && <Text style={s.coverPreview} numberOfLines={2}>{app.coverLetter}</Text>}
                      {app.status === 'PENDING' && (
                        <View style={s.actionRow}>
                          {[
                            { label: '✓ Accept', status: 'ACCEPTED' as AppStatus, style: s.acceptBtn, textStyle: s.acceptText },
                            { label: 'Review',   status: 'REVIEWED' as AppStatus, style: s.reviewBtn, textStyle: s.reviewText },
                            { label: '✕ Reject', status: 'REJECTED' as AppStatus, style: s.rejectBtn, textStyle: s.rejectText },
                          ].map(btn => (
                            <TouchableOpacity key={btn.status} style={btn.style}
                              onPress={() => updateStatus(app.id, btn.status)}
                              disabled={updatingId === app.id}>
                              {updatingId === app.id
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={btn.textStyle}>{btn.label}</Text>
                              }
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )
                })
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

function Empty({ icon, text, sub }: { icon: string; text: string; sub: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8 }}>
      <Text style={{ fontSize: 36 }}>{icon}</Text>
      <Text style={{ fontSize: Font.md, fontWeight: '600', color: Colors.text }}>{text}</Text>
      <Text style={{ fontSize: Font.sm, color: Colors.textHint, textAlign: 'center' }}>{sub}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  topBar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
               paddingHorizontal: 20, paddingVertical: 16 },
  screenTitle: { fontSize: Font.xl, fontWeight: '800', color: Colors.text },
  logoutBtn:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.sm,
                 borderWidth: 1, borderColor: Colors.border },
  logoutText:  { fontSize: Font.sm, color: Colors.textMuted, fontWeight: '600' },

  profileCard: { backgroundColor: Colors.surface, margin: 20, borderRadius: 18,
                 padding: 18, borderWidth: 1, borderColor: Colors.border },
  profileTop:  { flexDirection: 'row', marginBottom: 14 },
  profileLogo: { width: 56, height: 56, borderRadius: 14, backgroundColor: Colors.primaryLight,
                 alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  profileLogoText: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  profileName:     { fontSize: 18, fontWeight: '800', color: Colors.text },
  profileIndustry: { fontSize: Font.sm, color: Colors.textMuted },
  profileLocation: { fontSize: Font.sm, color: Colors.textHint, marginTop: 2 },
  verifiedBadge:   { backgroundColor: '#F0FDF4', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  verifiedText:    { fontSize: 11, color: Colors.success, fontWeight: '600' },
  profileDesc:     { fontSize: Font.base, color: Colors.textMuted, lineHeight: 20, marginBottom: 8 },
  profileWeb:      { fontSize: Font.sm, color: Colors.primary, marginBottom: 14 },

  statsRow: { flexDirection: 'row', backgroundColor: Colors.bg, borderRadius: Radius.md,
              padding: 14, marginBottom: 16 },
  statBox:  { flex: 1, alignItems: 'center' },
  statNum:  { fontSize: 22, fontWeight: '800' },
  statLabel:{ fontSize: Font.sm, color: Colors.textMuted, marginTop: 2 },
  statDiv:  { width: 1, backgroundColor: Colors.border },

  postBtn:     { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 13, alignItems: 'center' },
  postBtnText: { color: '#fff', fontSize: Font.md, fontWeight: '700' },

  tabRow:      { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#E2E8F0',
                 borderRadius: Radius.md, padding: 4, marginBottom: 16 },
  tab:         { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive:   { backgroundColor: Colors.surface },
  tabText:     { fontSize: Font.sm, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.text },

  listingCard:      { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14,
                      marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  listingTitle:     { fontSize: Font.md, fontWeight: '700', color: Colors.text, flex: 1 },
  activeBadge:      { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  activeBadgeText:  { fontSize: 11, fontWeight: '600' },

  appCard:   { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14,
               marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  appTop:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  appAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight,
               alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  appAvatarText: { fontSize: Font.base, fontWeight: '700', color: Colors.primary },
  appName:       { fontSize: Font.md, fontWeight: '700', color: Colors.text },
  appUni:        { fontSize: Font.sm, color: Colors.textMuted, marginTop: 1 },
  appField:      { fontSize: Font.sm, color: Colors.textHint, marginTop: 1 },
  statusBadge:   { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  statusText:    { fontSize: 11, fontWeight: '600' },
  appliedFor:    { fontSize: Font.sm, color: Colors.textMuted, marginBottom: 6 },
  coverPreview:  { fontSize: Font.sm, color: Colors.textHint, fontStyle: 'italic', marginBottom: 10, lineHeight: 18 },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  acceptBtn: { flex: 1, backgroundColor: Colors.success, borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center' },
  acceptText:{ color: '#fff', fontSize: Font.sm, fontWeight: '700' },
  reviewBtn: { flex: 1, backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center',
               borderWidth: 1, borderColor: Colors.primaryBorder },
  reviewText:{ color: Colors.primary, fontSize: Font.sm, fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: '#FFF1F2', borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center',
               borderWidth: 1, borderColor: '#FECDD3' },
  rejectText:{ color: Colors.danger, fontSize: Font.sm, fontWeight: '700' },
})

