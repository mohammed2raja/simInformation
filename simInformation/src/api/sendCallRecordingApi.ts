import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://kongumayyam.com/api/v1/profile';

export interface CallRecordingPayload {
    call_type: 'INCOMING' | 'OUTGOING';
    cdate: string; // Call start time in "YYYY-MM-DD HH:mm:ss" format
    cduration: string; // Call duration as "HH:mm:ss"
    cnumber: string; // Caller/Receiver number
    date: number; // Timestamp of the call in milliseconds
    duration: number; // Call duration in seconds
    number: string; // International number format
    files: {
        name: string;
        localURL: string;
        type: string;
        lastModified: number;
        lastModifiedDate: number;
        size: number;
        start: number;
        end: number;
        record_file: string; // Base64 encoded string of the file
    };
}

export const sendCallRecordingApi = async (payload: any) => {
    try {
        const accessToken = await AsyncStorage.getItem('access_token'); // Retrieve the access token

        const response = await axios.post(
            `${BASE_URL}/auto-logs`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: accessToken || '', // Use the access token
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error during auto-logs API call:', error.message);
        throw error;
    }
};