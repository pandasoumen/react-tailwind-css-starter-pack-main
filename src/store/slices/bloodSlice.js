import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const authConfig = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const searchBloodDonors = createAsyncThunk("blood/search", async (filters, thunkAPI) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}/blood/search?${params}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const registerBloodDonor = createAsyncThunk("blood/registerDonor", async (payload, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/blood/register`, payload, authConfig());
    return response.data.donor;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendBloodRequest = createAsyncThunk("blood/sendRequest", async (payload, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/blood-requests`, payload, authConfig());
    return response.data.request;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getIncomingBloodRequests = createAsyncThunk("blood/incoming", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/blood-requests/incoming`, authConfig());
    return response.data.requests || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getMyBloodRequests = createAsyncThunk("blood/mine", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/blood-requests/mine`, authConfig());
    return response.data.requests || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const respondBloodRequest = createAsyncThunk("blood/respond", async ({ requestId, action }, thunkAPI) => {
  try {
    const response = await axios.patch(
      `${API_URL}/blood-requests/${requestId}/respond`,
      { action },
      authConfig()
    );
    return response.data.request;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const completeBloodRequest = createAsyncThunk("blood/complete", async (requestId, thunkAPI) => {
  try {
    const response = await axios.patch(`${API_URL}/blood-requests/${requestId}/complete`, {}, authConfig());
    return response.data.request;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getDonationHistory = createAsyncThunk("blood/history", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/blood-requests/history`, authConfig());
    return response.data.requests || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getBloodNotifications = createAsyncThunk("blood/notifications", async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/blood-requests/notifications`, authConfig());
    return response.data.notifications || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const updateRequestInList = (list, updated) =>
  list.map((item) => (item._id === updated._id ? { ...item, ...updated } : item));

const bloodSlice = createSlice({
  name: "blood",
  initialState: {
    donors: [],
    compatibleGroups: [],
    urgentSearch: false,
    incomingRequests: [],
    myRequests: [],
    donationHistory: [],
    notifications: [],
    isLoading: false,
    isError: false,
    message: "",
  },
  reducers: {
    resetBloodState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBloodDonors.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(searchBloodDonors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.donors = action.payload.donors || [];
        state.compatibleGroups = action.payload.compatibleGroups || [];
        state.urgentSearch = Boolean(action.payload.urgent);
      })
      .addCase(searchBloodDonors.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendBloodRequest.fulfilled, (state, action) => {
        state.myRequests.unshift(action.payload);
      })
      .addCase(registerBloodDonor.fulfilled, (state) => {
        state.message = "Donor profile saved";
      })
      .addCase(getIncomingBloodRequests.fulfilled, (state, action) => {
        state.incomingRequests = action.payload;
      })
      .addCase(getMyBloodRequests.fulfilled, (state, action) => {
        state.myRequests = action.payload;
      })
      .addCase(getDonationHistory.fulfilled, (state, action) => {
        state.donationHistory = action.payload;
      })
      .addCase(getBloodNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      .addCase(respondBloodRequest.fulfilled, (state, action) => {
        state.incomingRequests = updateRequestInList(state.incomingRequests, action.payload);
        state.myRequests = updateRequestInList(state.myRequests, action.payload);
      })
      .addCase(completeBloodRequest.fulfilled, (state, action) => {
        state.incomingRequests = updateRequestInList(state.incomingRequests, action.payload);
        state.myRequests = updateRequestInList(state.myRequests, action.payload);
        state.donationHistory.unshift(action.payload);
      });
  },
});

export const { resetBloodState } = bloodSlice.actions;
export default bloodSlice.reducer;
