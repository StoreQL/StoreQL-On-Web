import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auth, onAuthStateChanged, getRedirectResult } from './services/firebase';
import { setAuthState, serializeUser } from './store/authSlice';
import { setTheme } from './store/uiSlice';
import { api } from './services/api';

import Navbar            from './components/layout/Navbar';
import Sidebar           from './components/layout/Sidebar';
import Toast             from './components/layout/Toast';
import AuthModal         from './components/auth/AuthModal';
import CaptureModal      from './components/link/CaptureModal';
import CreateSpaceModal  from './components/spaces/CreateSpaceModal';
import HomeView          from './views/HomeView';
import SpacesView        from './views/SpacesView';
import SearchView        from './views/SearchView';
import ProfileView       from './views/ProfileView';

export default function App() {
  const dispatch = useDispatch();
  const { theme, activeTab }   = useSelector((s) => s.ui);
  const { isInitialized }      = useSelector((s) => s.auth);

  // Apply theme on mount
  useEffect(() => { dispatch(setTheme(theme)); }, []);

  useEffect(() => {
    // ── 1. Handle Google redirect result (fires once after returning from accounts.google.com)
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;
        let backendUser = {};
        try { backendUser = (await api.syncUser())?.user ?? {}; } catch (_) {}
        dispatch(setAuthState(serializeUser(result.user, backendUser)));
      })
      .catch((_err) => {
        // Silently ignore — onAuthStateChanged is the source of truth
      });

    // ── 2. Continuous listener — source of truth for all auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let backendUser = {};
        try { backendUser = (await api.syncUser())?.user ?? {}; } catch (_) {}
        dispatch(setAuthState(serializeUser(firebaseUser, backendUser)));
      } else {
        dispatch(setAuthState(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const renderView = () => {
    switch (activeTab) {
      case 'spaces':  return <SpacesView />;
      case 'search':  return <SearchView />;
      case 'profile': return <ProfileView />;
      default:        return <HomeView />;
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent-color)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading StoreQL…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
      <AuthModal />
      <CaptureModal />
      <CreateSpaceModal />
      <Toast />
    </div>
  );
}
