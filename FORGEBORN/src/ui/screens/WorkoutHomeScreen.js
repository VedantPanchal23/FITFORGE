/**
 * FORGEBORN — WORKOUT HOME SCREEN (Placeholder)
 * 
 * Today's workout plan with exercise demonstrations.
 * Phase 2B will add the full workout engine.
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

const WorkoutHomeScreen = () => {
    const profile = useUserStore((s) => s.profile);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>WORKOUT</Text>
                <Text style={styles.subtitle}>TODAY'S TRAINING</Text>

                {/* Training Day Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={18} color={colors.primary} />
                        <Text style={styles.infoText}>
                            {profile?.trainingDaysPerWeek || 5} DAYS / WEEK
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="fitness" size={18} color={colors.primary} />
                        <Text style={styles.infoText}>
                            {profile?.fitnessGoal?.join(' • ') || 'FULL BODY'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="trending-up" size={18} color={colors.primary} />
                        <Text style={styles.infoText}>
                            {profile?.experienceLevel || 'INTERMEDIATE'}
                        </Text>
                    </View>
                </View>

                {/* Placeholder Exercises */}
                <Text style={styles.sectionLabel}>EXERCISES</Text>

                {[
                    { name: 'BENCH PRESS', sets: '4 × 8-10', muscle: 'Chest', icon: 'barbell' },
                    { name: 'SQUATS', sets: '4 × 8-10', muscle: 'Legs', icon: 'body' },
                    { name: 'DEADLIFT', sets: '3 × 5', muscle: 'Back', icon: 'barbell' },
                    { name: 'PULL-UPS', sets: '4 × MAX', muscle: 'Back', icon: 'fitness' },
                    { name: 'OVERHEAD PRESS', sets: '3 × 8-10', muscle: 'Shoulders', icon: 'barbell' },
                ].map((exercise, index) => (
                    <TouchableOpacity key={index} style={styles.exerciseCard} activeOpacity={0.7}>
                        <View style={styles.exerciseNumber}>
                            <Text style={styles.exerciseNumText}>{index + 1}</Text>
                        </View>
                        <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Text style={styles.exerciseMuscle}>{exercise.muscle}</Text>
                        </View>
                        <View style={styles.exerciseSets}>
                            <Text style={styles.setsText}>{exercise.sets}</Text>
                        </View>
                        <Ionicons name="play-circle" size={28} color={colors.primary} />
                    </TouchableOpacity>
                ))}

                {/* Start Button */}
                <TouchableOpacity style={styles.startButton} activeOpacity={0.8}>
                    <Ionicons name="play" size={22} color={colors.text} />
                    <Text style={styles.startText}>START WORKOUT</Text>
                </TouchableOpacity>

                <Text style={styles.comingSoon}>
                    Full workout engine coming in Phase 2B
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: screen.paddingHorizontal,
        paddingTop: spacing[12],
        paddingBottom: spacing[4],
    },
    title: {
        ...textStyles.h1,
        color: colors.primary,
        fontSize: 28,
    },
    subtitle: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[5],
    },
    infoCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[4],
        marginBottom: spacing[5],
        gap: spacing[2],
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    infoText: {
        ...textStyles.label,
        color: colors.textSecondary,
    },
    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[3],
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[2],
        gap: spacing[3],
    },
    exerciseNumber: {
        width: 32,
        height: 32,
        backgroundColor: colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exerciseNumText: {
        fontSize: 14,
        fontWeight: '900',
        color: colors.primary,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 13,
    },
    exerciseMuscle: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginTop: 2,
    },
    exerciseSets: {
        paddingHorizontal: spacing[2],
    },
    setsText: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 11,
    },
    startButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4],
        marginTop: spacing[4],
        gap: spacing[2],
    },
    startText: {
        ...textStyles.button,
        color: colors.text,
    },
    comingSoon: {
        ...textStyles.caption,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing[4],
        fontSize: 9,
    },
});

export default WorkoutHomeScreen;
