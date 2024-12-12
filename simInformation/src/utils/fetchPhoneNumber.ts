import { NativeModules, PermissionsAndroid, Platform, Alert } from 'react-native';

const PhoneNumberModule = NativeModules.PhoneNumberModule;

export const fetchPhoneNumber = async (): Promise<string | null> => {
  try {
    const permission = await requestPhonePermission();
    if (!permission) {
      Alert.alert('Permission Denied', 'Cannot fetch phone number without permission.');
      return null;
    }

    const result = await PhoneNumberModule.getPhoneNumber();
    if (result) {
      return result;
    } else {
      Alert.alert('Error', 'Unable to fetch primary phone number.');
      return null;
    }
  } catch (err) {
    console.error('Error fetching phone number:', err);
    Alert.alert('Error', 'Failed to fetch SIM information.');
    return null;
  }
};

const requestPhonePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const permission = Platform.Version >= 29
        ? PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS
        : PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE;

      const granted = await PermissionsAndroid.request(permission, {
        title: 'Phone State Permission',
        message: 'This app needs access to your phone number.',
        buttonPositive: 'OK',
      });

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  }
  return true;
};
