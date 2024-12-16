declare module 'react-native-android-sms-listener' {
    export interface SmsListener {
      addListener(callback: (message: { body: string }) => void): () => void;
    }
    export default SmsListener;
  }
