/**
 * FORGEBORN — DASHBOARD SCREEN
 * 
 * The warrior's command center.
 * Everything you need for today — at a glance.
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles, fontSize } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useCommitmentStore from '../../store/commitmentStore';
import useUserStore from '../../store/userStore';
import useObligationStore, { ObligationStatus } from '../../store/obligationStore';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
    const [greeting, setGreeting] = useState('');

    // User data
    const profile = useUserStore((s) => s.profile);
    const userName = profile?.name || 'WARRIOR';

    // Commitment data
    const getDaysSinceCommitment = useCommitmentStore((s) => s.getDaysSinceCommitment);
    const days = getDaysSinceCommitment();

    // Obligation data
    const obligations = useObligationStore((s) => s.obligations);
    const debtUnits = useObligationStore((s) => s.debtUnits);
    const failureCount = useObligationStore((s) => s.failureCount);
    const getNextObligation = useObligationStore((s) => s.getNextObligation);
    const getPendingObligations = useObligationStore((s) => s.getPendingObligations);
    const tick = useObligationStore((s) => s.tick);

    const nextObligation = getNextObligation();
    const pendingCount = getPendingObligations().length;

    // Stats
    const completedToday = obligations.filter(
        o => o.status === ObligationStatus.EXECUTED &&
            new Date(o.createdAt).toDateString() === new Date().toDateString()
    ).length;

    const totalExecuted = obligations.filter(o => o.status === ObligationStatus.EXECUTED).length;

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 5) setGreeting('STILL GRINDING');
        else if (hour < 12) setGreeting('GOOD MORNING');
        else if (hour < 17) setGreeting('KEEP PUSHING');
        else if (hour < 21) setGreeting('EVENING PROTOCOL');
        else setGreeting('NIGHT OPS');

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp) => {
        const now = Date.now();
        const diff = timestamp - now;
        if (diff <= 0) return 'NOW';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusInfo = () => {
        if (debtUnits > 5) return { text: 'CRITICAL', color: colors.danger, icon: 'warning' };
        if (debtUnits > 0) return { text: 'IN DEBT', color: colors.warning, icon: 'alert-circle' };
        return { text: 'OPERATIONAL', color: colors.success, icon: 'shield-checkmark' };
    };

    const status = getStatusInfo();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{greeting}</Text>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>
                    <View style={styles.dayBadge}>
                        <Text style={styles.dayNumber}>{days}</Text>
                        <Text style={styles.dayLabel}>DAYS</Text>
                    </View>
                </View>

                {/* Status Card */}
                <View style={[styles.statusCard, { borderColor: status.color }]}>
                    <View style={styles.statusRow}>
                        <Ionicons name={status.icon} size={20} color={status.color} />
                        <Text style={[styles.statusText, { color: status.color }]}>
                            {status.text}
                        </Text>
                    </View>
                    {debtUnits > 0 && (
                        <Text style={styles.debtText}>
                            {debtUnits} DEBT UNITS • {failureCount} FAILURES
                        </Text>
                    )}
                </View>

                {/* Quick Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        <Text style={styles.statNumber}>{totalExecuted}</Text>
                        <Text style={styles.statLabel}>EXECUTED</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="flame" size={24} color={colors.primary} />
                        <Text style={styles.statNumber}>{completedToday}</Text>
                        <Text style={styles.statLabel}>TODAY</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="hourglass" size={24} color={colors.warning} />
                        <Text style={styles.statNumber}>{pendingCount}</Text>
                        <Text style={styles.statLabel}>PENDING</Text>
                    </View>
                </View>

                {/* Today's Sections */}
                <Text style={styles.sectionTitle}>TODAY'S MISSION</Text>

                {/* Workout Card */}
                <TouchableOpacity style={styles.missionCard} activeOpacity={0.7}>
                    <View style={styles.missionHeader}>
                        <View style={styles.missionIconBox}>
                            <Ionicons name="barbell" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.missionInfo}>
                            <Text style={styles.missionTitle}>WORKOUT</Text>
                            <Text style={styles.missionSub}>
                                {profile?.fitnessGoal?.length > 0
                                    ? profile.fitnessGoal.join(' • ')
                                    : 'Set up your plan'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                    </View>
                    <View style={styles.missionProgress}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '0%' }]} />
                        </View>
                        <Text style={styles.progressText}>Not started</Text>
                    </View>
                </TouchableOpacity>

                {/* Nutrition Card */}
                <TouchableOpacity style={styles.missionCard} activeOpacity={0.7}>
                    <View style={styles.missionHeader}>
                        <View style={[styles.missionIconBox, { borderColor: colors.success }]}>
                            <Ionicons name="nutrition" size={24} color={colors.success} />
                        </View>
                        <View style={styles.missionInfo}>
                            <Text style={styles.missionTitle}>NUTRITION</Text>
                            <Text style={styles.missionSub}>
                                {profile?.dietPreference || 'Track your meals'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                    </View>
                    <View style={styles.missionProgress}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '0%', backgroundColor: colors.success }]} />
                        </View>
                        <Text style={styles.progressText}>0 / {profile?.mealsPerDay || 4} meals</Text>
                    </View>
                </TouchableOpacity>

                {/* Habits Card */}
                <TouchableOpacity style={styles.missionCard} activeOpacity={0.7}>
                    <View style={styles.missionHeader}>
                        <View style={[styles.missionIconBox, { borderColor: colors.warning }]}>
                            <Ionicons name="flash" size={24} color={colors.warning} />
                        </View>
                        <View style={styles.missionInfo}>
                            <Text style={styles.missionTitle}>DISCIPLINE</Text>
                            <Text style={styles.missionSub}>Daily habits & obligations</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                    </View>
                    <View style={styles.missionProgress}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: '0%', backgroundColor: colors.warning }]} />
                        </View>
                        <Text style={styles.progressText}>0 habits tracked</Text>
                    </View>
                </TouchableOpacity>

                {/* Next Obligation */}
                {nextObligation && (
                    <>
                        <Text style={styles.sectionTitle}>NEXT OBLIGATION</Text>
                        <View style={[styles.obligationCard,
                        nextObligation.status === ObligationStatus.BINDING && styles.obligationBinding
                        ]}>
                            <View style={styles.obligationHeader}>
                                <Text style={styles.obligationName}>{nextObligation.name}</Text>
                                <View style={[styles.statusBadge,
                                { borderColor: nextObligation.status === ObligationStatus.BINDING ? colors.warning : colors.textDim }
                                ]}>
                                    <Text style={[styles.statusBadgeText,
                                    { color: nextObligation.status === ObligationStatus.BINDING ? colors.warning : colors.textDim }
                                    ]}>
                                        {nextObligation.status}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.obligationMeta}>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>UNITS</Text>
                                    <Text style={styles.metaValue}>{nextObligation.unitsRequired}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>DUE IN</Text>
                                    <Text style={styles.metaValue}>{formatTime(nextObligation.scheduledAt)}</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* Creed */}
                <View style={styles.creedBox}>
                    <Text style={styles.creedText}>THERE IS NO TOMORROW.</Text>
                    <Text style={styles.creedText}>I DO NOT LOSE. I EXECUTE.</Text>
                </View>

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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: spacing[12],
        paddingBottom: spacing[4],
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[5],
    },
    greeting: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    userName: {
        ...textStyles.h1,
        color: colors.text,
        fontSize: 28,
    },
    dayBadge: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[3],
    },
    dayNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.primary,
    },
    dayLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },

    // Status
    statusCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        padding: spacing[3],
        marginBottom: spacing[4],
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    statusText: {
        ...textStyles.h3,
    },
    debtText: {
        ...textStyles.caption,
        color: colors.danger,
        marginTop: spacing[1],
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[5],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        alignItems: 'center',
        gap: spacing[1],
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.text,
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },

    // Section
    sectionTitle: {
        ...textStyles.label,
        color: colors.textDim,
        marginBottom: spacing[3],
    },

    // Mission Cards
    missionCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[4],
        marginBottom: spacing[3],
    },
    missionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[3],
    },
    missionIconBox: {
        width: 44,
        height: 44,
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing[3],
    },
    missionInfo: {
        flex: 1,
    },
    missionTitle: {
        ...textStyles.h3,
        color: colors.text,
        fontSize: 16,
    },
    missionSub: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: 2,
    },
    missionProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: colors.surfaceLight,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    progressText: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        minWidth: 70,
        textAlign: 'right',
    },

    // Obligation Card
    obligationCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[4],
        marginBottom: spacing[4],
    },
    obligationBinding: {
        borderColor: colors.warning,
    },
    obligationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[3],
    },
    obligationName: {
        ...textStyles.h3,
        color: colors.text,
        flex: 1,
    },
    statusBadge: {
        borderWidth: 1,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
    },
    statusBadgeText: {
        ...textStyles.caption,
        fontSize: 9,
    },
    obligationMeta: {
        flexDirection: 'row',
        gap: spacing[6],
    },
    metaItem: {},
    metaLabel: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    metaValue: {
        ...textStyles.h3,
        color: colors.text,
        marginTop: 2,
    },

    // Creed
    creedBox: {
        alignItems: 'center',
        paddingVertical: spacing[6],
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: spacing[2],
    },
    creedText: {
        ...textStyles.caption,
        color: colors.primaryMuted,
        fontSize: 10,
        marginVertical: 2,
    },
});

export default DashboardScreen;
