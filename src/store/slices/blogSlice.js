import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const getBlogPosts = createAsyncThunk('blog/getAll', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/blog`);
    return response.data.posts;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getBlogPost = createAsyncThunk('blog/getOne', async (id, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/blog/${id}`);
    return response.data.post;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const blogSlice = createSlice({
  name: 'blog',
  initialState: {
    posts: [],
    selectedPost: null,
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBlogPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBlogPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(getBlogPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getBlogPost.fulfilled, (state, action) => {
        state.selectedPost = action.payload;
      });
  },
});

export const { reset } = blogSlice.actions;
export default blogSlice.reducer;
