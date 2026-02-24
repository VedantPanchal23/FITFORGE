import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme';
import { exportAllData, importData, clearAllData } from '../services/PFTCore';

export default function ExportScreen({ navigation }) {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const data = await exportAllData();
            const jsonString = JSON.stringify(data, null, 2);

            // Save to file
            const fileName = `aura_system_backup_${new Date().toISOString().split('T')[0]}.json`;
            const filePath = FileSystem.documentDirectory + fileName;
            await FileSystem.writeAsStringAsync(filePath, jsonString);

            // Share
            await Share.share({
                title: 'Aura System Backup',
                message: JSON.stringify(data),
                url: filePath
            });

            Alert.alert('Export Successful', 'Your data has been exported and you can share it.');
        } catch (error) {
            Alert.alert('Export Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.type === 'success' || result.assets?.[0]) {
                const file = result.assets?.[0] || result;
                const content = await FileSystem.readAsStringAsync(file.uri);
                const data = JSON.parse(content);

                if (!data.version || !data.exportDate) {
                    Alert.alert('Invalid File', 'This does not appear to be a valid FitForge backup file.');
                    return;
                }

                Alert.alert(
                    'Import Data?',
                    `This will replace your current data with backup from ${new Date(data.exportDate).toLocaleDateString()}`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Import',
                            onPress: async () => {
                                await importData(data);
                                Alert.alert('Success', 'Data imported successfully. Restart the app to see changes.');
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Import Failed', error.message);
        }
    };

    const handleReset = () => {
        Alert.alert(
            'Reset All Data?',
            'This will permanently delete all your data including profile, logs, and progress. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllData();
                        navigation.replace('Welcome');
                    }
                }
            ]
        );
    };

    const options = [
        { id: 'export', icon: 'cloud-upload-outline', label: 'Export Data', desc: 'Save all your data to a file', color: theme.success, onPress: handleExport },
        { id: 'import', icon: 'cloud-download-outline', label: 'Import Data', desc: 'Restore from a backup file', color: theme.info, onPress: handleImport },
        { id: 'reset', icon: 'trash-outline', label: 'Reset All Data', desc: 'Delete everything and start fresh', color: theme.error, onPress: handleReset }
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
                    <Ionicons name="arrow-back" size={22} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Data Management</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Export Card */}
                <View style={[styles.infoCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                    <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoTitle, { color: theme.text }]}>Your Data, Your Control</Text>
                        <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>
                            All data is stored locally on your device. Export regularly to keep backups.
                        </Text>
                    </View>
                </View>

                {/* Options */}
                {options.map(opt => (
                    <TouchableOpacity
                        key={opt.id}
                        style={[styles.optionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={opt.onPress}
                        disabled={loading}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: opt.color + '20' }]}>
                            <Ionicons name={opt.icon} size={24} color={opt.color} />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{opt.label}</Text>
                            <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>{opt.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                ))}

                {/* Data Breakdown */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Included in Export</Text>
                <View style={[styles.dataCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {['Profile & Goals', 'Daily Logs', 'Weight History', 'Habit Streaks', 'Meal Plans'].map((item, i) => (
                        <View key={i} style={styles.dataRow}>
                            <Ionicons name="checkmark-circle" size={18} color={theme.success} />
                            <Text style={[styles.dataText, { color: theme.text }]}>{item}</Text>
                        </View>
                    ))}
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
    infoCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24, gap: 14 },
    infoContent: { flex: 1 },
    infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    infoDesc: { fontSize: 13, lineHeight: 19 },
    optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
    optionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    optionContent: { flex: 1 },
    optionLabel: { fontSize: 16, fontWeight: '600' },
    optionDesc: { fontSize: 13, marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 16, marginBottom: 12 },
    dataCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
    dataRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    dataText: { fontSize: 15 }
});
