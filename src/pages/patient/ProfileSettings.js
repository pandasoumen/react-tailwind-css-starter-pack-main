import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { API } from "../../utils/api";
import { setCredentials } from "../../store/slices/authSlice";
import ProfileImageUpload from "../../components/ProfileImageUpload";
import {
  buildFlagUrl,
  getCountryOptions,
  getPhoneCodeOptions,
} from "../../utils/locationData";

const getAuthConfig = (token) => {
  const effectiveToken = token || localStorage.getItem("token");
  return effectiveToken ? { headers: { Authorization: `Bearer ${effectiveToken}` } } : {};
};

const initialForm = {
  name: "",
  sex: "",
  nationality: "",
  countryCode: "",
  countryFlag: "",
  phoneCountryCode: "+91",
  phone: "",
  address: "",
  bloodGroup: "",
  medicalConditions: "",
};

const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PROFILE_GET_ENDPOINTS = ["/patients/me/profile", "/patients/profile"];
const PROFILE_SAVE_ENDPOINTS = ["/patients/me/profile", "/patients/profile"];

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseError = (err) =>
  err?.response?.data?.message || err?.message || "Request failed";

const normalizePatientPayload = (data = {}) => {
  const patient = data?.patient || {};
  const user = data?.user || patient?.user || {};
  const mergedProfile = {
    ...(user?.profile || {}),
    ...(patient?.profile || {}),
  };

  return {
    user: {
      ...user,
      ...patient,
      profile: mergedProfile,
    },
  };
};

export default function PatientProfileSettings() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth || {});
  const authToken = token || localStorage.getItem("token");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const phoneCodeOptions = getPhoneCodeOptions();
  const countryOptions = getCountryOptions();

  useEffect(() => {
    const load = async () => {
      try {
        let loadedUser = null;

        for (const endpoint of PROFILE_GET_ENDPOINTS) {
          try {
            const res = await API.get(endpoint, getAuthConfig(authToken));
            const normalized = normalizePatientPayload(res?.data);
            const candidate = normalized?.user || {};
            if (candidate?.name || candidate?.email || Object.keys(candidate?.profile || {}).length > 0) {
              loadedUser = candidate;
              break;
            }
          } catch {
            // try next endpoint
          }
        }

        if (!loadedUser) {
          throw new Error("Failed to load profile settings.");
        }

        const profile = loadedUser?.profile || {};

        setForm({
          name: loadedUser?.name || user?.name || "",
          sex: loadedUser?.sex || profile?.sex || "",
          nationality: loadedUser?.nationality || profile?.nationality || "",
          countryCode: loadedUser?.countryCode || profile?.countryCode || "",
          countryFlag:
            loadedUser?.countryFlag ||
            profile?.countryFlag ||
            buildFlagUrl(loadedUser?.countryCode || profile?.countryCode || ""),
          phoneCountryCode: profile?.phoneCountryCode || "+91",
          phone: profile?.phone || "",
          address: profile?.address || "",
          bloodGroup: profile?.bloodGroup || "",
          medicalConditions: Array.isArray(profile?.medicalConditions)
            ? profile.medicalConditions.join(", ")
            : "",
        });
      } catch (err) {
        setError(parseError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authToken, user?.name]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const onCountryChange = (e) => {
    const selectedCode = e.target.value;
    const selectedCountry = countryOptions.find((item) => item.code === selectedCode);
    setForm((prev) => ({
      ...prev,
      countryCode: selectedCode,
      nationality: selectedCountry?.name || "",
      countryFlag: selectedCountry?.flagUrl || "",
    }));
    setError("");
    setMessage("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const medicalConditions = toArray(form.medicalConditions);
      const primaryPayload = {
        name: form.name,
        sex: form.sex,
        nationality: form.nationality,
        countryCode: form.countryCode,
        countryFlag: form.countryFlag,
        profile: {
          sex: form.sex,
          nationality: form.nationality,
          countryCode: form.countryCode,
          countryFlag: form.countryFlag,
          phoneCountryCode: form.phoneCountryCode,
          phone: form.phone,
          address: form.address,
          bloodGroup: form.bloodGroup,
          medicalConditions,
        },
      };
      const fallbackPayload = {
        name: form.name,
        sex: form.sex,
        nationality: form.nationality,
        countryCode: form.countryCode,
        countryFlag: form.countryFlag,
        phoneCountryCode: form.phoneCountryCode,
        phone: form.phone,
        address: form.address,
        bloodGroup: form.bloodGroup,
        medicalConditions,
      };

      let lastError = null;
      let saved = false;

      for (const endpoint of PROFILE_SAVE_ENDPOINTS) {
        try {
          await API.put(endpoint, primaryPayload, getAuthConfig(authToken));
          saved = true;
          break;
        } catch (err) {
          lastError = err;
          try {
            await API.put(endpoint, fallbackPayload, getAuthConfig(authToken));
            saved = true;
            break;
          } catch (err2) {
            lastError = err2;
          }
        }
      }

      if (!saved) {
        throw lastError || new Error("Failed to update patient profile.");
      }

      if (user) {
        const nextMedical = toArray(form.medicalConditions);
        dispatch(
          setCredentials({
            token: authToken,
            user: {
              ...user,
              name: form.name,
              sex: form.sex,
              nationality: form.nationality,
              countryCode: form.countryCode,
              countryFlag: form.countryFlag,
              profile: {
                ...(user?.profile || {}),
                sex: form.sex,
                nationality: form.nationality,
                countryCode: form.countryCode,
                countryFlag: form.countryFlag,
                phoneCountryCode: form.phoneCountryCode,
                phone: form.phone,
                address: form.address,
                bloodGroup: form.bloodGroup,
                medicalConditions: nextMedical,
              },
            },
          })
        );
      }

      setMessage("Patient profile updated successfully.");
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#0B3D91] mb-2">Edit Profile Settings</h1>
      <p className="text-slate-600 mb-6">Update your personal and medical information.</p>
      <ProfileImageUpload />

      {loading ? (
        <p className="text-slate-500 mt-6">Loading profile settings...</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sex</label>
            <select
              name="sex"
              value={form.sex}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <select
              name="countryCode"
              value={form.countryCode}
              onChange={onCountryChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Select country and flag</option>
              {countryOptions.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              {form.countryFlag ? (
                <img
                  src={form.countryFlag}
                  alt="Country flag"
                  className="w-7 h-5 rounded object-cover border border-slate-300"
                />
              ) : (
                <span className="text-slate-400">No flag</span>
              )}
              <span>{form.nationality || "No country selected"}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <div className="flex gap-2">
              <select
                name="phoneCountryCode"
                value={form.phoneCountryCode}
                onChange={onChange}
                className="w-44 rounded-lg border border-slate-300 px-2 py-2"
              >
                {phoneCodeOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={onChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Select blood group</option>
              {BLOOD_GROUP_OPTIONS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Medical Conditions (comma separated)
            </label>
            <textarea
              name="medicalConditions"
              value={form.medicalConditions}
              onChange={onChange}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0B3D91] px-4 py-2 text-white font-medium disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      )}
    </div>
  );
}
