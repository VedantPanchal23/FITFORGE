import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Vibration,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Card, Typography, Button, ProgressBar } from '../components';
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
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[2] }}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Typography variant="largeTitle">Lookmaxxing</Typography>
                        <Typography variant="subheadline" color={colors.textSecondary} style={{ marginTop: 2 }}>Sharpen the blade. Refine the weapon.</Typography>
                    </View>
                </View>

                {/* Progress cards */}
                <View style={styles.progressRow}>
                    <Card style={[styles.progressCard, status.isAMDone && styles.progressCardDone]}>
                        <View style={styles.progressHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Ionicons name="sunny" size={20} color="#F59E0B" />
                            </View>
                            <Typography variant="title2">{status.amCompleted}/{status.amTotal}</Typography>
                        </View>
                        <Typography variant="caption" color={colors.textDim} style={{ marginBottom: spacing[3] }}>Morning Routine</Typography>
                        <ProgressBar progress={status.amProgress} color="#F59E0B" />
                    </Card>
                    <Card style={[styles.progressCard, status.isPMDone && styles.progressCardDone]}>
                        <View style={styles.progressHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                                <Ionicons name="moon" size={20} color="#6366F1" />
                            </View>
                            <Typography variant="title2">{status.pmCompleted}/{status.pmTotal}</Typography>
                        </View>
                        <Typography variant="caption" color={colors.textDim} style={{ marginBottom: spacing[3] }}>Evening Routine</Typography>
                        <ProgressBar progress={status.pmProgress} color="#6366F1" />
                    </Card>
                </View>

                {/* AM Routine */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="sunny-outline" size={16} color={colors.textDim} />
                    <Typography variant="subheadline" color={colors.textSecondary}>Morning Protocol</Typography>
                </View>
                <Card style={styles.listCard}>
                    {amRoutine.map((item, index) => {
                        const done = isAMDone(item.id);
                        const isLast = index === amRoutine.length - 1;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.routineItem, isLast && { borderBottomWidth: 0 }]}
                                onPress={() => handleAMToggle(item.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                                    {done && <Ionicons name="checkmark" size={16} color={colors.textInverse} />}
                                </View>
                                <View style={styles.routineInfo}>
                                    <Typography
                                        variant="body"
                                        color={done ? colors.textDim : colors.text}
                                        style={done ? { textDecorationLine: 'line-through' } : {}}
                                    >
                                        {item.name}
                                    </Typography>
                                </View>
                                <Ionicons name={item.icon} size={20} color={done ? colors.textDim : '#F59E0B'} />
                            </TouchableOpacity>
                        );
                    })}
                </Card>

                {/* PM Routine */}
                <View style={[styles.sectionHeader, { marginTop: spacing[6] }]}>
                    <Ionicons name="moon-outline" size={16} color={colors.textDim} />
                    <Typography variant="subheadline" color={colors.textSecondary}>Evening Protocol</Typography>
                </View>
                <Card style={styles.listCard}>
                    {pmRoutine.map((item, index) => {
                        const done = isPMDone(item.id);
                        const isLast = index === pmRoutine.length - 1;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.routineItem, isLast && { borderBottomWidth: 0 }]}
                                onPress={() => handlePMToggle(item.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                                    {done && <Ionicons name="checkmark" size={16} color={colors.textInverse} />}
                                </View>
                                <View style={styles.routineInfo}>
                                    <Typography
                                        variant="body"
                                        color={done ? colors.textDim : colors.text}
                                        style={done ? { textDecorationLine: 'line-through' } : {}}
                                    >
                                        {item.name}
                                    </Typography>
                                </View>
                                <Ionicons name={item.icon} size={20} color={done ? colors.textDim : '#6366F1'} />
                            </TouchableOpacity>
                        );
                    })}
                </Card>

                {/* Grooming Schedule */}
                <View style={[styles.sectionHeader, { marginTop: spacing[6] }]}>
                    <Ionicons name="cut-outline" size={16} color={colors.textDim} />
                    <Typography variant="subheadline" color={colors.textSecondary}>Grooming Schedule</Typography>
                </View>
                <Card style={styles.listCard}>
                    {grooming.map((item, index) => {
                        const isDue = isGroomingDue(item);
                        const daysSince = item.lastDone
                            ? Math.floor((Date.now() - new Date(item.lastDone).getTime()) / (1000 * 60 * 60 * 24))
                            : null;
                        const isLast = index === grooming.length - 1;

                        return (
                            <View key={item.id} style={[styles.routineItem, isLast && { borderBottomWidth: 0 }]}>
                                <View style={styles.routineInfo}>
                                    <Typography variant="body" color={isDue ? colors.text : colors.textSecondary}>{item.name}</Typography>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: 2 }}>
                                        <Typography variant="caption" color={colors.textDim}>{item.frequency}</Typography>
                                        {daysSince !== null && (
                                            <>
                                                <Typography variant="caption" color={colors.textDim}>•</Typography>
                                                <Typography variant="caption" color={isDue ? colors.warning : colors.textDim}>
                                                    {daysSince}d ago
                                                </Typography>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={[styles.groomingBtn, isDue ? styles.groomingBtnDue : styles.groomingBtnDone]}
                                    onPress={() => {
                                        markGroomingDone(item.id);
                                        Vibration.vibrate(30);
                                        setRefreshKey(k => k + 1);
                                    }}
                                >
                                    {isDue ? (
                                        <Typography variant="caption" color={colors.primary} style={{ fontWeight: 'bold' }}>Complete</Typography>
                                    ) : (
                                        <Ionicons name="checkmark" size={16} color={colors.success} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </Card>

                {/* Sleep Tracker */}
                <View style={[styles.sectionHeader, { marginTop: spacing[6] }]}>
                    <Ionicons name="moon-outline" size={16} color={colors.textDim} />
                    <Typography variant="subheadline" color={colors.textSecondary}>Sleep Tracker</Typography>
                </View>
                <Card style={styles.sleepCard}>
                    {todaysSleep ? (
                        <View style={styles.sleepLogged}>
                            <View style={styles.sleepStat}>
                                <Typography variant="title1">{todaysSleep.hours}h</Typography>
                                <Typography variant="caption" color={colors.textDim}>Total Sleep</Typography>
                            </View>
                            <View style={styles.sleepDetails}>
                                <View style={styles.sleepDetailRow}>
                                    <Typography variant="caption" color={colors.textDim}>Bedtime</Typography>
                                    <Typography variant="headline">{todaysSleep.bedtime}</Typography>
                                </View>
                                <View style={styles.sleepDetailRow}>
                                    <Typography variant="caption" color={colors.textDim}>Wake Up</Typography>
                                    <Typography variant="headline">{todaysSleep.wakeTime}</Typography>
                                </View>
                            </View>
                            <View style={[styles.sleepBadge, {
                                backgroundColor: todaysSleep.hours >= 7 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            }]}>
                                <Ionicons
                                    name={todaysSleep.hours >= 7 ? 'checkmark-circle' : 'alert-circle'}
                                    size={24}
                                    color={todaysSleep.hours >= 7 ? colors.success : colors.danger}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.sleepForm}>
                            <View style={styles.sleepInputRow}>
                                <View style={styles.sleepInputGroup}>
                                    <Typography variant="caption" color={colors.textDim} style={{ marginBottom: spacing[2] }}>Bedtime</Typography>
                                    <TextInput
                                        style={styles.sleepInput}
                                        value={bedtime}
                                        onChangeText={setBedtime}
                                        placeholder="22:30"
                                        placeholderTextColor={colors.textDim}
                                    />
                                </View>
                                <View style={styles.sleepInputGroup}>
                                    <Typography variant="caption" color={colors.textDim} style={{ marginBottom: spacing[2] }}>Wake Up</Typography>
                                    <TextInput
                                        style={styles.sleepInput}
                                        value={wakeTime}
                                        onChangeText={setWakeTime}
                                        placeholder="06:00"
                                        placeholderTextColor={colors.textDim}
                                    />
                                </View>
                            </View>
                            <Button title="Log Sleep" onPress={handleLogSleep} style={{ marginTop: spacing[4] }} />
                        </View>
                    )}
                </Card>

                {/* Mewing Tracker */}
                <View style={[styles.sectionHeader, { marginTop: spacing[6] }]}>
                    <Ionicons name="fitness-outline" size={16} color={colors.textDim} />
                    <Typography variant="subheadline" color={colors.textSecondary}>Mewing Tracker</Typography>
                </View>
                <Card style={styles.mewingCard}>
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing[4], lineHeight: 20 }}>
                        Keep entire tongue on the roof of mouth, lips sealed, teeth lightly touching. Proper posture builds defined jawline overt time.
                    </Typography>
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
                                <Typography variant="subheadline" color={colors.primary}>+{min}m</Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: spacing[4],
        paddingTop: spacing[12],
        paddingBottom: spacing[8],
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing[6],
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[3],
        paddingLeft: spacing[1],
    },

    // Progress
    progressRow: {
        flexDirection: 'row',
        gap: spacing[4],
        marginBottom: spacing[6],
    },
    progressCard: {
        flex: 1,
        padding: spacing[4],
    },
    progressCardDone: {
        borderColor: colors.success,
        borderWidth: 1,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[3],
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Routine list
    listCard: {
        padding: 0,
        overflow: 'hidden',
    },
    routineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[4],
        paddingHorizontal: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        gap: spacing[3],
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: radius.sm,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxDone: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    routineInfo: {
        flex: 1,
        justifyContent: 'center',
    },

    // Grooming
    groomingBtn: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groomingBtnDue: {
        backgroundColor: colors.primaryMuted,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    groomingBtnDone: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },

    // Sleep
    sleepCard: {
        padding: spacing[5],
    },
    sleepLogged: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sleepStat: {
        alignItems: 'flex-start',
    },
    sleepDetails: {
        flex: 1,
        paddingHorizontal: spacing[6],
        gap: spacing[2],
    },
    sleepDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    sleepBadge: {
        width: 48,
        height: 48,
        borderRadius: radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sleepForm: {},
    sleepInputRow: {
        flexDirection: 'row',
        gap: spacing[4],
    },
    sleepInputGroup: {
        flex: 1,
    },
    sleepInput: {
        backgroundColor: colors.surfaceLight,
        borderRadius: radius.md,
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: spacing[3],
        borderWidth: 1,
        borderColor: colors.borderLight,
    },

    // Mewing
    mewingCard: {
        padding: spacing[5],
    },
    mewingBtns: {
        flexDirection: 'row',
        gap: spacing[3],
    },
    mewingBtn: {
        flex: 1,
        backgroundColor: colors.primaryMuted || 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        paddingVertical: spacing[3],
        borderRadius: radius.md,
        alignItems: 'center',
    },
});

export default LookmaxxingScreen;
