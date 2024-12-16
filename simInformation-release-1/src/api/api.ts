import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://kongumayyam.com/api/v1';
const EMPLOYEE_BASE_URL = `${BASE_URL}/employee`;
const USER_BASE_URL = `${BASE_URL}/user`;
const PROFILE_BASE_URL = `${BASE_URL}/profile`;

export interface CallRecordingPayload {
  call_type: 'INCOMING' | 'OUTGOING';
  cdate: string; 
  cduration: string; 
  cnumber: string; 
  date: number; 
  duration: number; 
  number: string; 
  files: {
    name: string;
    localURL: string;
    type: string;
    lastModified: number;
    lastModifiedDate: number;
    size: number;
    start: number;
    end: number;
    record_file: string;
  };
}

// Helper function to get Authorization headers
async function getAuthHeaders() {
  const accessToken = await AsyncStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': accessToken ?? '',
    'Accept-Encoding': 'identity',
  };
}

// ---------------------- Auth & OTP APIs ----------------------

// Send OTP to a given mobile number
export const sendOtpApi = async (mobile: number) => {
  const response = await axios.post(
    `${USER_BASE_URL}/verification`, 
    { mobile },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
};

// Validate OTP and potentially receive an access token
export const validateOtpApi = async (mobile: number, otp: string) => {
  const response = await axios.post(
    `${USER_BASE_URL}/verify-otp`,
    { mobile, otp },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
};

// ---------------------- Employee Check-In/Out API ----------------------

export const checkInOutApi = async (source: boolean) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${EMPLOYEE_BASE_URL}/checkinout`,
      { source },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error during Check-in/Check-out API call:', error.message);
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('access_token');
    }
    throw error;
  }
};

// ---------------------- Call Recording API ----------------------

export const sendCallRecordingApi = async (payload: CallRecordingPayload[]) => {
  try {
    const headers = await getAuthHeaders();
    console.log('Sending call recording with headers:', headers);
    const response = await axios.post(
      `${PROFILE_BASE_URL}/auto-logs`,
      payload,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.log('Server response:', error.response.data, error.response.status);
    } else if (error.request) {
      console.log('Request made but no response:', error.request);
    } else {
      console.log('Axios error:', error.message);
    }
    throw error;
  }
};
