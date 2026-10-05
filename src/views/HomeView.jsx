import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Plus, ArrowRight } from 'lucide-react';
import { fetchLinks, setActiveSpaceId, setActiveTag, setSortBy } from '../store/linksSlice';
import { fetchSpaces } from '../store/spacesSlice';
import { fetchTags } from '../store/tagsSlice';
import { setCaptureModalOpen, openAuthModal, setCreateSpaceModalOpen } from '../store/uiSlice';
import { LinkCard, LinkRow } from '../components/link/LinkCard';
import LinkDetailModal from '../components/link/LinkDetailModal';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="h-36" style={{ background: 'var(--bg-surface-alt)' }} />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3 w-20 rounded" style={{ background: 'var(--bg-surface-alt)' }} />
        <div className="h-4 w-3/4 rounded" style={{ background: 'var(--bg-surface-alt)' }} />
        <div className="h-3 w-full rounded" style={{ background: 'var(--bg-surface-alt)' }} />
      </div>
    </div>
  );
}

export default function HomeView() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items: links, loading, activeSpaceId, activeTag, sortBy, layout, searchQuery } = useSelector((s) => s.links);
  const { items: spaces } = useSelector((s) => s.spaces);
  const { items: tags } = useSelector((s) => s.tags);

  useEffect(() => {
    if (user) {
      dispatch(fetchLinks());
      dispatch(fetchSpaces());
      dispatch(fetchTags());
    }
  }, [user, dispatch]);

  // Filtered + sorted links
  const visibleLinks = useMemo(() => {
    let filtered = [...links];

    // Space filter
    if (activeSpaceId) {
      filtered = filtered.filter((l) => l.spaceId === activeSpaceId);
    }

    // Tag filter
    if (activeTag) {
      filtered = filtered.filter((l) => l.tagIds?.includes(activeTag));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.url?.toLowerCase().includes(q) ||
          l.domain?.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'date_asc') filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'title_asc') filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }, [links, activeSpaceId, activeTag, sortBy, searchQuery]);

  // Not signed in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-lg"
          style={{ background: 'color-mix(in srgb, var(--accent-color) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-color) 25%, transparent)' }}
        >
          🔖
        </div>
        <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Your link vault awaits
        </h2>
        <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Sign in to access your saved links, spaces, and notes — synced with your mobile app.
        </p>
        <button
          onClick={() => dispatch(openAuthModal('login'))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{ background: 'var(--accent-color)', color: '#fff' }}
        >
          Sign in to continue
          <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-20 md:pb-0">
      {/* Greeting header */}
      <div className="px-5 md:px-7 pt-6 pb-4">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              {getGreeting()}{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {links.length > 0
                ? `${links.length} link${links.length !== 1 ? 's' : ''} saved`
                : 'Ready to capture your first link?'}
            </p>
          </div>
        </div>
      </div>

      {/* Space filter pills */}
      {spaces.length > 0 && (
        <div className="flex items-center gap-2 px-5 md:px-7 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => dispatch(setActiveSpaceId(null))}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: !activeSpaceId ? 'var(--accent-color)' : 'var(--bg-surface)',
              color: !activeSpaceId ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${!activeSpaceId ? 'var(--accent-color)' : 'var(--border-color)'}`,
            }}
          >
            All
          </button>
          {spaces.map((sp) => (
            <button
              key={sp.id}
              onClick={() => dispatch(setActiveSpaceId(activeSpaceId === sp.id ? null : sp.id))}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: activeSpaceId === sp.id ? (sp.color || 'var(--accent-color)') : 'var(--bg-surface)',
                color: activeSpaceId === sp.id ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${activeSpaceId === sp.id ? (sp.color || 'var(--accent-color)') : 'var(--border-color)'}`,
              }}
            >
              <span>{sp.icon || '📁'}</span>
              <span>{sp.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Tag filter chips */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 px-5 md:px-7 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => dispatch(setActiveTag(activeTag === tag.id ? null : tag.id))}
              className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
              style={{
                background: activeTag === tag.id ? 'color-mix(in srgb, var(--accent-color) 20%, transparent)' : 'var(--bg-surface-alt)',
                color: activeTag === tag.id ? 'var(--accent-color)' : 'var(--text-muted)',
                border: `1px solid ${activeTag === tag.id ? 'var(--accent-color)' : 'transparent'}`,
              }}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Sort controls */}
      <div className="flex items-center gap-2 px-5 md:px-7 pb-4">
        {[
          { id: 'date_desc', label: 'Newest' },
          { id: 'date_asc', label: 'Oldest' },
          { id: 'title_asc', label: 'A → Z' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => dispatch(setSortBy(s.id))}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{
              background: sortBy === s.id ? 'var(--bg-surface)' : 'transparent',
              color: sortBy === s.id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: `1px solid ${sortBy === s.id ? 'var(--border-color)' : 'transparent'}`,
              boxShadow: sortBy === s.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {s.label}
          </button>
        ))}
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {visibleLinks.length} of {links.length}
        </span>
      </div>

      {/* Content area */}
      <div className="flex-1 px-5 md:px-7">
        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty states */}
        {!loading && links.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              No links yet
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              Capture your first link and start building your knowledge vault.
            </p>
            <button
              onClick={() => dispatch(setCaptureModalOpen(true))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent-color)', color: '#fff' }}
            >
              <Plus size={15} /> Capture first link
            </button>
          </div>
        )}

        {!loading && links.length > 0 && visibleLinks.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No links match this filter.</p>
            <button
              onClick={() => { dispatch(setActiveSpaceId(null)); dispatch(setActiveTag(null)); }}
              className="mt-3 text-sm font-medium"
              style={{ color: 'var(--accent-color)' }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Grid layout */}
        {!loading && visibleLinks.length > 0 && layout === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleLinks.map((link, i) => (
              <LinkCard key={link.id} link={link} index={i} />
            ))}
          </div>
        )}

        {/* List layout */}
        {!loading && visibleLinks.length > 0 && layout === 'list' && (
          <div className="flex flex-col" style={{ border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-surface)' }}>
            {visibleLinks.map((link, i) => (
              <div key={link.id} style={{ borderTop: i !== 0 ? `1px solid var(--border-color)` : 'none' }}>
                <LinkRow link={link} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      <LinkDetailModal />
    </div>
  );
}
