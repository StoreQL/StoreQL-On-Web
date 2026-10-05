import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { openAuthModal } from '../store/uiSlice';
import { setSelectedLinkId } from '../store/linksSlice';
import { api } from '../services/api';
import LinkDetailModal from '../components/link/LinkDetailModal';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

export default function SearchView() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query.trim());
        setResults(res.results || []);
        setSearched(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Search your vault</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Sign in to search across all your saved links, notes, and spaces.</p>
        <button onClick={() => dispatch(openAuthModal('login'))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent-color)', color: '#fff' }}>
          Sign in <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-7 pt-6 pb-20 md:pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <h1 className="font-display font-bold text-2xl mb-5" style={{ color: 'var(--text-primary)' }}>Search</h1>

      {/* Search bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-6 transition-all"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
      >
        {loading
          ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-color)', borderTopColor: 'transparent' }} />
          : <Search size={18} style={{ color: 'var(--text-muted)' }} />}
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, URL, domain, notes…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-[color:var(--text-muted)]"
          style={{ color: 'var(--text-primary)' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-surface-alt)' }}>
            clear
          </button>
        )}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {searched && results.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="text-4xl mb-3">🌀</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results for "{query}"</p>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            <p className="text-xs mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group w-full text-left flex items-start gap-3 p-4 rounded-2xl transition-all"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
                onClick={() => dispatch(setSelectedLinkId(item.id))}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-surface-alt)' }}>
                  {item.thumbnailUrl
                    ? <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display='none'} />
                    : item.faviconUrl
                      ? <img src={item.faviconUrl} alt="" className="w-full h-full object-contain p-2" onError={(e) => e.currentTarget.style.display='none'} />
                      : <div className="w-full h-full" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.title || item.url}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--accent-color)' }}>{item.domain}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(item.createdAt)}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <LinkDetailModal />
    </div>
  );
}
