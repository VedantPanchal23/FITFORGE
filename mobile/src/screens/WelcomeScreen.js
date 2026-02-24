import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, fonts, radius } from '../theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        minHeight: '100%',
                        paddingTop: insets.top,
                        paddingBottom: insets.bottom + 20
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Logo Area */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/app_logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.brand, { color: theme.text }]}>FITFORGE</Text>
                        <Text style={[styles.tagline, { color: theme.primary }]}>SYSTEM OPTIMIZATION</Text>
                    </View>

                    {/* Features Grid */}
                    <View style={styles.grid}>
                        <FeatureItem
                            icon="activity"
                            title="Bio-Metrics"
                            desc="Advanced body composition tracking"
                            theme={theme}
                        />
                        <FeatureItem
                            icon="cpu"
                            title="Smart Nutrition"
                            desc="Precision meal protocols"
                            theme={theme}
                        />
                        <FeatureItem
                            icon="zap"
                            title="Training"
                            desc="Hypertrophy & strength algorithms"
                            theme={theme}
                        />
                        <FeatureItem
                            icon="droplet"
                            title="Dermatology"
                            desc="Skincare & looksmaxing stack"
                            theme={theme}
                        />
                    </View>

                    {/* CTA */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Demographics')} style={styles.btnContainer}>
                            <LinearGradient
                                colors={[theme.primary, theme.accent || theme.primaryLight]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btn}
                            >
                                <Text style={styles.btnText}>INITIALIZE SYSTEM</Text>
                                <Feather name="arrow-right" size={20} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={[styles.version, { color: theme.textSecondary }]}>v1.0.0 • SYSTEM SECURE</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const FeatureItem = ({ icon, title, desc, theme }) => (
    <View style={[styles.feature, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
            <Feather name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.featureText}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{desc}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    content: { flex: 1, padding: spacing.lg, justifyContent: 'space-between', paddingBottom: 40 },
    logoContainer: { alignItems: 'center', marginTop: 40 },
    logo: { width: 100, height: 100, marginBottom: 24 },
    brand: { fontSize: 42, fontWeight: '700', letterSpacing: -1 },
    tagline: { fontSize: 12, fontWeight: '700', letterSpacing: 4, marginTop: 8 },

    grid: { gap: 16, marginTop: 40 },
    feature: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: radius.lg, borderWidth: 1 },
    iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    featureText: { flex: 1 },
    featureTitle: { fontSize: 16, fontWeight: '600' },
    featureDesc: { fontSize: 12, marginTop: 2 },

    footer: { marginBottom: 20 },
    btnContainer: { borderRadius: radius.full, overflow: 'hidden', marginBottom: 24 },
    btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
    version: { textAlign: 'center', fontSize: 10, letterSpacing: 1 }
});
