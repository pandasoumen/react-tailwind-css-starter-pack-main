import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { API } from "../utils/api";


const ProfileImageUpload = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const authToken = token || localStorage.getItem("token");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!image) return;
    if (!authToken) {
      setError("Please login again before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", image);

    try {
      setLoading(true);
      setError(null);

      const response = await API.put(
        "/users/profile-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatch(
        setCredentials({
          token: authToken,
          user: response.data.user,
        })
      );

      alert("Profile updated successfully");
    } catch (err) {
      const message =
        (err.message === "Network Error"
          ? "Cannot reach backend server. Check API base URL configuration."
          : null) ||
        err.response?.data?.message ||
        err.message ||
        "Upload failed";
      console.error("Profile upload error:", err.response?.data || err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={preview || "/default-avatar.png"}
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover border"
      />

      <input type="file" accept="image/*" onChange={handleChange} />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ProfileImageUpload;
