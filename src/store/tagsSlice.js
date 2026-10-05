import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getTags();
      return res.tags || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch tags');
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (name, { rejectWithValue }) => {
    try {
      const res = await api.createTag(name);
      return res.tag;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create tag');
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteTag(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete tag');
    }
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createTag.fulfilled, (state, action) => {
        if (action.payload && !state.items.some((t) => t.id === action.payload.id)) {
          state.items.push(action.payload);
        }
      })

      // Delete
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export default tagsSlice.reducer;
