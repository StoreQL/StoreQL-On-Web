import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { api } from '../services/api';

// ─── Error formatter ─────────────────────────────────────────────────────────
export const formatAuthError = (err) => {
  if (!err) return 'Something went wrong. Please try again.';
  const code = err.code || '';
  const msg  = err.message || '';

  if (code === 'auth/unauthorized-domain')
    return 'This site is not authorized in Firebase. Add your Vercel domain in Firebase Console → Authentication → Settings → Authorized domains.';
  if (code === 'auth/popup-blocked')
    return 'Pop-up was blocked. Using redirect instead — please wait.';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request')
    return '';                     // silent — user intentionally closed
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential')
    return 'Invalid email or password.';
  if (code === 'auth/email-already-in-use')
    return 'Email already registered — please sign in instead.';
  if (code === 'auth/weak-password')
    return 'Password must be at least 6 characters.';
  if (code === 'auth/invalid-email')
    return 'Please enter a valid email address.';
  if (code === 'auth/too-many-requests')
    return 'Too many attempts. Please wait a moment and try again.';
  if (code === 'auth/network-request-failed')
    return 'Network error. Check your internet connection.';

  // Strip the noisy "Firebase:" prefix Firebase includes in messages
  return msg.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[\w-]+\)\.$/, '') || 'Authentication failed.';
};

// ─── User serialiser ──────────────────────────────────────────────────────────
export const serializeUser = (firebaseUser, backendUser = {}) => {
  if (!firebaseUser) return null;
  return {
    uid:           firebaseUser.uid,
    email:         firebaseUser.email,
    displayName:   backendUser?.name || firebaseUser.displayName || 'Collector',
    photoURL:      backendUser?.profileImageUrl || firebaseUser.photoURL || null,
    emailVerified: firebaseUser.emailVerified,
    providers:     (firebaseUser.providerData || []).map((p) => p.providerId),
    mongoId:       backendUser?.id || null,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const syncBackend = async () => {
  try { return (await api.syncUser())?.user ?? {}; }
  catch { return {}; }
};

// ─── Async thunks ─────────────────────────────────────────────────────────────
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return serializeUser(user, await syncBackend());
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
        try { await updateProfile(user, { displayName: name.trim() }); } catch (_) {}
      }
      const backendUser = await syncBackend();
      if (name?.trim()) {
        try { await api.updateProfile({ name: name.trim() }); } catch (_) {}
      }
      return serializeUser(user, { ...backendUser, name: name?.trim() || backendUser?.name });
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

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:          null,
    loading:       false,
    googleLoading: false,   // separate flag for Google redirect flow
    error:         null,
    isInitialized: false,
  },
  reducers: {
    // Called by onAuthStateChanged listener in App.jsx
    setAuthState: (state, action) => {
      state.user          = action.payload;
      state.isInitialized = true;
      state.loading       = false;
      state.googleLoading = false;
      state.error         = null;
    },
    setAuthError: (state, action) => {
      state.error         = action.payload;
      state.loading       = false;
      state.googleLoading = false;
    },
    setGoogleLoading: (state, action) => {
      state.googleLoading = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Email Login
      .addCase(loginWithEmail.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(loginWithEmail.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload; })
      .addCase(loginWithEmail.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // Signup
      .addCase(signupWithEmail.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(signupWithEmail.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload; })
      .addCase(signupWithEmail.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user          = null;
        state.loading       = false;
        state.googleLoading = false;
        state.error         = null;
      });
  },
});

export const { setAuthState, setAuthError, setGoogleLoading, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
