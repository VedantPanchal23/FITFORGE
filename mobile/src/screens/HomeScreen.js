import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius, fonts } from '../theme';
import * as PFT from '../services/PFTBridge';

// Components
import CoachHeader from '../components/CoachHeader';
import GradientCard from '../components/GradientCard';
import ProgressRing from '../components/ProgressRing';
import ActionButton from '../components/ActionButton';

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [lifePlan, setLifePlan] = useState(null);
    const [userMode, setUserMode] = useState({ mode: 'normal' });
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const p = await PFT.getProfile();
            setProfile(p);
            const mode = await PFT.getUserMode();
            setUserMode(mode);
            // Generate unified life plan
            const plan = await PFT.generateUnifiedLifePlan();
            setLifePlan(plan);
        } catch (error) {
            console.log('Home load error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    // --- Dynamic Content ---
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 5) return 'Late Night Hustle?';
        if (h < 12) return 'Let\'s crush this morning';
        if (h < 17) return 'Stay focused this afternoon';
        if (h < 22) return 'Finish the day strong';
        return 'Time to recover & sleep';
    };

    const getCoachMessage = () => {
        if (!lifePlan) return "Loading your mission...";
        if (lifePlan.lifeScore >= 90) return "You're absolutely killing it! 🔥";
        if (lifePlan.lifeScore >= 70) return "Solid progress, keep pushing 💪";
        return "Let's get back on track rapidly 🚀";
    };

    // --- Render Helpers ---

    const InfoChip = ({ icon, label, value, color }) => (
        <View style={styles.chip}>
            <View style={[styles.chipIcon, { backgroundColor: color + '20' }]}>
                <Feather name={icon} size={14} color={color} />
            </View>
            <View>
                <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.chipValue, { color: theme.text }]}>{value}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
            >
                {/* 1. Coach Header */}
                <CoachHeader
                    userName={profile?.name || 'Athlete'}
                    greeting={getGreeting()}
                    onProfilePress={() => navigation.navigate('Profile')}
                />

                {/* 2. Hero Section: Life Score & Mission */}
                <View style={styles.heroSection}>
                    <View style={styles.scoreContainer}>
                        <ProgressRing score={lifePlan?.lifeScore || 0} size={140} />
                        <Text style={[styles.coachSubtext, { color: theme.primaryLight }]}>
                            {getCoachMessage()}
                        </Text>
                    </View>
                </View>

                {/* 3. Today's Mission (Horizontal Scroll) */}
                <View style={styles.missionSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>TODAY'S MISSION</Text>
                        <Text style={[styles.sectionDate, { color: theme.textSecondary }]}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                        </Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>

                        {/* Workout Mission */}
                        <GradientCard
                            style={styles.missionCard}
                            onPress={() => navigation.navigate('Body')}
                            variant="glass"
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconCircle, { backgroundColor: theme.error + '20' }]}>
                                    <Feather name="activity" size={20} color={theme.error} />
                                </View>
                                <Text style={[styles.cardTag, { color: theme.error }]}>TRAINING</Text>
                            </View>
                            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                                {profile?.experience_level === 'beginner' ? 'Full Body' : 'Upper/Lower'} Power
                            </Text>
                            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                                45 mins • High Intensity
                            </Text>
                        </GradientCard>

                        {/* Nutrition Mission */}
                        <GradientCard
                            style={styles.missionCard}
                            onPress={() => navigation.navigate('Food')}
                            variant="glass"
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconCircle, { backgroundColor: theme.success + '20' }]}>
                                    <Feather name="coffee" size={20} color={theme.success} />
                                </View>
                                <Text style={[styles.cardTag, { color: theme.success }]}>FUEL</Text>
                            </View>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>
                                {profile?.target_calories || 2000} kcal Target
                            </Text>
                            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                                {profile?.protein_grams || 150}g Protein Goal
                            </Text>
                        </GradientCard>

                        {/* Looks Mission */}
                        <GradientCard
                            style={styles.missionCard}
                            onPress={() => navigation.navigate('Looks')}
                            variant="glass"
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '20' }]}>
                                    <Feather name="smile" size={20} color={theme.primary} />
                                </View>
                                <Text style={[styles.cardTag, { color: theme.primary }]}>GLOW</Text>
                            </View>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>
                                Skincare & Style
                            </Text>
                            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                                Morning Routine
                            </Text>
                        </GradientCard>

                    </ScrollView>
                </View>

                {/* 4. Quick Actions Grid */}
                <View style={styles.gridSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>QUICK ACTIONS</Text>
                    <View style={styles.actionGrid}>
                        <ActionButton
                            label="Check In"
                            icon="check-circle"
                            onPress={() => navigation.navigate('DailyCheckIn')}
                            style={{ flex: 1 }}
                        />
                        <ActionButton
                            label="Log Meal"
                            icon="plus"
                            variant="glass"
                            onPress={() => navigation.navigate('Food')}
                            style={{ flex: 1 }}
                        />
                    </View>
                    <View style={[styles.actionGrid, { marginTop: 12 }]}>
                        <ActionButton
                            label="Weekly Report"
                            icon="bar-chart-2"
                            variant="secondary"
                            onPress={() => navigation.navigate('WeeklyReview')}
                            style={{ flex: 1 }}
                        />
                        <ActionButton
                            label="My Plan"
                            icon="calendar"
                            variant="glass"
                            onPress={() => navigation.navigate('Plan')}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>

                {/* 5. Today's Supplements */}
                {lifePlan?.supplements?.length > 0 && (
                    <View style={styles.supplementSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>TODAY'S SUPPLEMENTS</Text>
                        <GradientCard variant="glass" style={{ marginTop: 12 }}>
                            {lifePlan.supplements.slice(0, 4).map((supp, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.supplementRow,
                                        idx < lifePlan.supplements.slice(0, 4).length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: theme.cardBorder
                                        }
                                    ]}
                                >
                                    <View style={[styles.suppIcon, { backgroundColor: theme.warning + '20' }]}>
                                        <Feather name="zap" size={14} color={theme.warning} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.suppName, { color: theme.text }]}>
                                            {supp.name}
                                        </Text>
                                        <Text style={[styles.suppDosage, { color: theme.textSecondary }]}>
                                            {supp.dosage || supp.dose}
                                        </Text>
                                    </View>
                                    <Text style={[styles.suppTime, { color: theme.primary }]}>
                                        {supp.time || supp.timing || 'Daily'}
                                    </Text>
                                </View>
                            ))}
                        </GradientCard>
                    </View>
                )}

                {/* 5. Coach Insights (Glass Toasts) */}
                {lifePlan?.insights?.length > 0 && (
                    <View style={styles.insightSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>COACH INSIGHTS</Text>
                        {lifePlan.insights.slice(0, 2).map((insight, idx) => (
                            <GradientCard key={idx} variant="glass" style={{ marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <Feather
                                        name="info"
                                        size={20}
                                        color={theme.info}
                                        style={{ marginTop: 2 }}
                                    />
                                    <Text style={{ flex: 1, color: theme.text, fontSize: 14, lineHeight: 20 }}>
                                        {insight.insight}
                                    </Text>
                                </View>
                            </GradientCard>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.md },
    heroSection: {
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    scoreContainer: {
        alignItems: 'center',
        gap: spacing.md
    },
    coachSubtext: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        opacity: 0.9,
        marginTop: 8
    },
    missionSection: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: 4
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    sectionDate: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardScroll: {
        marginHorizontal: -spacing.md, // Bleed to edge
        paddingHorizontal: spacing.md,
    },
    missionCard: {
        width: 160,
        height: 160, // Square cards
        marginRight: spacing.md,
        justifyContent: 'space-between'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardTag: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginTop: 4
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
        lineHeight: 22
    },
    cardSubtitle: {
        fontSize: 12,
        marginTop: 4
    },
    gridSection: {
        marginBottom: spacing.xl,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: spacing.md
    },
    insightSection: {
        marginBottom: spacing.xl
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    chipIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    chipLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    chipValue: { fontSize: 14, fontWeight: '600' },
    // Supplement section styles
    supplementSection: { marginBottom: spacing.xl },
    supplementRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    suppIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    suppName: { fontSize: 14, fontWeight: '600' },
    suppDosage: { fontSize: 12, marginTop: 2 },
    suppTime: { fontSize: 11, fontWeight: '700' }
});

