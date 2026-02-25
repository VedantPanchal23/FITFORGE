/**
 * FORGEBORN — APP ENTRY POINT
 * 
 * Flow:
 * 1. If not committed → Creed Screen
 * 2. If not onboarded → Onboarding Screen 
 * 3. If locked (obligation due) → Lock Screen
 * 4. If committed + onboarded → Main Screen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import CreedScreen from './src/ui/screens/CreedScreen';
import OnboardingScreen from './src/ui/screens/OnboardingScreen';
import MainScreen from './src/ui/screens/MainScreen';
import LockScreen from './src/ui/screens/LockScreen';
import CreateObligationScreen from './src/ui/screens/CreateObligationScreen';
import useCommitmentStore from './src/store/commitmentStore';
import useUserStore from './src/store/userStore';
import useObligationStore from './src/store/obligationStore';
import { colors } from './src/ui/theme/colors';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Commitment state
  const hasCommitted = useCommitmentStore((s) => s.hasCommitted);
  const commit = useCommitmentStore((s) => s.commit);

  // Onboarding state
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);

  // Lock state
  const activeLock = useObligationStore((s) => s.activeLock);
  const tick = useObligationStore((s) => s.tick);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      tick();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Tick every second to update obligation statuses
  useEffect(() => {
    if (!hasCommitted || !hasCompletedOnboarding) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [hasCommitted, hasCompletedOnboarding]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // PRIORITY 1: Creed
  if (!hasCommitted) {
    return <CreedScreen onCommit={() => commit()} />;
  }

  // PRIORITY 2: Onboarding
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={() => { }} />;
  }

  // PRIORITY 3: Lock
  if (activeLock) {
    return <LockScreen />;
  }

  // Create obligation
  if (showCreate) {
    return (
      <CreateObligationScreen
        onComplete={() => { setShowCreate(false); tick(); }}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  // Main
  return <MainScreen onCreateObligation={() => setShowCreate(true)} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
