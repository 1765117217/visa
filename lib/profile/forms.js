const PROFILE_FIELD_MAP = {
  displayName: "display_name",
  fullName: "full_name",
  phone: "phone",
  nationality: "nationality",
  passType: "pass_type",
  visaType: "visa_type"
};

const BASIC_FIELD_MAP = {
  email: "email",
  full_name: "fullName",
  phone: "phone",
  nationality: "nationality",
  pass_type: "passType",
  visa_type: "visaType"
};

function cleanValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function buildProfilePayload(values = {}, options = {}) {
  const payload = {};

  Object.entries(PROFILE_FIELD_MAP).forEach(([sourceKey, targetKey]) => {
    const value = cleanValue(values[sourceKey]);
    if (value) {
      payload[targetKey] = value;
    } else if (options.emptyAsNull && sourceKey in values) {
      payload[targetKey] = null;
    }
  });

  return payload;
}

export function mergeProfileIntoBasicData(
  basicData = {},
  profile = {},
  options = {}
) {
  const merged = { ...basicData };
  const preferredProfileFields = new Set(options.preferProfileFields || []);

  Object.entries(BASIC_FIELD_MAP).forEach(([profileKey, basicKey]) => {
    const profileValue = cleanValue(profile[profileKey]);
    const basicValue = cleanValue(merged[basicKey]);

    if (profileValue && (!basicValue || preferredProfileFields.has(basicKey))) {
      merged[basicKey] = profileValue;
    }
  });

  return merged;
}

export function parseProfileForm(formData) {
  return buildProfilePayload({
    displayName: formData.get("displayName"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    nationality: formData.get("nationality"),
    passType: formData.get("passType"),
    visaType: formData.get("visaType")
  });
}
