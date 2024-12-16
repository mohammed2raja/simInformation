import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ImageBackground,
    Image,
} from 'react-native';
import { useCallRecording } from '../hooks/useCallRecording';
import { checkInOutApi } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from '../components/CustomModal';

const HomeScreen = ({ navigation }: { navigation: any }) => {
    const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalAction, setModalAction] = useState<'checkIn' | 'checkOut' | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useCallRecording(isCheckedIn);
    useEffect(() => {
        // Simulate a short delay before the screen is mounted
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);


    const handleCheckIn = async () => {
        setLoading(true);
        setShowModal(false); // Hide modal before starting
        try {
            await checkInOutApi(true);
            setIsCheckedIn(true);
            await AsyncStorage.setItem('checked_in_state', 'true');
        } catch (error: any) {
            console.error('Error during check-in:', error.message || 'Failed to check in.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        setShowModal(false); // Hide modal before starting
        try {
            await checkInOutApi(false);
            setIsCheckedIn(false);
            await AsyncStorage.removeItem('checked_in_state');
        } catch (error: any) {
            console.error('Error during check-out:', error.message || 'Failed to check out.');
        } finally {
            setLoading(false);
        }
    };

    const handleModalConfirm = () => {
        if (modalAction === 'checkIn') {
            handleCheckIn();
        } else if (modalAction === 'checkOut') {
            handleCheckOut();
        }
    };

    const handleLogout = () => {
        navigation.replace('Auth');
    };
    
    if (!isMounted) {
        return null; // Show nothing until the screen is mounted
    }
        
    return (
        <ImageBackground
            source={require('../assets/landing.jpg')}
            style={styles.background}
            blurRadius={10}
        >
                <View style={styles.container}>
                    {loading && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#0000ff" />
                            <Text style={styles.loaderText}>Processing...</Text>
                        </View>
                    )}
                    {!loading && (
                        <>
                            {isCheckedIn ? (
                                <View style={styles.checkedInContainer}>
                                    <View style={styles.circularBackground}>
                                        <Image 
                                            source={require('../assets/mayyam-logo.png')} 
                                            style={styles.logo} 
                                            resizeMode="contain" 
                                        />
                                    </View>
                                    <View style={styles.checkedInMessageContainer}>
                                        <Text style={styles.welcomeText}>You are ready for customer support!</Text>
                                        <Text style={styles.instructionText}>
                                            Your call will be monitored. Both incoming and outgoing calls will be recorded and securely sent to the backend.
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.checkOutButton}
                                        onPress={() => {
                                            setModalAction('checkOut');
                                            setShowModal(true);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Check-Out</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.checkedInContainer}>
                                    <View style={styles.circularBackground}>
                                        <Image 
                                            source={require('../assets/mayyam-logo.png')} 
                                            style={styles.logo} 
                                            resizeMode="contain" 
                                        />
                                    </View>
                                    <View style={styles.checkedInMessageContainer}>
                                        <Text style={styles.welcomeText}>Welcome!</Text>
                                        <Text style={styles.instructionText}>
                                            You are currently logged in but not checked in.
                                        </Text>
                                        <Text style={styles.instructionText}>
                                            Tap "Check-In" below to start assisting customers. Once checked in, both incoming and outgoing
                                            calls will be monitored and securely recorded for quality purposes.
                                        </Text>
                                    </View>
                                <TouchableOpacity
                                    style={styles.checkInButton}
                                    onPress={() => {
                                        setModalAction('checkIn');
                                        setShowModal(true);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Check-In</Text>
                                </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* Logout as a Link */}
                    <Text
                        style={styles.logoutLink}
                        onPress={handleLogout}
                    >
                        Logout
                    </Text>

                    {/* Custom Modal */}
                    <CustomModal
                        visible={showModal}
                        title={
                            modalAction === 'checkIn' ? 'Confirm Check-In' : 'Confirm Check-Out'
                        }
                        message={`Are you sure you want to ${
                            modalAction === 'checkIn' ? 'check in' : 'check out'
                        }?`}
                        onConfirm={handleModalConfirm}
                        onCancel={() => setShowModal(false)}
                    />
                </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    checkedInContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    checkInContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    circularBackground: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#ffffff', // White background
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000', // Shadow color (black)
        shadowOffset: {
            width: 0, // Horizontal shadow
            height: 4, // Vertical shadow
        },
        shadowOpacity: 0.3, // Shadow opacity
        shadowRadius: 4.65, // Blur radius
        elevation: 8, // Shadow effect for Android
    },
    checkedInText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    checkedInMessage: {
        fontSize: 14,
        textAlign: 'center',
        color: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
    },
    checkedInMessageContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black background
        borderRadius: 10, // Rounded corners for aesthetics
        padding: 10, // Add padding around the text
        marginHorizontal: 20, // Margin for consistent spacing
        marginBottom: 20, // Space between message and other components
    },
    checkInButton: {
        backgroundColor: '#4caf50',
        padding: 15,
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
    },
    checkOutButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    logoutLink: {
        fontSize: 16, // Slightly larger font size for better readability
        color: '#2196f3', // Keep the link blue for emphasis
        textDecorationLine: 'underline', // Make it look like a link
        position: 'absolute',
        bottom: 50, // Adjust placement to ensure visibility
        alignSelf: 'center', // Center horizontally
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Add a semi-transparent background
        padding: 5, // Add padding for better touch target
        borderRadius: 5, // Round the edges of the background
    },
    logo: {
        width: 100, // Adjust the width as needed
        height: 100, // Adjust the height as needed
    },
    welcomeText: {
        fontSize: 24, // Larger font size for emphasis
        fontWeight: 'bold', // Bold font for impact
        color: '#4caf50', // Green color to match the theme
        textAlign: 'center', // Centered text
        marginBottom: 10, // Space below the "Welcome!" text
    },
    instructionText: {
        fontSize: 16, // Standard font size for instructions
        fontWeight: '400', // Regular weight for readability
        color: '#ffffff', // White color for contrast
        textAlign: 'center', // Centered text
        lineHeight: 24, // Increased line height for better spacing
        marginBottom: 10, // Space between paragraphs
    },
});

export default HomeScreen;