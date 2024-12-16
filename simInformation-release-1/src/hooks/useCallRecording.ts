import { useEffect, useRef, useState } from 'react';
import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { CallRecordingPayload, sendCallRecordingApi } from '../api/api';

const { CallRecordingModule } = NativeModules;

type OnCallStartedData = {
  phoneNumber: string;
  filePath: string;
};

export const useCallRecording = (isRecording: boolean) => {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [currentNumber, setCurrentNumber] = useState<string>('');
  const callStartedListenerRef = useRef<any>(null);
  const callEndedListenerRef = useRef<any>(null);

  useEffect(() => {
    const eventEmitter = CallRecordingModule ? new NativeEventEmitter(CallRecordingModule) : null;

    const startRecordingProcess = async () => {
      console.log("Starting call recording process...");
      if (Platform.OS === 'android') {
        try {
          const permissionsGranted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.PROCESS_OUTGOING_CALLS,
          ]);

          if (Object.values(permissionsGranted).some(result => result !== PermissionsAndroid.RESULTS.GRANTED)) {
            console.error('Not all permissions were granted. Cannot start recording.');
            return;
          }
        } catch (err) {
          console.error('Error requesting permissions:', err);
          return;
        }
      }

      callStartedListenerRef.current = eventEmitter?.addListener('onCallStarted', (data: OnCallStartedData) => {
        console.log('Call started with:', data.phoneNumber);
        console.log('Recording file path:', data.filePath);
        setCurrentFilePath(data.filePath);
        setCurrentNumber(data.phoneNumber);
      });

      callEndedListenerRef.current = eventEmitter?.addListener('onCallEnded', async (data: OnCallStartedData) => {
        console.log('Call ended with:', data.phoneNumber);
        console.log(`onCallEnded callFilePath=${data.filePath}`);
        const filePath = data.filePath;
        if (!filePath) {
          console.warn('No current file path recorded for this ended call.');
          return;
        }

        try {
          const fileExists = await RNFS.exists(filePath);
          if (!fileExists) {
            throw new Error('Recording file does not exist on disk');
          }

          const fileStats = await RNFS.stat(filePath);
          console.log('Recorded file stats:', fileStats);

        // Read file and convert to base64
        const base64Content = await RNFS.readFile(filePath, 'base64');
        const now = new Date();

        // Build the payload object similar to the provided data
        const payload = [
        {
            call_type: "INCOMING",  // or "OUTGOING" depending on your logic
            cdate: now.toISOString().replace('T', ' ').split('.')[0], // e.g. "2024-11-30 20:12:40"
            cduration: "00:15:00", // You should calculate or track duration
            cnumber: data.phoneNumber.replace('+91', ''),  // Just an example transformation
            date: now.getTime(), // UNIX timestamp in ms
            duration: 15, // in minutes or seconds based on your logic
            number: data.phoneNumber, 
            files: {
            name: `${data.phoneNumber}(${data.phoneNumber})_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.mp3`,
            localURL: `file://${filePath}`,
            type: "audio/mpeg",
            lastModified: now.getTime(),
            lastModifiedDate: now.getTime(),
            size: base64Content.length, // approximate size in bytes of the base64 string
            start: 0,
            end: base64Content.length,
            record_file: `data:audio/mpeg;base64,${base64Content}`
            }
        } as CallRecordingPayload
        ];

        console.log('Recorded file payload:', payload);
        const apiResponse = await sendCallRecordingApi(payload);
        console.log('API response:', apiResponse);

          console.log('Call recording uploaded successfully.');
        } catch (error) {
          console.error('Error processing and uploading call recording file:', error);
        } finally {
          setCurrentFilePath(null);
          setCurrentNumber('');
        }
      });

      console.log('Starting call recording...');
      const directoryPath = `${RNFS.DocumentDirectoryPath}/CallRecordings`;
      const dirExists = await RNFS.exists(directoryPath);
      if (!dirExists) {
        await RNFS.mkdir(directoryPath);
      }

      CallRecordingModule?.startRecording(directoryPath);
    };

    const stopRecordingProcess = () => {
      console.log('Stopping call recording...');
      try {
        CallRecordingModule?.stopRecording();
      } catch (error) {
        console.error('Error stopping call recording:', error);
      }

      callStartedListenerRef.current?.remove?.();
      callEndedListenerRef.current?.remove?.();
      callStartedListenerRef.current = null;
      callEndedListenerRef.current = null;
    };

    if (isRecording) {
      startRecordingProcess();
    } else {
      stopRecordingProcess();
    }

    return () => {
      stopRecordingProcess();
    };
  }, [isRecording]);

  return {
    currentFilePath,
    currentNumber,
  };
};