import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

export default function WorkoutScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { demographics, goals, diet, lifestyle } = route.params || {};
    const [experience, setExperience] = useState(null);
    const [injuries, setInjuries] = useState([]);

    const experiences = [
        { id: 'beginner', label: 'Beginner', desc: '0-1 years training', icon: 'walk', workouts: '3 days/week', split: 'Full Body', color: '#10B981' },
        { id: 'intermediate', label: 'Intermediate', desc: '1-3 years training', icon: 'bicycle', workouts: '4 days/week', split: 'Upper/Lower', color: '#3B82F6' },
        { id: 'advanced', label: 'Advanced', desc: '3+ years training', icon: 'barbell', workouts: '6 days/week', split: 'Push/Pull/Legs', color: '#8B5CF6' }
    ];

    const injuryList = [
        { id: 'shoulder_injury', label: 'Shoulder', icon: 'body-outline' },
        { id: 'back_injury', label: 'Back', icon: 'body-outline' },
        { id: 'knee_injury', label: 'Knee', icon: 'body-outline' },
        { id: 'wrist_injury', label: 'Wrist', icon: 'hand-left-outline' },
        { id: 'ankle_injury', label: 'Ankle', icon: 'footsteps-outline' },
        { id: 'none', label: 'None', icon: 'checkmark-circle-outline' }
    ];

    const toggleInjury = id => {
        if (id === 'none') {
            setInjuries(['none']);
        } else {
            setInjuries(prev => {
                const filtered = prev.filter(i => i !== 'none');
                return filtered.includes(id) ? filtered.filter(i => i !== id) : [...filtered, id];
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
                        <Ionicons name="arrow-back" size={22} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.progress}>
                        <View style={[styles.progressFill, { width: '83%', backgroundColor: theme.primary }]} />
                    </View>
                    <Text style={[styles.step, { color: theme.textSecondary }]}>5/6</Text>
                </View>

                <Text style={[styles.title, { color: theme.text }]}>Workout Experience</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>We'll create the perfect program for your level</Text>

                {/* Experience Cards */}
                {experiences.map(e => (
                    <TouchableOpacity
                        key={e.id}
                        style={[styles.expCard, { backgroundColor: experience === e.id ? e.color + '15' : theme.card, borderColor: experience === e.id ? e.color : theme.border }]}
                        onPress={() => setExperience(e.id)}
                    >
                        <View style={[styles.expIcon, { backgroundColor: experience === e.id ? e.color : theme.backgroundSecondary }]}>
                            <Ionicons name={e.icon} size={24} color={experience === e.id ? '#FFF' : theme.textSecondary} />
                        </View>
                        <View style={styles.expContent}>
                            <Text style={[styles.expLabel, { color: theme.text }]}>{e.label}</Text>
                            <Text style={[styles.expDesc, { color: theme.textSecondary }]}>{e.desc}</Text>
                            <View style={styles.expTags}>
                                <View style={[styles.expTag, { backgroundColor: theme.backgroundSecondary }]}>
                                    <Text style={[styles.expTagText, { color: theme.textSecondary }]}>{e.workouts}</Text>
                                </View>
                                <View style={[styles.expTag, { backgroundColor: theme.backgroundSecondary }]}>
                                    <Text style={[styles.expTagText, { color: theme.textSecondary }]}>{e.split}</Text>
                                </View>
                            </View>
                        </View>
                        {experience === e.id && (
                            <View style={[styles.checkCircle, { backgroundColor: e.color }]}>
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Injuries */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Any Injuries or Limitations?</Text>
                <View style={styles.injuryGrid}>
                    {injuryList.map(i => (
                        <TouchableOpacity
                            key={i.id}
                            style={[styles.injuryChip, { backgroundColor: injuries.includes(i.id) ? (i.id === 'none' ? theme.success + '20' : theme.error + '20') : theme.card, borderColor: injuries.includes(i.id) ? (i.id === 'none' ? theme.success : theme.error) : theme.border }]}
                            onPress={() => toggleInjury(i.id)}
                        >
                            <Ionicons name={i.icon} size={18} color={injuries.includes(i.id) ? (i.id === 'none' ? theme.success : theme.error) : theme.textSecondary} />
                            <Text style={[styles.injuryText, { color: injuries.includes(i.id) ? (i.id === 'none' ? theme.success : theme.error) : theme.text }]}>{i.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Looksmaxing', { demographics, goals, diet, lifestyle, workout: { experience_level: experience, injuries: injuries.includes('none') ? [] : injuries } })}
                    disabled={!experience}
                >
                    <LinearGradient colors={experience ? ['#6366F1', '#8B5CF6'] : [theme.border, theme.border]} style={styles.continueBtn}>
                        <Text style={[styles.continueBtnText, { color: experience ? '#FFF' : theme.textTertiary }]}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color={experience ? '#FFF' : theme.textTertiary} />
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
    subtitle: { fontSize: 15, marginTop: 6, marginBottom: 24 },
    expCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 12 },
    expIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    expContent: { flex: 1 },
    expLabel: { fontSize: 17, fontWeight: '700' },
    expDesc: { fontSize: 13, marginTop: 2 },
    expTags: { flexDirection: 'row', marginTop: 10, gap: 8 },
    expTag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
    expTagText: { fontSize: 11, fontWeight: '500' },
    checkCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12 },
    injuryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    injuryChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
    injuryText: { fontSize: 14 },
    footer: { padding: spacing.lg, borderTopWidth: 1 },
    continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 8 },
    continueBtnText: { fontSize: 16, fontWeight: '600' }
});
