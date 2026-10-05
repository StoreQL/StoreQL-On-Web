import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { LogOut, Link2, Layers, FileText, Moon, Sun, ArrowRight } from 'lucide-react';
import { logoutUser } from '../store/authSlice';
import { toggleTheme, openAuthModal, addToast } from '../store/uiSlice';

export default function ProfileView() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { theme } = useSelector((s) => s.ui);
  const { items: links } = useSelector((s) => s.links);
  const { items: spaces } = useSelector((s) => s.spaces);

  const totalNotes = links.reduce((acc, l) => acc + (l.matters?.length || 0), 0);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Your Profile</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Sign in to manage your account and preferences.</p>
        <button onClick={() => dispatch(openAuthModal('login'))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent-color)', color: '#fff' }}>
          Sign in <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Links saved', value: links.length, icon: Link2 },
    { label: 'Spaces', value: spaces.length, icon: Layers },
    { label: 'Notes', value: totalNotes, icon: FileText },
  ];

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    dispatch(addToast({ type: 'info', title: 'Signed out', message: 'See you soon!' }));
  };

  return (
    <div className="px-5 md:px-7 pt-6 pb-20 md:pb-8 max-w-xl">
      {/* Header */}
      <h1 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>Profile</h1>

      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 p-5 rounded-2xl mb-5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
      >
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: '2px solid var(--accent-color)' }}>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ background: 'color-mix(in srgb, var(--accent-color) 15%, transparent)', color: 'var(--accent-color)' }}>
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
            {user.displayName || 'Collector'}
          </p>
          <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#5FAE78' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Connected to StoreQL</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="flex flex-col items-center p-4 rounded-2xl text-center"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            <Icon size={18} className="mb-2" style={{ color: 'var(--accent-color)' }} />
            <p className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Preferences */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid var(--border-color)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Preferences</p>
        </div>
        {/* Theme toggle */}
        <div
          className="flex items-center justify-between px-4 py-3.5 cursor-pointer transition-all"
          style={{ background: 'var(--bg-surface)' }}
          onClick={() => dispatch(toggleTheme())}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-alt)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={18} style={{ color: 'var(--text-secondary)' }} /> : <Sun size={18} style={{ color: 'var(--text-secondary)' }} />}
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
          </div>
          {/* Toggle switch */}
          <div
            className="w-10 h-5 rounded-full relative transition-all"
            style={{ background: theme === 'dark' ? 'var(--accent-color)' : 'var(--border-color)' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
              style={{
                background: '#fff',
                left: theme === 'dark' ? '22px' : '2px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-alt)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <LogOut size={18} style={{ color: '#D9635C' }} />
        Sign out
      </button>
    </div>
  );
}
