import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Layers, Link2, ArrowRight } from 'lucide-react';
import { fetchSpaces } from '../store/spacesSlice';
import { fetchLinks, setActiveSpaceId } from '../store/linksSlice';
import { setCreateSpaceModalOpen, setActiveTab, openAuthModal } from '../store/uiSlice';
import CreateSpaceModal from '../components/spaces/CreateSpaceModal';

export default function SpacesView() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items: spaces, loading } = useSelector((s) => s.spaces);
  const { items: links } = useSelector((s) => s.links);

  useEffect(() => {
    if (user) {
      dispatch(fetchSpaces());
      dispatch(fetchLinks());
    }
  }, [user, dispatch]);

  const getLinkCount = (spaceId) => links.filter((l) => l.spaceId === spaceId).length;

  const goToSpace = (spaceId) => {
    dispatch(setActiveSpaceId(spaceId));
    dispatch(setActiveTab('home'));
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="text-5xl mb-4">📁</div>
        <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Organize with Spaces</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Sign in to see and manage your link collections.</p>
        <button onClick={() => dispatch(openAuthModal('login'))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent-color)', color: '#fff' }}>
          Sign in <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-7 pt-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>Spaces</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {spaces.length} collection{spaces.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => dispatch(setCreateSpaceModalOpen(true))}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{ background: 'var(--accent-color)', color: '#fff' }}
        >
          <Plus size={15} /> New Space
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--bg-surface)' }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && spaces.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No spaces yet</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Create a space to organize your links into collections.</p>
          <button
            onClick={() => dispatch(setCreateSpaceModalOpen(true))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--accent-color)', color: '#fff' }}
          >
            <Plus size={15} /> Create first space
          </button>
        </div>
      )}

      {/* Spaces grid */}
      {!loading && spaces.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {spaces.map((space, i) => {
            const count = getLinkCount(space.id);
            return (
              <motion.button
                key={space.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => goToSpace(space.id)}
                className="group relative text-left flex flex-col p-5 rounded-2xl transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = space.color || 'var(--border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: space.color || 'var(--accent-color)' }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ background: (space.color || '#B5451B') + '18' }}
                >
                  {space.icon || '📁'}
                </div>

                {/* Name */}
                <h3 className="font-display font-semibold text-sm mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {space.name}
                </h3>

                {/* Count */}
                <div className="flex items-center gap-1.5">
                  <Link2 size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {count} link{count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={16}
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
                  style={{ color: space.color || 'var(--accent-color)' }}
                />
              </motion.button>
            );
          })}
        </div>
      )}

      <CreateSpaceModal />
    </div>
  );
}
