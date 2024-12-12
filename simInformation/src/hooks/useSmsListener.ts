import { useEffect, useState } from 'react';
import { requestPermissions } from '../utils/permissions';
import SmsAndroid from 'react-native-get-sms-android';

export const useSmsListener = (onReceive: (message: string) => void) => {
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        let lastFetchedSmsId: string | null = null; // Track the last fetched SMS ID

        const startSmsListening = async () => {
            console.log('Initializing SMS fetching...');
            const hasPermissions = await requestPermissions();
            if (!hasPermissions) {
                console.error('Permissions not granted');
                return;
            }

            const fetchLatestSms = () => {
                const filter = {
                    box: 'inbox', // Fetch SMS from the inbox
                    read: 0,      // Only unread messages
                    max: 1,       // Fetch the most recent SMS
                };

                SmsAndroid.list(
                    JSON.stringify(filter),
                    (fail: string) => {
                        console.error('Failed to fetch SMS:', fail);
                    },
                    (count: number, smsList: string) => {
                        const messages = JSON.parse(smsList);
                        console.log('Fetched SMS messages:', messages);

                        if (messages.length > 0) {
                            const latestMessage = messages[0];

                            // Avoid re-processing the same SMS
                            if (latestMessage._id !== lastFetchedSmsId) {
                                console.log('New SMS found:', latestMessage.body);
                                lastFetchedSmsId = latestMessage._id; // Update the last fetched SMS ID
                                onReceive(latestMessage.body);
                                stopSmsListening(); // Stop listening after receiving the SMS
                            } else {
                                console.log('No new SMS to process.');
                            }
                        } else {
                            console.log('No unread SMS found.');
                        }
                    }
                );
            };

            const listenerId = setInterval(fetchLatestSms, 2000); // Poll every 2 seconds
            setIsListening(true);

            const stopSmsListening = () => {
                console.log('Stopping SMS Listener...');
                clearInterval(listenerId);
                setIsListening(false);
            };

            return stopSmsListening;
        };

        if (!isListening) {
            startSmsListening().then((stopListener) => {
                return () => {
                    stopListener?.();
                    console.log('Cleaning up SMS Listener...');
                };
            });
        }
    }, [onReceive, isListening]);
};