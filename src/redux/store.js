import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import userInfoSlice from "../features/auth/userInfoSlice";
// import authSlice from "../features/auth/authSlice";
// import communitySlice from "../features/feed/communitySlice";
// import vaccinationSlice from "../features/healthRecord/vaccinationSlice";
// import petAppointmentSlice from "../features/appiontment/petAppointmentSlice";
// import doctorAppointmentSlice from "../features/appiontment/doctorAppointmentSlice";
// import diseaseSlice from "../features/healthRecord/diseaseSlice";
// import medicationSlice from "../features/healthRecord/medicationSlice";
// import slotsSlice from "../features/appiontment/slotsSlics";
// import doctorSlice from "../features/auth/doctor";
// import petSlice from "../features/auth/petSlice";
// import reminderSlice from "../features/reminder/reminders";

// Combine all slices into a single rootReducer
const rootReducer = combineReducers({
//   user: authSlice,
//   userInfo: userInfoSlice,
//   community: communitySlice,
//   vaccination: vaccinationSlice,
//   petAppointment: petAppointmentSlice,
//   drAppointment: doctorAppointmentSlice,
//   slots: slotsSlice,
//   disease: diseaseSlice,
//   medication: medicationSlice,
//   doctor: doctorSlice,
//   pet: petSlice,
//   reminder: reminderSlice,
});

// Reset all reducers on logout or session expiry
const appReducer = (state, action) => {
  if (action.type === "RESET_ALL") {
    state = undefined;
  }
  return rootReducer(state, action);
};

// Configure store with the combined reducer
export const store = configureStore({
  reducer: appReducer,
});

// Action to reset all reducers
export const resetAllReducers = () => ({
  type: "RESET_ALL",
});
