import React, { useEffect, useState } from "react";
import { API } from "../../utils/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const authConfig = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export default function DoctorAvailability() {
  const [form, setForm] = useState({ day: "Monday", startTime: "10:00", endTime: "13:00" });
  const [status, setStatus] = useState("");
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const res = await API.get("/availability", authConfig());
      setList(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      setList([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      await API.post("/availability", form, authConfig());
      setStatus("Availability saved.");
      await load();
    } catch (err) {
      setStatus(err?.response?.data?.message || "Failed to save availability.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#0B3D91] mb-3">Availability</h1>
      <p className="text-slate-600">
        Set your consultation slots and weekly availability here.
      </p>
      <form onSubmit={save} className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4">
        <select
          value={form.day}
          onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}
          className="rounded border border-slate-300 px-3 py-2"
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
          className="rounded border border-slate-300 px-3 py-2"
        />
        <input
          type="time"
          value={form.endTime}
          onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
          className="rounded border border-slate-300 px-3 py-2"
        />
        <button className="rounded bg-[#0B3D91] px-3 py-2 font-semibold text-white">Save Slot</button>
      </form>

      {status && <p className="mt-3 text-sm text-slate-700">{status}</p>}

      <div className="mt-4 space-y-2">
        {list.length === 0 ? (
          <p className="text-sm text-slate-500">No availability added yet.</p>
        ) : (
          list.map((item, idx) => (
            <div key={`${item.day}-${idx}`} className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              {item.day}: {item.startTime} - {item.endTime}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
