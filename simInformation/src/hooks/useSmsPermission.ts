// src/hooks/useSmsPermission.ts
import { useEffect, useState } from 'react';
import { PermissionsAndroid} from 'react-native';

const useSmsPermission = () => {
  const [receiveSmsPermission, setReceiveSmsPermission] = useState<string>('');

  const requestSmsPermission = async () => {
    try {
      const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
      setReceiveSmsPermission(permission);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    requestSmsPermission();
  }, []);

  return receiveSmsPermission;
};

export default useSmsPermission;
