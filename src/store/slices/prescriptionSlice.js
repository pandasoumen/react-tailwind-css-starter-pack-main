import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prescriptions: [],
  loading: false,
  error: null,
};

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPrescriptions: (state, action) => {
      state.prescriptions = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    removePrescription: (state, action) => {
      state.prescriptions = state.prescriptions.filter(
        (p) => p._id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setPrescriptions,
  setError,
  removePrescription,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;
