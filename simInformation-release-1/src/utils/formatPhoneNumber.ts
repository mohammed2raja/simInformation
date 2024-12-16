export const formatPhoneNumber = (phone: string): string => {
    if (phone.startsWith('+91')) {
      return phone.slice(3);
    }
    if (phone.startsWith('91')){
      return phone.slice(2);
    }
    if (phone.startsWith('+')) {
      return phone.slice(1);
    }
    return phone;
  };
