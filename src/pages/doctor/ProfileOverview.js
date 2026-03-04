import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { buildFlagUrl } from "../../utils/locationData";

const initialOverview = {
  name: "",
  sex: "",
  specialty: "",
  qualification: "",
  phone: "",
  phoneCountryCode: "",
  collegeUniversity: "",
  research: "",
  bio: "",
  offlineChamberLocation: "",
  offlineChamberStart: "",
  offlineChamberEnd: "",
  nationality: "",
  countryCode: "",
  countryFlag: "",
  experience: "",
  consultationFee: "",
  consultationCurrency: "",
};

export default function ProfileOverview() {
  const { token, user } = useSelector((state) => state.auth || {});
  const [overview, setOverview] = useState(initialOverview);
  const [loading, setLoading] = useState(false);
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
        setOverview({
          name: doctor?.user?.name || user?.name || "",
          sex: doctor?.sex || "",
          specialty: doctor?.specialty || "",
          qualification: Array.isArray(doctor?.qualifications)
            ? doctor.qualifications.join(", ")
            : "",
          phone: doctor?.user?.phone || doctor?.user?.profile?.phone || "",
          phoneCountryCode: doctor?.phoneCountryCode || "",
          collegeUniversity: doctor?.collegeUniversity || "",
          research: doctor?.research || "",
          bio: doctor?.bio || "",
          offlineChamberLocation: doctor?.offlineChamberLocation || "",
          offlineChamberStart: doctor?.offlineChamberStart || "",
          offlineChamberEnd: doctor?.offlineChamberEnd || "",
          nationality: doctor?.nationality || "",
          countryCode: doctor?.countryCode || "",
          countryFlag: doctor?.countryFlag || "",
          experience:
            doctor?.experience !== undefined && doctor?.experience !== null
              ? String(doctor.experience)
              : "",
          consultationFee:
            doctor?.consultationFee !== undefined && doctor?.consultationFee !== null
              ? String(doctor.consultationFee)
              : "",
          consultationCurrency: doctor?.consultationCurrency || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile overview.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, user?.name]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Profile Overview</h2>
      <p className="text-slate-600">Submitted doctor profile details.</p>

      <div className="mt-6 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <img
            src={user?.profileImage || "/default-avatar.png"}
            alt="Doctor"
            className="w-32 h-32 rounded-full object-cover border border-slate-300"
          />
          <p className="text-base">
            {(overview.countryFlag || buildFlagUrl(overview.countryCode)) && overview.nationality ? (
              <img
                src={overview.countryFlag || buildFlagUrl(overview.countryCode)}
                alt="Country flag"
                className="inline-block w-7 h-5 mr-2 rounded object-cover border border-slate-300"
              />
            ) : null}
            <span className="text-slate-700">{overview.nationality || "-"}</span>
          </p>
        </div>
      </div>

      {loading && <p className="mt-6 text-slate-500">Loading profile overview...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Name</span>
            <span className="text-slate-900">{overview.name || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Sex</span>
            <span className="text-slate-900">{overview.sex || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Specialty</span>
            <span className="text-slate-900">{overview.specialty || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Qualification</span>
            <span className="text-slate-900">{overview.qualification || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Phone Number</span>
            <span className="text-slate-900">
              {overview.phone ? `${overview.phoneCountryCode || ""} ${overview.phone}`.trim() : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">College / University</span>
            <span className="text-slate-900">{overview.collegeUniversity || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Research</span>
            <span className="text-slate-900">{overview.research || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Offline Chamber Location</span>
            <span className="text-slate-900">{overview.offlineChamberLocation || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Offline Chamber Time</span>
            <span className="text-slate-900">
              {overview.offlineChamberStart && overview.offlineChamberEnd
                ? `${overview.offlineChamberStart} - ${overview.offlineChamberEnd}`
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Experience</span>
            <span className="text-slate-900">{overview.experience || "-"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-700">Consultation Fee</span>
            <span className="text-slate-900">
              {overview.consultationFee
                ? `${overview.consultationFee} ${overview.consultationCurrency || ""}`.trim()
                : "-"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="font-semibold text-slate-700">Bio</span>
            <span className="text-slate-900 text-right">{overview.bio || "-"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
