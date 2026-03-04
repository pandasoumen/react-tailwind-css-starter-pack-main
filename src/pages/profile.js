import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import ProfileImageUpload from "../components/ProfileImageUpload";
import { setCredentials } from "../store/slices/authSlice";

const initialForm = {
  name: "",
  sex: "",
  specialty: "",
  qualification: "",
  collegeUniversity: "",
  research: "",
  experience: "",
  consultationFee: "",
};

const Profile = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth || {});

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
          collegeUniversity: doctor?.collegeUniversity || "",
          research: doctor?.research || "",
          experience:
            doctor?.experience !== undefined && doctor?.experience !== null
              ? String(doctor.experience)
              : "",
          consultationFee:
            doctor?.consultationFee !== undefined && doctor?.consultationFee !== null
              ? String(doctor.consultationFee)
              : "",
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
        collegeUniversity: form.collegeUniversity,
        research: form.research,
        experience: form.experience,
        consultationFee: form.consultationFee,
      };

      const res = await axios.put(`${process.env.REACT_APP_BASE_URL}/doctors/me/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedName = res?.data?.doctor?.user?.name || form.name;
      if (updatedName && user) {
        dispatch(
          setCredentials({
            token,
            user: { ...user, name: updatedName },
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Edit Profile Settings</h2>
        <p className="text-slate-600 mb-5">Update your profile details from this section.</p>

        <ProfileImageUpload />

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
          <input
            id="consultationFee"
            name="consultationFee"
            type="text"
            value={form.consultationFee}
            onChange={onChange}
            placeholder="Type your consultation fee"
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
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

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Profile Overview</h2>
        <p className="text-slate-600">Submitted doctor profile details.</p>

        <div className="mt-6 flex justify-center">
          <img
            src={user?.profileImage || "/default-avatar.png"}
            alt="Doctor"
            className="w-32 h-32 rounded-full object-cover border border-slate-300"
          />
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Name</span>
            <span className="text-slate-900">{form.name || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Sex</span>
            <span className="text-slate-900">{form.sex || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Specialty</span>
            <span className="text-slate-900">{form.specialty || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Qualification</span>
            <span className="text-slate-900">{form.qualification || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">College / University</span>
            <span className="text-slate-900">{form.collegeUniversity || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Research</span>
            <span className="text-slate-900">{form.research || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Experience</span>
            <span className="text-slate-900">{form.experience || "-"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Consultation Fee</span>
            <span className="text-slate-900">{form.consultationFee || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
