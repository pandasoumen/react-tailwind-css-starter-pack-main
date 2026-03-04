import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  completeBloodRequest,
  getBloodNotifications,
  getDonationHistory,
  getIncomingBloodRequests,
  respondBloodRequest,
} from "../../store/slices/bloodSlice";

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");

export default function DonorDashboard() {
  const dispatch = useDispatch();
  const { incomingRequests, donationHistory, notifications } = useSelector((state) => state.blood);

  useEffect(() => {
    dispatch(getIncomingBloodRequests());
    dispatch(getDonationHistory());
    dispatch(getBloodNotifications());
  }, [dispatch]);

  const totalLivesSaved = donationHistory.length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0B3D91]">Donor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Manage requests, track donation history, and monitor impact.</p>
        <div className="mt-3 inline-flex rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          Total Lives Saved: {totalLivesSaved}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-[#0B3D91]">Incoming Blood Requests</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-3">Requester</th>
                <th className="py-2 pr-3">Blood Group</th>
                <th className="py-2 pr-3">Hospital</th>
                <th className="py-2 pr-3">City</th>
                <th className="py-2 pr-3">Urgency</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomingRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-3 text-slate-500">
                    No incoming requests.
                  </td>
                </tr>
              )}
              {incomingRequests.map((item) => (
                <tr key={item._id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{item.requester?.name || "-"}</td>
                  <td className="py-2 pr-3">{item.bloodGroup}</td>
                  <td className="py-2 pr-3">{item.hospital}</td>
                  <td className="py-2 pr-3">{item.city}</td>
                  <td className="py-2 pr-3">{item.urgency ? "Urgent" : "Normal"}</td>
                  <td className="py-2 pr-3 capitalize">{item.status}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() => dispatch(respondBloodRequest({ requestId: item._id, action: "accept" }))}
                            className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => dispatch(respondBloodRequest({ requestId: item._id, action: "reject" }))}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {item.status === "accepted" && (
                        <button
                          onClick={() => dispatch(completeBloodRequest(item._id))}
                          className="rounded bg-[#0B3D91] px-2 py-1 text-xs font-semibold text-white"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-[#0B3D91]">Donation History</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-3">Blood Group</th>
                <th className="py-2 pr-3">City</th>
                <th className="py-2 pr-3">Requester</th>
                <th className="py-2 pr-3">Completed At</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {donationHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 text-slate-500">
                    No completed donations yet.
                  </td>
                </tr>
              )}
              {donationHistory.map((item) => (
                <tr key={item._id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">{item.bloodGroup}</td>
                  <td className="py-2 pr-3">{item.city}</td>
                  <td className="py-2 pr-3">{item.requester?.name || "-"}</td>
                  <td className="py-2 pr-3">{formatDateTime(item.completedAt)}</td>
                  <td className="py-2 capitalize">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-[#0B3D91]">Notifications</h2>
        <div className="mt-2 space-y-2">
          {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
          {notifications.map((note) => (
            <div key={note._id} className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-800">{note.title}</p>
              <p className="text-slate-600">{note.message}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDateTime(note.createdAt)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
