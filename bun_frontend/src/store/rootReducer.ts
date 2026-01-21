import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";
import youtubeReducer from "./slices/youtubeSlice";
import chatReducer from "./slices/chatSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  youtube: youtubeReducer,
  chat: chatReducer,
});

export default rootReducer;
