import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { radius } from '../theme';
import * as PFT from '../services/PFTBridge';

const MODES = [
    {
        id: 'normal',
        label: 'Normal',
        icon: 'sun',
        color: '#4ECDC4',
        description: 'Full plans active. All routines enabled.',
        adjustments: ['100% workout intensity', 'Full meal plans', 'All notifications on']
    },
    {
        id: 'travel',
        label: 'Travel',
        icon: 'map-pin',
        color: '#60A5FA',
        description: 'Minimal routines, flexible meals.',
        adjustments: ['50% workout intensity', 'Simple meals', 'Skincare maintained']
    },
    {
        id: 'sick',
        label: 'Sick',
        icon: 'thermometer',
        color: '#F87171',
        description: 'Rest focus, hydration priority.',
        adjustments: ['No workouts', 'Simple meals', 'Notifications off', 'Hydration reminders']
    },
    {
        id: 'exam',
        label: 'Exam/Busy',
        icon: 'book-open',
        color: '#A78BFA',
        description: 'Sleep priority, minimal routines.',
        adjustments: ['40% workout intensity', 'Quick meals', 'Sleep priority']
    },
    {
        id: 'festival',
        label: 'Festival',
        icon: 'gift',
        color: '#FBBF24',
        description: 'Relaxed tracking, enjoy yourself.',
        adjustments: ['60% workout intensity', 'Flexible meals', 'Notifications off']
    }
];

export default function ModeSwitcher({ currentMode, onModeChange, visible, onClose }) {
    const { theme } = useTheme();
    const [selectedMode, setSelectedMode] = useState(currentMode || 'normal');
    const [duration, setDuration] = useState(null);

    const handleConfirm = async () => {
        const options = {};
        if (duration) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + duration);
            options.autoExpiry = expiry.toISOString();
        }

        await PFT.setUserMode(selectedMode, options);
        onModeChange(selectedMode);
        onClose();
    };

    const ModeCard = ({ mode }) => {
        const isSelected = selectedMode === mode.id;
        return (
            <TouchableOpacity
                style={[
                    styles.modeCard,
                    {
                        backgroundColor: isSelected ? mode.color + '20' : theme.card,
                        borderColor: isSelected ? mode.color : theme.cardBorder
                    }
                ]}
                onPress={() => setSelectedMode(mode.id)}
            >
                <View style={[styles.modeIcon, { backgroundColor: mode.color + '20' }]}>
                    <Feather name={mode.icon} size={24} color={mode.color} />
                </View>
                <View style={styles.modeContent}>
                    <Text style={[styles.modeName, { color: theme.text }]}>{mode.label}</Text>
                    <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>{mode.description}</Text>
                </View>
                {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: mode.color }]}>
                        <Feather name="check" size={14} color="#FFF" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const selectedModeData = MODES.find(m => m.id === selectedMode);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.sheet, { backgroundColor: theme.background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Switch Mode</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Mode Cards */}
                        {MODES.map(mode => (
                            <ModeCard key={mode.id} mode={mode} />
                        ))}

                        {/* Adjustments Preview */}
                        {selectedModeData && (
                            <View style={[styles.adjustmentsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <Text style={[styles.adjustmentsTitle, { color: theme.textSecondary }]}>
                                    WHAT CHANGES IN {selectedModeData.label.toUpperCase()} MODE
                                </Text>
                                {selectedModeData.adjustments.map((adj, i) => (
                                    <View key={i} style={styles.adjustmentRow}>
                                        <Feather name="check-circle" size={14} color={selectedModeData.color} />
                                        <Text style={[styles.adjustmentText, { color: theme.text }]}>{adj}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Duration */}
                        {selectedMode !== 'normal' && (
                            <View style={[styles.durationCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                                <Text style={[styles.durationTitle, { color: theme.textSecondary }]}>AUTO-REVERT TO NORMAL</Text>
                                <View style={styles.durationRow}>
                                    {[1, 3, 7, null].map((d, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={[
                                                styles.durationBtn,
                                                {
                                                    backgroundColor: duration === d ? selectedModeData.color : theme.cardBorder
                                                }
                                            ]}
                                            onPress={() => setDuration(d)}
                                        >
                                            <Text style={[styles.durationText, { color: duration === d ? '#FFF' : theme.textSecondary }]}>
                                                {d ? `${d}d` : 'Never'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Confirm Button */}
                    <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: selectedModeData?.color || theme.primary }]}
                        onPress={handleConfirm}
                    >
                        <Text style={styles.confirmText}>
                            Switch to {selectedModeData?.label} Mode
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// Compact badge for header display
export function ModeBadge({ mode, onPress }) {
    const { theme } = useTheme();
    const modeData = MODES.find(m => m.id === mode) || MODES[0];

    return (
        <TouchableOpacity
            style={[styles.badge, { backgroundColor: modeData.color + '20' }]}
            onPress={onPress}
        >
            <Feather name={modeData.icon} size={14} color={modeData.color} />
            <Text style={[styles.badgeText, { color: modeData.color }]}>{modeData.label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 40, maxHeight: '85%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 20, fontWeight: '700' },
    content: { paddingHorizontal: 20 },
    modeCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radius.lg, borderWidth: 2, marginBottom: 12 },
    modeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    modeContent: { flex: 1, marginLeft: 14 },
    modeName: { fontSize: 16, fontWeight: '600' },
    modeDesc: { fontSize: 12, marginTop: 2 },
    checkmark: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    adjustmentsCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginTop: 8, marginBottom: 16 },
    adjustmentsTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
    adjustmentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    adjustmentText: { fontSize: 13 },
    durationCard: { borderRadius: radius.lg, borderWidth: 1, padding: 16, marginBottom: 16 },
    durationTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
    durationRow: { flexDirection: 'row', gap: 8 },
    durationBtn: { flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center' },
    durationText: { fontSize: 12, fontWeight: '600' },
    confirmBtn: { marginHorizontal: 20, padding: 16, borderRadius: radius.lg, alignItems: 'center' },
    confirmText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, gap: 6 },
    badgeText: { fontSize: 11, fontWeight: '700' }
});
