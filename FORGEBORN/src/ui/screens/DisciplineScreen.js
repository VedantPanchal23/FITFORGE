/**
 * FORGEBORN — DISCIPLINE SCREEN
 * 
 * Daily habits, obligations, and accountability.
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
import useObligationStore, { ObligationStatus } from '../../store/obligationStore';

const DEFAULT_HABITS = [
    { id: 'cold_shower', name: 'COLD SHOWER', icon: 'water', streak: 0 },
    { id: 'meditation', name: 'MEDITATE 20 MIN', icon: 'leaf', streak: 0 },
    { id: 'no_social', name: 'NO SOCIAL MEDIA', icon: 'phone-portrait-outline', streak: 0 },
    { id: 'read', name: 'READ 30 PAGES', icon: 'book', streak: 0 },
    { id: 'journal', name: 'JOURNAL', icon: 'pencil', streak: 0 },
    { id: 'sleep', name: 'SLEEP BY 10 PM', icon: 'moon', streak: 0 },
    { id: 'no_junk', name: 'NO JUNK FOOD', icon: 'close-circle', streak: 0 },
    { id: 'sunlight', name: '10 MIN SUNLIGHT', icon: 'sunny', streak: 0 },
];

const DisciplineScreen = ({ onCreateObligation }) => {
    const obligations = useObligationStore((s) => s.obligations);
    const getNextObligation = useObligationStore((s) => s.getNextObligation);
    const getPendingObligations = useObligationStore((s) => s.getPendingObligations);
    const debtUnits = useObligationStore((s) => s.debtUnits);

    const nextObl = getNextObligation();
    const pendingObls = getPendingObligations();

    const formatTime = (timestamp) => {
        const now = Date.now();
        const diff = timestamp - now;
        if (diff <= 0) return 'NOW';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>DISCIPLINE</Text>
                <Text style={styles.subtitle}>NO EXCUSES. NO EXCEPTIONS.</Text>

                {/* Debt warning */}
                {debtUnits > 0 && (
                    <View style={styles.debtCard}>
                        <Ionicons name="warning" size={20} color={colors.danger} />
                        <Text style={styles.debtText}>{debtUnits} DEBT UNITS ACTIVE</Text>
                    </View>
                )}

                {/* Daily Habits */}
                <Text style={styles.sectionLabel}>DAILY HABITS</Text>
                {DEFAULT_HABITS.map((habit) => (
                    <TouchableOpacity key={habit.id} style={styles.habitCard} activeOpacity={0.7}>
                        <View style={styles.habitLeft}>
                            <View style={styles.checkbox}>
                                <Ionicons name="square-outline" size={24} color={colors.textDim} />
                            </View>
                            <View>
                                <Text style={styles.habitName}>{habit.name}</Text>
                                <Text style={styles.habitStreak}>🔥 {habit.streak} day streak</Text>
                            </View>
                        </View>
                        <Ionicons name={habit.icon} size={20} color={colors.textDim} />
                    </TouchableOpacity>
                ))}

                {/* Obligations */}
                <Text style={[styles.sectionLabel, { marginTop: spacing[5] }]}>OBLIGATIONS</Text>

                {pendingObls.length > 0 ? (
                    pendingObls.map((obl) => (
                        <View key={obl.id} style={[styles.oblCard,
                        obl.status === ObligationStatus.BINDING && { borderColor: colors.warning }
                        ]}>
                            <View style={styles.oblHeader}>
                                <Text style={styles.oblName}>{obl.name}</Text>
                                <View style={[styles.oblBadge,
                                { borderColor: obl.status === ObligationStatus.BINDING ? colors.warning : colors.textDim }
                                ]}>
                                    <Text style={[styles.oblBadgeText,
                                    { color: obl.status === ObligationStatus.BINDING ? colors.warning : colors.textDim }
                                    ]}>{obl.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.oblMeta}>
                                {obl.unitsRequired} units • Due in {formatTime(obl.scheduledAt)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyCard}>
                        <Ionicons name="shield-checkmark" size={32} color={colors.textDim} />
                        <Text style={styles.emptyText}>NO ACTIVE OBLIGATIONS</Text>
                    </View>
                )}

                {/* Create button */}
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={onCreateObligation}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={20} color={colors.text} />
                    <Text style={styles.createText}>NEW OBLIGATION</Text>
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: spacing[12],
        paddingBottom: spacing[4],
    },
    title: {
        ...textStyles.h1,
        color: colors.warning,
        fontSize: 28,
    },
    subtitle: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[5],
    },

    // Debt
    debtCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        backgroundColor: colors.primaryMuted,
        borderWidth: 1,
        borderColor: colors.danger,
        padding: spacing[3],
        marginBottom: spacing[4],
    },
    debtText: {
        ...textStyles.label,
        color: colors.danger,
    },

    // Habits
    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[3],
    },
    habitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[2],
    },
    habitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    checkbox: {},
    habitName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    habitStreak: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginTop: 2,
    },

    // Obligations
    oblCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[2],
    },
    oblHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[1],
    },
    oblName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 13,
    },
    oblBadge: {
        borderWidth: 1,
        paddingVertical: 2,
        paddingHorizontal: spacing[1],
    },
    oblBadgeText: {
        ...textStyles.caption,
        fontSize: 8,
    },
    oblMeta: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
    emptyCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[6],
        alignItems: 'center',
        gap: spacing[2],
    },
    emptyText: {
        ...textStyles.label,
        color: colors.textDim,
    },

    // Create
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.warning,
        padding: spacing[3],
        marginTop: spacing[4],
        gap: spacing[2],
    },
    createText: {
        ...textStyles.button,
        color: colors.background,
        fontSize: 14,
    },
});

export default DisciplineScreen;
