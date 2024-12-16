import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles as authStyles } from "../styles/AuthScreenStyles";
import { extractOtpFromMessage, getSimPhoneNumber } from "../utils/otpUtils";
import { useSmsListener } from "../hooks/useSmsListener";
import { sendOtpApi, validateOtpApi } from "../api/api";

const ACCESS_TOKEN_KEY = "access_token";
const TOKEN_TIMESTAMP_KEY = "access-token-timestamp";
const TOKEN_EXPIRY_DAYS = 30;

interface AuthScreenProps {
  navigation: any;
}

const AuthScreen = ({ navigation }: AuthScreenProps) => {
  const [status, setStatus] = useState<string>("Checking authentication...");
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [smsSentTime, setSmsSentTime] = useState<number | null>(null);

  const handleSendOtp = async (mobile: string): Promise<void> => {
    try {
      const response = await sendOtpApi(Number(mobile));
      const smsSentOn = new Date().getTime();
      setSmsSentTime(smsSentOn);
      console.log("OTP Sent Response:", response);
      setStatus("Listening for incoming SMS...");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      setStatus(
        `Error sending OTP: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const handleValidateOtp = async (otp: string): Promise<void> => {
    try {
      console.log("Validating OTP:", otp);
      const response = await validateOtpApi(Number(phoneNumber), otp);
      console.log("OTP validation response:", response);

      if (response.status === "SUCCESS") {
        setStatus("Authentication successful!");
        // Save access token and timestamp
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
        await AsyncStorage.setItem(
          TOKEN_TIMESTAMP_KEY,
          new Date().toISOString()
        );
        navigation.replace("Home");
      } else {
        throw new Error("Invalid OTP.");
      }
    } catch (error: any) {
      console.error("Error validating OTP:", error);
      setStatus("Failed to validate OTP. Please try again.");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // Step 1: Check for existing access token
        const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        const tokenTimestamp = await AsyncStorage.getItem(TOKEN_TIMESTAMP_KEY);

        if (accessToken && tokenTimestamp) {
          const tokenDate = new Date(tokenTimestamp);
          const currentDate = new Date();
          const tokenAgeInDays =
            (currentDate.getTime() - tokenDate.getTime()) /
            (1000 * 60 * 60 * 24);

          if (tokenAgeInDays <= TOKEN_EXPIRY_DAYS) {
            // Token is valid; navigate to Home
            navigation.replace("Home");
            return;
          }
        }

        // Step 2: No valid token, proceed with authentication flow
        setStatus("Fetching phone number...");
        const simPhoneNumber = await getSimPhoneNumber();

        if (simPhoneNumber) {
          setPhoneNumber(simPhoneNumber);
          setStatus("Sending OTP...");
          await handleSendOtp(simPhoneNumber);
          setStatus("Listening for incoming SMS...");
          setIsListening(true);
        } else {
          throw new Error("Phone number not available on SIM.");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setStatus("Error initializing authentication.");
      }
    };

    initialize();
  }, []);

  // Listen for SMS with OTP
  useSmsListener(
    (message) => {
      const otp = extractOtpFromMessage(message);
      if (!otp || !phoneNumber) return;
      console.log("Received OTP:", otp);
      setStatus("Validating OTP...");
      handleValidateOtp(otp);
    },
    isListening,
    smsSentTime
  );

  return (
    <ImageBackground
      source={require("../assets/landing.jpg")} // Replace with your actual image path
      style={styles.background}
    >
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.message}>{status}</Text>
        {phoneNumber && (
          <Text style={{ marginTop: 20, fontSize: 16, color: "#666" }}>
            Phone Number: {phoneNumber}
          </Text>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Adds a dark overlay for better text visibility
    padding: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});
export default AuthScreen;
