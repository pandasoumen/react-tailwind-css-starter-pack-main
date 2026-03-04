import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  setLoading,
  setPrescriptions,
  setError,
  removePrescription,
} from "../../store/slices/prescriptionSlice";
import PrescriptionModal from "../../components/PrescriptionModal";

const PatientPrescriptions = () => {
  const { token } = useSelector((state) => state.auth);
  const prescriptionState = useSelector((state) => state.prescription) || {};
  const prescriptions = Array.isArray(prescriptionState.prescriptions)
    ? prescriptionState.prescriptions
    : [];
  const { loading, error } = prescriptionState;
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));

        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/prescriptions/doctor`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        dispatch(setPrescriptions(response.data.prescriptions));
      } catch {
        dispatch(setError("Failed to load prescriptions"));
      }
    };

    fetchData();
  }, [dispatch, token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/prescriptions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(removePrescription(id));
    } catch {
      dispatch(setError("Delete failed"));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#0B3D91] mb-4">Patient Prescriptions</h2>

      {loading && <p className="text-slate-600">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {prescriptions.length === 0 ? (
        <p className="text-slate-500">No prescriptions uploaded yet.</p>
      ) : (
        prescriptions.map((item) => (
          <div key={item._id} className="border border-slate-200 bg-slate-50 p-4 mb-4 rounded-xl">
            <p className="font-semibold text-slate-900">Patient: {item.patient.name}</p>
            <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>

            <div className="mt-3">
              <button
                onClick={() => setSelectedFile(item.fileUrl)}
                className="text-blue-700 underline mr-4"
              >
                Preview
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>

            <textarea
              placeholder="Add doctor notes..."
              className="border border-slate-300 bg-white p-2 w-full mt-3 rounded-lg"
            />
          </div>
        ))
      )}

      <PrescriptionModal
        fileUrl={selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
};

export default PatientPrescriptions;
