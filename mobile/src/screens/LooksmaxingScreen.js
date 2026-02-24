import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import * as PFT from '../services/PFTBridge';

export default function LooksmaxingScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { demographics, goals, diet, lifestyle, workout } = route.params || {};
    const [skinType, setSkinType] = useState(null);
    const [skinConcerns, setSkinConcerns] = useState([]);
    const [facialGoals, setFacialGoals] = useState([]);
    const [hairConcerns, setHairConcerns] = useState([]);
    const [saving, setSaving] = useState(false);

    const skinTypes = [
        { id: 'oily', label: 'Oily', icon: 'water' },
        { id: 'dry', label: 'Dry', icon: 'leaf' },
        { id: 'combination', label: 'Combination', icon: 'git-compare' },
        { id: 'normal', label: 'Normal', icon: 'checkmark-circle' }
    ];

    const skinConcernOptions = ['acne', 'dark_circles', 'uneven_tone', 'wrinkles', 'large_pores'];
    const facialGoalOptions = ['jawline', 'cheekbones', 'symmetry', 'skin_clarity', 'under_eye'];
    const hairConcernOptions = ['thinning', 'dandruff', 'dryness', 'oiliness', 'gray'];

    const toggleOption = (list, setter, id) => setter(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const completeSetup = async () => {
        try {
            setSaving(true);

            // Build raw profile data from all onboarding steps with fallbacks
            const rawProfile = {
                // Demographics (required fields)
                gender: demographics?.gender || 'male',
                age: demographics?.age || 25,
                height_cm: demographics?.height_cm || 170,
                weight_kg: demographics?.weight_kg || 70,
                body_fat_percent: demographics?.body_fat_percent || null,

                // Goals
                goal_type: goals?.goal_type || 'health',
                target_weight_kg: goals?.target_weight_kg || null,
                target_weeks: goals?.target_weeks || 12,

                // Diet
                diet_type: diet?.diet_type || 'veg',
                food_exclusions: diet?.food_exclusions || [],

                // Lifestyle
                activity_level: lifestyle?.activity_level || 'moderate',
                sleep_hours_avg: lifestyle?.sleep_hours_avg || '7-8',
                stress_level: lifestyle?.stress_level || 'medium',

                // Workout
                experience_level: workout?.experience_level || 'beginner',
                injuries: workout?.injuries || [],

                // Looksmaxing
                skin_type: skinType || 'normal',
                skin_concerns: skinConcerns || [],
                facial_goals: facialGoals || [],
                hair_concerns: hairConcerns || [],

                created_at: new Date().toISOString()
            };

            console.log('📝 Raw profile from onboarding:', rawProfile);

            // Always calculate and save profile, regardless of validation result
            const bodyMetrics = PFT.calculateBodyMetrics(rawProfile);
            console.log('📊 Body metrics calculated:', bodyMetrics);

            const enrichedProfile = {
                ...rawProfile,
                bmr: bodyMetrics.bmr || 1600,
                tdee: bodyMetrics.tdee || 2000,
                target_calories: bodyMetrics.targetCalories || 2000,
                protein_grams: bodyMetrics.macros?.protein || 120,
                carbs_grams: bodyMetrics.macros?.carbs || 200,
                fats_grams: bodyMetrics.macros?.fats || 60
            };

            // Save the profile
            await PFT.saveProfile(enrichedProfile);
            console.log('✅ Profile saved successfully:', enrichedProfile);

            navigation.replace('Main');
        } catch (error) {
            console.error('❌ Profile setup error:', error);

            // Emergency fallback - save minimal profile
            try {
                const fallbackProfile = {
                    gender: 'male',
                    age: 25,
                    height_cm: 170,
                    weight_kg: 70,
                    goal_type: 'health',
                    diet_type: 'veg',
                    experience_level: 'beginner',
                    activity_level: 'moderate',
                    skin_type: skinType || 'normal',
                    bmr: 1600,
                    tdee: 2000,
                    target_calories: 2000,
                    protein_grams: 120,
                    carbs_grams: 200,
                    fats_grams: 60,
                    created_at: new Date().toISOString()
                };
                await PFT.saveProfile(fallbackProfile);
                console.log('⚠️ Fallback profile saved:', fallbackProfile);
                navigation.replace('Main');
            } catch (fallbackError) {
                console.error('❌ Fallback save failed:', fallbackError);
                Alert.alert('Error', 'Failed to save profile. Please try again.');
            }
        } finally {
            setSaving(false);
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
                        <View style={[styles.progressFill, { width: '100%', backgroundColor: theme.primary }]} />
                    </View>
                    <Text style={[styles.step, { color: theme.textSecondary }]}>6/6</Text>
                </View>

                <Text style={[styles.title, { color: theme.text }]}>Looksmaxing</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Skincare, mewing, and grooming preferences</Text>

                {/* Skin Type */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Skin Type</Text>
                <View style={styles.typeGrid}>
                    {skinTypes.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            style={[styles.typeCard, { backgroundColor: skinType === s.id ? theme.primary + '20' : theme.card, borderColor: skinType === s.id ? theme.primary : theme.border }]}
                            onPress={() => setSkinType(s.id)}
                        >
                            <Ionicons name={s.icon} size={22} color={skinType === s.id ? theme.primary : theme.textSecondary} />
                            <Text style={[styles.typeLabel, { color: skinType === s.id ? theme.primary : theme.text }]}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Skin Concerns */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Skin Concerns</Text>
                <View style={styles.chips}>
                    {skinConcernOptions.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[styles.chip, { backgroundColor: skinConcerns.includes(c) ? theme.secondary + '20' : theme.card, borderColor: skinConcerns.includes(c) ? theme.secondary : theme.border }]}
                            onPress={() => toggleOption(skinConcerns, setSkinConcerns, c)}
                        >
                            <Text style={[styles.chipText, { color: skinConcerns.includes(c) ? theme.secondary : theme.text }]}>{c.split('_').join(' ')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Facial Goals */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Facial Improvement Goals</Text>
                <View style={styles.chips}>
                    {facialGoalOptions.map(g => (
                        <TouchableOpacity
                            key={g}
                            style={[styles.chip, { backgroundColor: facialGoals.includes(g) ? theme.primary + '20' : theme.card, borderColor: facialGoals.includes(g) ? theme.primary : theme.border }]}
                            onPress={() => toggleOption(facialGoals, setFacialGoals, g)}
                        >
                            <Text style={[styles.chipText, { color: facialGoals.includes(g) ? theme.primary : theme.text }]}>{g.split('_').join(' ')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Hair Concerns */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Hair Concerns</Text>
                <View style={styles.chips}>
                    {hairConcernOptions.map(h => (
                        <TouchableOpacity
                            key={h}
                            style={[styles.chip, { backgroundColor: hairConcerns.includes(h) ? theme.warning + '20' : theme.card, borderColor: hairConcerns.includes(h) ? theme.warning : theme.border }]}
                            onPress={() => toggleOption(hairConcerns, setHairConcerns, h)}
                        >
                            <Text style={[styles.chipText, { color: hairConcerns.includes(h) ? theme.warning : theme.text }]}>{h}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity onPress={completeSetup} disabled={saving}>
                    <LinearGradient colors={saving ? ['#9CA3AF', '#9CA3AF'] : ['#6366F1', '#8B5CF6']} style={styles.continueBtn}>
                        <Ionicons name={saving ? 'hourglass' : 'checkmark-circle'} size={22} color="#FFF" />
                        <Text style={styles.continueBtnText}>{saving ? 'Setting up...' : 'Complete Setup'}</Text>
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
    typeGrid: { flexDirection: 'row', gap: 10 },
    typeCard: { flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
    typeLabel: { marginTop: 8, fontSize: 13, fontWeight: '600' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
    chipText: { fontSize: 13, textTransform: 'capitalize' },
    footer: { padding: spacing.lg, borderTopWidth: 1 },
    continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, gap: 10 },
    continueBtnText: { color: '#FFF', fontSize: 17, fontWeight: '600' }
});
