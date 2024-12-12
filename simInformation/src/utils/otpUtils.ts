import axios from 'axios';
import SimCardsManagerModule from 'react-native-sim-cards-manager';

export const extractOtpFromMessage = (message: string): string | null => {
    // Regex to match exactly 8-digit numeric codes
    const otpRegex = /\b\d{8}\b/;
    const match = message.match(otpRegex);
    console.log('Extracted OTP:', match ? match[0] : 'None');
    return match ? match[0] : null;
};

export const getSimPhoneNumber = async (): Promise<string | null> => {
    try {
        const simData = await SimCardsManagerModule.getSimCards();
        console.log('SIM Data:', simData);

        // Access phone number from the first SIM card
        let phoneNumber = simData[0]?.phoneNumber || null;

        // Remove the initial "91" if present
        if (phoneNumber?.startsWith('91') && phoneNumber.length > 10) {
            phoneNumber = phoneNumber.substring(2); // Remove the first two characters
        }

        console.log('Processed Phone Number:', phoneNumber);

        if (!phoneNumber) {
            throw new Error('Phone number not found on SIM.');
        }

        return phoneNumber;
    } catch (error) {
        console.error('Error fetching phone number from SIM:', error);
        return null;
    }
};
