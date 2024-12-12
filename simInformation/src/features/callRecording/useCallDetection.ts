import { useEffect, useRef } from 'react';
import CallDetectorManager from 'react-native-call-detection';
import { startRecording, stopRecording } from './CallRecordingManager';

export const useCallDetection = (isCheckedIn: boolean) => {
  const callDetectorRef = useRef<CallDetectorManager | null>(null);

  useEffect(() => {
    if (isCheckedIn) {
      callDetectorRef.current = new CallDetectorManager(
        (event, phoneNumber) => {
          console.log(`Call event: ${event}, Phone number: ${phoneNumber}`);
          switch (event) {
            case 'Incoming':
              startRecording('Incoming', phoneNumber || 'Unknown');
              break;
            case 'Outgoing':
              startRecording('Outgoing', phoneNumber || 'Unknown');
              break;
            case 'Disconnected':
              stopRecording();
              break;
            default:
              console.log('Unhandled call state');
          }
        },
        true, // Use overlay permissions
        () => {
          console.error('Call detection initialization failed');
        },
        {
          title: 'Phone Call Detection',
          message: 'This app needs access to call detection to function.',
        }
      );
    } else {
      // Dispose of call detector when checked out
      callDetectorRef.current?.dispose();
      console.log('Call detection stopped');
    }

    return () => {
      callDetectorRef.current?.dispose();
      console.log('Call detector disposed');
    };
  }, [isCheckedIn]);
};
