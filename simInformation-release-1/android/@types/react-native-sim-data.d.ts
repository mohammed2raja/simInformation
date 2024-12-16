declare module 'react-native-sim-data' {
    export interface SimInfo {
      cards: Array<{
        number: string | null;
        carrierName: string | null;
        countryIso: string | null;
        displayName: string | null;
        simSlotIndex: number | null;
      }>;
    }
  
    export function getSimInfo(): SimInfo;
    export function getCarrierName(): string[];
  }
  