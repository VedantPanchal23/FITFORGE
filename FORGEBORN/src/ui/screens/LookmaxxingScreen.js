/**
 * FORGEBORN — LOOKMAXXING SCREEN
 * 
 * AM/PM skincare routines, grooming schedule, sleep tracking, mewing timer.
 * Inspired by: BasicBeauty, SkinCare routine apps
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Vibration,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
import useLookmaxxStore from '../../store/lookmaxxStore';

const LookmaxxingScreen = ({ navigation }) => {
    const amRoutine = useLookmaxxStore((s) => s.amRoutine);
    const pmRoutine = useLookmaxxStore((s) => s.pmRoutine);
    const grooming = useLookmaxxStore((s) => s.grooming);
    const toggleAMItem = useLookmaxxStore((s) => s.toggleAMItem);
    const togglePMItem = useLookmaxxStore((s) => s.togglePMItem);
    const isAMDone = useLookmaxxStore((s) => s.isAMDone);
    const isPMDone = useLookmaxxStore((s) => s.isPMDone);
    const markGroomingDone = useLookmaxxStore((s) => s.markGroomingDone);
    const isGroomingDue = useLookmaxxStore((s) => s.isGroomingDue);
    const getTodaysRoutineStatus = useLookmaxxStore((s) => s.getTodaysRoutineStatus);
    const logSleep = useLookmaxxStore((s) => s.logSleep);
    const getTodaysSleep = useLookmaxxStore((s) => s.getTodaysSleep);
    const addMewingMinutes = useLookmaxxStore((s) => s.addMewingMinutes);

    const [bedtime, setBedtime] = useState('22:30');
    const [wakeTime, setWakeTime] = useState('06:00');
    const [refreshKey, setRefreshKey] = useState(0);

    const status = getTodaysRoutineStatus();
    const todaysSleep = getTodaysSleep();

    const handleAMToggle = (id) => {
        toggleAMItem(id);
        Vibration.vibrate(30);
        setRefreshKey(k => k + 1);
    };

    const handlePMToggle = (id) => {
        togglePMItem(id);
        Vibration.vibrate(30);
        setRefreshKey(k => k + 1);
    };

    const handleLogSleep = () => {
        logSleep(bedtime, wakeTime);
        Vibration.vibrate(50);
        setRefreshKey(k => k + 1);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>LOOKMAXXING</Text>
                </View>
                <Text style={styles.subtitle}>SHARPEN THE BLADE. REFINE THE WEAPON.</Text>

                {/* Progress cards */}
                <View style={styles.progressRow}>
                    <View style={[styles.progressCard, status.isAMDone && styles.progressCardDone]}>
                        <Ionicons name="sunny-outline" size={22} color={colors.primary} />
                        <Text style={styles.progressNum}>{status.amCompleted}/{status.amTotal}</Text>
                        <Text style={styles.progressLabel}>AM ROUTINE</Text>
                        <View style={styles.miniBarBg}>
                            <View style={[styles.miniBarFill, { width: `${status.amProgress * 100}%` }]} />
                        </View>
                    </View>
                    <View style={[styles.progressCard, status.isPMDone && styles.progressCardDone]}>
                        <Ionicons name="moon-outline" size={22} color={colors.primary} />
                        <Text style={styles.progressNum}>{status.pmCompleted}/{status.pmTotal}</Text>
                        <Text style={styles.progressLabel}>PM ROUTINE</Text>
                        <View style={styles.miniBarBg}>
                            <View style={[styles.miniBarFill, { width: `${status.pmProgress * 100}%` }]} />
                        </View>
                    </View>
                </View>

                {/* AM Routine */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="sunny-outline" size={14} color={colors.textDim} />
                    <Text style={styles.sectionLabel}>MORNING PROTOCOL</Text>
                </View>
                {amRoutine.map((item) => {
                    const done = isAMDone(item.id);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.routineItem, done && styles.routineItemDone]}
                            onPress={() => handleAMToggle(item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, done && styles.checkboxDone]}>
                                {done && <Ionicons name="checkmark" size={14} color="#000" />}
                            </View>
                            <Ionicons name={item.icon} size={16} color={colors.textSecondary} />
                            <Text style={[styles.routineName, done && styles.routineNameDone]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                {/* PM Routine */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing[5] }}>
                    <Ionicons name="moon-outline" size={14} color={colors.textDim} />
                    <Text style={styles.sectionLabel}>EVENING PROTOCOL</Text>
                </View>
                {pmRoutine.map((item) => {
                    const done = isPMDone(item.id);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.routineItem, done && styles.routineItemDone]}
                            onPress={() => handlePMToggle(item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, done && styles.checkboxDone]}>
                                {done && <Ionicons name="checkmark" size={14} color="#000" />}
                            </View>
                            <Ionicons name={item.icon} size={16} color={colors.textSecondary} />
                            <Text style={[styles.routineName, done && styles.routineNameDone]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                {/* Grooming Schedule */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing[5] }}>
                    <Ionicons name="cut-outline" size={14} color={colors.textDim} />
                    <Text style={styles.sectionLabel}>GROOMING SCHEDULE</Text>
                </View>
                {grooming.map((item) => {
                    const isDue = isGroomingDue(item);
                    const daysSince = item.lastDone
                        ? Math.floor((Date.now() - new Date(item.lastDone).getTime()) / (1000 * 60 * 60 * 24))
                        : null;

                    return (
                        <View key={item.id} style={[styles.groomingItem, isDue && styles.groomingDue]}>
                            <View style={styles.groomingLeft}>
                                <Ionicons name={item.icon} size={16} color={colors.textSecondary} />
                                <View>
                                    <Text style={styles.groomingName}>{item.name}</Text>
                                    <Text style={styles.groomingFreq}>{item.frequency}</Text>
                                </View>
                            </View>
                            <View style={styles.groomingRight}>
                                {daysSince !== null && (
                                    <Text style={[styles.groomingSince, isDue && { color: colors.warning }]}>
                                        {daysSince}d ago
                                    </Text>
                                )}
                                <TouchableOpacity
                                    style={[styles.groomingBtn, !isDue && { opacity: 0.4 }]}
                                    onPress={() => {
                                        markGroomingDone(item.id);
                                        Vibration.vibrate(30);
                                        setRefreshKey(k => k + 1);
                                    }}
                                >
                                    <Ionicons name="checkmark" size={14} color={isDue ? '#000' : colors.textDim} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}

                {/* Sleep Tracker */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing[5] }}>
                    <Ionicons name="moon-outline" size={14} color={colors.textDim} />
                    <Text style={styles.sectionLabel}>SLEEP</Text>
                </View>
                <View style={styles.sleepCard}>
                    {todaysSleep ? (
                        <View style={styles.sleepLogged}>
                            <View style={styles.sleepStat}>
                                <Text style={styles.sleepStatVal}>{todaysSleep.hours}h</Text>
                                <Text style={styles.sleepStatLabel}>SLEPT</Text>
                            </View>
                            <View style={styles.sleepStat}>
                                <Text style={styles.sleepStatVal}>{todaysSleep.bedtime}</Text>
                                <Text style={styles.sleepStatLabel}>BED</Text>
                            </View>
                            <View style={styles.sleepStat}>
                                <Text style={styles.sleepStatVal}>{todaysSleep.wakeTime}</Text>
                                <Text style={styles.sleepStatLabel}>WAKE</Text>
                            </View>
                            <View style={[styles.sleepBadge, {
                                backgroundColor: todaysSleep.hours >= 7 ? colors.success : colors.danger,
                            }]}>
                                <Ionicons
                                    name={todaysSleep.hours >= 7 ? 'checkmark-circle' : 'alert-circle'}
                                    size={18}
                                    color={todaysSleep.hours >= 7 ? '#fff' : '#fff'}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.sleepForm}>
                            <View style={styles.sleepInputRow}>
                                <View style={styles.sleepInputGroup}>
                                    <Text style={styles.sleepInputLabel}>BEDTIME</Text>
                                    <TextInput
                                        style={styles.sleepInput}
                                        value={bedtime}
                                        onChangeText={setBedtime}
                                        placeholder="22:30"
                                        placeholderTextColor={colors.textDim}
                                    />
                                </View>
                                <View style={styles.sleepInputGroup}>
                                    <Text style={styles.sleepInputLabel}>WAKE UP</Text>
                                    <TextInput
                                        style={styles.sleepInput}
                                        value={wakeTime}
                                        onChangeText={setWakeTime}
                                        placeholder="06:00"
                                        placeholderTextColor={colors.textDim}
                                    />
                                </View>
                            </View>
                            <TouchableOpacity style={styles.sleepLogBtn} onPress={handleLogSleep}>
                                <Text style={styles.sleepLogBtnText}>LOG SLEEP</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Mewing Tracker */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing[5] }}>
                    <Ionicons name="fitness-outline" size={14} color={colors.textDim} />
                    <Text style={styles.sectionLabel}>MEWING</Text>
                </View>
                <View style={styles.mewingCard}>
                    <Text style={styles.mewingDesc}>
                        Keep tongue on roof of mouth. Proper tongue posture builds jawline.
                    </Text>
                    <View style={styles.mewingBtns}>
                        {[5, 10, 15, 30].map(min => (
                            <TouchableOpacity
                                key={min}
                                style={styles.mewingBtn}
                                onPress={() => {
                                    addMewingMinutes(min);
                                    Vibration.vibrate(50);
                                    setRefreshKey(k => k + 1);
                                }}
                            >
                                <Text style={styles.mewingBtnText}>+{min}m</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

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

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    title: {
        ...textStyles.h1,
        color: colors.primary,
        fontSize: 24,
    },
    subtitle: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[4],
    },

    sectionLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        marginBottom: spacing[2],
    },

    // Progress
    progressRow: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[4],
    },
    progressCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        alignItems: 'center',
    },
    progressCardDone: {
        borderColor: colors.success,
    },
    progressIcon: { fontSize: 22, marginBottom: spacing[1] },
    progressNum: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.text,
    },
    progressLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginBottom: spacing[1],
    },
    miniBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: colors.background,
        overflow: 'hidden',
    },
    miniBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },

    // Routine item
    routineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
        gap: spacing[2],
    },
    routineItemDone: {
        borderColor: colors.success,
        opacity: 0.7,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: colors.textDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxDone: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    routineIcon: { fontSize: 16 },
    routineName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    routineNameDone: {
        textDecorationLine: 'line-through',
        color: colors.textDim,
    },

    // Grooming
    groomingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
        marginBottom: spacing[1],
    },
    groomingDue: {
        borderColor: colors.warning,
    },
    groomingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    groomingIcon: { fontSize: 16 },
    groomingName: {
        ...textStyles.label,
        color: colors.text,
        fontSize: 12,
    },
    groomingFreq: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
    },
    groomingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    groomingSince: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 10,
    },
    groomingBtn: {
        width: 26,
        height: 26,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Sleep
    sleepCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
    },
    sleepLogged: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    sleepStat: {
        alignItems: 'center',
    },
    sleepStatVal: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.text,
    },
    sleepStatLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 8,
    },
    sleepBadge: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sleepBadgeText: { fontSize: 14 },
    sleepForm: {},
    sleepInputRow: {
        flexDirection: 'row',
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    sleepInputGroup: {
        flex: 1,
    },
    sleepInputLabel: {
        ...textStyles.caption,
        color: colors.textDim,
        fontSize: 9,
        marginBottom: 4,
    },
    sleepInput: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        padding: spacing[2],
    },
    sleepLogBtn: {
        backgroundColor: colors.primary,
        padding: spacing[2],
        alignItems: 'center',
    },
    sleepLogBtnText: {
        ...textStyles.button,
        color: '#000',
        fontSize: 11,
    },

    // Mewing
    mewingCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[3],
    },
    mewingDesc: {
        ...textStyles.caption,
        color: colors.textSecondary,
        fontSize: 10,
        marginBottom: spacing[2],
    },
    mewingBtns: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    mewingBtn: {
        flex: 1,
        backgroundColor: colors.primaryMuted,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: spacing[2],
        alignItems: 'center',
    },
    mewingBtnText: {
        ...textStyles.label,
        color: colors.primary,
        fontSize: 11,
    },
});

export default LookmaxxingScreen;
