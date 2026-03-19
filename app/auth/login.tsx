import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native'
import { useAuth } from '@/lib/AuthContext'
import { api } from '@/lib/api'
import { Colors, Radius, Font } from '@/constants/theme'
import { Picker } from '@react-native-picker/picker'

type Mode = 'login' | 'register'
type Role = 'STUDENT' | 'COMPANY'

const INDUSTRIES = [
  'Information Technology',
  'Finance',
  'Health Sciences',
  'Engineering',
  'Business',
  'Marketing',
  'Education',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Other',
]

export default function LoginScreen() {
  const { login } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [role, setRole] = useState<Role>('STUDENT')
  const [loading, setLoading] = useState(false)

  // Shared
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Student
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [university, setUniversity] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')

  // Company
  const [companyName, setCompanyName]   = useState('')
  const [industry, setIndustry]         = useState(INDUSTRIES[0])
  const [location, setLocation]         = useState('')
  const [description, setDescription]   = useState('')

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Required', 'Please enter your email and password')
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        const data = await api.post<any>('/api/auth/login', { email, password })
        await login(data.token, data.user)
      } else {
        const base = { email, password, role }
        const extra =
          role === 'STUDENT'
            ? { firstName, lastName, university, fieldOfStudy }
            : { companyName, industry, location, description }
        const data = await api.post<any>('/api/auth/register', { ...base, ...extra })
        await login(data.token, data.user)
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={s.header}>
            <View style={s.logo}>
              <Text style={s.logoText}>IL</Text>
            </View>
            <Text style={s.appName}>InternLink</Text>
            <Text style={s.tagline}>Find your perfect internship</Text>
          </View>

          {/* Login / Register toggle */}
          <View style={s.toggle}>
            {(['login', 'register'] as Mode[]).map(m => (
              <TouchableOpacity
                key={m}
                style={[s.toggleBtn, mode === m && s.toggleBtnActive]}
                onPress={() => setMode(m)}
              >
                <Text style={[s.toggleText, mode === m && s.toggleTextActive]}>
                  {m === 'login' ? 'Login' : 'Register'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Student / Company toggle */}
          <View style={s.roleRow}>
            {(['STUDENT', 'COMPANY'] as Role[]).map(r => (
              <TouchableOpacity
                key={r}
                style={[s.roleBtn, role === r && s.roleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Text style={s.roleIcon}>{r === 'STUDENT' ? '🎓' : '🏢'}</Text>
                <Text style={[s.roleText, role === r && s.roleTextActive]}>
                  {r === 'STUDENT' ? 'Student' : 'Company'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View style={s.form}>
            <TextInput style={s.input} placeholder="Email address" placeholderTextColor={Colors.textHint}
              keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TextInput style={s.input} placeholder="Password" placeholderTextColor={Colors.textHint}
              secureTextEntry value={password} onChangeText={setPassword} />

            {mode === 'register' && role === 'STUDENT' && (
              <>
                <View style={s.row}>
                  <TextInput style={[s.input, s.half]} placeholder="First name" placeholderTextColor={Colors.textHint}
                    value={firstName} onChangeText={setFirstName} />
                  <TextInput style={[s.input, s.half]} placeholder="Last name" placeholderTextColor={Colors.textHint}
                    value={lastName} onChangeText={setLastName} />
                </View>
                <TextInput style={s.input} placeholder="University" placeholderTextColor={Colors.textHint}
                  value={university} onChangeText={setUniversity} />
                <TextInput style={s.input} placeholder="Field of study (e.g. Computer Science)"
                  placeholderTextColor={Colors.textHint} value={fieldOfStudy} onChangeText={setFieldOfStudy} />
              </>
            )}

            {mode === 'register' && role === 'COMPANY' && (
              <>
                <TextInput style={s.input} placeholder="Company name" placeholderTextColor={Colors.textHint}
                  value={companyName} onChangeText={setCompanyName} />
                <View style={s.pickerContainer}>
                  <Picker
                    selectedValue={industry}
                    onValueChange={setIndustry}
                    style={s.picker}
                  >
                    {INDUSTRIES.map(ind => (
                      <Picker.Item key={ind} label={ind} value={ind} />
                    ))}
                  </Picker>
                </View>
                <TextInput style={s.input} placeholder="Location (e.g. Yaoundé, Cameroon)"
                  placeholderTextColor={Colors.textHint} value={location} onChangeText={setLocation} />
                <TextInput style={[s.input, s.textarea]} placeholder="Company description"
                  placeholderTextColor={Colors.textHint} multiline numberOfLines={3}
                  value={description} onChangeText={setDescription} />
              </>
            )}

            <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitText}>
                    {mode === 'login'
                      ? `Login as ${role === 'STUDENT' ? 'Student' : 'Company'}`
                      : 'Create Account'}
                  </Text>
              }
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  header: { alignItems: 'center', paddingTop: 56, marginBottom: 32 },
  logo:   { width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.primary,
            alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  appName:  { fontSize: Font.h1, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  tagline:  { fontSize: Font.sm, color: Colors.textMuted, marginTop: 4 },

  toggle: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: Radius.md,
            padding: 4, marginBottom: 14 },
  toggleBtn:       { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: Colors.surface, elevation: 2 },
  toggleText:      { fontSize: Font.base, fontWeight: '600', color: Colors.textMuted },
  toggleTextActive:{ color: Colors.text },

  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
             gap: 8, paddingVertical: 12, borderRadius: Radius.lg,
             borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  roleBtnActive:  { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleIcon:       { fontSize: 16 },
  roleText:       { fontSize: Font.base, fontWeight: '600', color: Colors.textMuted },
  roleTextActive: { color: Colors.primary },

  form:     { gap: 12 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
           borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 14,
           fontSize: Font.md, color: Colors.text },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: 14 },
  row:      { flexDirection: 'row', gap: 10 },
  half:     { flex: 1 },

  submitBtn:  { backgroundColor: Colors.primary, borderRadius: Radius.md,
                paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: Font.md, fontWeight: '700' },

  pickerContainer: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
                     borderRadius: Radius.md, overflow: 'hidden' },
  picker: { height: 50, color: Colors.text },
})

