import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";
import youtubeReducer from "./slices/youtubeSlice";
import chatReducer from "./slices/chatSlice";
import uiReducer from "./slices/uiSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  youtube: youtubeReducer,
  chat: chatReducer,
  ui: uiReducer,
});

export default rootReducer;
