export type PhoneCountryOption = {
  country: string;
  dialCode: string;
};

export const DEFAULT_PHONE_DIAL_CODE = "+90";

export const phoneCountryOptions: PhoneCountryOption[] = [
  { country: "Turkey", dialCode: "+90" },
  { country: "Egypt", dialCode: "+20" },
  { country: "Saudi Arabia", dialCode: "+966" },
  { country: "United Arab Emirates", dialCode: "+971" },
  { country: "Qatar", dialCode: "+974" },
  { country: "Jordan", dialCode: "+962" },
  { country: "Kuwait", dialCode: "+965" },
  { country: "Oman", dialCode: "+968" },
  { country: "Bahrain", dialCode: "+973" },
  { country: "Iraq", dialCode: "+964" },
  { country: "Lebanon", dialCode: "+961" },
  { country: "Germany", dialCode: "+49" },
  { country: "United Kingdom", dialCode: "+44" },
  { country: "United States", dialCode: "+1" },
  { country: "Canada", dialCode: "+1" },
];

export const splitPhoneNumber = (value?: string) => {
  const normalizedValue = value?.trim() || "";
  const matchedOption = phoneCountryOptions.find((option) => normalizedValue.startsWith(option.dialCode));

  if (!matchedOption) {
    return {
      dialCode: DEFAULT_PHONE_DIAL_CODE,
      phoneNumber: normalizedValue,
    };
  }

  return {
    dialCode: matchedOption.dialCode,
    phoneNumber: normalizedValue.slice(matchedOption.dialCode.length).trim(),
  };
};

export const buildPhoneNumber = (dialCode: string, phoneNumber: string) => {
  const trimmedPhoneNumber = phoneNumber.trim();
  return trimmedPhoneNumber ? `${dialCode} ${trimmedPhoneNumber}` : "";
};
