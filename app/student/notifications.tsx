import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { api } from '@/lib/api'
import { Colors, Radius, Font } from '@/constants/theme'

interface Notif { id: string; title: string; message: string; isRead: boolean; createdAt: string }

export default function Notifications() {
  const router = useRouter()
  const [items, setItems]     = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any>('/api/notifications')
      .then(d => { setItems(d.notifications ?? []); api.patch('/api/notifications', {}) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>
      {loading
        ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        : <FlatList
            data={items}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={{ fontSize: 36 }}>🔔</Text>
                <Text style={s.emptyText}>No notifications yet</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[s.card, !item.isRead && s.cardUnread]}>
                <View style={[s.dot, !item.isRead && s.dotActive]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.notifTitle}>{item.title}</Text>
                  <Text style={s.notifMsg}>{item.message}</Text>
                  <Text style={s.notifTime}>
                    {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            )}
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
  back:   { fontSize: Font.base, color: Colors.primary, fontWeight: '600' },
  title:  { fontSize: Font.lg, fontWeight: '700', color: Colors.text },
  card:   { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 14,
            marginBottom: 10, flexDirection: 'row', gap: 12,
            borderWidth: 1, borderColor: Colors.border },
  cardUnread: { borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryLight },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1', marginTop: 5 },
  dotActive: { backgroundColor: Colors.primary },
  notifTitle: { fontSize: Font.base, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  notifMsg:   { fontSize: Font.sm, color: Colors.textMuted, lineHeight: 18, marginBottom: 4 },
  notifTime:  { fontSize: 11, color: Colors.textHint },
  empty:      { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText:  { fontSize: Font.md, color: Colors.textHint },
})

