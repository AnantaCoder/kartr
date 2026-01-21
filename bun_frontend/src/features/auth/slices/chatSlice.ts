import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { ChatMessage } from "../schemas/chatSchema.ts"
import { v4 as uuid } from "uuid"

type ChatState = {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
}

const initialState: ChatState = {
  messages: [
    {
      id: uuid(),
      role: "assistant",
      content: "Hi 👋 How can I help you today?"
    }
  ],
  loading: false,
  error: null
}

// ASYNC → backend call
export const sendChatMessage = createAsyncThunk<
  ChatMessage,
  string
>("chat/sendMessage", async (userMessage) => {
  const res = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage })
  })

  const data = await res.json()

  return {
    id: uuid(),
    role: "assistant",
    content: data.reply
  }
})

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        id: uuid(),
        role: "user",
        content: action.payload
      })
    }
  },
  extraReducers: builder => {
    builder
      .addCase(sendChatMessage.pending, state => {
        state.loading = true
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false
        state.messages.push(action.payload)
      })
      .addCase(sendChatMessage.rejected, state => {
        state.loading = false
        state.error = "Failed to get response"
      })
  }
})

export const { addUserMessage } = chatSlice.actions
export default chatSlice.reducer
