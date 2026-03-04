import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setLoading, setError } from "../store/slices/prescriptionSlice";

const PrescriptionUpload = () => {
  const { token } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.prescription);
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      dispatch(setError("Please select a file"));
      return;
    }

    const formData = new FormData();
    formData.append("prescription", file);

    try {
      dispatch(setLoading(true));

      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/prescriptions`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatch(setLoading(false));
      alert("Prescription uploaded successfully");
      setFile(null);
    } catch {
      dispatch(setError("Upload failed. Try again."));
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded">
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 mt-3 rounded"
      >
        {loading ? "Uploading..." : "Upload Prescription"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PrescriptionUpload;

