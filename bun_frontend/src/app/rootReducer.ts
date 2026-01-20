import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import youtubeReducer from "@/features/auth/youtubeSlice"

const rootReducer = combineReducers({
  auth: authReducer,
    youtube: youtubeReducer
  // Add other reducers here
});

export default rootReducer;
