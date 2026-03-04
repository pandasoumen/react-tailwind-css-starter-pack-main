import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../../utils/api";

const authConfig = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const dayName = (dateValue) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  return d.toLocaleDateString("en-US", { weekday: "long" });
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function DoctorProfileBooking() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({
    date: "",
    time: "",
    reason: "Consultation",
    paymentMethod: "Razorpay",
  });
  const [bookingState, setBookingState] = useState({ loading: false, success: "", error: "", invoice: null });

  useEffect(() => {
    const loadDoctor = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/doctors/${id}`);
        setDoctor(res?.data?.doctor || null);
      } catch {
        setDoctor(null);
        setError("Doctor details could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [id]);

  const loadAvailability = async () => {
    try {
      const res = await API.get("/availability", {
        ...authConfig(),
        params: { doctorId: id },
      });
      setAvailability(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      setAvailability([]);
    }
  };

  const doctorName = doctor?.user?.name || "Doctor";
  const doctorEmail = doctor?.user?.email || "-";
  const doctorImage = doctor?.user?.profileImage || "/default-avatar.png";
  const doctorPrice = Number(doctor?.consultationFee || 0);

  const availableTimes = useMemo(() => {
    const selectedDay = dayName(booking.date).toLowerCase();
    const slot = availability.find((item) => item?.day?.toLowerCase() === selectedDay);
    if (!slot?.startTime || !slot?.endTime) return [];
    return [slot.startTime, slot.endTime];
  }, [availability, booking.date]);

  const canSubmit = booking.date && booking.time && booking.reason && booking.paymentMethod;

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setBookingState({ loading: true, success: "", error: "", invoice: null });
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet connection.");
      }

      const orderRes = await API.post("/appointments/create-order", { doctorId: id }, authConfig());
      const order = orderRes?.data?.order;
      const keyId = orderRes?.data?.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID;

      if (!order?.id || !keyId) {
        throw new Error("Unable to initialize Razorpay checkout.");
      }

      const result = await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Healtron",
          description: `Consultation with ${doctorName}`,
          order_id: order.id,
          prefill: {},
          notes: {
            doctorId: id,
          },
          theme: { color: "#0B3D91" },
          handler: async function (response) {
            try {
              const verifyRes = await API.post(
                "/appointments/verify",
                {
                  doctorId: id,
                  date: booking.date,
                  time: booking.time,
                  reason: booking.reason,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                authConfig()
              );
              resolve(verifyRes);
            } catch (verifyErr) {
              reject(verifyErr?.response?.data?.message || verifyErr?.message || "Payment verification failed.");
            }
          },
          modal: {
            ondismiss: function () {
              reject("Payment was cancelled.");
            },
          },
        });

        razorpay.open();
      });

      const appt = result?.data?.appointment;
      setBookingState({
        loading: false,
        success: "Appointment booked and payment verified successfully.",
        error: "",
        invoice: appt?.invoiceDetails || null,
      });
    } catch (err) {
      const message = typeof err === "string" ? err : err?.response?.data?.message || err?.message || "Booking failed.";
      setBookingState({
        loading: false,
        success: "",
        error: message,
        invoice: null,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-4">
      {loading && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading doctor profile...</section>}
      {!loading && error && <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</section>}

      {!loading && !error && doctor && (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <img src={doctorImage} alt={doctorName} className="h-24 w-24 rounded-full border border-slate-200 object-cover" />
              <div className="flex-1 space-y-2">
                <h1 className="text-2xl font-bold text-[#0B3D91]">{doctorName}</h1>
                <p className="text-slate-700"><span className="font-semibold">Email:</span> {doctorEmail}</p>
                <p className="text-slate-700"><span className="font-semibold">Specialty:</span> {doctor?.specialty || "Not added"}</p>
                <p className="text-slate-700"><span className="font-semibold">Experience:</span> {doctor?.experience || 0} years</p>
                <p className="text-slate-700"><span className="font-semibold">Qualifications:</span> {Array.isArray(doctor?.qualifications) && doctor.qualifications.length ? doctor.qualifications.join(", ") : "Not added"}</p>
                <p className="text-slate-700"><span className="font-semibold">College:</span> {doctor?.collegeUniversity || "Not added"}</p>
                <p className="text-slate-700"><span className="font-semibold">Bio:</span> {doctor?.bio || "Not added"}</p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={async () => {
                  setShowBooking((prev) => !prev);
                  if (!showBooking) {
                    await loadAvailability();
                  }
                }}
                className="rounded-lg bg-[#0B3D91] px-4 py-2 font-semibold text-white transition hover:brightness-110"
              >
                Take an Appointment
              </button>
              <p className="mt-3 text-lg font-semibold text-slate-800">Doctor&apos;s Price: {doctorPrice}</p>
            </div>
          </section>

          {showBooking && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0B3D91]">Appointment & Payment</h2>
              <p className="mt-1 text-sm text-slate-600">Choose date/time from doctor availability and complete payment.</p>

              <form onSubmit={submitBooking} className="mt-4 grid gap-3">
                <input
                  type="date"
                  value={booking.date}
                  onChange={(e) => setBooking((prev) => ({ ...prev, date: e.target.value, time: "" }))}
                  className="rounded border border-slate-300 px-3 py-2"
                  required
                />

                <select
                  value={booking.time}
                  onChange={(e) => setBooking((prev) => ({ ...prev, time: e.target.value }))}
                  className="rounded border border-slate-300 px-3 py-2"
                  required
                >
                  <option value="">Select available time</option>
                  {availableTimes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {booking.date && availableTimes.length === 0 && (
                  <p className="text-sm text-amber-700">
                    No configured availability for {dayName(booking.date)}.
                  </p>
                )}

                <input
                  value={booking.reason}
                  onChange={(e) => setBooking((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason"
                  className="rounded border border-slate-300 px-3 py-2"
                  required
                />

                <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  Amount to pay: <span className="font-semibold">{doctorPrice}</span>
                </div>
                <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  Payment gateway: Razorpay
                </div>

                <button
                  type="submit"
                  disabled={bookingState.loading || !canSubmit}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingState.loading ? "Processing..." : "Pay & Book"}
                </button>
              </form>

              {bookingState.error && <p className="mt-3 text-red-600">{bookingState.error}</p>}
              {bookingState.success && <p className="mt-3 text-emerald-700">{bookingState.success}</p>}
              {bookingState.invoice && (
                <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p><span className="font-semibold">Invoice:</span> {bookingState.invoice.invoiceNumber}</p>
                  <p><span className="font-semibold">Method:</span> {bookingState.invoice.method}</p>
                  <p><span className="font-semibold">Amount:</span> {bookingState.invoice.amount}</p>
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Confirmation email is sent automatically when SMTP is configured in backend.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
