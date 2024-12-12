declare module 'react-native-get-sms-android' {
    interface SmsFilter {
        box?: string; // 'inbox' or 'sent'
        read?: number; // 0 for unread, 1 for read
        address?: string; // Filter by sender address
        body?: string; // Filter by message body content
        indexFrom?: number; // Pagination - start index
        maxCount?: number; // Pagination - number of messages
    }

    interface Sms {
        _id: string;
        thread_id: string;
        address: string;
        date: string;
        date_sent: string;
        read: string;
        status: string;
        type: string;
        body: string;
    }

    export default class SmsAndroid {
        static list(
            filter: string,
            onError: (error: string) => void,
            onSuccess: (count: number, smsList: string) => void
        ): void;
    }
}