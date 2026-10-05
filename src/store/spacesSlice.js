import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchSpaces = createAsyncThunk(
  'spaces/fetchSpaces',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getSpaces();
      return res.spaces || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch spaces');
    }
  }
);

export const createSpace = createAsyncThunk(
  'spaces/createSpace',
  async (spaceData, { rejectWithValue }) => {
    try {
      const res = await api.createSpace(spaceData);
      return res.space;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create space');
    }
  }
);

export const updateSpace = createAsyncThunk(
  'spaces/updateSpace',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.updateSpace(id, data);
      return res.space;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update space');
    }
  }
);

export const deleteSpace = createAsyncThunk(
  'spaces/deleteSpace',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteSpace(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete space');
    }
  }
);

const spacesSlice = createSlice({
  name: 'spaces',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSpaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpaces.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSpaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSpace.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
      })

      // Update
      .addCase(updateSpace.fulfilled, (state, action) => {
        const index = state.items.findIndex((s) => s.id === action.payload?.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteSpace.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s.id !== action.payload);
      });
  },
});

export default spacesSlice.reducer;
