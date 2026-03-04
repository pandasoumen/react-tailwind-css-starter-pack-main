import { useEffect, useMemo, useState } from "react";
import { FiFilter } from "react-icons/fi";
import { Link } from "react-router-dom";
import { API } from "../utils/api";

const PAGE_SIZE = 5;

const getGender = (doctor = {}) =>
  (doctor?.gender || doctor?.sex || doctor?.user?.gender || doctor?.user?.sex || "Not specified").toString();

const getSpecialty = (doctor = {}) =>
  (
    doctor?.specialty ||
    doctor?.doctorProfile?.specialty ||
    doctor?.department ||
    doctor?.doctorProfile?.department ||
    "General"
  ).toString();

const getEmail = (doctor = {}) => (doctor?.user?.email || doctor?.email || "-").toString();
const getName = (doctor = {}) => (doctor?.user?.name || doctor?.name || "Doctor").toString();
const getImage = (doctor = {}) => doctor?.user?.profileImage || doctor?.profileImage || "/default-avatar.png";

export default function Doctors() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const hasQuery = Boolean(search.trim() || gender || specialty);

  useEffect(() => {
    const loadFilterSource = async () => {
      try {
        const res = await API.get("/doctors");
        setAllDoctors(Array.isArray(res?.data?.doctors) ? res.data.doctors : []);
      } catch {
        setAllDoctors([]);
      }
    };

    loadFilterSource();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!hasQuery) {
        setDoctors([]);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await API.get("/doctors", {
          params: {
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(gender ? { gender } : {}),
            ...(specialty ? { specialty } : {}),
          },
        });
        setDoctors(Array.isArray(res?.data?.doctors) ? res.data.doctors : []);
      } catch (err) {
        setDoctors([]);
        const serverMessage = err?.response?.data?.message;
        if (serverMessage) {
          setError(`Could not load doctors: ${serverMessage}`);
        } else {
          setError("Could not load doctors right now.");
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, gender, specialty, hasQuery]);

  const genders = useMemo(() => {
    const set = new Set();
    allDoctors.forEach((doctor) => {
      const g = getGender(doctor).trim();
      if (g && g.toLowerCase() !== "not specified") set.add(g);
    });
    return Array.from(set);
  }, [allDoctors]);

  const specialties = useMemo(() => {
    const set = new Set();
    allDoctors.forEach((doctor) => {
      const s = getSpecialty(doctor).trim();
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [allDoctors]);

  const totalPages = Math.max(1, Math.ceil(doctors.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = doctors.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, gender, specialty]);

  return (
    <div className="mx-auto w-full max-w-7xl rounded-md bg-[#e9edf2] p-3 sm:p-4">
      <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <h1 className="text-xl font-bold text-[#0B3D91]">Book Your doctor</h1>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor by name, email, or specialty"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          />
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <FiFilter />
            Filter
          </button>
        </div>

        {showFilters && (
          <div className="mt-2 grid grid-cols-1 gap-2 rounded border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="">- Select Gender -</option>
              {genders.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="">- Select Specialist -</option>
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setGender("");
                setSpecialty("");
              }}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-[#7ea4c6] text-white">
              <tr>
                <th className="px-2 py-2">Profile</th>
                <th className="px-2 py-2">Dr Full Name</th>
                <th className="px-2 py-2">Gender</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Specialist</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-center text-slate-500">
                    Loading doctors...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && hasQuery && paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-center text-slate-500">
                    No doctors found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                paginated.map((doctor) => (
                  <tr key={doctor?._id || getEmail(doctor)} className="border-t border-slate-200">
                    <td className="px-2 py-2">
                      <Link to={`/doctors/${doctor?._id}`} className="inline-flex">
                        <img
                          src={getImage(doctor)}
                          alt={getName(doctor)}
                          className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                        />
                      </Link>
                    </td>
                    <td className="px-2 py-2">
                      <Link to={`/doctors/${doctor?._id}`} className="font-medium text-[#0B3D91] hover:underline">
                        {getName(doctor)}
                      </Link>
                    </td>
                    <td className="px-2 py-2">{getGender(doctor)}</td>
                    <td className="px-2 py-2">{getEmail(doctor)}</td>
                    <td className="px-2 py-2">{getSpecialty(doctor)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {hasQuery && (
          <div className="mt-3 flex flex-wrap items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={safePage === 1}
            className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            First
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={safePage === totalPages}
            className="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Last
          </button>
          </div>
        )}
      </div>
    </div>
  );
}
