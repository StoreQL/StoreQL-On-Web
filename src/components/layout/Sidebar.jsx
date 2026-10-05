import { useDispatch, useSelector } from 'react-redux';
import { Home, Layers, Search, User, Moon, Sun, LogOut } from 'lucide-react';
import { setActiveTab, toggleTheme, openAuthModal } from '../../store/uiSlice';
import { logoutUser } from '../../store/authSlice';
import logoSrc from '../../assets/logo.png';

const NAV_ITEMS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'spaces', icon: Layers, label: 'Spaces' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const { activeTab, theme } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);
  const links = useSelector((s) => s.links.items);
  const spaces = useSelector((s) => s.spaces.items);

  const counts = {
    home: links.length || null,
    spaces: spaces.length || null,
    search: null,
    profile: null,
  };

  const handleNavClick = (id) => {
    if (!user && id !== 'home') {
      dispatch(openAuthModal('login'));
      return;
    }
    dispatch(setActiveTab(id));
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-16 lg:w-56 border-r min-h-screen sticky top-0 h-screen"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <img src={logoSrc} alt="StoreQL" className="w-7 h-7 rounded-lg flex-shrink-0 object-cover" />
          <span className="hidden lg:block font-display font-semibold text-sm tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
            StoreQL
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-1 pt-3">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const active = activeTab === id;
            const count = counts[id];
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left group"
                style={{
                  background: active ? 'color-mix(in srgb, var(--accent-color) 12%, transparent)' : 'transparent',
                  color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'var(--bg-surface-alt)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="hidden lg:block flex-1">{label}</span>
                {count && count > 0 && (
                  <span
                    className="hidden lg:flex items-center justify-center min-w-[20px] h-5 rounded-full px-1 text-[11px] font-semibold"
                    style={{
                      background: active ? 'var(--accent-color)' : 'var(--bg-surface-alt)',
                      color: active ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="p-2 border-t flex flex-col gap-1" style={{ borderColor: 'var(--border-color)' }}>
          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-alt)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {theme === 'dark' ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
            <span className="hidden lg:block">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

          {/* Sign out (if logged in) */}
          {user && (
            <button
              onClick={() => dispatch(logoutUser())}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-alt)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span className="hidden lg:block">Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t h-16 px-2"
        style={{
          background: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--border-color)',
        }}
      >
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all"
              style={{ color: active ? 'var(--accent-color)' : 'var(--text-muted)' }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
