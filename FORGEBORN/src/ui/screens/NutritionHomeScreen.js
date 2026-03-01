/**
 * FORGEBORN — NUTRITION HOME SCREEN (Placeholder)
 * 
 * Daily meal plan, macro tracking, water intake.
 * Phase 2C will add the full nutrition engine.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useUserStore from '../../store/userStore';

const NutritionHomeScreen = () => {
    const profile = useUserStore((s) => s.profile);
    const getBMI = useUserStore((s) => s.getBMI);
    const bmi = getBMI();

    // Calculate estimated TDEE
    const weight = profile?.weight || 70;
    const height = profile?.height || 175;
    const age = profile?.age || 22;
    const gender = profile?.gender;

    let bmr = 0;
    if (gender === 'MALE') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    const tdee = Math.round(bmr * 1.55); // Moderate activity
    const protein = Math.round(weight * 2.2); // 2.2g per kg
    const fats = Math.round(weight * 0.8); // 0.8g per kg
    const carbCals = tdee - (protein * 4) - (fats * 9);
    const carbs = Math.round(carbCals / 4);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>NUTRITION</Text>
                <Text style={styles.subtitle}>FUEL THE MACHINE</Text>

                {/* TDEE Card */}
                <View style={styles.tdeeCard}>
                    <Text style={styles.tdeeLabel}>DAILY TARGET</Text>
                    <Text style={styles.tdeeValue}>{tdee}</Text>
                    <Text style={styles.tdeeUnit}>CALORIES</Text>
                </View>

                {/* Macros Row */}
                <View style={styles.macrosRow}>
                    <View style={[styles.macroCard, { borderColor: colors.primary }]}>
                        <Text style={[styles.macroValue, { color: colors.primary }]}>{protein}g</Text>
                        <Text style={styles.macroLabel}>PROTEIN</Text>
                        <Text style={styles.macroSub}>{protein * 4} cal</Text>
                    </View>
                    <View style={[styles.macroCard, { borderColor: colors.warning }]}>
                        <Text style={[styles.macroValue, { color: colors.warning }]}>{carbs}g</Text>
                        <Text style={styles.macroLabel}>CARBS</Text>
                        <Text style={styles.macroSub}>{carbs * 4} cal</Text>
                    </View>
                    <View style={[styles.macroCard, { borderColor: colors.success }]}>
                        <Text style={[styles.macroValue, { color: colors.success }]}>{fats}g</Text>
                        <Text style={styles.macroLabel}>FATS</Text>
                        <Text style={styles.macroSub}>{fats * 9} cal</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>BMI</Text>
                        <Text style={styles.statValue}>{bmi || '—'}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>DIET</Text>
                        <Text style={styles.statValue}>{profile?.dietPreference || '—'}</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>MEALS/DAY</Text>
                        <Text style={styles.statValue}>{profile?.mealsPerDay || 4}</Text>
                    </View>
                </View>

                {/* Meal Slots */}
                <Text style={styles.sectionLabel}>TODAY'S MEALS</Text>

                {Array.from({ length: profile?.mealsPerDay || 4 }, (_, i) => {
                    const mealNames = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER', 'POST-WORKOUT', 'LATE SNACK'];
                    return (
                        <TouchableOpacity key={i} style={styles.mealCard} activeOpacity={0.7}>
                            <View style={styles.mealLeft}>
                                <Ionicons name="restaurant-outline" size={20} color={colors.textDim} />
                                <View>
                                    <Text style={styles.mealName}>{mealNames[i] || `MEAL ${i + 1}`}</Text>
                                    <Text style={styles.mealCals}>~{Math.round(tdee / (profile?.mealsPerDay || 4))} cal target</Text>
                                </View>
                            </View>
                            <Ionicons name="add-circle" size={28} color={colors.primary} />
                        </TouchableOpacity>
                    );
                })}

                {/* Water */}
                <Text style={styles.sectionLabel}>HYDRATION</Text>
                <View style={styles.waterCard}>
                    <Ionicons name="water" size={28} color="#4FC3F7" />
                    <View style={styles.waterInfo}>
                        <Text style={styles.waterText}>0 / 8 GLASSES</Text>
                        <View style={styles.waterBar}>
                            <View style={[styles.waterFill, { width: '0%' }]} />
                        </View>
                    </View>
                    <TouchableOpacity style={styles.waterAdd}>
                        <Ionicons name="add" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.comingSoon}>
                    Full nutrition engine with food database coming in Phase 2C
                </Text>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: spacing[12],
        paddingBottom: spacing[4],
    },
    title: {
        ...textStyles.h1,
        color: colors.success,
        fontSize: 28,
    },
    subtitle: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[5],
    },

    // TDEE
    tdeeCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.success,
        padding: spacing[5],
        alignItems: 'center',
        marginBottom: spacing[4],
    },
    tdeeLabel: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    tdeeValue: {
        fontSize: 56,
        fontWeight: '900',
        color: colors.text,
    },
    tdeeUnit: {
        ...textStyles.caption,
        color: colors.textDim,
    },

    // Macros
    macrosRow: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    macroCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        padding: spacing[3],
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    macroLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginTop: 4,
    },
    macroSub: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 8,
        marginTop: 2,
    },

    // Stats
    statsCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[5],
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[1],
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    statValue: {
        ...textStyles.label,
        color: colors.text,
    },

    // Meals
    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[3],
    },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[2],
    },
    mealLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    mealName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    mealCals: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginTop: 2,
    },

    // Water
    waterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        gap: spacing[3],
        marginBottom: spacing[4],
    },
    waterInfo: { flex: 1 },
    waterText: {
        ...textStyles.label,
        color: colors.textSecondary,
        fontSize: 11,
        marginBottom: 4,
    },
    waterBar: {
        height: 4,
        backgroundColor: colors.surfaceLight,
    },
    waterFill: {
        height: '100%',
        backgroundColor: '#4FC3F7',
    },
    waterAdd: {
        width: 36,
        height: 36,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    comingSoon: {
        ...textStyles.caption,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing[2],
        fontSize: 9,
    },
});

export default NutritionHomeScreen;
