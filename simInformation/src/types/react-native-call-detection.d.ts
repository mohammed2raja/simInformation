declare module 'react-native-call-detection' {
export type CallEventType = 'Incoming' | 'Outgoing' | 'Missed' | 'Disconnected';

export interface CallDetectorOptions {
    title: string;
    message: string;
}

export default class CallDetectorManager {
    constructor(
    callback: (event: CallEventType, phoneNumber: string | null) => void,
    useOverlay?: boolean,
    onError?: () => void,
    options?: CallDetectorOptions
    );

    dispose(): void;
}
}
