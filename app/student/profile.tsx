import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
         SafeAreaView, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { api } from '@/lib/api'
import { Colors, Radius, Font } from '@/constants/theme'

interface Student { id: string; firstName: string; lastName: string; university: string; fieldOfStudy: string; bio?: string }

export default function Profile() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [student, setStudent]   = useState<Student | null>(null)
  const [editing, setEditing]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [bio, setBio]           = useState('')
  const [university, setUni]    = useState('')
  const [fieldOfStudy, setFos]  = useState('')

  useEffect(() => {
    api.get<any>('/api/student/profile')
      .then(d => {
        setStudent(d.student)
        setBio(d.student.bio ?? '')
        setUni(d.student.university)
        setFos(d.student.fieldOfStudy)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const d = await api.patch<any>('/api/student/profile', { bio, university: university, fieldOfStudy })
      setStudent(d.student)
      setEditing(false)
      Alert.alert('Saved ✓', 'Profile updated')
    } catch (e: any) { Alert.alert('Error', e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <SafeAreaView style={s.safe}><ActivityIndicator color={Colors.primary} style={{ marginTop: 80 }} /></SafeAreaView>

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={s.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{student?.firstName.charAt(0)}{student?.lastName.charAt(0)}</Text>
          </View>
          <Text style={s.fullName}>{student?.firstName} {student?.lastName}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>

        <View style={s.card}>
          {[
            { label: 'University', value: university, set: setUni },
            { label: 'Field of Study', value: fieldOfStudy, set: setFos },
          ].map(({ label, value, set }) => (
            <React.Fragment key={label}>
              <View style={s.row}>
                <Text style={s.rowLabel}>{label}</Text>
                {editing
                  ? <TextInput style={s.rowInput} value={value} onChangeText={set} placeholderTextColor={Colors.textHint} />
                  : <Text style={s.rowValue}>{value}</Text>
                }
              </View>
              <View style={s.divider} />
            </React.Fragment>
          ))}
          <View style={s.row}>
            <Text style={s.rowLabel}>Bio</Text>
            {editing
              ? <TextInput style={[s.rowInput, { minHeight: 80, textAlignVertical: 'top' }]}
                  value={bio} onChangeText={setBio} multiline placeholderTextColor={Colors.textHint}
                  placeholder="Tell companies about yourself..." />
              : <Text style={[s.rowValue, !student?.bio && { color: Colors.textHint, fontStyle: 'italic' }]}>
                  {student?.bio ?? 'No bio yet'}
                </Text>
            }
          </View>
        </View>

        {editing && (
          <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
            borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  back:        { fontSize: Font.base, color: Colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: Font.lg, fontWeight: '700', color: Colors.text },
  editBtn:     { fontSize: Font.base, color: Colors.primary, fontWeight: '600' },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar:    { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight,
               alignItems: 'center', justifyContent: 'center', marginBottom: 12,
               borderWidth: 2, borderColor: Colors.primaryBorder },
  avatarText:{ fontSize: 28, fontWeight: '800', color: Colors.primary },
  fullName:  { fontSize: Font.xxl, fontWeight: '800', color: Colors.text },
  email:     { fontSize: Font.base, color: Colors.textMuted, marginTop: 4 },

  card:     { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 16,
              borderWidth: 1, borderColor: Colors.border, marginBottom: 16 },
  row:      { paddingVertical: 10 },
  rowLabel: { fontSize: 11, fontWeight: '700', color: Colors.textHint, marginBottom: 4,
              textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue: { fontSize: Font.md, color: Colors.text },
  rowInput: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
              borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10,
              fontSize: Font.base, color: Colors.text },
  divider:  { height: 1, backgroundColor: Colors.borderLight },

  saveBtn:     { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 15,
                 alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#fff', fontSize: Font.md, fontWeight: '700' },
  logoutBtn:   { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
                 paddingVertical: 15, alignItems: 'center', backgroundColor: Colors.surface },
  logoutText:  { fontSize: Font.md, color: '#EF4444', fontWeight: '600' },
})

