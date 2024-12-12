import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
//import PhoneNumberCard from './PhoneNumberCard';
import { fetchPhoneNumber } from '../utils/fetchPhoneNumber';
import { ActivityIndicator } from 'react-native-paper';

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchPhone = async () => {
      const number = await fetchPhoneNumber();
      if (number) {
        setPhoneNumber(number);
      }
      setIsLoading(false);
    };

    fetchPhone();
  }, []);

  if (isLoading) {
         return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
             <ActivityIndicator size="large" color="#0000ff" />
             <Text>Fetching SIM Information...</Text>
           </View>
        );
      }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {phoneNumber && (
         <>
          <TextInput value={phoneNumber}/>
           {/* <Button title="Start Messaging" onPress={startListeningForSMS} disabled={!isSelected} /> */}
         </>
       )}
      {/* <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '80%',
    paddingLeft: 10,
  },
});

export default LoginPage;
