/**
 * FORGEBORN — APP ENTRY POINT
 * 
 * The system starts here.
 * 
 * Flow:
 * 1. If not committed → Creed Screen
 * 2. If locked (obligation due) → Lock Screen
 * 3. If committed → Main Screen
 * 
 * Commitment is PERMANENT.
 * Lock is INESCAPABLE.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import CreedScreen from './src/ui/screens/CreedScreen';
import MainScreen from './src/ui/screens/MainScreen';
import LockScreen from './src/ui/screens/LockScreen';
import CreateObligationScreen from './src/ui/screens/CreateObligationScreen';
import useCommitmentStore from './src/store/commitmentStore';
import useObligationStore from './src/store/obligationStore';
import { colors } from './src/ui/theme/colors';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Commitment state
  const hasCommitted = useCommitmentStore((s) => s.hasCommitted);
  const commit = useCommitmentStore((s) => s.commit);

  // Lock state
  const activeLock = useObligationStore((s) => s.activeLock);
  const tick = useObligationStore((s) => s.tick);

  useEffect(() => {
    // Brief loading to hydrate stores
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Initial tick to check for any pending locks
      tick();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Tick every second to update obligation statuses
  useEffect(() => {
    if (!hasCommitted) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [hasCommitted]);

  const handleCommit = () => {
    commit();
  };

  const handleCreateComplete = () => {
    setShowCreate(false);
    // Tick immediately to check if we need to lock
    tick();
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // PRIORITY 1: Creed screen for first-time users
  if (!hasCommitted) {
    return <CreedScreen onCommit={handleCommit} />;
  }

  // PRIORITY 2: Lock screen when obligation is due
  if (activeLock) {
    return <LockScreen />;
  }

  // Show create screen
  if (showCreate) {
    return (
      <CreateObligationScreen
        onComplete={handleCreateComplete}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  // Default: Main screen
  return (
    <MainScreen
      onCreateObligation={() => setShowCreate(true)}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
