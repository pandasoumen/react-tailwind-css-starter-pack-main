export default function DoctorCard({ doctor, onBook }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-primary transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{doctor.name}</h3>
          <p className="text-slate-400 text-sm">{doctor.doctorProfile?.specialty}</p>
        </div>
        <div className="text-primary text-sm font-semibold">
          ⭐ {doctor.doctorProfile?.rating?.toFixed(1) || 'N/A'}
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-300 mb-4">
        <p>📍 Region: {doctor.doctorProfile?.region}</p>
        <p>💼 Experience: {doctor.doctorProfile?.experience} years</p>
        <p>💰 Fee: ${doctor.doctorProfile?.consultationFee}/session</p>
        <p>🗣️ Languages: {doctor.doctorProfile?.languages?.join(', ')}</p>
      </div>

      <button
        onClick={() => onBook(doctor)}
        className="w-full py-2 bg-primary text-secondary rounded-lg hover:bg-green-400 transition font-semibold"
      >
        Book Appointment
      </button>
    </div>
  );
}