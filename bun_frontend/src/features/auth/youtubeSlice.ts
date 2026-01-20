import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { YoutubeResult } from "./youtubeSchema.ts"

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

// ASYNC ACTION
export const fetchYoutubeResults = createAsyncThunk<
  YoutubeResult[],
  string
>("youtube/fetchResults", async (query) => {
  // Replace with real API later
  await new Promise(resolve => setTimeout(resolve, 1200))

  return [
    {
      video_title: "How MrBeast Builds Viral Videos",
      channel_name: "MrBeast",
      creator_name: "Jimmy Donaldson",
      creator_industry: "Entertainment",
      published_at: "2023-01-01",
      sponsors: ["Nike", "Google"]
    }
  ]
})

const youtubeSlice = createSlice({
  name: "youtube",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchYoutubeResults.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchYoutubeResults.fulfilled, (state, action) => {
        state.loading = false
        state.results = action.payload
      })
      .addCase(fetchYoutubeResults.rejected, state => {
        state.loading = false
        state.error = "Failed to fetch results"
      })
  }
})

export default youtubeSlice.reducer
