import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

export default function DietScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { demographics, goals } = route.params || {};
    const [diet, setDiet] = useState(null);
    const [exclusions, setExclusions] = useState([]);

    const diets = [
        { id: 'nonveg', icon: 'restaurant', label: 'Non-Vegetarian', desc: 'Includes all meats, fish, eggs', color: '#EF4444' },
        { id: 'veg', icon: 'leaf', label: 'Vegetarian', desc: 'No meat or fish, dairy allowed', color: '#10B981' },
        { id: 'veg_egg', icon: 'egg', label: 'Eggetarian', desc: 'Vegetarian + eggs', color: '#F59E0B' },
        { id: 'jain', icon: 'sparkles', label: 'Jain', desc: 'No root vegetables, strict rules', color: '#8B5CF6' }
    ];

    const commonExclusions = ['dairy', 'gluten', 'soy', 'nuts', 'shellfish', 'peanuts'];

    const toggleExclusion = id => setExclusions(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
                        <Ionicons name="arrow-back" size={22} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.progress}>
                        <View style={[styles.progressFill, { width: '50%', backgroundColor: theme.primary }]} />
                    </View>
                    <Text style={[styles.step, { color: theme.textSecondary }]}>3/6</Text>
                </View>

                <Text style={[styles.title, { color: theme.text }]}>Diet Preferences</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Tell us what you eat</Text>

                {/* Diet Cards */}
                {diets.map(d => (
                    <TouchableOpacity
                        key={d.id}
                        style={[styles.dietCard, { backgroundColor: diet === d.id ? d.color + '15' : theme.card, borderColor: diet === d.id ? d.color : theme.border }]}
                        onPress={() => setDiet(d.id)}
                    >
                        <View style={[styles.dietIcon, { backgroundColor: diet === d.id ? d.color : theme.backgroundSecondary }]}>
                            <Ionicons name={d.icon} size={22} color={diet === d.id ? '#FFF' : theme.textSecondary} />
                        </View>
                        <View style={styles.dietContent}>
                            <Text style={[styles.dietLabel, { color: theme.text }]}>{d.label}</Text>
                            <Text style={[styles.dietDesc, { color: theme.textSecondary }]}>{d.desc}</Text>
                        </View>
                        {diet === d.id && (
                            <View style={[styles.checkCircle, { backgroundColor: d.color }]}>
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {diet === 'jain' && (
                    <View style={[styles.infoCard, { backgroundColor: theme.warning + '15', borderColor: theme.warning }]}>
                        <Ionicons name="information-circle" size={20} color={theme.warning} />
                        <Text style={[styles.infoText, { color: theme.warning }]}>Jain diet excludes: onion, garlic, potato, carrot, radish, beetroot, mushroom, and other root vegetables</Text>
                    </View>
                )}

                {/* Exclusions */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Food Allergies / Intolerances</Text>
                <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Optional - select any that apply</Text>
                <View style={styles.chips}>
                    {commonExclusions.map(e => (
                        <TouchableOpacity
                            key={e}
                            style={[styles.chip, { backgroundColor: exclusions.includes(e) ? theme.error + '20' : theme.card, borderColor: exclusions.includes(e) ? theme.error : theme.border }]}
                            onPress={() => toggleExclusion(e)}
                        >
                            <Text style={[styles.chipText, { color: exclusions.includes(e) ? theme.error : theme.text }]}>
                                {e.charAt(0).toUpperCase() + e.slice(1)}
                            </Text>
                            {exclusions.includes(e) && <Ionicons name="close-circle" size={16} color={theme.error} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Lifestyle', { demographics, goals, diet: { diet_type: diet, food_exclusions: exclusions } })}
                    disabled={!diet}
                >
                    <LinearGradient colors={diet ? ['#6366F1', '#8B5CF6'] : [theme.border, theme.border]} style={styles.continueBtn}>
                        <Text style={[styles.continueBtnText, { color: diet ? '#FFF' : theme.textTertiary }]}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color={diet ? '#FFF' : theme.textTertiary} />
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
    dietCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 12 },
    dietIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    dietContent: { flex: 1 },
    dietLabel: { fontSize: 16, fontWeight: '600' },
    dietDesc: { fontSize: 12, marginTop: 2 },
    checkCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    infoCard: { flexDirection: 'row', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16, gap: 10 },
    infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 4 },
    sectionSub: { fontSize: 13, marginBottom: 12 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, gap: 6 },
    chipText: { fontSize: 14 },
    footer: { padding: spacing.lg, borderTopWidth: 1 },
    continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 8 },
    continueBtnText: { fontSize: 16, fontWeight: '600' }
});
