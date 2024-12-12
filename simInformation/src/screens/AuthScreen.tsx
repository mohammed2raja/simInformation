import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { styles as authStyles } from '../styles/AuthScreenStyles';
import { extractOtpFromMessage, getSimPhoneNumber } from '../utils/otpUtils';
import { useSmsListener } from '../hooks/useSmsListener';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useCallDetection } from '../features/callRecording/useCallDetection';
import { login, sendOtpApi, validateOtpApi } from '../api/checkInOutApi';
// Add navigation prop typing for better TypeScript support
interface AuthScreenProps {
    navigation: any; // Replace 'any' with the correct type if using TypeScript for React Navigation
}
const AuthScreen = ({ navigation }: AuthScreenProps) => {
    const [status, setStatus] = useState<string>('Fetching phone number...');
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Track authentication status
    const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false); // Track Check-in/Check-out status

    useCallDetection(isCheckedIn); // Pass check-in state to trigger call detection

    useEffect(() => {
        const initialize = async () => {
            try {
                const simPhoneNumber = await getSimPhoneNumber();
                console.log("---------------------------------");
                console.log('Phone Number:', simPhoneNumber);
                console.log("==============================================")
                if (simPhoneNumber) {
                    setPhoneNumber(simPhoneNumber);
                    setStatus('Sending OTP...');
                    await handleSendOtp(simPhoneNumber);
                } else {
                    throw new Error('Phone number not available on SIM.');
                }
            } catch (error) {
                console.error('Initialization error:', error);
                setStatus('Error fetching phone number');
            }
        };

        initialize();
    }, []);

    const handleSendOtp = async (mobile: string): Promise<void> => {
        try {
            const response = await sendOtpApi(Number(mobile));
            console.log('OTP Sent Response:', response);
            setStatus('Listening for incoming SMS...');
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            setStatus(`Error sending OTP: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleValidateOtp = async (otp: string): Promise<void> => {
        try {
            console.log('Validating OTP:', otp);
            const response = await validateOtpApi(Number(phoneNumber), otp) as any;
            console.log('Login response:', response);

            if (response.status === 'SUCCESS') {
                setStatus('Authentication successful!');
                setIsAuthenticated(true);

                // Store access_token in AsyncStorage
                await AsyncStorage.setItem('access_token', response.access_token);

                navigation.replace('Home'); // Navigate to HomeScreen
            } else {
                throw new Error('Login failed. Invalid credentials.');
            }
        } catch (error: any) {
            console.error('Error login:', error);
            setStatus(`Login failed: ${error.response?.data?.error || error.message}`);
        }
    };

    useSmsListener((message) => {
        const otp = extractOtpFromMessage(message);
        if(!otp || !phoneNumber) return;
        console.log('SMS Listener Triggered:', otp);
        console.log('Received OTP:', otp);
        setStatus('Validating OTP...');
        handleValidateOtp(otp);
    });

    const handleCheckIn = () => {
        if (!isCheckedIn) {
            setStatus('Checked in. Recording calls...');
            setIsCheckedIn(true);
        } else {
            setStatus('Checked out. Call recording stopped.');
            setIsCheckedIn(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <View style={authStyles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={authStyles.status}>{status}</Text>
                {phoneNumber && (
                    <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>
                        Phone Number: {phoneNumber}
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.status}>{status}</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, isCheckedIn && styles.activeButton]}
                    onPress={handleCheckIn}
                >
                    <Text style={styles.buttonText}>{isCheckedIn ? 'Check-out' : 'Check-in'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    status: {
        marginTop: 20,
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 10,
        width: 150,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#4caf50', // Active button color for Check-in
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AuthScreen;
