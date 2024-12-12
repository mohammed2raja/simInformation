import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://kongumayyam.com/api/v1/employee';

export const checkInOutApi = async (source: boolean): Promise<any> => {
    try {
        const accessToken = await AsyncStorage.getItem('access_token'); // Retrieve the access token

        const response = await axios.post(
            `${BASE_URL}/checkinout`,
            { source },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: accessToken || '', // Use the access token
                },
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error during Check-in/Check-out API call:', error.message);
        throw error;
    }
};

export type OTPResponse = {
    message: string;
    sid?: string;
};

export const sendOtpApi = async (mobile: number): Promise<OTPResponse> => {
    const response = await axios.post<OTPResponse>(
    'https://kongumayyam.com/api/v1/user/verification',
    { mobile }
    );
    return response.data;
};

export const validateOtpApi = async (mobile: number, otp: string): Promise<OTPResponse> => {
    const response = await axios.post<OTPResponse>(
        'https://kongumayyam.com/api/v1/user/verify-otp',
        { mobile, otp }
    );
    return response.data;
};
export const login = async (mobile: number, otp: string): Promise<OTPResponse> => {
    const response = await axios.post<OTPResponse>(
        'https://kongumayyam.com/api/v1/user/login',
        { username:mobile, password:otp, seg:'app' }
    );
    return response.data;
};