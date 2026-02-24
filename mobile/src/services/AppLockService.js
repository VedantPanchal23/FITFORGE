/**
 * App Lock Service
 * Optional PIN protection for the app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const KEYS = {
    PIN_ENABLED: '@fitforge_pin_enabled',
    PIN_VALUE: '@fitforge_pin_hash',
    BIOMETRIC_ENABLED: '@fitforge_biometric',
    LAST_UNLOCK: '@fitforge_last_unlock'
};

// Simple hash function (not cryptographically secure, but sufficient for PIN)
function hashPin(pin) {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
        const char = pin.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return String(hash);
}

// ============================================================================
// PIN MANAGEMENT
// ============================================================================

export async function isPinEnabled() {
    const enabled = await AsyncStorage.getItem(KEYS.PIN_ENABLED);
    return enabled === 'true';
}

export async function setPin(pin) {
    if (pin.length < 4 || pin.length > 6) {
        throw new Error('PIN must be 4-6 digits');
    }

    const hashed = hashPin(pin);
    await AsyncStorage.setItem(KEYS.PIN_VALUE, hashed);
    await AsyncStorage.setItem(KEYS.PIN_ENABLED, 'true');
    return true;
}

export async function verifyPin(pin) {
    const stored = await AsyncStorage.getItem(KEYS.PIN_VALUE);
    const hashed = hashPin(pin);

    if (stored === hashed) {
        await AsyncStorage.setItem(KEYS.LAST_UNLOCK, new Date().toISOString());
        return true;
    }
    return false;
}

export async function removePin() {
    await AsyncStorage.removeItem(KEYS.PIN_VALUE);
    await AsyncStorage.setItem(KEYS.PIN_ENABLED, 'false');
    return true;
}

export async function changePin(oldPin, newPin) {
    const isValid = await verifyPin(oldPin);
    if (!isValid) {
        throw new Error('Current PIN is incorrect');
    }
    return await setPin(newPin);
}

// ============================================================================
// BIOMETRIC AUTHENTICATION
// ============================================================================

export async function isBiometricAvailable() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
}

export async function getBiometricType() {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'face';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'fingerprint';
    }
    return null;
}

export async function isBiometricEnabled() {
    const enabled = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
}

export async function setBiometricEnabled(enabled) {
    await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
    return true;
}

export async function authenticateWithBiometric() {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock FitForge',
            fallbackLabel: 'Use PIN',
            disableDeviceFallback: true
        });

        if (result.success) {
            await AsyncStorage.setItem(KEYS.LAST_UNLOCK, new Date().toISOString());
        }

        return result.success;
    } catch (error) {
        console.log('Biometric auth error:', error);
        return false;
    }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function isSessionValid() {
    const lastUnlock = await AsyncStorage.getItem(KEYS.LAST_UNLOCK);
    if (!lastUnlock) return false;

    const elapsed = Date.now() - new Date(lastUnlock).getTime();
    return elapsed < SESSION_TIMEOUT_MS;
}

export async function requiresUnlock() {
    const pinEnabled = await isPinEnabled();
    if (!pinEnabled) return false;

    const sessionValid = await isSessionValid();
    return !sessionValid;
}

export async function extendSession() {
    await AsyncStorage.setItem(KEYS.LAST_UNLOCK, new Date().toISOString());
}

// ============================================================================
// LOCK STATUS
// ============================================================================

export async function getLockStatus() {
    const pinEnabled = await isPinEnabled();
    const biometricEnabled = await isBiometricEnabled();
    const biometricAvailable = await isBiometricAvailable();
    const biometricType = await getBiometricType();

    return {
        pinEnabled,
        biometricEnabled: biometricEnabled && biometricAvailable,
        biometricType,
        biometricAvailable
    };
}

export default {
    isPinEnabled,
    setPin,
    verifyPin,
    removePin,
    changePin,
    isBiometricAvailable,
    getBiometricType,
    isBiometricEnabled,
    setBiometricEnabled,
    authenticateWithBiometric,
    isSessionValid,
    requiresUnlock,
    extendSession,
    getLockStatus
};
