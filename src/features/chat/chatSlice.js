// features/chat/chatSlice.js
import {  createSlice } from '@reduxjs/toolkit';
import { createAsyncThunkWrapper } from '@/redux/wrapper/createAsyncThunkWrapper';
import client from '@/services/apiClient';

export const getChatToken = createAsyncThunkWrapper(
  'chat/getToken',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await client.post('/chat/token', { userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPrivateChannel = createAsyncThunkWrapper(
  'chat/createPrivate',
  async ({ senderId, receiverId }, { rejectWithValue }) => {
    try {
      const response = await client.post('/chat/private', { senderId, receiverId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGroupChannel = createAsyncThunkWrapper(
  'chat/createGroup',
  async ({ creatorId, groupName }, { rejectWithValue }) => {
    try {
      const response = await client.post('/chat/group', { creatorId, groupName });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendMessage = createAsyncThunkWrapper(
  'chat/sendMessage',
  async ({ userId, channelId, text }, { rejectWithValue }) => {
    try {
      const response = await client.post('/chat/message', { userId, channelId, text });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMessages = createAsyncThunkWrapper(
  'chat/fetchMessages',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await client.get(`/chat/getMessages/${channelId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    channels: [],
    currentChannel: null,
    messages: [],
    status: 'idle',
    error: null
  },
  reducers: {
    setCurrentChannel: (state, action) => {
      state.currentChannel = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChatToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getChatToken.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createPrivateChannel.fulfilled, (state, action) => {
        state.channels.push(action.payload);
      })
      .addCase(createGroupChannel.fulfilled, (state, action) => {
        state.channels.push(action.payload);
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  }
});

export const { setCurrentChannel } = chatSlice.actions;
export default chatSlice.reducer;