import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchLinks = createAsyncThunk(
  'links/fetchLinks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.getLinks({ limit: 100, ...params });
      return res.items || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load links');
    }
  }
);

export const previewUrl = createAsyncThunk(
  'links/previewUrl',
  async (url, { rejectWithValue }) => {
    try {
      const res = await api.previewLink(url);
      return res.preview;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not fetch metadata');
    }
  }
);

export const createLink = createAsyncThunk(
  'links/createLink',
  async (linkData, { rejectWithValue }) => {
    try {
      const res = await api.createLink(linkData);
      return res.link;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save link');
    }
  }
);

export const updateLink = createAsyncThunk(
  'links/updateLink',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.updateLink(id, data);
      return res.link;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update link');
    }
  }
);

export const deleteLink = createAsyncThunk(
  'links/deleteLink',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteLink(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete link');
    }
  }
);

export const refreshLinkMeta = createAsyncThunk(
  'links/refreshLinkMeta',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.refreshLinkMeta(id);
      return res.link;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to refresh metadata');
    }
  }
);

export const addMatter = createAsyncThunk(
  'links/addMatter',
  async ({ linkId, content, type = 'note', spaceId }, { rejectWithValue }) => {
    try {
      const res = await api.createMatter({ linkId, content, type, spaceId });
      return { linkId, matter: res.matter };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save note');
    }
  }
);

export const deleteMatter = createAsyncThunk(
  'links/deleteMatter',
  async ({ linkId, matterId }, { rejectWithValue }) => {
    try {
      await api.deleteMatter(matterId);
      return { linkId, matterId };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete note');
    }
  }
);

const linksSlice = createSlice({
  name: 'links',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedLinkId: null,

    // Filter and view controls
    activeSpaceId: null,
    activeTag: null,
    searchQuery: '',
    sortBy: 'date_desc', // 'date_desc' | 'date_asc' | 'title_asc'
    layout: 'grid', // 'grid' | 'list'

    // Live preview state for capture modal
    previewData: null,
    previewLoading: false,
    previewError: null,
  },
  reducers: {
    setSelectedLinkId: (state, action) => {
      state.selectedLinkId = action.payload;
    },
    setActiveSpaceId: (state, action) => {
      state.activeSpaceId = action.payload;
    },
    setActiveTag: (state, action) => {
      state.activeTag = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    clearPreview: (state) => {
      state.previewData = null;
      state.previewLoading = false;
      state.previewError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Links
      .addCase(fetchLinks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLinks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Live Preview
      .addCase(previewUrl.pending, (state) => {
        state.previewLoading = true;
        state.previewError = null;
      })
      .addCase(previewUrl.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.previewData = action.payload;
      })
      .addCase(previewUrl.rejected, (state, action) => {
        state.previewLoading = false;
        state.previewError = action.payload;
      })

      // Create Link
      .addCase(createLink.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })

      // Update Link
      .addCase(updateLink.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          const index = state.items.findIndex((item) => item.id === updated.id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...updated };
          }
        }
      })

      // Delete Link
      .addCase(deleteLink.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedLinkId === action.payload) {
          state.selectedLinkId = null;
        }
      })

      // Refresh Meta
      .addCase(refreshLinkMeta.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          const index = state.items.findIndex((item) => item.id === updated.id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...updated };
          }
        }
      })

      // Add Matter
      .addCase(addMatter.fulfilled, (state, action) => {
        const { linkId, matter } = action.payload;
        const link = state.items.find((l) => l.id === linkId);
        if (link) {
          if (!link.matters) link.matters = [];
          link.matters.push(matter);
        }
      })

      // Delete Matter
      .addCase(deleteMatter.fulfilled, (state, action) => {
        const { linkId, matterId } = action.payload;
        const link = state.items.find((l) => l.id === linkId);
        if (link && link.matters) {
          link.matters = link.matters.filter((m) => m.id !== matterId);
        }
      });
  },
});

export const {
  setSelectedLinkId,
  setActiveSpaceId,
  setActiveTag,
  setSearchQuery,
  setSortBy,
  setLayout,
  clearPreview,
} = linksSlice.actions;

export default linksSlice.reducer;
