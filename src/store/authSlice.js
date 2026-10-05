import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { api } from '../services/api';

const serializeUser = (user, extra = {}) => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: extra.name || extra.displayName || user.displayName || 'Collector',
    photoURL: extra.profileImageUrl || user.photoURL || null,
    emailVerified: user.emailVerified,
    providers: user.providerData ? user.providerData.map((p) => p.providerId) : [],
    mongoId: extra.id || null,
  };
};

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      let syncData = null;
      try {
        syncData = await api.syncUser();
      } catch (err) {
        console.warn('Backend sync note:', err.message);
      }
      return serializeUser(user, syncData?.user);
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const signupWithEmail = createAsyncThunk(
  'auth/signupWithEmail',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (name?.trim()) {
        try {
          await updateProfile(user, { displayName: name.trim() });
        } catch (_) {}
      }
      let syncData = null;
      try {
        syncData = await api.syncUser();
        if (name?.trim()) {
          await api.updateProfile({ name: name.trim() });
        }
      } catch (err) {
        console.warn('Backend sync note:', err.message);
      }
      return serializeUser(user, { ...syncData?.user, displayName: name?.trim() || user.displayName });
    } catch (err) {
      return rejectWithValue(err.message || 'Signup failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      let syncData = null;
      try {
        syncData = await api.syncUser();
      } catch (err) {
        console.warn('Backend sync note:', err.message);
      }
      return serializeUser(user, syncData?.user);
    } catch (err) {
      return rejectWithValue(err.message || 'Google sign-in cancelled or failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return null;
    } catch (err) {
      return rejectWithValue(err.message || 'Logout failed');
    }
  }
);

export const syncUserBackend = createAsyncThunk(
  'auth/syncUserBackend',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await api.syncUser();
      const currentUser = auth.currentUser;
      return serializeUser(currentUser, res?.user);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isInitialized: false,
  },
  reducers: {
    setAuthState: (state, action) => {
      state.user = action.payload;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Email Login
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Signup
      .addCase(signupWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signupWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })

      // Backend sync
      .addCase(syncUserBackend.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        }
      });
  },
});

export const { setAuthState, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
