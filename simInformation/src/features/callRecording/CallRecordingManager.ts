import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

// Directory for storing recordings
const RECORDING_DIR = 'sdcard/CallRecordings';

export const startRecording = async (callType: 'Incoming' | 'Outgoing', phoneNumber: string) => {
  try {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '_');
    const filePath = `${RECORDING_DIR}/${callType}_${phoneNumber}_${timestamp}.mp3`;

    // Ensure directory exists
    const exists = await RNFS.exists(RECORDING_DIR);
    if (!exists) {
      await RNFS.mkdir(RECORDING_DIR);
    }

    const uri = await audioRecorderPlayer.startRecorder(filePath);
    console.log('Recording started at:', uri);
  } catch (error) {
    console.error('Error starting recording:', error);
  }
};

export const stopRecording = async () => {
  try {
    const result = await audioRecorderPlayer.stopRecorder();
    console.log('Recording stopped:', result);
    return result;
  } catch (error) {
    console.error('Error stopping recording:', error);
  }
};
