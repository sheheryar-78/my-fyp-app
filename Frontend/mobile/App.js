import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
// You will need to install async-storage to persist auth token
// import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/pages/Login';
import DashboardScreen from './src/pages/Dashboard';
import AIAgentsScreen from './src/pages/AIAgents';
import DocumentsScreen from './src/pages/Documents';
import CallHistoryScreen from './src/pages/CallHistory';
import BillingScreen from './src/pages/Billing';
import SettingsScreen from './src/pages/Settings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Agents" component={AIAgentsScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Calls" component={CallHistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Basic check - in reality you'll use AsyncStorage
    // const checkToken = async () => {
    //   const token = await AsyncStorage.getItem('token');
    //   setIsLoggedIn(!!token);
    //   setIsLoading(false);
    // };
    // checkToken();
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
