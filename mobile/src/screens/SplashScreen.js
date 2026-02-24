import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

export default function SplashScreen({ navigation }) {
    const { loading } = useTheme();

    useEffect(() => {
        // Fallback: navigate after 3 seconds regardless of loading state
        const fallbackTimer = setTimeout(() => {
            checkProfile();
        }, 3000);

        if (!loading) {
            clearTimeout(fallbackTimer);
            checkProfile();
        }

        return () => clearTimeout(fallbackTimer);
    }, [loading]);

    const checkProfile = async () => {
        try {
            const profile = await AsyncStorage.getItem('@fitforge_profile');
            setTimeout(() => {
                navigation.replace(profile ? 'Main' : 'Welcome');
            }, 1500);
        } catch (error) {
            console.log('Profile check error:', error);
            navigation.replace('Welcome');
        }
    };

    return (
        <LinearGradient colors={['#09090B', '#18181B', '#27272A']} style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/app_logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.title}>FITFORGE</Text>
            <Text style={styles.tagline}>SYSTEM OPTIMIZATION</Text>
            <ActivityIndicator color="#7C3AED" style={styles.loader} size="small" />
            <Text style={styles.version}>v1.0.0 • OPTIMIZED</Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    logoContainer: { marginBottom: 24, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },
    logo: { width: 120, height: 120 },
    title: { fontSize: 48, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
    tagline: { fontSize: 12, fontWeight: '700', color: '#A1A1AA', marginTop: 12, letterSpacing: 4 },
    loader: { marginTop: 48 },
    version: { position: 'absolute', bottom: 32, color: '#52525B', fontSize: 10, letterSpacing: 1 }
});
