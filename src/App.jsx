import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from './services/firebase';
import { auth } from './services/firebase';
import { setAuthState } from './store/authSlice';
import { setTheme } from './store/uiSlice';
import { api } from './services/api';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Toast from './components/layout/Toast';
import AuthModal from './components/auth/AuthModal';
import CaptureModal from './components/link/CaptureModal';
import CreateSpaceModal from './components/spaces/CreateSpaceModal';
import HomeView from './views/HomeView';
import SpacesView from './views/SpacesView';
import SearchView from './views/SearchView';
import ProfileView from './views/ProfileView';

export default function App() {
  const dispatch = useDispatch();
  const { theme, activeTab } = useSelector((s) => s.ui);
  const { isInitialized } = useSelector((s) => s.auth);

  // Apply initial theme class
  useEffect(() => {
    dispatch(setTheme(theme));
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let syncExtra = null;
        try {
          syncExtra = await api.syncUser();
        } catch (_) {}
        dispatch(setAuthState({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: syncExtra?.user?.name || firebaseUser.displayName || 'Collector',
          photoURL: syncExtra?.user?.profileImageUrl || firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified,
          providers: firebaseUser.providerData?.map((p) => p.providerId) || [],
          mongoId: syncExtra?.user?.id || null,
        }));
      } else {
        dispatch(setAuthState(null));
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  const renderView = () => {
    switch (activeTab) {
      case 'spaces': return <SpacesView />;
      case 'search': return <SearchView />;
      case 'profile': return <ProfileView />;
      default: return <HomeView />;
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-color)', borderTopColor: 'transparent' }} />
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
      {/* Overlays */}
      <AuthModal />
      <CaptureModal />
      <CreateSpaceModal />
      <Toast />
    </div>
  );
}
