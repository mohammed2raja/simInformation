import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const ACCESS_TOKEN_KEY = 'access_token';
const TOKEN_TIMESTAMP_KEY = 'access-token-timestamp';
const TOKEN_EXPIRY_DAYS = 30;

const AppNavigator = () => {
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            try {
                // Get the access token and timestamp from AsyncStorage
                const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
                const tokenTimestamp = await AsyncStorage.getItem(TOKEN_TIMESTAMP_KEY);
                console.log('Access Token:', accessToken);
                console.log('Token Timestamp:', tokenTimestamp);
                if (accessToken && tokenTimestamp) {
                    const tokenDate = new Date(parseInt(tokenTimestamp, 10));
                    const currentDate = new Date();

                    // Calculate the token age in days
                    const tokenAgeInDays = (currentDate.getTime() - tokenDate.getTime()) / (1000 * 60 * 60 * 24);
                    console.log('Token Age (days):', tokenAgeInDays);
                    if (tokenAgeInDays <= TOKEN_EXPIRY_DAYS) {
                        // Token is valid
                        setInitialRoute('Home');
                        return;
                    }
                }

                // If no token or token is expired, navigate to Auth
                setInitialRoute('Auth');
            } catch (error) {
                console.error('Error checking access token:', error);
                setInitialRoute('Auth'); // Default to Auth in case of error
            }
        };

        checkToken();
    }, []);

    if (!initialRoute) {
        // Show a loading indicator until the initial route is determined
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;