import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { YoutubeResult } from "../schemas/youtubeSchema"
import axios from "axios"

type YoutubeState = {
  results: YoutubeResult[]
  loading: boolean
  error: string | null
}

const initialState: YoutubeState = {
  results: [],
  loading: false,
  error: null
}



export const fetchYoutubeResults = createAsyncThunk<
  YoutubeResult[],
  string
>("youtube/fetchResults", async (videoUrl, thunkAPI) => {
  try {
    const res = await axios.post(
      "/api/youtube/analyze-video",
      { video_url: videoUrl }
    );

    // Return array of YoutubeResult
    // If backend returns a single object, wrap it in array:
    if (Array.isArray(res.data.results)) return res.data.results as YoutubeResult[];
    return [res.data as YoutubeResult];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || "API failed");
  }
});



const youtubeSlice = createSlice({
  name: "youtube",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchYoutubeResults.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchYoutubeResults.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload
      })
      .addCase(fetchYoutubeResults.rejected, (state) => {
        state.loading = false
        state.error = "Failed to fetch results"
      })
  }
})

export default youtubeSlice.reducer
