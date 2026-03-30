import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS } from '../constants/theme';

import DashboardScreen from '../screens/DashboardScreen';
import GoalsScreen from '../screens/GoalsScreen';
import GoalDetailScreen from '../screens/GoalDetailScreen';
import GoalFormScreen from '../screens/GoalFormScreen';
import RecentActivityScreen from '../screens/RecentActivityScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SmsTransactionsScreen from '../screens/SmsTransactionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import ExpenseAnalyticsScreen from '../screens/ExpenseAnalyticsScreen';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { resolveIcon } from '../constants/icons';

const Stack = createNativeStackNavigator();
const ExpensesStack = createNativeStackNavigator();

function ExpensesStackNavigator() {
  return (
    <ExpensesStack.Navigator screenOptions={{ headerShown: false }}>
      <ExpensesStack.Screen name="ExpensesList" component={ExpensesScreen} />
      <ExpensesStack.Screen
        name="ExpenseAnalytics"
        component={ExpenseAnalyticsScreen}
        options={{ presentation: 'card' }}
      />
    </ExpensesStack.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="DashboardTab" 
      screenOptions={{ headerShown: false }}
      screenListeners={({ navigation, route }) => ({
        beforeRemove: (e) => {
          // Get the current route and the parent navigation
          const state = navigation.getState();
          const currentRouteName = route.name;
          
          // Root tab screens that should have special back behavior
          const rootTabScreens = ['DashboardTab', 'GoalsTab', 'ExpensesTab', 'AnalyticsTab', 'TransactionsTab', 'SettingsTab'];
          
          // Check if current screen is a root tab and we're trying to go back
          if (rootTabScreens.includes(currentRouteName) && state.routes.length > 1) {
            // If we're on DashboardTab, let the default behavior happen (DashboardScreen handles it)
            if (currentRouteName === 'DashboardTab') {
              return;
            }
            
            // If we're on any other tab root, navigate to Dashboard instead of going back
            e.preventDefault();
            navigation.navigate('DashboardTab' as never);
          }
        },
      })}
    >
      <Stack.Screen 
        name="DashboardTab" 
        component={DashboardScreenWithTabBar}
      />
      <Stack.Screen 
        name="GoalsTab" 
        component={GoalsScreenWithTabBar}
      />
      <Stack.Screen 
        name="ExpensesTab" 
        component={ExpensesStackNavigatorWithTabBar}
      />
      <Stack.Screen 
        name="AnalyticsTab" 
        component={AnalyticsScreenWithTabBar}
      />
      <Stack.Screen 
        name="TransactionsTab" 
        component={SmsTransactionsScreenWithTabBar}
      />
      <Stack.Screen 
        name="SettingsTab" 
        component={SettingsScreenWithTabBar}
      />
      <Stack.Screen
        name="GoalDetail"
        component={GoalDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="GoalForm"
        component={GoalFormScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="RecentActivity"
        component={RecentActivityScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}

function TabBar({ navigation, currentScreen }: any) {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();

  const tabs = [
    { key: 'DashboardTab', title: t.dashboard, icon: 'faHouse' },
    { key: 'GoalsTab', title: t.goals, icon: 'faBullseye' },
    { key: 'ExpensesTab', title: t.expenses, icon: 'faWallet' },
    { key: 'AnalyticsTab', title: t.analytics, icon: 'faChartLine' },
    { key: 'TransactionsTab', title: isRTL ? 'رسائل SMS' : 'SMS', icon: 'faEnvelope' },
    { key: 'SettingsTab', title: t.settings, icon: 'faCog' },
  ];

  const orderedTabs = isRTL ? [...tabs].reverse() : tabs;

  return (
    <View
      style={{
        backgroundColor: theme.tabBar,
        borderTopColor: theme.cardBorder,
        borderTopWidth: 1,
        paddingBottom: 6,
        paddingTop: 6,
        height: 80,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {orderedTabs.map(tab => {
        const isFocused = currentScreen === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              // Only navigate if not already on this tab
              if (!isFocused) {
                navigation.navigate(tab.key);
              }
            }}
            style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 8, flex: 1 }}
          >
            <FontAwesomeIcon
              icon={resolveIcon(tab.icon)}
              size={isFocused ? 22 : 20}
              color={isFocused ? COLORS.accent : theme.textMuted}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '600',
                marginTop: 2,
                color: isFocused ? COLORS.accent : theme.textMuted,
              }}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function DashboardScreenWithTabBar(props: any) {
  return (
    <View style={{ flex: 1 }}>
      <DashboardScreen {...props} />
      <TabBar navigation={props.navigation} currentScreen="DashboardTab" />
    </View>
  );
}

function GoalsScreenWithTabBar(props: any) {
  return (
    <View style={{ flex: 1 }}>
      <GoalsScreen {...props} />
      <TabBar navigation={props.navigation} currentScreen="GoalsTab" />
    </View>
  );
}

function ExpensesStackNavigatorWithTabBar(props: any) {
  return (
    <View style={{ flex: 1 }}>
      <ExpensesStackNavigator />
      <TabBar navigation={props.navigation} currentScreen="ExpensesTab" />
    </View>
  );
}

function AnalyticsScreenWithTabBar(props: any) {
  return (
    <View style={{ flex: 1 }}>
      <AnalyticsScreen {...props} />
      <TabBar navigation={props.navigation} currentScreen="AnalyticsTab" />
    </View>
  );
}

function SmsTransactionsScreenWithTabBar(props: any) {
  return (
    <View style={{ flex: 1 }}>
      <SmsTransactionsScreen {...props} />
      <TabBar navigation={props.navigation} currentScreen="TransactionsTab" />
    </View>
  );
}

function SettingsScreenWithTabBar(props: any) {
  return (
    <View style={{ flex: 1 }}>
      <SettingsScreen {...props} />
      <TabBar navigation={props.navigation} currentScreen="SettingsTab" />
    </View>
  );
}

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'MainStack' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then(val => {
      setInitialRoute(val === 'true' ? 'MainStack' : 'Onboarding');
    });
  }, []);

  // Show nothing (blank dark screen) while determining initial route
  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="MainStack"
          component={MainStackNavigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}