import React from "react";

const PrescriptionModal = ({ fileUrl, onClose }) => {
  if (!fileUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-3/4 h-3/4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-red-500 font-bold"
        >
          X
        </button>

        {fileUrl.endsWith(".pdf") ? (
          <iframe src={fileUrl} title="Prescription" className="w-full h-full" />
        ) : (
          <img
            src={fileUrl}
            alt="Prescription"
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default PrescriptionModal;
