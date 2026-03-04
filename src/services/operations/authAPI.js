import { toast } from "react-hot-toast";
import axios from "axios";

// Change this to your backend URL
const BASE_URL = "http://localhost:4000/api/auth";

export const login = (email, password, navigate) => {
  return async (dispatch) => {
    const toastId = toast.loading("Logging in...");

    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });

      toast.success("Login successful!");
      toast.dismiss(toastId);

      // Store token
      localStorage.setItem("token", res.data.token);

      // Optional: save user in Redux
      dispatch({
        type: "SET_USER",
        payload: res.data.user,
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };
};

// REGISTER
export const register = (userData) => {
  return async (dispatch) => {
    const toastId = toast.loading("Creating your account...");

    try {
      const res = await axios.post(`${BASE_URL}/register`, userData);

      toast.success("Account created successfully!");
      toast.dismiss(toastId);

      dispatch({
        type: "SET_USER",
        payload: res.data.user,
      });
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };
};

// FORGOT PASSWORD
export const sendResetEmail = (email) => {
  return async () => {
    const toastId = toast.loading("Sending reset email...");

    try {
      await axios.post(`${BASE_URL}/forgot-password`, { email });

      toast.success("Password reset email sent!");
      toast.dismiss(toastId);
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to send reset email");
    }
  };
};



export const updateProfileImage = async (formData, token) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_BASE_URL}/users/profile-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.user;
  } catch (error) {
    console.error(error);
    alert("Image upload failed");
  }
};
