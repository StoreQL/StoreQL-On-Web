import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('storeql_theme');
    if (saved) return saved;
    // Default to dark for classy high-contrast look
    return 'dark';
  }
  return 'dark';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeTab: 'home', // 'home' | 'spaces' | 'search' | 'profile'
    theme: getInitialTheme(),
    captureModalOpen: false,
    createSpaceModalOpen: false,
    authModalOpen: false,
    authMode: 'login', // 'login' | 'signup'
    toasts: [],
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('storeql_theme', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('storeql_theme', state.theme);
        if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setCaptureModalOpen: (state, action) => {
      state.captureModalOpen = action.payload;
    },
    setCreateSpaceModalOpen: (state, action) => {
      state.createSpaceModalOpen = action.payload;
    },
    setAuthModalOpen: (state, action) => {
      state.authModalOpen = action.payload;
    },
    setAuthMode: (state, action) => {
      state.authMode = action.payload;
    },
    openAuthModal: (state, action) => {
      state.authMode = action.payload || 'login';
      state.authModalOpen = true;
    },
    addToast: (state, action) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      state.toasts.push({
        id,
        type: action.payload.type || 'info', // 'success' | 'danger' | 'warning' | 'info'
        title: action.payload.title || '',
        message: action.payload.message || '',
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setActiveTab,
  toggleTheme,
  setTheme,
  setCaptureModalOpen,
  setCreateSpaceModalOpen,
  setAuthModalOpen,
  setAuthMode,
  openAuthModal,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
