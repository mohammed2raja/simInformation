import { useEffect } from 'react';
import SmsAndroid from 'react-native-get-sms-android';

export const useSmsListener = (
    onReceive: (message: string) => void,
    shouldListen: boolean,
    smsSentTime: number | null,
) => {
    useEffect(() => {
        let lastFetchedSmsId: string | null = null; // Track the last fetched SMS ID
        let listenerId: ReturnType<typeof setInterval> | null = null;

        const startSmsListening = () => {
            console.log('Initializing SMS fetching...');
            listenerId = setInterval(fetchLatestSms, 2000); // Poll every 2 seconds
        };

        const stopSmsListening = () => {
            if (listenerId) {
                console.log('Stopping SMS Listener...');
                clearInterval(listenerId);
                listenerId = null;
            }
        };

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
                    
                    if (messages.length > 0) {
                        const latestMessage = messages[0];
                        const messageTimestamp = new Date(latestMessage.date).getTime();


                        // Avoid re-processing the same SMS
                        if (smsSentTime !== null && messageTimestamp >= smsSentTime && latestMessage._id !== lastFetchedSmsId) {
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

        if (shouldListen) {
            startSmsListening();
        }

        return () => {
            stopSmsListening();
            console.log('Cleaning up SMS Listener...');
        };
    }, [onReceive, shouldListen]); // Only listen to these dependencies
};