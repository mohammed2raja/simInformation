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
    ];

    // Add WRITE_EXTERNAL_STORAGE for Android versions below API 33
    if (Platform.OS === 'android' && Platform.Version < 33) {
      permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    }

    // Request permissions
    const granted = await PermissionsAndroid.requestMultiple(permissions);

    // Check if any permission is in 'never_ask_again' state
    const neverAskAgainPermissions = Object.entries(granted).filter(
      ([permission, result]) => result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    );

    if (neverAskAgainPermissions.length > 0) {
      console.warn('Permissions in never_ask_again state:', neverAskAgainPermissions);

      // Show alert to guide the user to app settings
      showPermissionAlert();
      return false;
    }

    // Check if all permissions are granted
    const allPermissionsGranted = permissions.every(
      (permission) => granted[permission] === PermissionsAndroid.RESULTS.GRANTED
    );

    if (allPermissionsGranted) {
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

/**
 * Displays an alert guiding the user to enable permissions in the app settings.
 */
const showPermissionAlert = () => {
  Alert.alert(
    'Permissions Required',
    'Some permissions are permanently denied. Please enable them in the app settings to ensure full functionality.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
      },
    ],
    { cancelable: true }
  );
};