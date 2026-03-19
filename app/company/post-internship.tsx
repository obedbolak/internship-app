import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
         SafeAreaView, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { api } from '@/lib/api'
import { Colors, Radius, Font } from '@/constants/theme'

const FIELDS = ['Engineering','Business','Information Technology','Health Sciences',
                'Law','Arts & Design','Computer Science','Finance','Marketing','Other']

export default function PostInternship() {
  const router = useRouter()
  const [title, setTitle]         = useState('')
  const [description, setDesc]    = useState('')
  const [fieldOfStudy, setFos]    = useState('')
  const [location, setLocation]   = useState('')
  const [duration, setDuration]   = useState('')
  const [deadline, setDeadline]   = useState('')
  const [isPaid, setIsPaid]       = useState(false)
  const [salary, setSalary]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const submit = async () => {
    if (!title || !description || !fieldOfStudy || !location || !duration || !deadline) {
      return Alert.alert('Missing Fields', 'Please fill in all required fields')
    }
    const dl = new Date(deadline)
    if (isNaN(dl.getTime()) || dl <= new Date()) {
      return Alert.alert('Invalid Date', 'Deadline must be a future date (YYYY-MM-DD)')
    }
    setLoading(true)
    try {
      await api.post('/api/internships', {
        title, description, fieldOfStudy, location, duration, deadline,
        isPaid, salary: isPaid && salary ? parseFloat(salary) : null,
      })
      Alert.alert('Posted! 🎉', 'Your internship is now live', [
        { text: 'OK', onPress: () => router.replace('/company/dashboard') },
      ])
    } catch (e: any) { Alert.alert('Error', e.message) }
    finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.headerTitle}>Post Internship</Text>
        <View style={{ width: 60 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

          {[
            { label: 'Job Title *',         value: title,    set: setTitle,    ph: 'e.g. Software Engineering Intern' },
            { label: 'Location *',          value: location, set: setLocation, ph: 'e.g. Yaoundé, Cameroon' },
            { label: 'Duration *',          value: duration, set: setDuration, ph: 'e.g. 3 months' },
            { label: 'Application Deadline * (YYYY-MM-DD)', value: deadline, set: setDeadline, ph: '2025-12-31', keyboardType: 'numeric' as const },
          ].map(f => (
            <View key={f.label} style={s.field}>
              <Text style={s.label}>{f.label}</Text>
              <TextInput style={s.input} placeholder={f.ph} placeholderTextColor={Colors.textHint}
                value={f.value} onChangeText={f.set} keyboardType={f.keyboardType} />
            </View>
          ))}

          {/* Field of study picker */}
          <View style={s.field}>
            <Text style={s.label}>Field of Study *</Text>
            <TouchableOpacity style={s.picker} onPress={() => setShowPicker(!showPicker)}>
              <Text style={[s.pickerText, !fieldOfStudy && { color: Colors.textHint }]}>
                {fieldOfStudy || 'Select field of study'}
              </Text>
              <Text style={{ fontSize: 11, color: Colors.textHint }}>{showPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showPicker && (
              <View style={s.dropdown}>
                {FIELDS.map(f => (
                  <TouchableOpacity key={f} style={[s.dropItem, fieldOfStudy === f && s.dropItemActive]}
                    onPress={() => { setFos(f); setShowPicker(false) }}>
                    <Text style={[s.dropText, fieldOfStudy === f && s.dropTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={s.field}>
            <Text style={s.label}>Description *</Text>
            <TextInput style={[s.input, s.textarea]} placeholder="Describe responsibilities and requirements..."
              placeholderTextColor={Colors.textHint} multiline numberOfLines={5}
              textAlignVertical="top" value={description} onChangeText={setDesc} />
          </View>

          {/* Paid toggle */}
          <View style={s.field}>
            <View style={s.switchRow}>
              <View>
                <Text style={s.label}>Paid Internship</Text>
                <Text style={{ fontSize: Font.sm, color: Colors.textHint, marginTop: 2 }}>Will the intern be compensated?</Text>
              </View>
              <Switch value={isPaid} onValueChange={setIsPaid}
                trackColor={{ false: '#E2E8F0', true: Colors.primaryBorder }}
                thumbColor={isPaid ? Colors.primary : Colors.textHint} />
            </View>
          </View>

          {isPaid && (
            <View style={s.field}>
              <Text style={s.label}>Monthly Salary (USD)</Text>
              <TextInput style={s.input} placeholder="e.g. 500" placeholderTextColor={Colors.textHint}
                keyboardType="numeric" value={salary} onChangeText={setSalary} />
            </View>
          )}

          <TouchableOpacity style={s.submitBtn} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Post Internship →</Text>}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
            borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  back:        { fontSize: Font.base, color: Colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: Font.lg, fontWeight: '700', color: Colors.text },
  field:       { marginBottom: 16 },
  label:       { fontSize: Font.sm, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  input:       { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
                 borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 13,
                 fontSize: Font.base, color: Colors.text },
  textarea:    { minHeight: 120, paddingTop: 13 },
  picker:      { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
                 borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 13,
                 flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerText:  { fontSize: Font.base, color: Colors.text },
  dropdown:    { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
                 borderRadius: Radius.md, marginTop: 4, overflow: 'hidden' },
  dropItem:      { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropItemActive:{ backgroundColor: Colors.primaryLight },
  dropText:      { fontSize: Font.base, color: Colors.text },
  dropTextActive:{ color: Colors.primary, fontWeight: '600' },
  switchRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  submitBtn:   { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitText:  { color: '#fff', fontSize: Font.md, fontWeight: '700' },
})

