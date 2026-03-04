import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiActivity, FiDroplet, FiHeart, FiWind } from "react-icons/fi";
import { API } from "../../utils/api";

const PROFILE_ENDPOINTS = ["/patients/me/profile", "/patients/profile"];

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const pick = (obj, keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") {
      return obj[key];
    }
  }
  return "";
};

const normalizePatient = (data = {}) => {
  const patient = data?.patient || {};
  const user = data?.user || patient?.user || {};
  return {
    ...patient,
    ...user,
    profile: {
      ...(user?.profile || {}),
      ...(patient?.profile || {}),
    },
  };
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "-");
const formatTime = (value) => (value ? value : "-");

const toNumberOrDash = (value, unit = "") => {
  if (value === undefined || value === null || value === "") return "-";
  return unit ? `${value} ${unit}` : String(value);
};

export default function PatientDashboard() {
  const authUserState = useSelector((state) => state.auth?.user);
  const authUser = useMemo(() => authUserState || {}, [authUserState]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patient, setPatient] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [activeCard, setActiveCard] = useState("");
  const [typedHint, setTypedHint] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        let profileData = {};

        for (const endpoint of PROFILE_ENDPOINTS) {
          try {
            const res = await API.get(endpoint, getAuthConfig());
            const normalized = normalizePatient(res?.data);
            if (normalized?.name || normalized?.email || Object.keys(normalized?.profile || {}).length > 0) {
              profileData = normalized;
              break;
            }
          } catch {
            // try next endpoint
          }
        }

        const apptRes = await API.get("/appointments", getAuthConfig());
        setPatient(profileData);
        setAppointments(Array.isArray(apptRes?.data?.appointments) ? apptRes.data.appointments : []);
      } catch {
        setPatient(authUser || {});
        setAppointments([]);
        setError("Could not load full dashboard data. Showing available account data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authUser]);

  useEffect(() => {
    if (!activeCard) {
      setTypedHint("");
      return;
    }

    const hints = {
      booking: "Finding best doctors for you...",
      appointments: "Opening your appointment timeline...",
      blood: "Locating matching donors near you...",
    };

    const fullText = hints[activeCard] || "";
    let i = 0;
    setTypedHint("");

    const timer = setInterval(() => {
      i += 1;
      setTypedHint(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(timer);
      }
    }, 28);

    return () => clearInterval(timer);
  }, [activeCard]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) =>
          new Date(b?.updatedAt || b?.date || 0).getTime() - new Date(a?.updatedAt || a?.date || 0).getTime()
      ),
    [appointments]
  );

  const latestDoctorUpdate = useMemo(
    () =>
      sortedAppointments.find((item) => {
        const source = item?.vitals || item?.medicalHistory || item?.healthData || item || {};
        return (
          pick(source, ["bloodPressure", "bp"]) ||
          pick(source, ["pulse", "heartRate"]) ||
          pick(source, ["temperature", "temp"]) ||
          pick(source, ["spo2", "oxygenSaturation"]) ||
          pick(source, ["respiratoryRate", "respiration"]) ||
          pick(source, ["weight"])
        );
      }) || null,
    [sortedAppointments]
  );

  const vitals = useMemo(() => {
    const profile = patient?.profile || {};
    const source = latestDoctorUpdate?.vitals || latestDoctorUpdate?.medicalHistory || latestDoctorUpdate?.healthData || latestDoctorUpdate || {};

    return {
      bloodPressure: pick(source, ["bloodPressure", "bp"]) || pick(profile, ["bloodPressure", "bp"]) || "-",
      pulse: toNumberOrDash(pick(source, ["pulse", "heartRate"]) || pick(profile, ["pulse", "heartRate"]), "bpm"),
      temperature: toNumberOrDash(pick(source, ["temperature", "temp"]) || pick(profile, ["temperature", "temp"]), "C"),
      spo2: toNumberOrDash(
        pick(source, ["spo2", "oxygenSaturation"]) || pick(profile, ["spo2", "oxygenSaturation"]),
        "%"
      ),
      respiratoryRate: pick(source, ["respiratoryRate", "respiration"]) || pick(profile, ["respiratoryRate", "respiration"]) || "-",
      weight: pick(source, ["weight"]) || pick(profile, ["weight"]) || "-",
      updatedAt: latestDoctorUpdate?.updatedAt || latestDoctorUpdate?.date || patient?.updatedAt || "-",
    };
  }, [latestDoctorUpdate, patient]);

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((item) => {
          if (!item?.date) return false;
          return new Date(item.date).getTime() >= new Date().setHours(0, 0, 0, 0) && item?.status !== "cancelled";
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
    [appointments]
  );

  const card =
    "rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur";
  const vitalCard =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.10)]";

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/70 bg-gradient-to-r from-white to-slate-50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-[#0B3D91]">Hi, {patient?.name || authUser?.name || "Patient"}</h1>
          <Link
            to="/doctors"
            className="inline-flex items-center justify-center rounded-lg bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            Book Appointment
          </Link>
        </div>
      </section>

      {loading && <section className={card}>Loading patient dashboard...</section>}
      {!loading && error && <section className={`${card} text-amber-700`}>{error}</section>}

      {!loading && (
        <>
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article className={vitalCard}>
              <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Blood Pressure</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B3D91] tracking-tight">{vitals.bloodPressure}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#0B3D91]/20 bg-[#0B3D91]/10 text-[#0B3D91]">
                    <FiDroplet className="text-lg" />
                  </span>
                </div>
              </div>
            </article>
            <article className={vitalCard}>
              <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Pulse</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B3D91] tracking-tight">{vitals.pulse}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#0B3D91]/20 bg-[#0B3D91]/10 text-[#0B3D91]">
                    <FiHeart className="text-lg" />
                  </span>
                </div>
              </div>
            </article>
            <article className={vitalCard}>
              <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Temperature</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B3D91] tracking-tight">{vitals.temperature}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#0B3D91]/20 bg-[#0B3D91]/10 text-[#0B3D91]">
                    <FiActivity className="text-lg" />
                  </span>
                </div>
              </div>
            </article>
            <article className={vitalCard}>
              <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">SPO2</p>
                    <p className="mt-2 text-2xl font-bold text-[#0B3D91] tracking-tight">{vitals.spo2}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#0B3D91]/20 bg-[#0B3D91]/10 text-[#0B3D91]">
                    <FiWind className="text-lg" />
                  </span>
                </div>
              </div>
            </article>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className={`${card} border-slate-300 shadow-[0_16px_38px_rgba(15,23,42,0.12)] xl:col-span-2`}>
              <h2 className="text-lg font-bold text-[#0B3D91]">Medical History</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="pb-2 pr-4">Blood Pressure</th>
                      <th className="pb-2 pr-4">Pulse</th>
                      <th className="pb-2 pr-4">Respiratory Rate</th>
                      <th className="pb-2 pr-4">SPO2</th>
                      <th className="pb-2 pr-4">Temperature</th>
                      <th className="pb-2 pr-4">Weight</th>
                      <th className="pb-2">Updated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="pt-2 pr-4">{vitals.bloodPressure}</td>
                      <td className="pt-2 pr-4">{vitals.pulse}</td>
                      <td className="pt-2 pr-4">{vitals.respiratoryRate}</td>
                      <td className="pt-2 pr-4">{vitals.spo2}</td>
                      <td className="pt-2 pr-4">{vitals.temperature}</td>
                      <td className="pt-2 pr-4">{vitals.weight}</td>
                      <td className="pt-2">{formatDate(vitals.updatedAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            <article className={`${card} border-slate-300 shadow-[0_16px_38px_rgba(15,23,42,0.12)]`}>
              <h2 className="text-lg font-bold text-[#0B3D91]">Upcoming Appointments</h2>
              {upcomingAppointments.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No upcoming appointments.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600">
                        <th className="pb-2 pr-3">Date</th>
                        <th className="pb-2 pr-3">Time</th>
                        <th className="pb-2 pr-3">Reason</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingAppointments.map((item) => (
                        <tr key={item?._id || `${item?.date}-${item?.time}`}>
                          <td className="pt-2 pr-3">{formatDate(item?.date)}</td>
                          <td className="pt-2 pr-3">{formatTime(item?.time)}</td>
                          <td className="pt-2 pr-3">{item?.reason || "-"}</td>
                          <td className="pt-2 capitalize">{item?.status || "pending"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 px-4 sm:px-6 lg:px-10 md:grid-cols-3">
            <Link
              to="/doctors"
              onMouseEnter={() => setActiveCard("booking")}
              onMouseLeave={() => setActiveCard("")}
              onTouchStart={() => setActiveCard("booking")}
              onTouchEnd={() => setActiveCard("")}
              className="min-h-[160px] rounded-lg border border-slate-300 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.14)] transition hover:-translate-y-1 hover:border-[#0B3D91] hover:shadow-[0_18px_42px_rgba(11,61,145,0.22)]"
            >
              <p className="text-lg font-bold text-[#0B3D91]">Dr. Booking</p>
              <p className="mt-1 text-sm text-slate-600">Find doctors and book appointments.</p>
              <p className="mt-4 text-sm font-medium text-[#0B3D91] min-h-5">
                {activeCard === "booking" ? typedHint : ""}
              </p>
            </Link>
            <Link
              to="/patient/appointments"
              onMouseEnter={() => setActiveCard("appointments")}
              onMouseLeave={() => setActiveCard("")}
              onTouchStart={() => setActiveCard("appointments")}
              onTouchEnd={() => setActiveCard("")}
              className="min-h-[160px] rounded-lg border border-slate-300 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.14)] transition hover:-translate-y-1 hover:border-[#0B3D91] hover:shadow-[0_18px_42px_rgba(11,61,145,0.22)]"
            >
              <p className="text-lg font-bold text-[#0B3D91]">My Appointments</p>
              <p className="mt-1 text-sm text-slate-600">View and manage your appointment list.</p>
              <p className="mt-4 text-sm font-medium text-[#0B3D91] min-h-5">
                {activeCard === "appointments" ? typedHint : ""}
              </p>
            </Link>
            <Link
              to="/patient/blood"
              onMouseEnter={() => setActiveCard("blood")}
              onMouseLeave={() => setActiveCard("")}
              onTouchStart={() => setActiveCard("blood")}
              onTouchEnd={() => setActiveCard("")}
              className="min-h-[160px] rounded-lg border border-slate-300 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.14)] transition hover:-translate-y-1 hover:border-[#0B3D91] hover:shadow-[0_18px_42px_rgba(11,61,145,0.22)]"
            >
              <p className="text-lg font-bold text-[#0B3D91]">Blood Find</p>
              <p className="mt-1 text-sm text-slate-600">Search blood donors by group and city.</p>
              <p className="mt-4 text-sm font-medium text-[#0B3D91] min-h-5">
                {activeCard === "blood" ? typedHint : ""}
              </p>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
