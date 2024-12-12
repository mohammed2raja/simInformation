// src/components/SmsMessageList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SmsMessageListProps {
  smsMessages: string[];
}

const SmsMessageList: React.FC<SmsMessageListProps> = ({ smsMessages }) => {
  return (
    <View style={styles.smsContainer}>
      <Text style={styles.smsHeader}>Received SMS:</Text>
      {smsMessages.map((sms, index) => (
        <Text key={index} style={styles.smsText}>{sms}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  smsContainer: {
    marginTop: 20,
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  smsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  smsText: {
    fontSize: 16,
    color: '#555',
    marginVertical: 5,
  },
});

export default SmsMessageList;
