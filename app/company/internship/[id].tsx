import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Colors, Radius, Font } from '@/constants/theme'

export default function InternshipDetail() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Internship Details</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView style={s.content}>
        <View style={s.placeholder}>
          <Text style={s.placeholderText}>Internship ID: {id}</Text>
          <Text style={s.subtext}>Details page coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { padding: 4 },
  back: { fontSize: Font.base, color: Colors.primary, fontWeight: '600' },
  title: { fontSize: Font.lg, fontWeight: '700', color: Colors.text },
  content: { flex: 1 },
  placeholder: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  placeholderText: { fontSize: Font.md, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  subtext: { fontSize: Font.sm, color: Colors.textMuted },
})
