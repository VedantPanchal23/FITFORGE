import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { spacing, fonts, radius } from '../theme';

export default function DemographicsScreen({ navigation }) {
    const { theme } = useTheme();
    const [gender, setGender] = useState(null);
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');

    const isValid = gender && age && height && weight && parseInt(age) >= 18;

    const genders = [
        { id: 'male', icon: 'male', label: 'Male' },
        { id: 'female', icon: 'female', label: 'Female' }
    ];

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
                            <Ionicons name="arrow-back" size={22} color={theme.text} />
                        </TouchableOpacity>
                        <View style={styles.progress}>
                            <View style={[styles.progressFill, { width: '16%', backgroundColor: theme.primary }]} />
                        </View>
                        <Text style={[styles.step, { color: theme.textSecondary }]}>1/6</Text>
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>Basic Information</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>We'll use this to calculate your metabolism</Text>

                    {/* Gender Selection */}
                    <Text style={[styles.label, { color: theme.text }]}>Gender <Text style={{ color: theme.error }}>*</Text></Text>
                    <View style={styles.genderRow}>
                        {genders.map(g => (
                            <TouchableOpacity
                                key={g.id}
                                style={[styles.genderCard, { backgroundColor: gender === g.id ? theme.primary : theme.card, borderColor: gender === g.id ? theme.primary : theme.border }]}
                                onPress={() => setGender(g.id)}
                            >
                                <Ionicons name={g.icon} size={28} color={gender === g.id ? '#FFF' : theme.textSecondary} />
                                <Text style={[styles.genderLabel, { color: gender === g.id ? '#FFF' : theme.text }]}>{g.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Age */}
                    <Text style={[styles.label, { color: theme.text }]}>Age <Text style={{ color: theme.error }}>*</Text></Text>
                    <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
                        <TextInput style={[styles.input, { color: theme.text }]} placeholder="Enter your age" placeholderTextColor={theme.textTertiary} keyboardType="numeric" value={age} onChangeText={setAge} maxLength={3} />
                        <Text style={[styles.unit, { color: theme.textSecondary }]}>years</Text>
                    </View>
                    {age && parseInt(age) < 18 && (
                        <View style={styles.warning}>
                            <Ionicons name="warning" size={16} color={theme.warning} />
                            <Text style={[styles.warningText, { color: theme.warning }]}>You must be 18+ to use this app</Text>
                        </View>
                    )}

                    {/* Height */}
                    <Text style={[styles.label, { color: theme.text }]}>Height <Text style={{ color: theme.error }}>*</Text></Text>
                    <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="resize-outline" size={20} color={theme.textSecondary} />
                        <TextInput style={[styles.input, { color: theme.text }]} placeholder="Enter your height" placeholderTextColor={theme.textTertiary} keyboardType="numeric" value={height} onChangeText={setHeight} maxLength={3} />
                        <Text style={[styles.unit, { color: theme.textSecondary }]}>cm</Text>
                    </View>

                    {/* Weight */}
                    <Text style={[styles.label, { color: theme.text }]}>Current Weight <Text style={{ color: theme.error }}>*</Text></Text>
                    <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="scale-outline" size={20} color={theme.textSecondary} />
                        <TextInput style={[styles.input, { color: theme.text }]} placeholder="Enter your weight" placeholderTextColor={theme.textTertiary} keyboardType="numeric" value={weight} onChangeText={setWeight} maxLength={5} />
                        <Text style={[styles.unit, { color: theme.textSecondary }]}>kg</Text>
                    </View>

                    {/* Body Fat (Optional) */}
                    <Text style={[styles.label, { color: theme.text }]}>Body Fat % <Text style={{ color: theme.textTertiary }}>(optional)</Text></Text>
                    <View style={[styles.inputRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="body-outline" size={20} color={theme.textSecondary} />
                        <TextInput style={[styles.input, { color: theme.text }]} placeholder="If you know it" placeholderTextColor={theme.textTertiary} keyboardType="numeric" value={bodyFat} onChangeText={setBodyFat} maxLength={4} />
                        <Text style={[styles.unit, { color: theme.textSecondary }]}>%</Text>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Goals', { demographics: { gender, age: +age, height_cm: +height, weight_kg: +weight, body_fat_percent: bodyFat ? +bodyFat : null } })}
                        disabled={!isValid}
                    >
                        <LinearGradient colors={isValid ? ['#6366F1', '#8B5CF6'] : [theme.border, theme.border]} style={styles.continueBtn}>
                            <Text style={[styles.continueBtnText, { color: isValid ? '#FFF' : theme.textTertiary }]}>Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color={isValid ? '#FFF' : theme.textTertiary} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.lg },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    progress: { flex: 1, height: 4, backgroundColor: '#27272A', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    step: { fontSize: 12, fontWeight: '600' },
    title: { fontSize: 28, fontWeight: '800' },
    subtitle: { fontSize: 15, marginTop: 6, marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 10 },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderCard: { flex: 1, padding: 24, borderRadius: 16, borderWidth: 2, alignItems: 'center' },
    genderLabel: { marginTop: 8, fontSize: 15, fontWeight: '600' },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, gap: 12 },
    input: { flex: 1, paddingVertical: 16, fontSize: 16 },
    unit: { fontSize: 15 },
    warning: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
    warningText: { fontSize: 12 },
    footer: { padding: spacing.lg, borderTopWidth: 1 },
    continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 8 },
    continueBtnText: { fontSize: 16, fontWeight: '600' }
});
