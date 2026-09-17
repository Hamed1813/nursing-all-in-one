import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

import { HomeScreen } from '../screens/HomeScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { DomainListScreen } from '../screens/DomainListScreen';
import { DomainPagesScreen } from '../screens/DomainPagesScreen';
import { PageReaderScreen } from '../screens/PageReaderScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ReviewListScreen } from '../screens/ReviewListScreen';
import { ExamSetupScreen } from '../screens/ExamSetupScreen';
import { ExamRunScreen } from '../screens/ExamRunScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const BrowseStack = createNativeStackNavigator();
const ReviewStack = createNativeStackNavigator();
const ExamStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function useStackScreenOptions() {
  const { theme } = useApp();
  return {
    headerStyle: { backgroundColor: theme.color.surface },
    headerTintColor: theme.color.text,
    headerTitleStyle: { fontFamily: 'Lalezar_400Regular', fontSize: 19 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.color.bg },
  } as const;
}

function HomeStackNavigator() {
  const opts = useStackScreenOptions();
  return (
    <HomeStack.Navigator screenOptions={opts}>
      <HomeStack.Screen name="HomeRoot" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Stats" component={StatsScreen} options={{ title: 'آمار کامل' }} />
      <HomeStack.Screen name="PageReader" component={PageReaderScreen} options={{ title: '' }} />
      <HomeStack.Screen name="Quiz" component={QuizScreen} options={{ title: 'سؤالات صفحه' }} />
    </HomeStack.Navigator>
  );
}

function BrowseStackNavigator() {
  const opts = useStackScreenOptions();
  return (
    <BrowseStack.Navigator screenOptions={opts}>
      <BrowseStack.Screen name="DomainList" component={DomainListScreen} options={{ headerShown: false }} />
      <BrowseStack.Screen name="DomainPages" component={DomainPagesScreen} options={({ route }: any) => ({ title: route.params.domainName })} />
      <BrowseStack.Screen name="PageReader" component={PageReaderScreen} options={{ title: '' }} />
      <BrowseStack.Screen name="Quiz" component={QuizScreen} options={{ title: 'سؤالات صفحه' }} />
    </BrowseStack.Navigator>
  );
}

function ReviewStackNavigator() {
  const opts = useStackScreenOptions();
  return (
    <ReviewStack.Navigator screenOptions={opts}>
      <ReviewStack.Screen name="ReviewList" component={ReviewListScreen} options={{ headerShown: false }} />
      <ReviewStack.Screen name="PageReader" component={PageReaderScreen} options={{ title: '' }} />
      <ReviewStack.Screen name="Quiz" component={QuizScreen} options={{ title: 'سؤالات صفحه' }} />
    </ReviewStack.Navigator>
  );
}

function ExamStackNavigator() {
  const opts = useStackScreenOptions();
  return (
    <ExamStack.Navigator screenOptions={opts}>
      <ExamStack.Screen name="ExamSetup" component={ExamSetupScreen} options={{ headerShown: false }} />
      <ExamStack.Screen name="ExamRun" component={ExamRunScreen} options={{ title: 'آزمون', headerBackVisible: false }} />
    </ExamStack.Navigator>
  );
}

function SettingsStackNavigator() {
  const opts = useStackScreenOptions();
  return (
    <SettingsStack.Navigator screenOptions={opts}>
      <SettingsStack.Screen name="SettingsRoot" component={SettingsScreen} options={{ headerShown: false }} />
    </SettingsStack.Navigator>
  );
}

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  خانه: 'home-outline',
  مرور: 'book-outline',
  بازخوانی: 'refresh-outline',
  آزمون: 'flash-outline',
  تنظیمات: 'settings-outline',
};

export function RootNavigator() {
  const { theme, settings } = useApp();
  const navTheme = settings.theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: theme.color.bg,
          card: theme.color.surface,
          text: theme.color.text,
          border: theme.color.hairline,
          primary: theme.color.primary,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.color.primary,
          tabBarInactiveTintColor: theme.color.textMuted,
          tabBarStyle: {
            backgroundColor: theme.color.surface,
            borderTopColor: theme.color.hairline,
            borderTopWidth: 1,
            height: 62,
            paddingTop: 6,
            paddingBottom: 8,
          },
          tabBarLabelStyle: { fontFamily: 'Vazirmatn_500Medium', fontSize: 11.5 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS[route.name] ?? 'ellipse-outline'} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="خانه" component={HomeStackNavigator} />
        <Tab.Screen name="مرور" component={BrowseStackNavigator} />
        <Tab.Screen name="بازخوانی" component={ReviewStackNavigator} />
        <Tab.Screen name="آزمون" component={ExamStackNavigator} />
        <Tab.Screen name="تنظیمات" component={SettingsStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
