import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { api } from '../services/api';

export const formatAuthError = (err) => {
  if (!err) return 'An error occurred during authentication';
  const msg = err.code || err.message || '';
  if (msg.includes('auth/popup-blocked')) {
    return 'Pop-up was blocked. Please try clicking the button again, or sign in with email.';
  }
  if (msg.includes('auth/unauthorized-domain')) {
    return 'Domain not authorized. Please add your Vercel URL to Firebase Console > Authentication > Settings > Authorized domains.';
  }
  if (msg.includes('auth/popup-closed-by-user')) {
    return 'Sign-in window was closed before finishing.';
  }
  if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
    return 'Invalid email or password.';
  }
  if (msg.includes('auth/email-already-in-use')) {
    return 'This email address is already registered. Please sign in instead.';
  }
  if (msg.includes('auth/weak-password')) {
    return 'Password should be at least 6 characters.';
  }
  if (msg.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  return err.message?.replace('Firebase: ', '') || 'Authentication failed';
};

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
      return rejectWithValue(formatAuthError(err));
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
      return rejectWithValue(formatAuthError(err));
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
      return rejectWithValue(formatAuthError(err));
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
      return rejectWithValue(formatAuthError(err));
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
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
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

export const { setAuthState, setAuthError, setAuthLoading, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

