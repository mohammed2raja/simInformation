import { NativeModules } from 'react-native';
import { formatPhoneNumber } from './formatPhoneNumber';

const { PhoneNumberModule } = NativeModules;

export const fetchPhoneNumber = async (): Promise<string> => {
  const phone: string = await PhoneNumberModule.getPhoneNumber();
  return formatPhoneNumber(phone);
};
