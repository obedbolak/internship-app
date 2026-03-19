import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
         ActivityIndicator, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { api } from '@/lib/api'
import { Colors, Radius, Font } from '@/constants/theme'

type Status = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
const STATUS: Record<Status, { label: string; bg: string; color: string; icon: string }> = {
  PENDING:  { label: 'Pending',  bg: '#FFF7ED', color: Colors.warning, icon: '⏳' },
  REVIEWED: { label: 'Reviewed', bg: '#EFF6FF', color: Colors.info,    icon: '👁️' },
  ACCEPTED: { label: 'Accepted', bg: '#F0FDF4', color: Colors.success,  icon: '✅' },
  REJECTED: { label: 'Rejected', bg: '#FFF1F2', color: Colors.danger,   icon: '❌' },
}

interface App {
  id: string; status: Status; createdAt: string
  internship: { title: string; location: string; duration: string
    company: { name: string; industry: string } }
}

export default function Applications() {
  const router = useRouter()
  const [apps, setApps]         = useState<App[]>([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetch_ = () => {
    api.get<any>('/api/student/applications')
      .then(d => setApps(d.applications ?? []))
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(fetch_, [])

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>My Applications</Text>
        <View style={{ width: 60 }} />
      </View>
      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        : <FlatList
            data={apps}
            keyExtractor={a => a.id}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch_() }} />}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={{ fontSize: 36 }}>📋</Text>
                <Text style={s.emptyTitle}>No applications yet</Text>
                <Text style={s.emptySub}>Start applying from the home screen</Text>
              </View>
            }
            renderItem={({ item }) => {
              const cfg = STATUS[item.status]
              return (
                <View style={s.card}>
                  <View style={s.cardTop}>
                    <View style={s.logo}>
                      <Text style={s.logoText}>{item.internship.company.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.internTitle}>{item.internship.title}</Text>
                      <Text style={s.company}>{item.internship.company.name}</Text>
                      <Text style={s.meta}>📍 {item.internship.location}  ⏱ {item.internship.duration}</Text>
                    </View>
                    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
                      <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.icon} {cfg.label}</Text>
                    </View>
                  </View>
                  <Text style={s.date}>Applied {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
              )
            }}
          />
      }
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
            borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  back:  { fontSize: Font.base, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: Font.lg, fontWeight: '700', color: Colors.text },
  card:  { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 14,
           marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  logo:    { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight,
             alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoText:    { fontSize: 18, fontWeight: '800', color: Colors.primary },
  internTitle: { fontSize: Font.base, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  company:     { fontSize: Font.sm, color: Colors.textMuted, marginBottom: 2 },
  meta:        { fontSize: Font.sm, color: Colors.textHint },
  badge:       { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 5 },
  badgeText:   { fontSize: 11, fontWeight: '600' },
  date:        { fontSize: Font.sm, color: Colors.textHint },
  empty:       { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle:  { fontSize: Font.md, fontWeight: '600', color: Colors.text },
  emptySub:    { fontSize: Font.sm, color: Colors.textHint },
})

