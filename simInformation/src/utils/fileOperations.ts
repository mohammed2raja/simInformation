import RNFS from 'react-native-fs';

/**
 * Saves audio recording to the app's private directory.
 * 
 * @param fileName - The name of the file to save.
 * @param audioData - The audio data to be saved (Base64 or binary).
 * @returns {Promise<string>} - Resolves with the file path if successful, rejects on error.
 */
export const saveRecording = async (fileName: string, audioData: string): Promise<string> => {
  try {
    // Define the path to save the file
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    
    // Write the audio data to the file
    await RNFS.writeFile(path, audioData, 'base64'); // Use 'utf8' if the data is not Base64 encoded
    
    console.log('File saved successfully at:', path);
    return path; // Return the file path
  } catch (error) {
    console.error('Error saving file:', error);
    throw error; // Rethrow the error for the caller to handle
  }
};