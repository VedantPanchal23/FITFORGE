/**
 * FORGEBORN — APP ENTRY POINT
 * 
 * Flow:
 * 1. If not committed → Creed Screen
 * 2. If not onboarded → Onboarding Screen 
 * 3. If locked (obligation due) → Lock Screen (overlay)
 * 4. If committed + onboarded → Tab Navigator (5 tabs)
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import CreedScreen from './src/ui/screens/CreedScreen';
import OnboardingScreen from './src/ui/screens/OnboardingScreen';
import DashboardScreen from './src/ui/screens/DashboardScreen';
import WorkoutHomeScreen from './src/ui/screens/WorkoutHomeScreen';
import NutritionHomeScreen from './src/ui/screens/NutritionHomeScreen';
import DisciplineScreen from './src/ui/screens/DisciplineScreen';
import ProfileScreen from './src/ui/screens/ProfileScreen';
import LockScreen from './src/ui/screens/LockScreen';
import CreateObligationScreen from './src/ui/screens/CreateObligationScreen';

// Stores
import useCommitmentStore from './src/store/commitmentStore';
import useUserStore from './src/store/userStore';
import useObligationStore from './src/store/obligationStore';
import { colors } from './src/ui/theme/colors';

const Tab = createBottomTabNavigator();

// ─── Tab Navigator ────────────────────────────────────────────────────────────
function MainTabs() {
  const [showCreate, setShowCreate] = useState(false);
  const tick = useObligationStore((s) => s.tick);

  if (showCreate) {
    return (
      <CreateObligationScreen
        onComplete={() => { setShowCreate(false); tick(); }}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: getTabColor(route.name),
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'grid',
            Workout: 'barbell',
            Nutrition: 'nutrition',
            Discipline: 'flash',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workout" component={WorkoutHomeScreen} />
      <Tab.Screen name="Nutrition" component={NutritionHomeScreen} />
      <Tab.Screen
        name="Discipline"
        children={() => <DisciplineScreen onCreateObligation={() => setShowCreate(true)} />}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function getTabColor(name) {
  const tabColors = {
    Dashboard: colors.text,
    Workout: colors.primary,
    Nutrition: colors.success,
    Discipline: colors.warning,
    Profile: colors.text,
  };
  return tabColors[name] || colors.text;
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

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

  // Tick every second after onboarding
  useEffect(() => {
    if (!hasCommitted || !hasCompletedOnboarding) return;
    const interval = setInterval(tick, 1000);
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

  // PRIORITY 3: Lock overlay
  if (activeLock) {
    return <LockScreen />;
  }

  // MAIN APP: Tab Navigator
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
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
