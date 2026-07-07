export interface ProfileFormValues {
  displayName?: string;
  fullName?: string;
  phone?: string;
  nationality?: string;
  passType?: string;
  visaType?: string;
}

export interface ProfilePayload {
  display_name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  nationality?: string | null;
  pass_type?: string | null;
  visa_type?: string | null;
}

export interface ProfileRow extends ProfilePayload {
  id?: string;
  email?: string;
  updated_at?: string;
}

export interface BasicVisaData {
  destinationCountry?: string;
  visaType?: string;
  fullName?: string;
  passportNo?: string;
  nationality?: string;
  passType?: string;
  travelDate?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

const PROFILE_FIELD_MAP: Record<keyof ProfileFormValues, keyof ProfilePayload> = {
  displayName: "display_name",
  fullName: "full_name",
  phone: "phone",
  nationality: "nationality",
  passType: "pass_type",
  visaType: "visa_type"
};

const BASIC_FIELD_MAP: Record<string, keyof BasicVisaData> = {
  email: "email",
  full_name: "fullName",
  phone: "phone",
  nationality: "nationality",
  pass_type: "passType",
  visa_type: "visaType"
};

function cleanValue(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function buildProfilePayload(
  values: ProfileFormValues = {},
  options: { emptyAsNull?: boolean } = {}
): ProfilePayload {
  const payload: ProfilePayload = {};

  (Object.entries(PROFILE_FIELD_MAP) as [keyof ProfileFormValues, keyof ProfilePayload][]).forEach(
    ([sourceKey, targetKey]) => {
      const value = cleanValue(values[sourceKey]);
      if (value) {
        payload[targetKey] = value;
      } else if (options.emptyAsNull && sourceKey in values) {
        payload[targetKey] = null;
      }
    }
  );

  return payload;
}

export function mergeProfileIntoBasicData(
  basicData: BasicVisaData = {},
  profile: ProfileRow = {},
  options: { preferProfileFields?: string[] } = {}
): BasicVisaData {
  const merged: BasicVisaData = { ...basicData };
  const preferredProfileFields = new Set(options.preferProfileFields || []);

  (Object.entries(BASIC_FIELD_MAP) as [keyof ProfileRow, keyof BasicVisaData][]).forEach(
    ([profileKey, basicKey]) => {
      const profileValue = cleanValue(profile[profileKey]);
      const basicValue = cleanValue(merged[basicKey]);

      if (profileValue && (!basicValue || preferredProfileFields.has(basicKey))) {
        merged[basicKey] = profileValue;
      }
    }
  );

  return merged;
}

export function parseProfileForm(formData: FormData): ProfilePayload {
  return buildProfilePayload({
    displayName: formData.get("displayName") as string,
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    nationality: formData.get("nationality") as string,
    passType: formData.get("passType") as string,
    visaType: formData.get("visaType") as string
  });
}
