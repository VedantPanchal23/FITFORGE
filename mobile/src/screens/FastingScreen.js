import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';

export default function FastingScreen({ navigation }) {
    const { theme } = useTheme();
    const [fastingMode, setFastingMode] = useState(null);
    const [enabled, setEnabled] = useState(false);

    const fastingModes = [
        { id: 'if_16_8', label: 'Intermittent 16:8', desc: 'Fast 16 hours, eat within 8-hour window', eatingWindow: '12 PM - 8 PM', icon: 'time-outline', color: '#3B82F6' },
        { id: 'if_18_6', label: 'Intermittent 18:6', desc: 'Fast 18 hours, eat within 6-hour window', eatingWindow: '1 PM - 7 PM', icon: 'time-outline', color: '#6366F1' },
        { id: 'ramadan', label: 'Ramadan', desc: 'Dawn to sunset fasting', eatingWindow: 'Sunset - Dawn (Suhoor & Iftar)', icon: 'moon-outline', color: '#8B5CF6' },
        { id: 'ekadashi', label: 'Ekadashi', desc: 'Hindu biweekly fast (11th day of moon cycle)', eatingWindow: 'One meal or fruits only', icon: 'leaf-outline', color: '#10B981' },
        { id: 'navratri', label: 'Navratri', desc: '9-day festival fasting', eatingWindow: 'Sattvic food, no grains', icon: 'flower-outline', color: '#F59E0B' },
        { id: 'custom', label: 'Custom', desc: 'Set your own fasting schedule', eatingWindow: 'Define your window', icon: 'create-outline', color: '#71717A' }
    ];

    useEffect(() => {
        loadFastingSettings();
    }, []);

    const loadFastingSettings = async () => {
        const saved = await AsyncStorage.getItem('@fitforge_fasting');
        if (saved) {
            const { mode, enabled: isEnabled } = JSON.parse(saved);
            setFastingMode(mode);
            setEnabled(isEnabled);
        }
    };

    const saveFastingSettings = async (mode, isEnabled) => {
        await AsyncStorage.setItem('@fitforge_fasting', JSON.stringify({ mode, enabled: isEnabled }));
    };

    const selectMode = async (mode) => {
        setFastingMode(mode);
        await saveFastingSettings(mode, enabled);
    };

    const toggleEnabled = async () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);
        await saveFastingSettings(fastingMode, newEnabled);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
                    <Ionicons name="arrow-back" size={22} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Fasting Mode</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Toggle Card */}
                <View style={[styles.toggleCard, { backgroundColor: enabled ? theme.primary + '15' : theme.card, borderColor: enabled ? theme.primary : theme.border }]}>
                    <View style={styles.toggleRow}>
                        <View style={[styles.toggleIcon, { backgroundColor: enabled ? theme.primary : theme.backgroundSecondary }]}>
                            <Ionicons name="timer-outline" size={24} color={enabled ? '#FFF' : theme.textSecondary} />
                        </View>
                        <View style={styles.toggleContent}>
                            <Text style={[styles.toggleLabel, { color: theme.text }]}>Fasting Enabled</Text>
                            <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>Adjusts meal timing & calories</Text>
                        </View>
                        <Switch value={enabled} onValueChange={toggleEnabled} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#FFF" />
                    </View>
                </View>

                {/* Mode Selection */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Fasting Type</Text>

                {fastingModes.map(mode => (
                    <TouchableOpacity
                        key={mode.id}
                        style={[styles.modeCard, { backgroundColor: fastingMode === mode.id ? mode.color + '15' : theme.card, borderColor: fastingMode === mode.id ? mode.color : theme.border }]}
                        onPress={() => selectMode(mode.id)}
                    >
                        <View style={[styles.modeIcon, { backgroundColor: fastingMode === mode.id ? mode.color : theme.backgroundSecondary }]}>
                            <Ionicons name={mode.icon} size={22} color={fastingMode === mode.id ? '#FFF' : theme.textSecondary} />
                        </View>
                        <View style={styles.modeContent}>
                            <Text style={[styles.modeLabel, { color: theme.text }]}>{mode.label}</Text>
                            <Text style={[styles.modeDesc, { color: theme.textSecondary }]}>{mode.desc}</Text>
                            <View style={[styles.windowTag, { backgroundColor: theme.backgroundSecondary }]}>
                                <Ionicons name="time" size={12} color={theme.textSecondary} />
                                <Text style={[styles.windowText, { color: theme.textSecondary }]}>{mode.eatingWindow}</Text>
                            </View>
                        </View>
                        {fastingMode === mode.id && (
                            <Ionicons name="checkmark-circle" size={24} color={mode.color} />
                        )}
                    </TouchableOpacity>
                ))}

                {/* Info */}
                <View style={[styles.infoCard, { backgroundColor: theme.info + '15', borderColor: theme.info }]}>
                    <Ionicons name="information-circle" size={20} color={theme.info} />
                    <Text style={[styles.infoText, { color: theme.info }]}>
                        When fasting is enabled, meal plans will be adjusted to fit within your eating window and calories will be redistributed accordingly.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
    backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700' },
    scroll: { padding: spacing.lg, paddingTop: 0 },
    toggleCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
    toggleRow: { flexDirection: 'row', alignItems: 'center' },
    toggleIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    toggleContent: { flex: 1 },
    toggleLabel: { fontSize: 17, fontWeight: '600' },
    toggleDesc: { fontSize: 13, marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    modeCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
    modeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    modeContent: { flex: 1 },
    modeLabel: { fontSize: 15, fontWeight: '600' },
    modeDesc: { fontSize: 12, marginTop: 2 },
    windowTag: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 8, alignSelf: 'flex-start', gap: 4 },
    windowText: { fontSize: 11 },
    infoCard: { flexDirection: 'row', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 16, gap: 10 },
    infoText: { flex: 1, fontSize: 12, lineHeight: 18 }
});
