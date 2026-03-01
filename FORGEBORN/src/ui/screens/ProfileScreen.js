/**
 * FORGEBORN — PROFILE SCREEN
 * 
 * User stats, lookmaxxing protocol, progress tracking.
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
import useCommitmentStore from '../../store/commitmentStore';

const ProfileScreen = () => {
    const profile = useUserStore((s) => s.profile);
    const getBMI = useUserStore((s) => s.getBMI);
    const getDaysSinceCommitment = useCommitmentStore((s) => s.getDaysSinceCommitment);

    const bmi = getBMI();
    const days = getDaysSinceCommitment();

    // DEV reset
    const resetUser = useUserStore((s) => s.__devReset);
    const resetCommitment = useCommitmentStore((s) => s.__devReset);

    const getBMICategory = () => {
        if (!bmi) return '';
        if (bmi < 18.5) return 'UNDERWEIGHT';
        if (bmi < 25) return 'NORMAL';
        if (bmi < 30) return 'OVERWEIGHT';
        return 'OBESE';
    };

    const LOOKMAXX_AM = [
        { name: 'WASH FACE', icon: 'water' },
        { name: 'SUNSCREEN SPF 50', icon: 'sunny' },
        { name: 'MOISTURIZER', icon: 'sparkles' },
        { name: 'LIP BALM', icon: 'ellipse' },
        { name: 'MEWING', icon: 'fitness' },
        { name: 'POSTURE CHECK', icon: 'body' },
    ];

    const LOOKMAXX_PM = [
        { name: 'CLEANSER', icon: 'water' },
        { name: 'RETINOL/SERUM', icon: 'flask' },
        { name: 'MOISTURIZER', icon: 'sparkles' },
        { name: 'ICE FACE', icon: 'snow' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>PROFILE</Text>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(profile?.name || 'W')[0]}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile?.name || 'WARRIOR'}</Text>
                        <Text style={styles.profileSub}>
                            {profile?.gender} • {profile?.age} YRS • DAY {days}
                        </Text>
                    </View>
                </View>

                {/* Body Stats */}
                <Text style={styles.sectionLabel}>BODY STATS</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{profile?.weight || '—'}</Text>
                        <Text style={styles.statUnit}>KG</Text>
                        <Text style={styles.statLabel}>WEIGHT</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{profile?.height || '—'}</Text>
                        <Text style={styles.statUnit}>CM</Text>
                        <Text style={styles.statLabel}>HEIGHT</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{bmi || '—'}</Text>
                        <Text style={styles.statUnit}>{getBMICategory()}</Text>
                        <Text style={styles.statLabel}>BMI</Text>
                    </View>
                </View>

                {/* Training Info */}
                <Text style={styles.sectionLabel}>TRAINING PROFILE</Text>
                <View style={styles.infoCard}>
                    {[
                        { label: 'GOALS', value: profile?.fitnessGoal?.join(', ') || '—' },
                        { label: 'LEVEL', value: profile?.experienceLevel || '—' },
                        { label: 'TRAINING DAYS', value: `${profile?.trainingDaysPerWeek || 5}/WEEK` },
                        { label: 'CARDIO', value: profile?.wantsCardio ? (profile?.cardioTypes?.join(', ') || 'YES') : 'NO' },
                        { label: 'YOGA', value: profile?.wantsYoga ? 'YES' : 'NO' },
                        { label: 'DIET', value: profile?.dietPreference || '—' },
                        { label: 'MEALS/DAY', value: `${profile?.mealsPerDay || 4}` },
                    ].map((item, i) => (
                        <View key={i} style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{item.label}</Text>
                            <Text style={styles.infoValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Lookmaxxing - AM */}
                <Text style={styles.sectionLabel}>☀️ LOOKMAXXING — MORNING</Text>
                {LOOKMAXX_AM.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.lookCard} activeOpacity={0.7}>
                        <View style={styles.lookLeft}>
                            <Ionicons name="square-outline" size={22} color={colors.textDim} />
                            <Text style={styles.lookText}>{item.name}</Text>
                        </View>
                        <Ionicons name={item.icon} size={18} color={colors.textDim} />
                    </TouchableOpacity>
                ))}

                {/* Lookmaxxing - PM */}
                <Text style={[styles.sectionLabel, { marginTop: spacing[4] }]}>🌙 LOOKMAXXING — NIGHT</Text>
                {LOOKMAXX_PM.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.lookCard} activeOpacity={0.7}>
                        <View style={styles.lookLeft}>
                            <Ionicons name="square-outline" size={22} color={colors.textDim} />
                            <Text style={styles.lookText}>{item.name}</Text>
                        </View>
                        <Ionicons name={item.icon} size={18} color={colors.textDim} />
                    </TouchableOpacity>
                ))}

                {/* DEV Reset */}
                <TouchableOpacity
                    style={styles.devReset}
                    onLongPress={() => { resetUser(); resetCommitment(); }}
                    delayLongPress={3000}
                    activeOpacity={0.5}
                >
                    <Text style={styles.devResetText}>HOLD 3s TO RESET ALL DATA (DEV)</Text>
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
        color: colors.text,
        fontSize: 28,
        marginBottom: spacing[4],
    },

    // Profile Card
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: spacing[4],
        marginBottom: spacing[5],
        gap: spacing[4],
    },
    avatar: {
        width: 56,
        height: 56,
        backgroundColor: colors.primaryMuted,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.primary,
    },
    profileInfo: { flex: 1 },
    profileName: {
        ...textStyles.h2,
        color: colors.text,
        fontSize: 20,
    },
    profileSub: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: 2,
    },

    // Stats Grid
    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[3],
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[5],
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.text,
    },
    statUnit: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },
    statLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginTop: spacing[1],
    },

    // Info Card
    infoCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[5],
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        ...textStyles.caption,
        color: colors.textDim,
    },
    infoValue: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 11,
        maxWidth: '60%',
        textAlign: 'right',
    },

    // Lookmaxxing
    lookCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
    },
    lookLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    lookText: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },

    // DEV
    devReset: {
        alignItems: 'center',
        paddingVertical: spacing[4],
        marginTop: spacing[6],
    },
    devResetText: {
        ...textStyles.caption,
        color: colors.textMuted,
        fontSize: 9,
    },
});

export default ProfileScreen;
