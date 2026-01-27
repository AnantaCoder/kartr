import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";
import youtubeReducer from "./slices/youtubeSlice";
import chatReducer from "./slices/chatSlice";
import adminReducer from "./slices/adminSlice";
import campaignReducer from "./slices/campaignSlice";
import discoveryReducer from "./slices/discoverySlice";
import trackingReducer from "./slices/trackingSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  youtube: youtubeReducer,
  chat: chatReducer,
  admin: adminReducer,
  campaigns: campaignReducer,
  discovery: discoveryReducer,
  tracking: trackingReducer,
});

export default rootReducer;
