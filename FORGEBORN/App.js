/**
 * FORGEBORN — APP ENTRY POINT (V2)
 * 
 * Flow:
 * 1. If not committed → Creed Screen
 * 2. If not onboarded → Onboarding Screen 
 * 3. If locked (obligation due) → Lock Screen (overlay)
 * 4. If committed + onboarded → Tab Navigator with nested stacks
 * 
 * V2: Proper React Navigation stacks for smooth transitions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// Screens
import CreedScreen from './src/ui/screens/CreedScreen';
import OnboardingScreen from './src/ui/screens/OnboardingScreen';
import DashboardScreen from './src/ui/screens/DashboardScreen';
import WorkoutHomeScreen from './src/ui/screens/WorkoutHomeScreen';
import ActiveWorkoutScreen from './src/ui/screens/ActiveWorkoutScreen';
import WorkoutCompleteScreen from './src/ui/screens/WorkoutCompleteScreen';
import WorkoutLogScreen from './src/ui/screens/WorkoutLogScreen';
import NutritionHomeScreen from './src/ui/screens/NutritionHomeScreen';
import MealLogScreen from './src/ui/screens/MealLogScreen';
import DisciplineScreen from './src/ui/screens/DisciplineScreen';
import ProfileScreen from './src/ui/screens/ProfileScreen';
import LookmaxxingScreen from './src/ui/screens/LookmaxxingScreen';
import ProgressScreen from './src/ui/screens/ProgressScreen';
import LockScreen from './src/ui/screens/LockScreen';
import CreateObligationScreen from './src/ui/screens/CreateObligationScreen';

// Stores
import useCommitmentStore from './src/store/commitmentStore';
import useUserStore from './src/store/userStore';
import useObligationStore from './src/store/obligationStore';
import { colors } from './src/ui/theme/colors';
import { initNotifications } from './src/services/notificationService';

const Tab = createBottomTabNavigator();
const WorkoutStack = createNativeStackNavigator();
const NutritionStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const DisciplineStack = createNativeStackNavigator();

const screenOptions = { headerShown: false, animation: 'slide_from_right' };

// ─── Workout Stack ────────────────────────────────────────────────────────────
function WorkoutStackScreen() {
  return (
    <WorkoutStack.Navigator screenOptions={screenOptions}>
      <WorkoutStack.Screen name="WorkoutHome" component={WorkoutHomeScreen} />
      <WorkoutStack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <WorkoutStack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
      <WorkoutStack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
    </WorkoutStack.Navigator>
  );
}

// ─── Nutrition Stack ──────────────────────────────────────────────────────────
function NutritionStackScreen() {
  return (
    <NutritionStack.Navigator screenOptions={screenOptions}>
      <NutritionStack.Screen name="NutritionHome" component={NutritionHomeScreen} />
      <NutritionStack.Screen
        name="MealLog"
        component={MealLogScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </NutritionStack.Navigator>
  );
}

// ─── Profile Stack ────────────────────────────────────────────────────────────
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Lookmaxxing" component={LookmaxxingScreen} />
      <ProfileStack.Screen name="Progress" component={ProgressScreen} />
    </ProfileStack.Navigator>
  );
}

// ─── Discipline Stack ─────────────────────────────────────────────────────────
function DisciplineStackScreen() {
  return (
    <DisciplineStack.Navigator screenOptions={screenOptions}>
      <DisciplineStack.Screen name="DisciplineHome" component={DisciplineScreen} />
      <DisciplineStack.Screen
        name="CreateObligation"
        component={CreateObligationScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </DisciplineStack.Navigator>
  );
}

// ─── Tab Navigator ────────────────────────────────────────────────────────────
function MainTabs() {
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
      <Tab.Screen name="Workout" component={WorkoutStackScreen} />
      <Tab.Screen name="Nutrition" component={NutritionStackScreen} />
      <Tab.Screen name="Discipline" component={DisciplineStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
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
  // Load fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  const [isReady, setIsReady] = useState(false);

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
      setIsReady(true);
      tick();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Hide splash once fonts + app are ready
  useEffect(() => {
    if (fontsLoaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  // Tick every second after onboarding
  useEffect(() => {
    if (!hasCommitted || !hasCompletedOnboarding) return;
    const interval = setInterval(tick, 1000);

    // Init notifications
    initNotifications().catch(() => { });

    return () => clearInterval(interval);
  }, [hasCommitted, hasCompletedOnboarding]);

  if (!fontsLoaded || !isReady) {
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

  // MAIN APP: Tab Navigator with nested stacks
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
