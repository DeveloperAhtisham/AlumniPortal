import { createSlice } from "@reduxjs/toolkit";
import client from "@/services/apiClient";
import { createAsyncThunkWrapper } from "@/redux/wrapper/createAsyncThunkWrapper";

const initialState = {
  jobData: [],
  loading: false,
  error: null,
};

// POST job thunk
export const PostJobApi = createAsyncThunkWrapper(
  "job/create",
  async (payload) => {
    console.log("🚀 API Hit Started: /jobs/job");
    const response = await client.post("/jobs/job", payload,{
      "Content-Type": "multipart/form-data",
    });
    console.log("🚀 ~ Job Post Response:", response);
    const { data, status } = response || {};
    return { data, status };
  }
);

export const getAllJobs = createAsyncThunkWrapper(
  "job/jobsList",
  async () => {
    const response = await client.get(`/jobs/all`);
    console.log("🚀 ~ jobsList ~ response:", response);

    const { data, status } = response || {};
    return { data, status };
  }
);

const PostJobSlice = createSlice({
  name: "job", 
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllJobs.fulfilled, (state, action) => {
        console.log("🚀 ~ Job Posted:", action);
        state.loading = false;
        state.jobData = action.payload?.data || {}; 
      })
      .addCase(getAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "An error occurred while posting the job";
      });
  },
});

export default PostJobSlice.reducer;
