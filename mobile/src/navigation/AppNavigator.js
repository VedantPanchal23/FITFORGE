import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

// Onboarding Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import DemographicsScreen from '../screens/DemographicsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import DietScreen from '../screens/DietScreen';
import LifestyleScreen from '../screens/LifestyleScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import LooksmaxingScreen from '../screens/LooksmaxingScreen';

// Main Screens (Tabs)
import HomeScreen from '../screens/HomeScreen';
import FoodScreen from '../screens/FoodScreen';
import BodyScreen from '../screens/BodyScreen';
import HealthScreen from '../screens/HealthScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Module Screens (Stack)
import LooksScreen from '../screens/LooksScreen';
import RoutineScreen from '../screens/RoutineScreen';
import GoalManagerScreen from '../screens/GoalManagerScreen';
import PlanScreen from '../screens/PlanScreen';
import ProgressScreen from '../screens/ProgressScreen';

// Feature Screens
import DailyCheckInScreen from '../screens/DailyCheckInScreen';
import WeeklyReviewScreen from '../screens/WeeklyReviewScreen';
import MonthlyReviewScreen from '../screens/MonthlyReviewScreen';
import BodyMeasurementsScreen from '../screens/BodyMeasurementsScreen';
import HabitHeatmapsScreen from '../screens/HabitHeatmapsScreen';
import BackupScreen from '../screens/BackupScreen';
import LoggingScreen from '../screens/LoggingScreen';
import FastingScreen from '../screens/FastingScreen';
import CycleScreen from '../screens/CycleScreen';
import ExportScreen from '../screens/ExportScreen';
import FoodLoggingScreen from '../screens/FoodLoggingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNav = () => {
    const { theme } = useTheme();

    const tabConfig = {
        Home: { icon: 'home', label: 'Command' },
        Food: { icon: 'coffee', label: 'Food' },
        Body: { icon: 'activity', label: 'Body' },
        Health: { icon: 'heart', label: 'Health' },
        Profile: { icon: 'user', label: 'Profile' }
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color }) => {
                    const iconName = tabConfig[route.name]?.icon || 'circle';
                    return <Feather name={iconName} size={22} color={color} />;
                },
                tabBarLabel: tabConfig[route.name]?.label || route.name,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textTertiary,
                tabBarStyle: {
                    backgroundColor: theme.card,
                    borderTopColor: theme.cardBorder,
                    height: 70,
                    paddingBottom: 12,
                    paddingTop: 8
                },
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' }
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Food" component={FoodScreen} />
            <Tab.Screen name="Body" component={BodyScreen} />
            <Tab.Screen name="Health" component={HealthScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default function AppNavigator() {
    const { theme, isDark } = useTheme();
    const navTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDark ? DarkTheme : DefaultTheme).colors,
            background: theme.background,
            card: theme.card,
            text: theme.text,
            border: theme.border,
            primary: theme.primary
        }
    };

    return (
        <SafeAreaProvider>
            <NavigationContainer theme={navTheme}>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {/* Splash */}
                    <Stack.Screen name="Splash" component={SplashScreen} />

                    {/* Onboarding (7 steps) */}
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Demographics" component={DemographicsScreen} />
                    <Stack.Screen name="Goals" component={GoalsScreen} />
                    <Stack.Screen name="Diet" component={DietScreen} />
                    <Stack.Screen name="Lifestyle" component={LifestyleScreen} />
                    <Stack.Screen name="Workout" component={WorkoutScreen} />
                    <Stack.Screen name="Looksmaxing" component={LooksmaxingScreen} />

                    {/* Main App with Bottom Tabs */}
                    <Stack.Screen name="Main" component={TabNav} />

                    {/* Module Screens (all 5 domains accessible) */}
                    <Stack.Screen name="Looks" component={LooksScreen} />
                    <Stack.Screen name="Routine" component={RoutineScreen} />
                    <Stack.Screen name="GoalManager" component={GoalManagerScreen} />
                    <Stack.Screen name="Plan" component={PlanScreen} />
                    <Stack.Screen name="Progress" component={ProgressScreen} />

                    {/* Feature Screens */}
                    <Stack.Screen name="DailyCheckIn" component={DailyCheckInScreen} options={{ presentation: 'modal' }} />
                    <Stack.Screen name="WeeklyReview" component={WeeklyReviewScreen} />
                    <Stack.Screen name="MonthlyReview" component={MonthlyReviewScreen} />
                    <Stack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
                    <Stack.Screen name="HabitHeatmaps" component={HabitHeatmapsScreen} />

                    {/* Settings Screens */}
                    <Stack.Screen name="Backup" component={BackupScreen} />
                    <Stack.Screen name="Fasting" component={FastingScreen} />
                    <Stack.Screen name="Cycle" component={CycleScreen} />
                    <Stack.Screen name="Export" component={ExportScreen} />

                    {/* Modals */}
                    <Stack.Screen name="Logging" component={LoggingScreen} options={{ presentation: 'modal' }} />
                    <Stack.Screen name="FoodLogging" component={FoodLoggingScreen} options={{ presentation: 'modal' }} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
