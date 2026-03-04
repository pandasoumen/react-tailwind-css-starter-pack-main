import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "../store/slices/authSlice";
import doctorReducer from "../store/slices/doctorSlice";
import patientReducer from "../store/slices/patientSlice";
import appointmentReducer from "../store/slices/appointmentSlice";
import productReducer from "../store/slices/productSlice";
import blogReducer from "../store/slices/blogSlice";
import bloodReducer from "../store/slices/bloodSlice";
import prescriptionReducer from "../store/slices/prescriptionSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  doctors: doctorReducer,
  patients: patientReducer,
  appointments: appointmentReducer,
  products: productReducer,
  blog: blogReducer,
  blood: bloodReducer,
  prescription: prescriptionReducer,
});

export default rootReducer;
