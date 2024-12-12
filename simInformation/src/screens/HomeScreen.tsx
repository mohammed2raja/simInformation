import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCallRecording } from '../hooks/useCallRecording';
import { checkInOutApi } from '../api/checkInOutApi';

const HomeScreen = ({ navigation }: { navigation: any }) => {
    const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // Call or stop call recording based on Check-in status
    useCallRecording(isCheckedIn);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await checkInOutApi(true); // Call API with source: true
            setIsCheckedIn(true);
            Alert.alert('Success', 'Checked in successfully. Call recording started.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to Check-in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            await checkInOutApi(false); // Call API with source: false
            setIsCheckedIn(false);
            Alert.alert('Success', 'Checked out successfully. Call recording stopped.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to Check-out. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        navigation.replace('Auth');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome</Text>
            <View style={styles.buttonContainer}>
                {!isCheckedIn ? (
                    <TouchableOpacity
                        style={[styles.button, styles.checkInButton, loading && styles.disabledButton]}
                        onPress={handleCheckIn}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Check-in'}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.checkOutButton, loading && styles.disabledButton]}
                        onPress={handleCheckOut}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Check-out'}</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.button, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <Text style={styles.buttonText}>Logout</Text>
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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
    },
    button: {
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        width: 200,
        alignItems: 'center',
    },
    checkInButton: {
        backgroundColor: '#4caf50',
    },
    checkOutButton: {
        backgroundColor: '#f44336',
    },
    logoutButton: {
        backgroundColor: '#2196f3',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default HomeScreen;