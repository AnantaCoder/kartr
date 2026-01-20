import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";
import youtubeReducer from "@/features/auth/youtubeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  youtube: youtubeReducer,
});

export default rootReducer;
