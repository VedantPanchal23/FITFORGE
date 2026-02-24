import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Vibration } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { radius } from '../theme';
import * as AppLock from '../services/AppLockService';

export default function LockScreen({ onUnlock }) {
    const { theme } = useTheme();
    const [pin, setPin] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [biometricType, setBiometricType] = useState(null);
    const [showBiometric, setShowBiometric] = useState(false);

    const shakeX = useSharedValue(0);

    useEffect(() => {
        checkBiometric();
    }, []);

    const checkBiometric = async () => {
        const status = await AppLock.getLockStatus();
        if (status.biometricEnabled) {
            setBiometricType(status.biometricType);
            setShowBiometric(true);
            // Auto-trigger biometric
            handleBiometric();
        }
    };

    const handlePinInput = async (digit) => {
        if (pin.length >= 6) return;

        const newPin = pin + digit;
        setPin(newPin);

        if (newPin.length >= 4) {
            const isValid = await AppLock.verifyPin(newPin);
            if (isValid) {
                Vibration.vibrate(50);
                onUnlock();
            } else if (newPin.length === 6) {
                // Wrong PIN
                handleWrongPin();
            }
        }
    };

    const handleWrongPin = () => {
        Vibration.vibrate([0, 50, 100, 50]);
        shakeX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
        setPin('');
        setAttempts(attempts + 1);

        if (attempts >= 4) {
            Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.');
        }
    };

    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleBiometric = async () => {
        const success = await AppLock.authenticateWithBiometric();
        if (success) {
            Vibration.vibrate(50);
            onUnlock();
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }]
    }));

    const PinDot = ({ filled }) => (
        <View style={[
            styles.pinDot,
            {
                backgroundColor: filled ? theme.primary : 'transparent',
                borderColor: theme.primary
            }
        ]} />
    );

    const KeypadButton = ({ digit, onPress, children }) => (
        <TouchableOpacity
            style={[styles.keypadBtn, { backgroundColor: theme.card }]}
            onPress={() => onPress(digit)}
            activeOpacity={0.7}
        >
            {children || <Text style={[styles.keypadText, { color: theme.text }]}>{digit}</Text>}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.lockIcon, { backgroundColor: theme.primary + '20' }]}>
                        <Feather name="lock" size={32} color={theme.primary} />
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>Enter PIN</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {attempts > 0 ? `Wrong PIN. ${5 - attempts} attempts left.` : 'Unlock to continue'}
                    </Text>
                </View>

                {/* PIN Dots */}
                <Animated.View style={[styles.pinDots, animatedStyle]}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <PinDot key={i} filled={pin.length > i} />
                    ))}
                </Animated.View>

                {/* Keypad */}
                <View style={styles.keypad}>
                    <View style={styles.keypadRow}>
                        <KeypadButton digit="1" onPress={handlePinInput} />
                        <KeypadButton digit="2" onPress={handlePinInput} />
                        <KeypadButton digit="3" onPress={handlePinInput} />
                    </View>
                    <View style={styles.keypadRow}>
                        <KeypadButton digit="4" onPress={handlePinInput} />
                        <KeypadButton digit="5" onPress={handlePinInput} />
                        <KeypadButton digit="6" onPress={handlePinInput} />
                    </View>
                    <View style={styles.keypadRow}>
                        <KeypadButton digit="7" onPress={handlePinInput} />
                        <KeypadButton digit="8" onPress={handlePinInput} />
                        <KeypadButton digit="9" onPress={handlePinInput} />
                    </View>
                    <View style={styles.keypadRow}>
                        {showBiometric ? (
                            <KeypadButton digit="bio" onPress={handleBiometric}>
                                <Feather
                                    name={biometricType === 'face' ? 'smile' : 'smartphone'}
                                    size={24}
                                    color={theme.primary}
                                />
                            </KeypadButton>
                        ) : (
                            <View style={styles.keypadBtn} />
                        )}
                        <KeypadButton digit="0" onPress={handlePinInput} />
                        <KeypadButton digit="del" onPress={handleBackspace}>
                            <Feather name="delete" size={24} color={theme.text} />
                        </KeypadButton>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    header: { alignItems: 'center', marginBottom: 40 },
    lockIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '700' },
    subtitle: { fontSize: 14, marginTop: 8, textAlign: 'center' },
    pinDots: { flexDirection: 'row', gap: 16, marginBottom: 48 },
    pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
    keypad: { width: '100%', maxWidth: 280 },
    keypadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    keypadBtn: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
    keypadText: { fontSize: 28, fontWeight: '500' }
});
