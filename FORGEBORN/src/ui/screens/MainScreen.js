/**
 * FORGEBORN — MAIN SCREEN
 * 
 * The warrior's dashboard.
 * Shows:
 * - Current status
 * - Next obligation
 * - Debt level
 * - Create button
 */

import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useCommitmentStore from '../../store/commitmentStore';
import useUserStore from '../../store/userStore';
import useObligationStore, { ObligationStatus } from '../../store/obligationStore';

const MainScreen = ({ onCreateObligation }) => {
    const getDaysSinceCommitment = useCommitmentStore((s) => s.getDaysSinceCommitment);
    const days = getDaysSinceCommitment();

    const obligations = useObligationStore((s) => s.obligations);
    const debtUnits = useObligationStore((s) => s.debtUnits);
    const failureCount = useObligationStore((s) => s.failureCount);
    const getPendingObligations = useObligationStore((s) => s.getPendingObligations);
    const getNextObligation = useObligationStore((s) => s.getNextObligation);
    const tick = useObligationStore((s) => s.tick);

    // DEV reset functions
    const resetUser = useUserStore((s) => s.__devReset);
    const resetCommitment = useCommitmentStore((s) => s.__devReset);
    const resetObligations = useObligationStore((s) => s.__devClearAll);

    const pendingObligations = getPendingObligations();
    const nextObligation = getNextObligation();

    // Tick every second to update statuses
    useEffect(() => {
        tick(); // Initial tick

        const interval = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp) => {
        const now = Date.now();
        const diff = timestamp - now;

        if (diff <= 0) return 'NOW';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    };

    const getStatusColor = () => {
        if (debtUnits > 5) return colors.danger;
        if (debtUnits > 0) return colors.warning;
        return colors.success;
    };

    const getStatusText = () => {
        if (debtUnits > 5) return 'CRITICAL';
        if (debtUnits > 0) return 'IN DEBT';
        return 'OPERATIONAL';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>FORGEBORN</Text>
                    <Text style={styles.subtitle}>DAY {days}</Text>
                </View>

                {/* Status */}
                <View style={styles.statusSection}>
                    <Text style={styles.sectionLabel}>STATUS</Text>
                    <View style={[styles.statusBox, { borderColor: getStatusColor() }]}>
                        <Text style={[styles.statusText, { color: getStatusColor() }]}>
                            {getStatusText()}
                        </Text>
                    </View>
                </View>

                {/* Debt indicator */}
                {debtUnits > 0 && (
                    <View style={styles.debtSection}>
                        <Text style={styles.debtLabel}>DEBT UNITS</Text>
                        <Text style={styles.debtValue}>{debtUnits}</Text>
                        <Text style={styles.debtHint}>
                            {failureCount} failure{failureCount !== 1 ? 's' : ''} recorded
                        </Text>
                    </View>
                )}

                {/* Creed reminder */}
                <Text style={styles.creedReminder}>THERE IS NO TOMORROW</Text>

                {/* Next obligation */}
                <View style={styles.obligationSection}>
                    <Text style={styles.sectionLabel}>NEXT OBLIGATION</Text>

                    {nextObligation ? (
                        <View style={styles.obligationCard}>
                            <View style={styles.obligationHeader}>
                                <Text style={styles.obligationName}>{nextObligation.name}</Text>
                                <Text style={[
                                    styles.obligationStatus,
                                    nextObligation.status === ObligationStatus.BINDING && styles.statusBinding,
                                ]}>
                                    {nextObligation.status}
                                </Text>
                            </View>

                            <View style={styles.obligationDetails}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>UNITS</Text>
                                    <Text style={styles.detailValue}>{nextObligation.unitsRequired}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>DUE IN</Text>
                                    <Text style={styles.detailValue}>{formatTime(nextObligation.scheduledAt)}</Text>
                                </View>
                            </View>

                            {nextObligation.status === ObligationStatus.BINDING && (
                                <Text style={styles.bindingWarning}>
                                    ⚠️ CANNOT BE MODIFIED OR DELETED
                                </Text>
                            )}
                        </View>
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>NO ACTIVE OBLIGATIONS</Text>
                            <Text style={styles.emptyHint}>Schedule your first execution</Text>
                        </View>
                    )}
                </View>

                {/* Pending obligations list */}
                {pendingObligations.length > 1 && (
                    <View style={styles.listSection}>
                        <Text style={styles.sectionLabel}>QUEUE ({pendingObligations.length})</Text>
                        {pendingObligations.slice(1).map((obl) => (
                            <View key={obl.id} style={styles.queueItem}>
                                <Text style={styles.queueName}>{obl.name}</Text>
                                <Text style={styles.queueTime}>{formatTime(obl.scheduledAt)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Spacer for button */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Create button */}
            <TouchableOpacity
                style={styles.createButton}
                onPress={onCreateObligation}
                activeOpacity={0.8}
            >
                <Text style={styles.createText}>+ NEW OBLIGATION</Text>
            </TouchableOpacity>

            {/* Footer creed */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>I DO NOT LOSE. I EXECUTE.</Text>
                <TouchableOpacity
                    style={styles.devResetButton}
                    onLongPress={() => {
                        resetUser();
                        resetCommitment();
                        resetObligations();
                    }}
                    delayLongPress={2000}
                    activeOpacity={0.5}
                >
                    <Text style={styles.devResetText}>HOLD 2s TO RESET (DEV)</Text>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: screen.paddingTop,
    },

    header: {
        alignItems: 'center',
        marginBottom: spacing[6],
    },

    title: {
        ...textStyles.h1,
        color: colors.primary,
        fontSize: 32,
    },

    subtitle: {
        ...textStyles.label,
        color: colors.textSecondary,
        marginTop: spacing[1],
    },

    statusSection: {
        alignItems: 'center',
        marginBottom: spacing[4],
    },

    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[2],
    },

    statusBox: {
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[6],
        borderWidth: 1,
        backgroundColor: colors.surface,
    },

    statusText: {
        ...textStyles.h3,
    },

    debtSection: {
        alignItems: 'center',
        backgroundColor: colors.primaryMuted,
        padding: spacing[4],
        marginBottom: spacing[4],
        borderWidth: 1,
        borderColor: colors.danger,
    },

    debtLabel: {
        ...textStyles.caption,
        color: colors.danger,
    },

    debtValue: {
        fontSize: 48,
        fontWeight: '900',
        color: colors.danger,
    },

    debtHint: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[1],
    },

    creedReminder: {
        ...textStyles.caption,
        color: colors.textDim,
        textAlign: 'center',
        marginBottom: spacing[6],
    },

    obligationSection: {
        marginBottom: spacing[4],
    },

    obligationCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[4],
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

    obligationStatus: {
        ...textStyles.caption,
        color: colors.textDim,
        backgroundColor: colors.background,
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[2],
    },

    statusBinding: {
        color: colors.warning,
        borderWidth: 1,
        borderColor: colors.warning,
    },

    obligationDetails: {
        flexDirection: 'row',
    },

    detailItem: {
        marginRight: spacing[6],
    },

    detailLabel: {
        ...textStyles.caption,
        color: colors.textDim,
    },

    detailValue: {
        ...textStyles.h3,
        color: colors.text,
        marginTop: spacing[1],
    },

    bindingWarning: {
        ...textStyles.caption,
        color: colors.warning,
        marginTop: spacing[3],
    },

    emptyCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[6],
        alignItems: 'center',
    },

    emptyText: {
        ...textStyles.h3,
        color: colors.textSecondary,
    },

    emptyHint: {
        ...textStyles.body,
        color: colors.textDim,
        marginTop: spacing[1],
    },

    listSection: {
        marginBottom: spacing[4],
    },

    queueItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
    },

    queueName: {
        ...textStyles.label,
        color: colors.textSecondary,
    },

    queueTime: {
        ...textStyles.label,
        color: colors.textDim,
    },

    createButton: {
        position: 'absolute',
        bottom: 70,
        left: screen.paddingHorizontal,
        right: screen.paddingHorizontal,
        backgroundColor: colors.primary,
        padding: spacing[4],
        alignItems: 'center',
    },

    createText: {
        ...textStyles.button,
        color: colors.text,
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: spacing[4],
        alignItems: 'center',
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    footerText: {
        ...textStyles.caption,
        color: colors.primary,
    },
    devResetButton: {
        marginTop: spacing[1],
        paddingVertical: spacing[1],
        paddingHorizontal: spacing[3],
    },
    devResetText: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 8,
    },
});

export default MainScreen;
