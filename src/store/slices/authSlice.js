import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL (set this in your .env file)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Get auth payload from localStorage
const storedAuth = JSON.parse(localStorage.getItem("user"));

// Async Thunks
export const register = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, userData);
    if (res.data) {
      localStorage.setItem("user", JSON.stringify({
        user: res.data.user || null,
        token: res.data.token || null,
      }));
      if (res.data.token) localStorage.setItem("token", res.data.token);
    }
    return res.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const login = createAsyncThunk("auth/login", async (userData, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, userData);
    if (res.data) {
      localStorage.setItem("user", JSON.stringify({
        user: res.data.user || null,
        token: res.data.token || null,
      }));
      if (res.data.token) localStorage.setItem("token", res.data.token);
    }
    return res.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (profileData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const res = await axios.put(`${API_URL}/patients/profile`, profileData, config);
    if (res.data) localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("user");
});

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedAuth?.user || null,
    token: storedAuth?.token || localStorage.getItem("token") || null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
  },
  reducers: {
    setCredentials: (state, action) => {
      const payload = action.payload || {};
      state.user = payload.user || null;
      state.token = payload.token || null;
      localStorage.setItem("user", JSON.stringify({
        user: payload.user || null,
        token: payload.token || null,
      }));
      if (payload.token) {
        localStorage.setItem("token", payload.token);
      }
    },
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload?.user || state.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      });
  },
});

export const { reset, setCredentials } = authSlice.actions;
export default authSlice.reducer;
