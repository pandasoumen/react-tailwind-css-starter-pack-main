import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import ProfileImageUpload from "../../components/ProfileImageUpload";
import { setCredentials } from "../../store/slices/authSlice";
import {
  buildFlagUrl,
  getCountryOptions,
  getCurrencyOptions,
  getPhoneCodeOptions,
} from "../../utils/locationData";

const initialForm = {
  name: "",
  sex: "",
  specialty: "",
  qualification: "",
  collegeUniversity: "",
  research: "",
  bio: "",
  phone: "",
  phoneCountryCode: "+91",
  offlineChamberLocation: "",
  offlineChamberStart: "",
  offlineChamberEnd: "",
  nationality: "",
  countryCode: "",
  countryFlag: "",
  experience: "",
  consultationFee: "",
  consultationCurrency: "INR",
};

export default function ProfileSettings() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth || {});

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const countryOptions = getCountryOptions();
  const currencyOptions = getCurrencyOptions();
  const phoneCodeOptions = getPhoneCodeOptions();

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/doctors/me/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const doctor = res?.data?.doctor || {};
        setForm({
          name: doctor?.user?.name || user?.name || "",
          sex: doctor?.sex || "",
          specialty: doctor?.specialty || "",
          qualification: Array.isArray(doctor?.qualifications)
            ? doctor.qualifications.join(", ")
            : "",
          phone: doctor?.user?.phone || doctor?.user?.profile?.phone || "",
          phoneCountryCode: doctor?.phoneCountryCode || "+91",
          collegeUniversity: doctor?.collegeUniversity || "",
          research: doctor?.research || "",
          bio: doctor?.bio || "",
          offlineChamberLocation: doctor?.offlineChamberLocation || "",
          offlineChamberStart: doctor?.offlineChamberStart || "",
          offlineChamberEnd: doctor?.offlineChamberEnd || "",
          nationality: doctor?.nationality || "",
          countryCode: doctor?.countryCode || "",
          countryFlag:
            typeof doctor?.countryFlag === "string" && doctor.countryFlag.startsWith("http")
              ? doctor.countryFlag
              : buildFlagUrl(doctor?.countryCode || ""),
          experience:
            doctor?.experience !== undefined && doctor?.experience !== null
              ? String(doctor.experience)
              : "",
          consultationFee:
            doctor?.consultationFee !== undefined && doctor?.consultationFee !== null
              ? String(doctor.consultationFee)
              : "",
          consultationCurrency: doctor?.consultationCurrency || "INR",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load doctor profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, user?.name]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage("");
    setError("");
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
    setMessage("");
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        name: form.name,
        sex: form.sex,
        specialty: form.specialty,
        qualification: form.qualification,
        phone: form.phone,
        phoneCountryCode: form.phoneCountryCode,
        collegeUniversity: form.collegeUniversity,
        research: form.research,
        bio: form.bio,
        offlineChamberLocation: form.offlineChamberLocation,
        offlineChamberStart: form.offlineChamberStart,
        offlineChamberEnd: form.offlineChamberEnd,
        nationality: form.nationality,
        countryCode: form.countryCode,
        countryFlag: form.countryFlag,
        experience: form.experience,
        consultationFee: form.consultationFee,
        consultationCurrency: form.consultationCurrency,
      };

      const res = await axios.put(`${process.env.REACT_APP_BASE_URL}/doctors/me/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedName = res?.data?.doctor?.user?.name || form.name;
      const updatedPhone =
        res?.data?.doctor?.user?.phone ||
        res?.data?.doctor?.user?.profile?.phone ||
        form.phone;
      if (updatedName && user) {
        dispatch(
          setCredentials({
            token,
            user: { ...user, name: updatedName, phone: updatedPhone },
          })
        );
      }

      setMessage("Doctor profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update doctor profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Edit Profile Settings</h2>
      <p className="text-slate-600 mb-5">Update your profile details from this section.</p>

      <ProfileImageUpload />
      <div className="mt-3 flex items-center justify-center gap-2 text-base">
        {form.countryFlag ? (
          <img
            src={form.countryFlag}
            alt="Country flag"
            className="w-7 h-5 rounded object-cover border border-slate-300"
          />
        ) : (
          <span className="text-slate-400">No flag</span>
        )}
        <span className="text-slate-700">{form.nationality || "No nationality selected"}</span>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Full Name"
          className="border border-slate-300 rounded-lg px-3 py-2"
        />

        <select
          name="sex"
          value={form.sex}
          onChange={onChange}
          className="border border-slate-300 rounded-lg px-3 py-2"
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          name="specialty"
          value={form.specialty}
          onChange={onChange}
          placeholder="Specialty"
          className="border border-slate-300 rounded-lg px-3 py-2"
        />

        <input
          name="qualification"
          value={form.qualification}
          onChange={onChange}
          placeholder="Qualification(s) (comma separated)"
          className="border border-slate-300 rounded-lg px-3 py-2"
        />

        <div className="flex gap-2">
          <select
            name="phoneCountryCode"
            value={form.phoneCountryCode}
            onChange={onChange}
            className="w-44 border border-slate-300 rounded-lg px-2 py-2"
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
            placeholder="Doctor Phone Number"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>

        <select
          name="countryCode"
          value={form.countryCode}
          onChange={onCountryChange}
          className="border border-slate-300 rounded-lg px-3 py-2"
        >
          <option value="">Select Nationality and Country Flag</option>
          {countryOptions.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>

        <input
          name="collegeUniversity"
          value={form.collegeUniversity}
          onChange={onChange}
          placeholder="College / University"
          className="border border-slate-300 rounded-lg px-3 py-2"
        />

        <input
          name="research"
          value={form.research}
          onChange={onChange}
          placeholder="Research"
          className="border border-slate-300 rounded-lg px-3 py-2"
        />

        <div className="md:col-span-2">
          <label htmlFor="bio" className="text-sm font-medium text-slate-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={onChange}
            placeholder="Write your doctor bio"
            rows={4}
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="offlineChamberLocation" className="text-sm font-medium text-slate-700">
            Offline Chamber Location
          </label>
          <input
            id="offlineChamberLocation"
            name="offlineChamberLocation"
            value={form.offlineChamberLocation}
            onChange={onChange}
            placeholder="Enter offline chamber address/location"
            className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="offlineChamberStart" className="text-sm font-medium text-slate-700">
            Offline Chamber Start Time
          </label>
          <input
            id="offlineChamberStart"
            name="offlineChamberStart"
            type="time"
            value={form.offlineChamberStart}
            onChange={onChange}
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="offlineChamberEnd" className="text-sm font-medium text-slate-700">
            Offline Chamber End Time
          </label>
          <input
            id="offlineChamberEnd"
            name="offlineChamberEnd"
            type="time"
            value={form.offlineChamberEnd}
            onChange={onChange}
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="experience" className="text-sm font-medium text-slate-700">
            Experience
          </label>
          <input
            id="experience"
            name="experience"
            type="text"
            value={form.experience}
            onChange={onChange}
            placeholder="Type your experience"
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="consultationFee" className="text-sm font-medium text-slate-700">
            Consultation Fee
          </label>
          <div className="flex gap-2">
            <select
              name="consultationCurrency"
              value={form.consultationCurrency}
              onChange={onChange}
              className="w-28 border border-slate-300 rounded-lg px-2 py-2"
            >
              {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <input
              id="consultationFee"
              name="consultationFee"
              type="text"
              value={form.consultationFee}
              onChange={onChange}
              placeholder="Type your consultation fee"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-3 mt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="bg-[#0B3D91] text-white px-5 py-2 rounded-lg font-medium disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {loading && <p className="text-slate-500 text-sm">Loading profile...</p>}
          {message && <p className="text-emerald-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </form>
    </div>
  );
}
