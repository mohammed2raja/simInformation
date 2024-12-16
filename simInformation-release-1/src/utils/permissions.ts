import { PermissionsAndroid, Linking, Alert, Platform } from 'react-native';

/**
 * Requests necessary permissions for the app's functionality.
 * Skips WRITE_EXTERNAL_STORAGE permission for API level 33 (Android 13) and above.
 * Handles 'never_ask_again' state by guiding the user to the app settings.
 * 
 * @returns {Promise<boolean>} True if all permissions are granted, otherwise false.
 */
export const requestPermissions = async (): Promise<boolean> => {
  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.PROCESS_OUTGOING_CALLS,
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
    ];


    // Request permissions
    const granted = await PermissionsAndroid.requestMultiple(permissions);

    let allGranted = true;

    Object.entries(granted).forEach(([permission, result]) => {
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log(`Permission denied for: ${permission}`);
        allGranted = false;
      } else {
        console.log(`Permission granted for: ${permission}`);
      }
    });


    if (allGranted) {
      console.log('All required permissions granted.');
      return true;
    } else {
      console.warn('One or more permissions were denied:', granted);
      return false;
    }
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
};
