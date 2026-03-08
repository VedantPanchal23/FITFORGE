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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

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
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

import * as Haptics from 'expo-haptics';

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: getTabColor(route.name),
        tabBarInactiveTintColor: colors.textDim,
        tabBarShowLabel: false, // Cleaner look without text
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          borderTopWidth: 0, // Remove default border
          elevation: 0, // Remove Android shadow to use custom shadow
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 0.15,
          shadowRadius: 24,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, borderRadius: 32, overflow: 'hidden' }}>
            <BlurView
              tint="light"
              intensity={80}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        ),
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Workout: focused ? 'barbell' : 'barbell-outline',
            Nutrition: focused ? 'nutrition' : 'nutrition-outline',
            Discipline: focused ? 'flash' : 'flash-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              top: 4, // Adjust for removed labels
              transform: [{ scale: focused ? 1.15 : 1 }] // Slight scale leap
            }}>
              <Ionicons name={icons[route.name]} size={24} color={color} />
            </View>
          );
        },
      })}
      screenListeners={{
        tabPress: (e) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
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
