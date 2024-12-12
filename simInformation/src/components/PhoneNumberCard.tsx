import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PhoneNumberCardProps {
  phoneNumber: string;
  isSelected: boolean;
  onSelect: () => void;
}

const PhoneNumberCard: React.FC<PhoneNumberCardProps> = ({ phoneNumber, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={onSelect}
    >
      <View style={styles.radioButtonContainer}>
        <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]} />
        <Text style={styles.text}>{phoneNumber}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'flex-start',
  },
  selectedCard: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#007bff',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});

export default PhoneNumberCard;
