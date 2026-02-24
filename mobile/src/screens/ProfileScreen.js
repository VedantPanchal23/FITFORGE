import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, fonts } from '../theme';
import * as PFT from '../services/PFTBridge';

export default function ProfileScreen({ navigation }) {
    const { theme, isDark, toggleTheme } = useTheme();
    const [profile, setProfile] = useState(null);
    const [bodyMetrics, setBodyMetrics] = useState(null);
    const [dataStatus, setDataStatus] = useState({
        profileDate: null,
        lastCheckIn: null,
        totalLogs: 0,
        dbStatus: 'checking...'
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const p = await PFT.getProfile();
            setProfile(p);
            if (p) {
                const metrics = PFT.calculateBodyMetrics(p);
                setBodyMetrics(metrics);
            }

            // Get data status info
            const today = new Date().toISOString().split('T')[0];
            const dailyLog = await PFT.getDailyLog(today);
            const healthLogs = await PFT.getHealthLogs(30);

            setDataStatus({
                profileDate: p?.created_at ? new Date(p.created_at).toLocaleDateString() : 'Not saved',
                lastCheckIn: dailyLog?.created_at ? new Date(dailyLog.created_at).toLocaleDateString() : (healthLogs?.length > 0 ? 'Recent' : 'None'),
                totalLogs: healthLogs?.length || 0,
                dbStatus: 'Connected ✓'
            });
        } catch (error) {
            console.log('Profile load error:', error);
            setDataStatus(prev => ({ ...prev, dbStatus: 'Error' }));
        }
    };

    const handleResetProfile = () => {
        Alert.alert(
            'Reset Profile?',
            'This will delete your profile and take you back to onboarding.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await PFT.clearAllData();
                        navigation.replace('Welcome');
                    }
                }
            ]
        );
    };

    const menuItems = [
        { id: 'fasting', label: 'Fasting Mode', icon: 'timer-outline', screen: 'Fasting', desc: '6 modes including Ramadan, Ekadashi' },
        { id: 'cycle', label: 'Cycle Tracking', icon: 'calendar-outline', screen: 'Cycle', desc: 'MenstrualCycleEngine adjustments' },
        { id: 'export', label: 'Export/Import', icon: 'cloud-outline', screen: 'Export', desc: 'Backup and restore all data' }
    ];

    const bmiCategory = bodyMetrics?.bmi < 18.5 ? 'Underweight' : bodyMetrics?.bmi < 25 ? 'Normal' : bodyMetrics?.bmi < 30 ? 'Overweight' : 'Obese';
    const bmiColor = bodyMetrics?.bmi < 18.5 || bodyMetrics?.bmi >= 25 ? theme.warning : theme.success;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>11 Engines • Full Core System</Text>

                {/* Profile Card */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.profileRow}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                            <Ionicons name="person" size={32} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.profileName, { color: theme.text }]}>
                                {profile?.gender === 'male' ? '♂' : '♀'} {profile?.age || '--'} years
                            </Text>
                            <Text style={[styles.profileDetail, { color: theme.textSecondary }]}>
                                {profile?.height_cm || '--'} cm • {profile?.weight_kg || '--'} kg
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Body Metrics from BodyEngine */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>BMR</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{bodyMetrics?.bmr || '--'}</Text>
                        <Text style={[styles.statUnit, { color: theme.textSecondary }]}>kcal</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TDEE</Text>
                        <Text style={[styles.statValue, { color: theme.primary }]}>{bodyMetrics?.tdee || '--'}</Text>
                        <Text style={[styles.statUnit, { color: theme.textSecondary }]}>kcal</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>BMI</Text>
                        <Text style={[styles.statValue, { color: bmiColor }]}>{bodyMetrics?.bmi?.toFixed(1) || '--'}</Text>
                        <Text style={[styles.statUnit, { color: bmiColor }]}>{bmiCategory}</Text>
                    </View>
                </View>

                {/* Macros from BodyEngine */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Daily Macros (from BodyEngine)</Text>
                    <View style={styles.macroRow}>
                        <View style={[styles.macroItem, { backgroundColor: theme.caloriesColor + '15' }]}>
                            <Text style={[styles.macroVal, { color: theme.caloriesColor }]}>{bodyMetrics?.targetCalories || '--'}</Text>
                            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Calories</Text>
                        </View>
                        <View style={[styles.macroItem, { backgroundColor: theme.proteinColor + '15' }]}>
                            <Text style={[styles.macroVal, { color: theme.proteinColor }]}>{bodyMetrics?.macros?.protein || '--'}g</Text>
                            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Protein</Text>
                        </View>
                        <View style={[styles.macroItem, { backgroundColor: theme.carbsColor + '15' }]}>
                            <Text style={[styles.macroVal, { color: theme.carbsColor }]}>{bodyMetrics?.macros?.carbs || '--'}g</Text>
                            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Carbs</Text>
                        </View>
                        <View style={[styles.macroItem, { backgroundColor: theme.fatsColor + '15' }]}>
                            <Text style={[styles.macroVal, { color: theme.fatsColor }]}>{bodyMetrics?.macros?.fats || '--'}g</Text>
                            <Text style={[styles.macroLabel, { color: theme.textSecondary }]}>Fats</Text>
                        </View>
                    </View>
                </View>

                {/* Theme Toggle */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.settingRow}>
                        <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={theme.textSecondary} />
                        <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                        <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#FFF" />
                    </View>
                </View>

                {/* Menu Items */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, padding: 0, overflow: 'hidden' }]}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <Ionicons name={item.icon} size={20} color={theme.textSecondary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                                <Text style={[styles.menuDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ============== DATA STATUS SECTION ============== */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <View style={styles.dataStatusHeader}>
                        <Ionicons name="server-outline" size={18} color={theme.primary} />
                        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 0, marginLeft: 10 }]}>DATA STATUS</Text>
                    </View>
                    <View style={styles.dataStatusGrid}>
                        <View style={styles.dataStatusItem}>
                            <Text style={[styles.dataStatusLabel, { color: theme.textSecondary }]}>Database</Text>
                            <Text style={[styles.dataStatusValue, { color: dataStatus.dbStatus.includes('✓') ? theme.success : theme.error }]}>
                                {dataStatus.dbStatus}
                            </Text>
                        </View>
                        <View style={styles.dataStatusItem}>
                            <Text style={[styles.dataStatusLabel, { color: theme.textSecondary }]}>Profile Saved</Text>
                            <Text style={[styles.dataStatusValue, { color: theme.text }]}>{dataStatus.profileDate}</Text>
                        </View>
                        <View style={styles.dataStatusItem}>
                            <Text style={[styles.dataStatusLabel, { color: theme.textSecondary }]}>Last Check-in</Text>
                            <Text style={[styles.dataStatusValue, { color: theme.text }]}>{dataStatus.lastCheckIn || 'None'}</Text>
                        </View>
                        <View style={styles.dataStatusItem}>
                            <Text style={[styles.dataStatusLabel, { color: theme.textSecondary }]}>Total Logs</Text>
                            <Text style={[styles.dataStatusValue, { color: theme.primary }]}>{dataStatus.totalLogs}</Text>
                        </View>
                    </View>
                </View>

                {/* Reset Profile */}
                <TouchableOpacity style={[styles.resetBtn, { borderColor: theme.error }]} onPress={handleResetProfile}>
                    <Ionicons name="trash-outline" size={18} color={theme.error} />
                    <Text style={[styles.resetText, { color: theme.error }]}>Reset Profile</Text>
                </TouchableOpacity>

                {/* Engine List */}
                <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
                    <Text style={[styles.engineTitle, { color: theme.textSecondary }]}>Powered by 11 Engines:</Text>
                    <Text style={[styles.engineList, { color: theme.textTertiary }]}>
                        BodyEngine • NutritionEngine • WorkoutEngine • LifestyleEngine • LooksmaxingEngine • AdaptationEngine • AdaptiveTDEE • MicronutrientEngine • MenstrualCycleEngine • PlateauEngine • HealthConditionFilter
                    </Text>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appName, { color: theme.primary }]}>Aura</Text>
                    <Text style={[styles.appVersion, { color: theme.textTertiary }]}>Version 1.0.0 • Full Core Integration</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.lg },
    title: { ...fonts.h2 },
    subtitle: { fontSize: 12, marginTop: 2, marginBottom: 16 },
    card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
    cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    profileName: { ...fonts.h3 },
    profileDetail: { fontSize: 13, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center' },
    statLabel: { fontSize: 11 },
    statValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
    statUnit: { fontSize: 10, marginTop: 2 },
    macroRow: { flexDirection: 'row', gap: 8 },
    macroItem: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
    macroVal: { fontSize: 20, fontWeight: '700' },
    macroLabel: { fontSize: 12, marginTop: 4, fontWeight: '500' },
    settingRow: { flexDirection: 'row', alignItems: 'center' },
    settingLabel: { flex: 1, fontSize: 16, marginLeft: 12 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    menuLabel: { fontSize: 15, fontWeight: '500' },
    menuDesc: { fontSize: 11, marginTop: 2 },
    resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16, gap: 8 },
    resetText: { fontSize: 15, fontWeight: '600' },
    engineTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    engineList: { fontSize: 11, lineHeight: 18 },
    appInfo: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
    appName: { fontSize: 18, fontWeight: '700' },
    appVersion: { fontSize: 12, marginTop: 4 },
    // Data Status styles
    dataStatusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    dataStatusGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dataStatusItem: { width: '50%', paddingVertical: 8 },
    dataStatusLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    dataStatusValue: { fontSize: 14, fontWeight: '600', marginTop: 4 }
});
