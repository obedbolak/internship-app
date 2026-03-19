import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
         SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { api } from '@/lib/api'
import { Colors, Radius, Font } from '@/constants/theme'

interface Internship {
  id: string; title: string; description: string; fieldOfStudy: string
  location: string; isPaid: boolean; salary?: number; duration: string; deadline: string
  company: { name: string; industry: string; description: string }
}

export default function Apply() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [internship, setInternship] = useState<Internship | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get<any>(`/api/internships/${id}`)
      .then(d => setInternship(d.internship))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const submit = async () => {
    if (!coverLetter.trim()) return Alert.alert('Required', 'Please write a cover letter')
    setSubmitting(true)
    try {
      await api.post('/api/student/applications', { internshipId: id, coverLetter })
      Alert.alert('Applied! 🎉', 'Your application was submitted successfully', [
        { text: 'OK', onPress: () => router.replace('/student/applications') },
      ])
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <SafeAreaView style={s.safe}><ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} /></SafeAreaView>
  if (!internship) return <SafeAreaView style={s.safe}><Text style={s.notFound}>Internship not found</Text></SafeAreaView>

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Apply</Text>
        <View style={{ width: 60 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

          {/* Summary card */}
          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={s.logo}><Text style={s.logoText}>{internship.company.name.charAt(0)}</Text></View>
              <View>
                <Text style={s.company}>{internship.company.name}</Text>
                <Text style={s.industry}>{internship.company.industry}</Text>
              </View>
            </View>
            <Text style={s.internTitle}>{internship.title}</Text>
            <View style={s.tags}>
              <View style={s.tag}><Text style={s.tagText}>📍 {internship.location}</Text></View>
              <View style={s.tag}><Text style={s.tagText}>⏱ {internship.duration}</Text></View>
              <View style={[s.tag, { backgroundColor: internship.isPaid ? '#DCFCE7' : '#F1F5F9' }]}>
                <Text style={[s.tagText, { color: internship.isPaid ? Colors.success : Colors.textMuted }]}>
                  {internship.isPaid ? `💰 Paid${internship.salary ? ` · $${internship.salary}/mo` : ''}` : 'Unpaid'}
                </Text>
              </View>
            </View>
            <Text style={s.label}>About this role</Text>
            <Text style={s.description}>{internship.description}</Text>
            <Text style={s.deadline}>
              📅 Deadline: {new Date(internship.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>

          {/* Cover letter */}
          <Text style={s.label}>Cover Letter *</Text>
          <Text style={s.hint}>Tell them why you are the right fit</Text>
          <TextInput
            style={s.coverInput}
            placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest..."
            placeholderTextColor={Colors.textHint}
            multiline numberOfLines={8}
            textAlignVertical="top"
            value={coverLetter}
            onChangeText={setCoverLetter}
          />
          <Text style={s.charCount}>{coverLetter.length} characters</Text>

          <TouchableOpacity style={s.submitBtn} onPress={submit} disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitText}>Submit Application →</Text>
            }
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
             paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
             borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  back:        { fontSize: Font.base, color: Colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: Font.lg, fontWeight: '700', color: Colors.text },
  notFound:    { textAlign: 'center', marginTop: 80, color: Colors.textHint },

  card:    { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18,
             marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  logo:    { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primaryLight,
             alignItems: 'center', justifyContent: 'center' },
  logoText:   { fontSize: 20, fontWeight: '800', color: Colors.primary },
  company:    { fontSize: Font.md, fontWeight: '700', color: Colors.text },
  industry:   { fontSize: Font.sm, color: Colors.textMuted },
  internTitle:{ fontSize: Font.xl, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  tags:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag:        { backgroundColor: '#F1F5F9', borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 5 },
  tagText:    { fontSize: Font.sm, color: Colors.textMuted, fontWeight: '500' },
  label:      { fontSize: Font.sm, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  description:{ fontSize: Font.base, color: Colors.textMuted, lineHeight: 22, marginBottom: 10 },
  deadline:   { fontSize: Font.sm, color: Colors.textMuted },
  hint:       { fontSize: Font.sm, color: Colors.textMuted, marginBottom: 10 },
  coverInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
                borderRadius: Radius.lg, padding: 14, fontSize: Font.base,
                color: Colors.text, minHeight: 180, lineHeight: 22, marginBottom: 6 },
  charCount:  { fontSize: 11, color: Colors.textHint, textAlign: 'right', marginBottom: 16 },
  submitBtn:  { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: Font.md, fontWeight: '700' },
})

