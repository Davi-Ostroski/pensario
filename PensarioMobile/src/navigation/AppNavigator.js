import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import NotesListScreen from '../screens/NotesListScreen';
import NoteFormScreen from '../screens/NoteFormScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerStyle: {
        backgroundColor: '#007bff',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ title: 'Entrar' }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen} 
      options={{ title: 'Registrar' }}
    />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    initialRouteName="NotesList"
    screenOptions={{
      headerStyle: {
        backgroundColor: '#007bff',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="NotesList" 
      component={NotesListScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="NoteForm" 
      component={NoteFormScreen} 
      options={{ title: 'Nova Nota' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Ou um componente de loading
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;

