import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Alert,
  AppState,
  AppStateStatus,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { requestPermissions } from './src/utils/permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkInOutApi } from './src/api/api';

const App = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const appState = useRef(AppState.currentState);


  useEffect(() => {
    const initializeApp = async () => {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permissions Required',
          'The app requires permissions to function properly. Please grant them in the settings.',
        );
      }
      setPermissionsGranted(granted);
    };

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log('App State:', appState.current, '->', nextAppState);
      // Check if the app moves to the background or is closed
      if (appState.current.match(/active/) && nextAppState.match(/inactive/)) {
          console.log('App is in the background or closed.');
          const isCheckedIn = await AsyncStorage.getItem('checked_in_state');

          // Auto-checkout if the user is "checkedIn"
          if (isCheckedIn === 'true') {
              try {
                  console.log('User is checked in. Automatically checking out...');
                  await checkInOutApi(false); // Perform the checkout API call
                  await AsyncStorage.removeItem('checked_in_state'); // Clear the state
              } catch (error) {
                  console.error('Error during auto-checkout:', error);
              }
          }
      }

      appState.current = nextAppState;
  };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    initializeApp();

      return () => {
        console.log('Removing AppState listener...');
        subscription.remove();
    };
  }, [requestPermissions, checkInOutApi, AsyncStorage]);

  if (!permissionsGranted) {
    return (

      <ImageBackground
        source={require('./src/assets/landing.jpg')} // Replace with your actual image path
        style={styles.background}
      >
       <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
          <Text style={styles.message}>Requesting Permissions...</Text>
        </View>
      </ImageBackground>
    );
  }

  return <AppNavigator />;
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Adds a dark overlay for better text visibility
    padding: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});


export default App;