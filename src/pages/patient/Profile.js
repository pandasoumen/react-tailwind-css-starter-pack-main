import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "../../utils/api";
import { buildFlagUrl } from "../../utils/locationData";

const getAuthConfig = (token) => {
  const effectiveToken = token || localStorage.getItem("token");
  return effectiveToken ? { headers: { Authorization: `Bearer ${effectiveToken}` } } : {};
};
const PROFILE_ENDPOINTS = ["/patients/me/profile", "/patients/profile"];

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

const initialOverview = {
  name: "",
  email: "",
  role: "",
  sex: "",
  nationality: "",
  profileImage: "",
  countryFlag: "",
  countryCode: "",
  phoneCountryCode: "",
  phone: "",
  address: "",
  bloodGroup: "",
  medicalConditions: "",
  status: "",
};

export default function PatientProfile() {
  const authUser = useSelector((state) => state.auth?.user) || {};
  const authToken = useSelector((state) => state.auth?.token) || localStorage.getItem("token");
  const [overview, setOverview] = useState(initialOverview);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setOverviewError("");
      setHistoryError("");

      try {
        let normalizedProfile = null;

        for (const endpoint of PROFILE_ENDPOINTS) {
          try {
            const res = await API.get(endpoint, getAuthConfig(authToken));
            const normalized = normalizePatientPayload(res?.data);
            const candidate = normalized?.user || {};
            if (candidate?.name || candidate?.email || Object.keys(candidate?.profile || {}).length > 0) {
              normalizedProfile = normalized;
              break;
            }
          } catch {
            // try next endpoint
          }
        }

        if (normalizedProfile?.user) {
          const user = normalizedProfile.user || {};
          const profile = user?.profile || {};

          setOverview({
            name: user?.name || authUser?.name || "",
            email: user?.email || authUser?.email || "",
            role: user?.role || authUser?.role || "patient",
            sex: user?.sex || profile?.sex || authUser?.sex || authUser?.profile?.sex || "",
            nationality:
              user?.nationality ||
              profile?.nationality ||
              authUser?.nationality ||
              authUser?.profile?.nationality ||
              "",
            profileImage: user?.profileImage || authUser?.profileImage || "",
            countryFlag:
              user?.countryFlag ||
              profile?.countryFlag ||
              authUser?.countryFlag ||
              authUser?.profile?.countryFlag ||
              "",
            countryCode:
              user?.countryCode ||
              profile?.countryCode ||
              authUser?.countryCode ||
              authUser?.profile?.countryCode ||
              "",
            phoneCountryCode: profile?.phoneCountryCode || authUser?.profile?.phoneCountryCode || "",
            phone: profile?.phone || authUser?.profile?.phone || "",
            address: profile?.address || authUser?.profile?.address || "",
            bloodGroup: profile?.bloodGroup || authUser?.profile?.bloodGroup || "",
            medicalConditions: Array.isArray(profile?.medicalConditions)
              ? profile.medicalConditions.join(", ")
              : Array.isArray(authUser?.profile?.medicalConditions)
                ? authUser.profile.medicalConditions.join(", ")
                : "",
            status: user?.isActive === false ? "Inactive" : "Active",
          });
        } else {
          setOverview({
            name: authUser?.name || "",
            email: authUser?.email || "",
            role: authUser?.role || "patient",
            sex: authUser?.sex || authUser?.profile?.sex || "",
            nationality: authUser?.nationality || authUser?.profile?.nationality || "",
            profileImage: authUser?.profileImage || "",
            countryFlag: authUser?.countryFlag || authUser?.profile?.countryFlag || "",
            countryCode: authUser?.countryCode || authUser?.profile?.countryCode || "",
            phoneCountryCode: authUser?.profile?.phoneCountryCode || "",
            phone: authUser?.profile?.phone || "",
            address: authUser?.profile?.address || "",
            bloodGroup: authUser?.profile?.bloodGroup || "",
            medicalConditions: Array.isArray(authUser?.profile?.medicalConditions)
              ? authUser.profile.medicalConditions.join(", ")
              : "",
            status: authUser?.isActive === false ? "Inactive" : "Active",
          });
          setOverviewError("Live profile data could not be loaded. Showing saved account data.");
        }
      } catch {
        setOverview({
          name: authUser?.name || "",
          email: authUser?.email || "",
          role: authUser?.role || "patient",
          sex: authUser?.sex || authUser?.profile?.sex || "",
          nationality: authUser?.nationality || authUser?.profile?.nationality || "",
          profileImage: authUser?.profileImage || "",
          countryFlag: authUser?.countryFlag || authUser?.profile?.countryFlag || "",
          countryCode: authUser?.countryCode || authUser?.profile?.countryCode || "",
          phoneCountryCode: authUser?.profile?.phoneCountryCode || "",
          phone: authUser?.profile?.phone || "",
          address: authUser?.profile?.address || "",
          bloodGroup: authUser?.profile?.bloodGroup || "",
          medicalConditions: Array.isArray(authUser?.profile?.medicalConditions)
            ? authUser.profile.medicalConditions.join(", ")
            : "",
          status: authUser?.isActive === false ? "Inactive" : "Active",
        });
        setOverviewError("Live profile data could not be loaded. Showing saved account data.");
      }

      try {
        const appointmentsResult = await API.get("/appointments", getAuthConfig(authToken));
        setHistory(appointmentsResult?.data?.appointments || []);
      } catch {
        setHistory([]);
        setHistoryError("Could not load appointment history.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authToken, authUser?.email, authUser?.name, authUser?.role]);

  const rowClass = "flex items-center justify-between border-b border-slate-200 pb-2";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col items-center">
          <img
            src={overview.profileImage || "/default-avatar.png"}
            alt="Patient"
            className="w-28 h-28 rounded-full object-cover border border-slate-300"
          />
          <h1 className="mt-3 text-3xl font-extrabold bg-gradient-to-r from-[#2EFFA3] via-[#35D9FF] to-[#74FF3B] bg-clip-text text-transparent">
            Welcome to HEALTRON
          </h1>
          <p className="mt-2 text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span>{overview.name || "User"}</span>
            {(overview.countryFlag || buildFlagUrl(overview.countryCode)) && (
              <img
                src={overview.countryFlag || buildFlagUrl(overview.countryCode)}
                alt="Country flag"
                className="w-7 h-5 rounded object-cover border border-slate-300"
              />
            )}
          </p>
        </div>

        {loading && <p className="mt-6 text-slate-500">Loading profile overview...</p>}
        {!loading && overviewError && <p className="mt-4 text-amber-700">{overviewError}</p>}

        {!loading && (
          <div className="mt-6 space-y-3">
            <div className={rowClass}>
              <span className="font-semibold text-slate-700">Name</span>
              <span className="text-slate-900">{overview.name || "-"}</span>
            </div>
            <div className={rowClass}>
              <span className="font-semibold text-slate-700">Email</span>
              <span className="text-slate-900">{overview.email || "-"}</span>
            </div>
            <div className={rowClass}>
              <span className="font-semibold text-slate-700">Role</span>
              <span className="text-slate-900 capitalize">{overview.role || "-"}</span>
            </div>
            <div className={rowClass}>
              <span className="font-semibold text-slate-700">Sex</span>
              <span className="text-slate-900">{overview.sex || "-"}</span>
            </div>
            <div className={rowClass}>
              <span className="font-semibold text-slate-700">Phone Number</span>
              <span className="text-slate-900">
                {overview.phone
                  ? `${overview.phoneCountryCode || ""} ${overview.phone}`.trim()
                  : "-"}
              </span>
            </div>
            <div className={rowClass}>
              <span className="font-semibold text-slate-700">Address</span>
              <span className="text-slate-900 text-right">{overview.address || "-"}</span>
            </div>
            <div className={rowClass}>
              <span className="font-semibold text-slate-700">Blood Group</span>
              <span className="text-slate-900">{overview.bloodGroup || "-"}</span>
            </div>
            <div className={rowClass}>
              <span className="font-semibold text-slate-700">Account Status</span>
              <span className="text-slate-900">{overview.status || "-"}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="font-semibold text-slate-700">Medical Conditions</span>
              <span className="text-slate-900 text-right">{overview.medicalConditions || "-"}</span>
            </div>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#0B3D91] mb-2">History</h2>
        <p className="text-slate-600">Your recent appointment history.</p>

        {loading && <p className="mt-6 text-slate-500">Loading history...</p>}
        {!loading && historyError && <p className="mt-4 text-red-600">{historyError}</p>}

        {!loading && !historyError && (
          <div className="mt-4 space-y-3">
            {history.length === 0 ? (
              <p className="text-slate-500">No appointment history found.</p>
            ) : (
              history.slice(0, 10).map((item) => (
                <article key={item._id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">
                    {item?.doctorId?.name || item?.doctor?.name || "Doctor"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Date: {item?.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                  </p>
                  <p className="text-sm text-slate-600">Time: {item?.time || "N/A"}</p>
                  <p className="text-sm text-slate-600 capitalize">Status: {item?.status || "pending"}</p>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
