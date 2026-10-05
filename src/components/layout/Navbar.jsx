import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  LogIn,
  Sun,
  Moon,
  LogOut,
  User,
  Layers,
  Sparkles,
  ChevronDown,
  X,
  Command,
  SlidersHorizontal,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { setCaptureModalOpen, openAuthModal, setActiveTab, toggleTheme } from '../../store/uiSlice';
import { setSearchQuery, setLayout, setActiveSpaceId } from '../../store/linksSlice';
import { logoutUser } from '../../store/authSlice';
import logoSrc from '../../assets/logo.png';

export default function Navbar() {
  const dispatch = useDispatch();
  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user } = useSelector((s) => s.auth);
  const { activeTab, theme } = useSelector((s) => s.ui);
  const { layout, searchQuery, activeSpaceId, items: links } = useSelector((s) => s.links);
  const spaces = useSelector((s) => s.spaces.items);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isHome = activeTab === 'home';
  const activeSpace = spaces.find((sp) => sp.id === activeSpaceId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K to focus search, C to open capture modal)
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't trigger if user is typing inside an input or textarea
      const targetTag = e.target.tagName.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (activeTab !== 'home') dispatch(setActiveTab('home'));
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key.toLowerCase() === 'c' && !isInput && !e.metaKey && !e.ctrlKey && !e.altKey && user) {
        e.preventDefault();
        dispatch(setCaptureModalOpen(true));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, activeTab, user]);

  const getPageTitle = () => {
    if (activeTab === 'spaces') return { title: 'Spaces', icon: Layers };
    if (activeTab === 'search') return { title: 'Explore & Search', icon: Search };
    if (activeTab === 'profile') return { title: 'Profile & Settings', icon: User };
    if (activeSpace) return { title: activeSpace.name, icon: null, emoji: activeSpace.icon || '📁' };
    return { title: 'All Bookmarks', icon: Sparkles };
  };

  const pageInfo = getPageTitle();

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-14 border-b transition-colors"
      style={{
        background: 'color-mix(in srgb, var(--bg-surface) 88%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Left Section: Mobile logo / Desktop context breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
          <img src={logoSrc} alt="StoreQL" className="w-7 h-7 rounded-lg object-cover shadow-sm" />
          <span className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            StoreQL
          </span>
        </div>

        {/* Desktop Breadcrumb Badge */}
        <div className="hidden md:flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold select-none border transition-all"
            style={{
              background: 'var(--bg-surface-alt)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {pageInfo.emoji ? (
              <span className="text-sm leading-none">{pageInfo.emoji}</span>
            ) : pageInfo.icon ? (
              <pageInfo.icon size={13} style={{ color: 'var(--accent-color)' }} />
            ) : null}
            <span className="truncate max-w-[140px] lg:max-w-[200px]">{pageInfo.title}</span>

            {activeSpaceId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(setActiveSpaceId(null));
                }}
                className="hover:opacity-75 transition-opacity p-0.5 rounded"
                title="Clear space filter"
              >
                <X size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Center Section: Global Search Bar */}
      <div className="flex-1 max-w-lg px-2 sm:px-6">
        {isHome ? (
          <div
            className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm transition-all duration-200 ${
              isSearchFocused ? 'ring-2' : ''
            }`}
            style={{
              background: isSearchFocused ? 'var(--bg-surface)' : 'var(--bg-surface-alt)',
              border: `1px solid ${isSearchFocused ? 'var(--accent-color)' : 'var(--border-color)'}`,
              boxShadow: isSearchFocused
                ? '0 0 0 3px color-mix(in srgb, var(--accent-color) 15%, transparent), var(--shadow-sm)'
                : 'none',
            }}
          >
            <Search
              size={15}
              className="flex-shrink-0 transition-colors"
              style={{ color: isSearchFocused ? 'var(--accent-color)' : 'var(--text-muted)' }}
            />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  dispatch(setSearchQuery(''));
                  searchInputRef.current?.blur();
                }
              }}
              placeholder="Search bookmarks, domains, tags…"
              className="flex-1 min-w-0 bg-transparent outline-none text-xs sm:text-sm placeholder:text-[color:var(--text-muted)]"
              style={{ color: 'var(--text-primary)' }}
            />

            {/* Clear button if typed */}
            {searchQuery ? (
              <button
                onClick={() => {
                  dispatch(setSearchQuery(''));
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
                title="Clear search (Esc)"
              >
                <X size={13} />
              </button>
            ) : (
              <div
                className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border select-none"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)',
                }}
              >
                <Command size={10} />
                <span>K</span>
              </div>
            )}
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* Right Section: View Switcher, Theme, Capture, User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Layout View Mode Switcher (Home Only) */}
        {isHome && (
          <div
            className="hidden sm:flex items-center p-0.5 rounded-xl border"
            style={{
              background: 'var(--bg-surface-alt)',
              borderColor: 'var(--border-color)',
            }}
          >
            {[
              { id: 'grid', label: 'Grid view', icon: Grid3X3 },
              { id: 'list', label: 'List view', icon: List },
            ].map(({ id, label, icon: Icon }) => {
              const active = layout === id;
              return (
                <button
                  key={id}
                  onClick={() => dispatch(setLayout(id))}
                  className="p-1.5 rounded-lg transition-all"
                  style={{
                    background: active ? 'var(--bg-surface)' : 'transparent',
                    color: active ? 'var(--accent-color)' : 'var(--text-muted)',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  }}
                  title={label}
                  aria-label={label}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl border transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'var(--bg-surface-alt)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)',
          }}
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Capture Action Button */}
        {user ? (
          <button
            onClick={() => dispatch(setCaptureModalOpen(true))}
            className="group relative flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--accent-color)',
              color: '#FFFFFF',
              boxShadow: '0 2px 10px color-mix(in srgb, var(--accent-color) 35%, transparent)',
            }}
            title="Capture new link (Hotkey: C)"
          >
            <Plus size={15} className="transition-transform group-hover:rotate-90 duration-200" />
            <span className="tracking-tight">Capture</span>
          </button>
        ) : (
          <button
            onClick={() => dispatch(openAuthModal('login'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--accent-color)',
              color: '#FFFFFF',
            }}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        )}

        {/* User Profile Avatar with Dropdown */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-0.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/30 hover:scale-105"
              aria-label="User account menu"
            >
              <div
                className="w-8 h-8 rounded-full overflow-hidden border-2 flex items-center justify-center font-bold text-xs transition-colors"
                style={{
                  borderColor: isUserMenuOpen ? 'var(--accent-color)' : 'var(--border-color)',
                  background: 'var(--accent-color)',
                  color: '#FFFFFF',
                }}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <span>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
            </button>

            {/* Profile Menu Popover */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-60 rounded-2xl p-1.5 shadow-xl glass-dropdown z-50 overflow-hidden"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {/* User Info Header */}
                  <div className="px-3 py-2.5 border-b mb-1" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="font-display font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.displayName || 'Collector'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {user.email || 'Signed in'}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        dispatch(setActiveTab('profile'));
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-alt)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <User size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>Profile & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        dispatch(setActiveTab('spaces'));
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-alt)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <Layers size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>Spaces & Collections</span>
                    </button>

                    <button
                      onClick={() => {
                        dispatch(toggleTheme());
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-alt)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[var(--bg-surface-alt)] text-[var(--text-muted)]">
                        {theme}
                      </span>
                    </button>

                    <div className="h-[1px] my-1" style={{ background: 'var(--border-color)' }} />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        dispatch(logoutUser());
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut size={14} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}

