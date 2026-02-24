import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

export default function LifestyleScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { demographics, goals, diet } = route.params || {};
    const [activity, setActivity] = useState(null);
    const [sleep, setSleep] = useState(null);
    const [stress, setStress] = useState(null);

    const activities = [
        { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise', icon: 'desktop-outline' },
        { id: 'light', label: 'Light', desc: '1-3 days/week exercise', icon: 'walk-outline' },
        { id: 'moderate', label: 'Moderate', desc: '3-5 days/week exercise', icon: 'bicycle-outline' },
        { id: 'active', label: 'Active', desc: '6-7 days/week intense', icon: 'barbell-outline' },
        { id: 'very_active', label: 'Very Active', desc: 'Physical job + training', icon: 'flame-outline' }
    ];

    const sleepLevels = [
        { id: '<5', label: 'Under 5h', color: '#EF4444' },
        { id: '5-6', label: '5-6 hours', color: '#F59E0B' },
        { id: '6-7', label: '6-7 hours', color: '#F59E0B' },
        { id: '7-8', label: '7-8 hours', color: '#10B981' },
        { id: '>8', label: '8+ hours', color: '#10B981' }
    ];

    const stressLevels = [
        { id: 'low', label: 'Low', desc: 'Relaxed lifestyle', color: '#10B981' },
        { id: 'medium', label: 'Medium', desc: 'Manageable stress', color: '#F59E0B' },
        { id: 'high', label: 'High', desc: 'Frequent stress', color: '#EF4444' }
    ];

    const isValid = activity && sleep;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
                        <Ionicons name="arrow-back" size={22} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.progress}>
                        <View style={[styles.progressFill, { width: '66%', backgroundColor: theme.primary }]} />
                    </View>
                    <Text style={[styles.step, { color: theme.textSecondary }]}>4/6</Text>
                </View>

                <Text style={[styles.title, { color: theme.text }]}>Lifestyle</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Activity and recovery patterns</Text>

                {/* Activity Level */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Activity Level</Text>
                {activities.map(a => (
                    <TouchableOpacity
                        key={a.id}
                        style={[styles.optionCard, { backgroundColor: activity === a.id ? theme.primary + '15' : theme.card, borderColor: activity === a.id ? theme.primary : theme.border }]}
                        onPress={() => setActivity(a.id)}
                    >
                        <Ionicons name={a.icon} size={22} color={activity === a.id ? theme.primary : theme.textSecondary} />
                        <View style={styles.optionContent}>
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{a.label}</Text>
                            <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>{a.desc}</Text>
                        </View>
                        {activity === a.id && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
                    </TouchableOpacity>
                ))}

                {/* Sleep */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Average Sleep</Text>
                <View style={styles.sleepRow}>
                    {sleepLevels.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            style={[styles.sleepChip, { backgroundColor: sleep === s.id ? s.color : theme.card, borderColor: sleep === s.id ? s.color : theme.border }]}
                            onPress={() => setSleep(s.id)}
                        >
                            <Text style={[styles.sleepText, { color: sleep === s.id ? '#FFF' : theme.text }]}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stress */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Stress Level</Text>
                <View style={styles.stressRow}>
                    {stressLevels.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            style={[styles.stressCard, { backgroundColor: stress === s.id ? s.color + '20' : theme.card, borderColor: stress === s.id ? s.color : theme.border }]}
                            onPress={() => setStress(s.id)}
                        >
                            <Text style={[styles.stressLabel, { color: stress === s.id ? s.color : theme.text }]}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Workout', { demographics, goals, diet, lifestyle: { activity_level: activity, sleep_hours_avg: sleep, stress_level: stress } })}
                    disabled={!isValid}
                >
                    <LinearGradient colors={isValid ? ['#6366F1', '#8B5CF6'] : [theme.border, theme.border]} style={styles.continueBtn}>
                        <Text style={[styles.continueBtnText, { color: isValid ? '#FFF' : theme.textTertiary }]}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color={isValid ? '#FFF' : theme.textTertiary} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
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
    subtitle: { fontSize: 15, marginTop: 6, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 },
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10, gap: 12 },
    optionContent: { flex: 1 },
    optionLabel: { fontSize: 15, fontWeight: '600' },
    optionDesc: { fontSize: 12, marginTop: 2 },
    sleepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    sleepChip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
    sleepText: { fontSize: 13, fontWeight: '500' },
    stressRow: { flexDirection: 'row', gap: 10 },
    stressCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
    stressLabel: { fontSize: 14, fontWeight: '600' },
    footer: { padding: spacing.lg, borderTopWidth: 1 },
    continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 8 },
    continueBtnText: { fontSize: 16, fontWeight: '600' }
});
