/**
 * FORGEBORN — CREATE OBLIGATION SCREEN
 * 
 * Schedule your execution.
 * Once scheduled, you WILL be held accountable.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Vibration,
} from 'react-native';
import { colors } from '../theme/colors';
import { textStyles } from '../theme/typography';
import { spacing, screen } from '../theme/spacing';
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

const CreateObligationScreen = ({ onComplete, onCancel }) => {
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

        onComplete && onComplete();
    };

    const canCreate = customName && customUnits && selectedTime;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.title}>NEW OBLIGATION</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Warning */}
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        ⚠️ ONCE SCHEDULED, YOU WILL BE HELD ACCOUNTABLE
                    </Text>
                </View>

                {/* Presets */}
                <Text style={styles.sectionLabel}>QUICK SELECT</Text>
                <View style={styles.presetsGrid}>
                    {PRESET_OBLIGATIONS.map((preset, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.presetButton,
                                selectedPreset?.name === preset.name && styles.presetButtonActive,
                            ]}
                            onPress={() => handlePresetSelect(preset)}
                        >
                            <Text style={[
                                styles.presetText,
                                selectedPreset?.name === preset.name && styles.presetTextActive,
                            ]}>
                                {preset.name}
                            </Text>
                            <Text style={styles.presetUnits}>{preset.units} UNITS</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom input */}
                <Text style={styles.sectionLabel}>OR CUSTOMIZE</Text>
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
                    <Text style={styles.unitsHint}>
                        Each tap = +1 unit during execution
                    </Text>
                </View>

                {/* Time selection */}
                <Text style={styles.sectionLabel}>SCHEDULE FOR</Text>
                <View style={styles.timeGrid}>
                    {TIME_PRESETS.map((preset, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.timeButton,
                                selectedTime?.label === preset.label && styles.timeButtonActive,
                                preset.label === 'NOW' && styles.timeButtonNow,
                            ]}
                            onPress={() => handleTimeSelect(preset)}
                        >
                            <Text style={[
                                styles.timeText,
                                selectedTime?.label === preset.label && styles.timeTextActive,
                            ]}>
                                {preset.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Create button */}
                <TouchableOpacity
                    style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
                    onPress={handleCreate}
                    disabled={!canCreate}
                >
                    <Text style={styles.createText}>
                        {selectedTime?.label === 'NOW' ? 'CREATE & LOCK NOW' : 'CREATE OBLIGATION'}
                    </Text>
                </TouchableOpacity>

                {selectedTime?.label === 'NOW' && (
                    <Text style={styles.nowWarning}>
                        ⚡ SYSTEM WILL LOCK IMMEDIATELY
                    </Text>
                )}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: screen.paddingTop,
        paddingHorizontal: screen.paddingHorizontal,
        paddingBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    cancelButton: {
        padding: spacing[2],
    },

    cancelText: {
        color: colors.textDim,
        fontSize: 24,
    },

    title: {
        ...textStyles.h2,
        color: colors.primary,
    },

    placeholder: {
        width: 40,
    },

    content: {
        flex: 1,
        paddingHorizontal: screen.paddingHorizontal,
    },

    warningBox: {
        backgroundColor: colors.primaryMuted,
        padding: spacing[4],
        marginTop: spacing[4],
        borderWidth: 1,
        borderColor: colors.primary,
    },

    warningText: {
        ...textStyles.label,
        color: colors.primary,
        textAlign: 'center',
    },

    sectionLabel: {
        ...textStyles.label,
        color: colors.textDim,
        marginTop: spacing[6],
        marginBottom: spacing[3],
    },

    presetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing[1],
    },

    presetButton: {
        width: '48%',
        backgroundColor: colors.surface,
        padding: spacing[3],
        marginHorizontal: '1%',
        marginBottom: spacing[2],
        borderWidth: 1,
        borderColor: colors.border,
    },

    presetButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryMuted,
    },

    presetText: {
        ...textStyles.label,
        color: colors.textSecondary,
        fontSize: 12,
    },

    presetTextActive: {
        color: colors.text,
    },

    presetUnits: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[1],
    },

    inputRow: {
        marginBottom: spacing[3],
    },

    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing[4],
        color: colors.text,
        ...textStyles.body,
        fontSize: 16,
    },

    unitsInput: {
        width: '40%',
    },

    unitsHint: {
        ...textStyles.caption,
        color: colors.textDim,
        marginTop: spacing[1],
    },

    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing[1],
    },

    timeButton: {
        paddingVertical: spacing[3],
        paddingHorizontal: spacing[4],
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: spacing[1],
        marginBottom: spacing[2],
    },

    timeButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryMuted,
    },

    timeButtonNow: {
        borderColor: colors.warning,
    },

    timeText: {
        ...textStyles.label,
        color: colors.textSecondary,
    },

    timeTextActive: {
        color: colors.text,
    },

    createButton: {
        backgroundColor: colors.primary,
        padding: spacing[5],
        marginTop: spacing[6],
        marginBottom: spacing[2],
        alignItems: 'center',
    },

    createButtonDisabled: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },

    createText: {
        ...textStyles.button,
        color: colors.text,
    },

    nowWarning: {
        ...textStyles.caption,
        color: colors.warning,
        textAlign: 'center',
        marginBottom: spacing[8],
    },
});

export default CreateObligationScreen;
