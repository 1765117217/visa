import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProfilePayload,
  mergeProfileIntoBasicData,
  parseProfileForm
} from "../lib/profile/forms.js";
import { isMissingProfileStoreError } from "../lib/profile/errors.js";

test("buildProfilePayload maps basic form fields and omits passport numbers", () => {
  const payload = buildProfilePayload({
    fullName: " Zhang Wei ",
    passportNo: "E12345678",
    nationality: " China ",
    phone: " +60123456789 ",
    passType: "student_pass",
    visaType: "tourist",
    schoolName: "Example University"
  });

  assert.deepEqual(payload, {
    full_name: "Zhang Wei",
    nationality: "China",
    phone: "+60123456789",
    pass_type: "student_pass",
    visa_type: "tourist"
  });
  assert.equal("passportNo" in payload, false);
  assert.equal("passport_no" in payload, false);
  assert.equal("schoolName" in payload, false);
});

test("buildProfilePayload trims empty strings out of the payload", () => {
  assert.deepEqual(
    buildProfilePayload({
      displayName: "  Yee Chung  ",
      fullName: "  Zhang Wei  ",
      nationality: " ",
      phone: "",
      passType: "student_pass",
      visaType: undefined
    }),
    {
      display_name: "Yee Chung",
      full_name: "Zhang Wei",
      pass_type: "student_pass"
    }
  );
});

test("buildProfilePayload can convert editable empty fields to null", () => {
  const payload = buildProfilePayload(
    {
      displayName: " ",
      fullName: "",
      nationality: " Malaysia ",
      phone: "",
      passType: "",
      visaType: "tourist",
      passportNo: "E12345678",
      schoolName: "Example University"
    },
    { emptyAsNull: true }
  );

  assert.deepEqual(payload, {
    display_name: null,
    full_name: null,
    nationality: "Malaysia",
    phone: null,
    pass_type: null,
    visa_type: "tourist"
  });
  assert.equal("passportNo" in payload, false);
  assert.equal("schoolName" in payload, false);
});

test("mergeProfileIntoBasicData fills only missing basic data fields", () => {
  const merged = mergeProfileIntoBasicData(
    {
      fullName: "",
      nationality: "China",
      phone: "",
      passType: "student_pass",
      visaType: ""
    },
    {
      full_name: "Zhang Wei",
      nationality: "Malaysia",
      phone: "+60111111111",
      pass_type: "work_pass",
      visa_type: "business"
    }
  );

  assert.deepEqual(merged, {
    fullName: "Zhang Wei",
    nationality: "China",
    phone: "+60111111111",
    passType: "student_pass",
    visaType: "business"
  });
});

test("parseProfileForm returns normalized editable profile fields", () => {
  const formData = new FormData();
  formData.set("displayName", "  Yee Chung  ");
  formData.set("fullName", " Zhang Wei ");
  formData.set("phone", " +60123456789 ");
  formData.set("nationality", " China ");
  formData.set("passType", "student_pass");
  formData.set("visaType", "tourist");
  formData.set("passportNo", "E12345678");

  assert.deepEqual(parseProfileForm(formData), {
    display_name: "Yee Chung",
    full_name: "Zhang Wei",
    phone: "+60123456789",
    nationality: "China",
    pass_type: "student_pass",
    visa_type: "tourist"
  });
});

test("isMissingProfileStoreError detects missing profiles table errors", () => {
  assert.equal(
    isMissingProfileStoreError({
      code: "42P01",
      message: "relation \"public.profiles\" does not exist"
    }),
    true
  );
  assert.equal(
    isMissingProfileStoreError({
      code: "PGRST205",
      message: "Could not find the table 'public.profiles' in the schema cache"
    }),
    true
  );
  assert.equal(isMissingProfileStoreError({ code: "42501" }), false);
});
