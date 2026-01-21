import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";
import youtubeReducer from "@/features/auth/slices/youtubeSlice";
import chatReducer from "@/features/auth/slices/chatSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  youtube: youtubeReducer,
  chat: chatReducer,
});

export default rootReducer;
