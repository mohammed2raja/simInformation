import { useEffect } from 'react';
import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { sendCallRecordingApi } from '../api/sendCallRecordingApi';

const { CallRecordingModule } = NativeModules;

export const useCallRecording = (isRecording: boolean) => {
    useEffect(() => {
        const eventEmitter = new NativeEventEmitter(CallRecordingModule);
        let callStartedListener: any;
        let callEndedListener: any;

        const startRecording = async () => {
            try {
                if (Platform.OS === 'android') {
                    // Request permissions
                    const granted = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    ]);

                    if (
                        granted[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
                    ) {
                        console.log('Permissions granted. Starting call recording...');
                        const outputPath = `${RNFS.DocumentDirectoryPath}/recordings`;
                        await RNFS.mkdir(outputPath); // Create directory for recordings if it doesn't exist
                        CallRecordingModule.startRecording(outputPath);

                        // Listen for call events
                        callStartedListener = eventEmitter.addListener('onCallStarted', phoneNumber => {
                            console.log(`Call started with: ${phoneNumber}`);
                        });

                        callEndedListener = eventEmitter.addListener('onCallEnded', async phoneNumber => {
                            console.log(`Call ended with: ${phoneNumber}`);
                            const filePath = `${outputPath}/call_recording.mp4`;

                            try {
                                const fileStats = await RNFS.stat(filePath);
                                const lastModified = new Date(fileStats.mtime).getTime();
                                const metadata = {
                                    call_type: 'INCOMING', // Adjust dynamically if needed
                                    cdate: new Date().toISOString(),
                                    cduration: 0, // Call duration in seconds
                                    cnumber: phoneNumber,
                                    date: Date.now(),
                                    duration: 0,
                                    number: phoneNumber,
                                    files: {
                                        name: filePath.split('/').pop(),
                                        localURL: filePath,
                                        type: 'audio/mpeg',
                                        lastModified,
                                        lastModifiedDate: lastModified,
                                        size: fileStats.size,
                                        start: 0,
                                        end: fileStats.size,
                                        record_file: await RNFS.readFile(filePath, 'base64'),
                                    },
                                };

                                await sendCallRecordingApi([metadata]);
                                console.log('Call recording metadata sent successfully.');
                            } catch (fileError) {
                                console.error('Error processing call recording file:', fileError);
                            }
                        });
                    } else {
                        console.log('Permissions denied.');
                    }
                }
            } catch (error) {
                console.error('Error starting call recording:', error);
            }
        };

        const stopRecording = () => {
            try {
                console.log('Stopping call recording...');
                CallRecordingModule.stopRecording();
                callStartedListener?.remove();
                callEndedListener?.remove();
            } catch (error) {
                console.error('Error stopping call recording:', error);
            }
        };

        if (isRecording) {
            startRecording();
        } else {
            stopRecording();
        }

        return () => {
            stopRecording(); // Cleanup when component unmounts
        };
    }, [isRecording]);
};