import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { API } from "../../utils/api";
import {
  registerBloodDonor,
  searchBloodDonors,
  sendBloodRequest,
} from "../../store/slices/bloodSlice";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RADIUS_OPTIONS = [5, 10, 25, 50];

const formatDate = (value) => {
  if (!value) return "Never donated";
  return new Date(value).toLocaleDateString();
};

export default function BloodFinder() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user);
  const { donors, compatibleGroups, urgentSearch, isLoading, message } = useSelector((state) => state.blood);

  const [filters, setFilters] = useState({
    bloodGroup: "A+",
    city: "",
    radiusKm: "10",
    urgent: false,
  });
  const [hospital, setHospital] = useState("");
  const [geo, setGeo] = useState({ latitude: "", longitude: "" });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo({
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        });
      },
      () => {
        setGeo({ latitude: "", longitude: "" });
      }
    );
  }, []);

  const onSearch = () => {
    dispatch(
      searchBloodDonors({
        ...filters,
        latitude: geo.latitude,
        longitude: geo.longitude,
      })
    );
  };

  const onRegisterAsDonor = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first.");
      return;
    }

    const userName = authUser?.name || "User";

    API.get("/blood/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        toast.info(`You are already registered for blood donor, ${userName}`);
      })
      .catch(() => {
        if (!filters.city.trim()) {
          toast.error("Please enter city before donor registration.");
          return;
        }

        dispatch(
          registerBloodDonor({
            bloodGroup: filters.bloodGroup,
            city: filters.city.trim(),
            latitude: geo.latitude || 0,
            longitude: geo.longitude || 0,
            isAvailable: true,
          })
        )
          .unwrap()
          .then(() => {
            const userId = authUser?.id || authUser?._id;
            if (userId) {
              localStorage.setItem(`donor:${userId}`, "true");
            }
            toast.success("You are registered as a donor successfully");
            window.dispatchEvent(new Event("donor-status-changed"));
          })
          .catch((err) => {
            toast.error(err || "Donor registration failed.");
          });
      });
  };

  const onSendRequest = (donor) => {
    if (!hospital.trim() || !filters.city.trim()) return;
    dispatch(
      sendBloodRequest({
        donorId: donor._id,
        bloodGroup: filters.bloodGroup,
        hospital: hospital.trim(),
        city: filters.city.trim(),
        urgency: filters.urgent,
      })
    );
  };

  const cardClass = useMemo(
    () =>
      urgentSearch
        ? "rounded-xl border border-red-300 bg-red-50 p-4 shadow-sm"
        : "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
    [urgentSearch]
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRegisterAsDonor}
          className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Register Me as Donor
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0B3D91]">Smart Blood Finder</h1>
        <p className="mt-1 text-sm text-slate-600">Search compatible and eligible donors with priority sorting.</p>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-5">
          <select
            value={filters.bloodGroup}
            onChange={(e) => setFilters((prev) => ({ ...prev, bloodGroup: e.target.value }))}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <input
            value={filters.city}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="City"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />

          <select
            value={filters.radiusKm}
            onChange={(e) => setFilters((prev) => ({ ...prev, radiusKm: e.target.value }))}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            {RADIUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item} km
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={filters.urgent}
              onChange={(e) => setFilters((prev) => ({ ...prev, urgent: e.target.checked }))}
            />
            Mark as Urgent
          </label>

          <button
            type="button"
            onClick={onSearch}
            className="rounded bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            {isLoading ? "Searching..." : "Search Donors"}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <input
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            placeholder="Hospital name (for request)"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Location: {geo.latitude && geo.longitude ? "Auto-detected" : "Not detected"}
          </p>
        </div>

        {compatibleGroups.length > 0 && (
          <p className="mt-3 text-xs text-slate-600">
            Compatible donor groups for {filters.bloodGroup}: {compatibleGroups.join(", ")}
          </p>
        )}
        {message && <p className="mt-2 text-xs text-emerald-700">{message}</p>}
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {donors.map((donor) => (
          <article key={donor._id} className={cardClass}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{donor.user?.name || "Donor"}</h2>
              {urgentSearch && (
                <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">URGENT</span>
              )}
            </div>

            <div className="mt-2 space-y-1 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Blood Group:</span> {donor.bloodGroup}
              </p>
              <p>
                <span className="font-semibold">City:</span> {donor.city}
              </p>
              <p>
                <span className="font-semibold">Distance:</span>{" "}
                {donor.distanceKm === null ? "N/A" : `${donor.distanceKm} km`}
              </p>
              <p>
                <span className="font-semibold">Last Donation:</span> {formatDate(donor.lastDonatedAt)}
              </p>
              <p>
                <span className="font-semibold">Eligibility:</span> {donor.eligibilityStatus}
              </p>
              <p>
                <span className="font-semibold">Availability:</span> {donor.availabilityStatus}
              </p>
              <p>
                <span className="font-semibold">Response Score:</span> {donor.responseScore}%
              </p>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSendRequest(donor)}
                className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                Send Request
              </button>
              {donor.highlyResponsive && (
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Highly Responsive Donor
                </span>
              )}
            </div>
          </article>
        ))}
        {donors.length === 0 && !isLoading && (
          <p className="col-span-full rounded border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No eligible donors found for current filters.
          </p>
        )}
      </section>
    </div>
  );
}
