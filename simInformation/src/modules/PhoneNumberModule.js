import { NativeModules } from 'react-native';

const { PhoneNumberModule } = NativeModules;

export const getPhoneNumber = async () => {
  try {
    const phoneNumber = await PhoneNumberModule.getPhoneNumber();
    return phoneNumber;
  } catch (error) {
    console.error('Error fetching phone number:', error);
    return null;
  }
};
