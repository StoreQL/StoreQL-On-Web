import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { setAuthModalOpen, setAuthMode, addToast } from '../../store/uiSlice';
import {
  loginWithEmail,
  signupWithEmail,
  setAuthState,
  setAuthError,
  setAuthLoading,
  clearAuthError,
  formatAuthError,
} from '../../store/authSlice';
import { auth, googleProvider, signInWithPopup } from '../../services/firebase';
import { api } from '../../services/api';
import googleIconSrc from '../../assets/google.png';

export default function AuthModal() {
  const dispatch = useDispatch();
  const { authModalOpen, authMode } = useSelector((s) => s.ui);
  const { loading, error } = useSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const close = () => {
    dispatch(setAuthModalOpen(false));
    dispatch(clearAuthError());
    setName(''); setEmail(''); setPassword('');
  };

  const switchMode = () => {
    dispatch(setAuthMode(authMode === 'login' ? 'signup' : 'login'));
    dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      const res = await dispatch(loginWithEmail({ email, password }));
      if (!res.error) {
        dispatch(addToast({ type: 'success', title: 'Welcome back!', message: 'Signed in successfully.' }));
        close();
      }
    } else {
      const res = await dispatch(signupWithEmail({ email, password, name }));
      if (!res.error) {
        dispatch(addToast({ type: 'success', title: 'Account created!', message: 'Welcome to StoreQL.' }));
        close();
      }
    }
  };

  const handleGoogle = async () => {
    dispatch(clearAuthError());
    dispatch(setAuthLoading(true));

    try {
      // Direct call preserves browser user activation/gesture so Chrome never blocks popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      let syncData = null;
      try {
        syncData = await api.syncUser();
      } catch (err) {
        console.warn('Backend sync note:', err.message);
      }

      const serialized = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: syncData?.user?.name || firebaseUser.displayName || 'Collector',
        photoURL: syncData?.user?.profileImageUrl || firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified,
        providers: firebaseUser.providerData ? firebaseUser.providerData.map((p) => p.providerId) : [],
        mongoId: syncData?.user?.id || null,
      };

      dispatch(setAuthState(serialized));
      dispatch(addToast({
        type: 'success',
        title: 'Signed in!',
        message: `Welcome, ${serialized.displayName}!`,
      }));
      close();
    } catch (err) {
      dispatch(setAuthLoading(false));
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      dispatch(setAuthError(formatAuthError(err)));
    }
  };


  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all`;

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0"
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all"
              style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="mb-7">
                <h2 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
                  {authMode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {authMode === 'login'
                    ? 'Sign in to access your links and spaces'
                    : 'Start curating your knowledge vault'}
                </p>
              </div>

              {/* Google sign-in */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium mb-5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <img src={googleIconSrc} alt="Google" className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or continue with email</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {authMode === 'signup' && (
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className={inputCls}
                      style={{
                        paddingLeft: '2.5rem',
                        background: 'var(--bg-surface-alt)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className={inputCls}
                    style={{
                      paddingLeft: '2.5rem',
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className={inputCls}
                    style={{
                      paddingLeft: '2.5rem',
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm px-1" style={{ color: 'var(--accent-color)' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: 'var(--accent-color)',
                    color: '#fff',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Sign in' : 'Create account'}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Switch mode */}
              <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  onClick={switchMode}
                  className="font-semibold transition-colors"
                  style={{ color: 'var(--accent-color)' }}
                >
                  {authMode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
