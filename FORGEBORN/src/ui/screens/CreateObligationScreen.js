import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Typography, Button, Card } from '../components';
import useObligationStore, { ObligationType } from '../../store/obligationStore';

const PRESET_OBLIGATIONS = [
    { name: '100 PUSH-UPS', type: ObligationType.WORKOUT, units: 100 },
    { name: '50 PULL-UPS', type: ObligationType.WORKOUT, units: 50 },
    { name: '200 SQUATS', type: ObligationType.WORKOUT, units: 200 },
    { name: '5K RUN', type: ObligationType.WORKOUT, units: 1 },
    { name: 'COLD SHOWER', type: ObligationType.HABIT, units: 1 },
    { name: 'NO SOCIAL MEDIA', type: ObligationType.HABIT, units: 1 },
    { name: 'READ 30 PAGES', type: ObligationType.HABIT, units: 30 },
    { name: 'MEDITATE 20 MIN', type: ObligationType.HABIT, units: 1 },
];

const TIME_PRESETS = [
    { label: 'NOW', minutes: 0 },
    { label: '1 MIN', minutes: 1 },
    { label: '5 MIN', minutes: 5 },
    { label: '1 HOUR', minutes: 60 },
    { label: 'TOMORROW', minutes: 24 * 60 },
];

const CreateObligationScreen = ({ navigation }) => {
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customName, setCustomName] = useState('');
    const [customUnits, setCustomUnits] = useState('1');
    const [selectedTime, setSelectedTime] = useState(null);

    const createObligation = useObligationStore((s) => s.createObligation);
    const tick = useObligationStore((s) => s.tick);

    const handlePresetSelect = (preset) => {
        Vibration.vibrate(30);
        setSelectedPreset(preset);
        setCustomName(preset.name);
        setCustomUnits(preset.units.toString());
    };

    const handleTimeSelect = (preset) => {
        Vibration.vibrate(30);
        setSelectedTime(preset);
    };

    const handleCreate = () => {
        if (!customName || !customUnits || !selectedTime) return;

        Vibration.vibrate([0, 50, 100, 50]);

        const scheduledAt = Date.now() + (selectedTime.minutes * 60 * 1000);
        const units = parseInt(customUnits, 10);
        const type = selectedPreset?.type || ObligationType.CUSTOM;

        createObligation(type, customName, units, scheduledAt);

        // Immediately tick to update status
        setTimeout(() => {
            tick();
        }, 100);

        navigation.goBack();
    };

    const canCreate = customName && customUnits && selectedTime;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={28} color={colors.textSecondary} />
                </TouchableOpacity>
                <Typography variant="h3" style={styles.title}>New Obligation</Typography>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Warning */}
                <View style={styles.warningBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Ionicons name="alert-circle" size={16} color={colors.primary} />
                        <Typography variant="caption" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                            ONCE SCHEDULED, YOU WILL BE HELD ACCOUNTABLE
                        </Typography>
                    </View>
                </View>

                {/* Presets */}
                <Typography variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
                    QUICK SELECT
                </Typography>
                <View style={styles.presetsGrid}>
                    {PRESET_OBLIGATIONS.map((preset, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.presetButton,
                                selectedPreset?.name === preset.name && styles.presetButtonActive,
                            ]}
                            onPress={() => handlePresetSelect(preset)}
                            activeOpacity={0.7}
                        >
                            <Typography
                                variant="caption"
                                style={[
                                    { fontWeight: '700' },
                                    selectedPreset?.name === preset.name ? { color: colors.primaryDark } : { color: colors.textSecondary }
                                ]}
                                numberOfLines={1}
                            >
                                {preset.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                style={[
                                    { marginTop: 2, fontSize: 10 },
                                    selectedPreset?.name === preset.name ? { color: colors.primary } : { color: colors.textDim }
                                ]}
                            >
                                {preset.units} UNITS
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom input */}
                <Typography variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
                    OR CUSTOMIZE
                </Typography>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="OBLIGATION NAME"
                        placeholderTextColor={colors.textDim}
                        value={customName}
                        onChangeText={setCustomName}
                        autoCapitalize="characters"
                    />
                </View>

                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.unitsInput]}
                        placeholder="UNITS"
                        placeholderTextColor={colors.textDim}
                        value={customUnits}
                        onChangeText={setCustomUnits}
                        keyboardType="number-pad"
                    />
                    <Typography variant="caption" color={colors.textDim} style={styles.unitsHint}>
                        Each tap = +1 unit during execution
                    </Typography>
                </View>

                {/* Time selection */}
                <Typography variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
                    SCHEDULE FOR
                </Typography>
                <View style={styles.timeGrid}>
                    {TIME_PRESETS.map((preset, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.timeButton,
                                selectedTime?.label === preset.label && styles.timeButtonActive,
                                preset.label === 'NOW' && selectedTime?.label === preset.label && styles.timeButtonNowActive,
                                preset.label === 'NOW' && selectedTime?.label !== preset.label && styles.timeButtonNow,
                            ]}
                            onPress={() => handleTimeSelect(preset)}
                            activeOpacity={0.7}
                        >
                            <Typography
                                variant="caption"
                                style={[
                                    { fontWeight: '700' },
                                    selectedTime?.label === preset.label ? { color: colors.primaryDark } : { color: colors.textSecondary },
                                    preset.label === 'NOW' && selectedTime?.label === preset.label && { color: colors.dangerDark },
                                    preset.label === 'NOW' && selectedTime?.label !== preset.label && { color: colors.danger },
                                ]}
                            >
                                {preset.label}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Create button */}
                <View style={{ marginTop: spacing[8], marginBottom: spacing[8] }}>
                    <Button
                        title={selectedTime?.label === 'NOW' ? 'CREATE & LOCK NOW' : 'CREATE OBLIGATION'}
                        onPress={handleCreate}
                        disabled={!canCreate}
                        variant={selectedTime?.label === 'NOW' ? 'danger' : 'primary'}
                        style={!canCreate && styles.createButtonDisabled}
                    />

                    {selectedTime?.label === 'NOW' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing[4] }}>
                            <Ionicons name="flash" size={14} color={colors.danger} />
                            <Typography variant="caption" style={{ color: colors.danger, fontWeight: '700' }}>
                                SYSTEM WILL LOCK IMMEDIATELY
                            </Typography>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // Light background
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing[14], // Safe area + padding
        paddingHorizontal: spacing[6],
        paddingBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        backgroundColor: colors.surface,
    },

    cancelButton: {
        padding: spacing[1],
    },

    title: {
        color: colors.text,
    },

    placeholder: {
        width: 40,
    },

    content: {
        flex: 1,
        paddingHorizontal: spacing[6],
    },

    warningBox: {
        backgroundColor: colors.primaryLight, // Soft primary background
        padding: spacing[4],
        marginTop: spacing[4],
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.primary + '30', // Very subtle border
    },

    sectionLabel: {
        marginTop: spacing[8],
        marginBottom: spacing[3],
        fontWeight: 'bold',
        letterSpacing: 1,
    },

    presetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing[1],
    },

    presetButton: {
        width: '48%',
        backgroundColor: colors.surface,
        padding: spacing[4],
        marginHorizontal: '1%',
        marginBottom: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
    },

    presetButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },

    inputRow: {
        marginBottom: spacing[3],
    },

    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[4],
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },

    unitsInput: {
        width: '40%',
    },

    unitsHint: {
        marginTop: spacing[2],
        fontStyle: 'italic',
    },

    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing[1],
    },

    timeButton: {
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[5],
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.full,
        marginHorizontal: spacing[1],
        marginBottom: spacing[2],
    },

    timeButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },

    timeButtonNow: {
        borderColor: colors.danger + '50',
    },

    timeButtonNowActive: {
        borderColor: colors.danger,
        backgroundColor: colors.dangerLight, // Need a light danger color, if not defined, 'rgba(239, 68, 68, 0.1)'
    },

    createButtonDisabled: {
        backgroundColor: colors.border,
        opacity: 0.5,
    },
});

export default CreateObligationScreen;
