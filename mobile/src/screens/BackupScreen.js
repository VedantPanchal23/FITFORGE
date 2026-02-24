import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme';
import * as DatabaseService from '../services/DatabaseService';
import * as PFT from '../services/PFTBridge';

export default function BackupScreen({ navigation }) {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [lastBackup, setLastBackup] = useState(null);
    const [stats, setStats] = useState({ logs: 0, goals: 0 });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const healthLogs = await DatabaseService.getHealthLogs(1000);
            const goals = await DatabaseService.getGoals();
            setStats({
                logs: healthLogs.length,
                goals: goals.length
            });
        } catch (error) {
            console.log('Stats error:', error);
        }
    };

    const exportBackup = async () => {
        setLoading(true);
        try {
            // Get all data from SQLite
            const sqliteData = await DatabaseService.exportAllData();

            // Get additional data from AsyncStorage
            const profile = await PFT.getProfile();
            const userMode = await PFT.getUserMode();

            const fullBackup = {
                ...sqliteData,
                settings: {
                    profile,
                    userMode
                }
            };

            const backupJson = JSON.stringify(fullBackup, null, 2);
            const fileName = `fitforge_backup_${new Date().toISOString().split('T')[0]}.json`;
            const filePath = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(filePath, backupJson);

            // Share the file
            await Share.share({
                url: filePath,
                title: 'FitForge Backup',
                message: `FitForge backup created on ${new Date().toLocaleDateString()}`
            });

            setLastBackup(new Date().toISOString());
            Alert.alert('Success', 'Backup created and ready to save!');
        } catch (error) {
            console.log('Export error:', error);
            Alert.alert('Error', 'Failed to create backup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const importBackup = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const content = await FileSystem.readAsStringAsync(fileUri);
            const backup = JSON.parse(content);

            Alert.alert(
                'Restore Backup?',
                'This will replace all current data with the backup. This cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Restore',
                        style: 'destructive',
                        onPress: async () => {
                            setLoading(true);
                            try {
                                await DatabaseService.importData(backup);

                                // Restore settings
                                if (backup.settings?.profile) {
                                    await PFT.saveProfile(backup.settings.profile);
                                }
                                if (backup.settings?.userMode) {
                                    await PFT.setUserMode(backup.settings.userMode.mode);
                                }

                                Alert.alert('Success', 'Backup restored successfully!');
                                loadStats();
                            } catch (error) {
                                Alert.alert('Error', 'Failed to restore backup. Invalid format.');
                            } finally {
                                setLoading(false);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.log('Import error:', error);
            Alert.alert('Error', 'Failed to read backup file.');
        }
    };

    const clearAllData = () => {
        Alert.alert(
            'Clear All Data?',
            'This will permanently delete all your logs, goals, and settings. This cannot be undone!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await DatabaseService.deleteOldLogs(0); // Delete all
                            await PFT.clearAllData();
                            Alert.alert('Done', 'All data has been cleared.');
                            loadStats();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear data.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const ActionCard = ({ icon, title, description, onPress, color, danger }) => (
        <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={onPress}
            disabled={loading}
        >
            <View style={[styles.actionIcon, { backgroundColor: (color || theme.primary) + '20' }]}>
                <Feather name={icon} size={22} color={color || theme.primary} />
            </View>
            <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: danger ? theme.error : theme.text }]}>{title}</Text>
                <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>{description}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Backup & Data</Text>
                    <View style={{ width: 24 }} />
                </View>

                {loading && (
                    <View style={[styles.loadingOverlay, { backgroundColor: theme.background + 'EE' }]}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Processing...</Text>
                    </View>
                )}

                {/* Stats Card */}
                <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Text style={[styles.statsTitle, { color: theme.textSecondary }]}>YOUR DATA</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>{stats.logs}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Log Entries</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: theme.cardBorder }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.text }]}>{stats.goals}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Goals</Text>
                        </View>
                    </View>
                </View>

                {/* Backup Actions */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>BACKUP</Text>

                <ActionCard
                    icon="upload-cloud"
                    title="Export Backup"
                    description="Save all your data as a JSON file"
                    onPress={exportBackup}
                    color={theme.success}
                />

                <ActionCard
                    icon="download-cloud"
                    title="Import Backup"
                    description="Restore data from a backup file"
                    onPress={importBackup}
                    color={theme.info}
                />

                {lastBackup && (
                    <Text style={[styles.lastBackup, { color: theme.textTertiary }]}>
                        Last backup: {new Date(lastBackup).toLocaleString()}
                    </Text>
                )}

                {/* Data Management */}
                <Text style={[styles.sectionTitle, { color: theme.textSecondary, marginTop: 24 }]}>DATA MANAGEMENT</Text>

                <ActionCard
                    icon="trash-2"
                    title="Clear All Data"
                    description="Permanently delete everything"
                    onPress={clearAllData}
                    color={theme.error}
                    danger
                />

                {/* Info */}
                <View style={[styles.infoCard, { backgroundColor: theme.info + '15', borderColor: theme.info }]}>
                    <Feather name="info" size={18} color={theme.info} />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                        Your data is stored locally on your device. Regular backups are recommended to prevent data loss.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: spacing.md, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 20, fontWeight: '600' },
    loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    loadingText: { marginTop: 12, fontSize: 14 },
    statsCard: { borderRadius: radius.lg, borderWidth: 1, padding: 20, marginBottom: 24 },
    statsTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
    statsRow: { flexDirection: 'row', alignItems: 'center' },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 32, fontWeight: '700' },
    statLabel: { fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, height: 40 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
    actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radius.lg, borderWidth: 1, marginBottom: 12 },
    actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    actionContent: { flex: 1, marginLeft: 14 },
    actionTitle: { fontSize: 16, fontWeight: '600' },
    actionDesc: { fontSize: 12, marginTop: 2 },
    lastBackup: { fontSize: 12, textAlign: 'center', marginTop: 8 },
    infoCard: { flexDirection: 'row', padding: 14, borderRadius: radius.md, borderWidth: 1, marginTop: 24, gap: 12 },
    infoText: { flex: 1, fontSize: 13, lineHeight: 20 }
});
