import React, { useState, useEffect } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

type LandingPageParams = {
  autoCheckIn?: boolean;
};

type LandingPageRouteProp = RouteProp<{ LandingPage: LandingPageParams }, 'LandingPage'>;

const LandingPage = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const route = useRoute<LandingPageRouteProp>();

  useEffect(() => {
    // Auto Check-In if navigated from AuthScreen
    if (route.params?.autoCheckIn) {
      setCheckedIn(true);
    }
  }, [route.params]);

  const handleToggle = () => {
    if (checkedIn) {
      Alert.alert(
        'Confirmation',
        'Are you sure you want to check out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => setCheckedIn(false),
          },
        ],
        { cancelable: true }
      );
    } else {
      setCheckedIn(true);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/landing.jpg')}
      style={styles.imageBackground}
      resizeMode="cover"
    >
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: checkedIn ? '#D32F2F' : '#039749' },
        ]}
        onPress={handleToggle}
      >
        <Text style={styles.buttonText}>
          {checkedIn ? 'Check Out' : 'Check In'}
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  imageBackground: {
    width: width,
    height: height,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 20,
    width: width * 0.8,
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LandingPage;
