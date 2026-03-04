import { useEffect, useMemo, useState } from "react";
import { FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAppointments } from "../store/slices/appointmentSlice";

const PAGE_SIZE = 5;

const toDateText = (value) => {
  if (!value) return "-";
  return new Date(value).toISOString().slice(0, 10);
};

const deriveType = (appointment) => {
  const value = (appointment?.appointmentType || appointment?.type || "").toString().trim();
  if (value) return value;

  const reason = (appointment?.reason || "").toString().toLowerCase();
  if (reason.includes("procedure")) return "Procedure";
  return "Consultation";
};

const getConsultingName = (appointment, role) => {
  if (role === "doctor") {
    return appointment?.patientId?.name || appointment?.patient?.name || appointment?.patientName || "Patient";
  }
  return appointment?.doctorId?.name || appointment?.doctor?.name || "Doctor";
};

const makeAppointmentCode = (index) => `AP${String(index + 1).padStart(5, "0")}`;

export default function Appointments() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth) || {};
  const role = authState.user?.role || "patient";
  const appointmentsState = useSelector((state) => state.appointments) || {};
  const appointments = useMemo(
    () => (Array.isArray(appointmentsState.appointments) ? appointmentsState.appointments : []),
    [appointmentsState.appointments]
  );

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedConsulting, setSelectedConsulting] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(getAppointments());
  }, [dispatch]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(b?.date || b?.createdAt || 0).getTime() - new Date(a?.date || a?.createdAt || 0).getTime()
      ),
    [appointments]
  );

  const rows = useMemo(
    () =>
      sortedAppointments.map((item, index) => ({
        raw: item,
        code: makeAppointmentCode(index),
        consultingName: getConsultingName(item, role),
        dateText: toDateText(item?.date),
        timeText: item?.time || "-",
        reasonText: item?.reason || "-",
        typeText: deriveType(item),
        yearText: item?.date ? String(new Date(item.date).getFullYear()) : "",
      })),
    [role, sortedAppointments]
  );

  const yearOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((row) => {
      if (row.yearText) set.add(row.yearText);
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [rows]);

  const typeOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((row) => {
      if (row.typeText) set.add(row.typeText);
    });
    return Array.from(set);
  }, [rows]);

  const consultingOptions = useMemo(() => {
    const set = new Set();
    rows.forEach((row) => {
      if (row.consultingName) set.add(row.consultingName);
    });
    return Array.from(set);
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (selectedYear && row.yearText !== selectedYear) return false;
        if (selectedType && row.typeText !== selectedType) return false;
        if (selectedConsulting && row.consultingName !== selectedConsulting) return false;
        return true;
      }),
    [rows, selectedYear, selectedType, selectedConsulting]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [selectedYear, selectedType, selectedConsulting]);

  return (
    <div className="rounded-xl border border-slate-200 bg-[#d9e0e6] p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {role === "doctor" ? "Doctor Dashboard" : "Patient Dashboard"} <span className="px-1">{">"}</span>{" "}
          Appointment List
        </p>
        <Link
          to={role === "doctor" ? "/doctor/dashboard" : "/doctors"}
          className="inline-flex items-center justify-center rounded bg-[#0B4E8A] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          {role === "doctor" ? "Dashboard" : "Book Appointment"}
        </Link>
      </div>

      <section className="mt-3 rounded-md border border-slate-200 bg-white p-3">
        <h2 className="text-base font-semibold text-[#0B4E8A]">All Appointments</h2>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            <option value="">Appointment Date YY</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            <option value="">Appointment Type</option>
            {typeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={selectedConsulting}
            onChange={(e) => setSelectedConsulting(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            <option value="">- Select Consulting ...</option>
            {consultingOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="bg-[#7ca0bf] text-white">
                <th className="px-2 py-2">Appointment ID</th>
                <th className="px-2 py-2">{role === "doctor" ? "Patient" : "Consulting Doctor"}</th>
                <th className="px-2 py-2">Appointment Date</th>
                <th className="px-2 py-2">Appointment Time</th>
                <th className="px-2 py-2">Appointment Reason</th>
                <th className="px-2 py-2">Appointment Type</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-4 text-center text-slate-500">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.raw?._id || row.code} className="border-b border-slate-200">
                    <td className="px-2 py-2">{row.code}</td>
                    <td className="px-2 py-2">{row.consultingName}</td>
                    <td className="px-2 py-2">{row.dateText}</td>
                    <td className="px-2 py-2">{row.timeText}</td>
                    <td className="px-2 py-2">{row.reasonText}</td>
                    <td className="px-2 py-2">{row.typeText}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => setSelected(row.raw)}
                        className="text-[#0B4E8A] hover:opacity-80"
                        title="View details"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

        {selected && (
          <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Status:</span> {selected?.status || "pending"}
            </p>
            <p>
              <span className="font-semibold">Payment:</span> {selected?.paymentStatus || "-"}
            </p>
            <p>
              <span className="font-semibold">Invoice:</span> {selected?.invoiceNumber || "-"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
