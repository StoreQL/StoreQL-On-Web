import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, Trash2, RefreshCw, FileText, Plus, ChevronDown, Tag, Loader2, Edit2, Check
} from 'lucide-react';
import { setSelectedLinkId } from '../../store/linksSlice';
import { deleteLink, refreshLinkMeta, updateLink, addMatter, deleteMatter } from '../../store/linksSlice';
import { addToast } from '../../store/uiSlice';

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

export default function LinkDetailModal() {
  const dispatch = useDispatch();
  const { selectedLinkId } = useSelector((s) => s.links);
  const link = useSelector((s) => s.links.items.find((l) => l.id === selectedLinkId));
  const spaces = useSelector((s) => s.spaces.items);
  const tags = useSelector((s) => s.tags.items);

  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState('');

  if (!link) return null;

  const close = () => dispatch(setSelectedLinkId(null));

  const handleDelete = async () => {
    if (!confirm('Delete this link permanently?')) return;
    setDeleting(true);
    await dispatch(deleteLink(link.id));
    dispatch(addToast({ type: 'success', title: 'Link deleted', message: link.title || link.url }));
    close();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await dispatch(refreshLinkMeta(link.id));
    setRefreshing(false);
    if (!res.error) dispatch(addToast({ type: 'success', title: 'Metadata refreshed' }));
  };

  const handleSaveTitle = async () => {
    if (!titleVal.trim()) return;
    await dispatch(updateLink({ id: link.id, data: { title: titleVal.trim() } }));
    setEditTitle(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    const res = await dispatch(addMatter({ linkId: link.id, content: newNote.trim() }));
    if (!res.error) setNewNote('');
    setAddingNote(false);
  };

  const handleDeleteNote = async (matterId) => {
    await dispatch(deleteMatter({ linkId: link.id, matterId }));
  };

  const space = spaces.find((s) => s.id === link.spaceId);
  const linkTags = (link.tagIds || []).map((id) => tags.find((t) => t.id === id)).filter(Boolean);

  return (
    <AnimatePresence>
      {link && (
        <div className="fixed inset-0 z-[997] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0"
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            {/* Thumbnail */}
            {link.thumbnailUrl && (
              <div className="relative h-40 flex-shrink-0">
                <img src={link.thumbnailUrl} alt="" className="w-full h-full object-cover" onError={(e) => e.currentTarget.parentElement.style.display = 'none'} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, var(--bg-surface))' }} />
                <button onClick={close} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between p-5 gap-3">
              {/* Title */}
              <div className="flex-1 min-w-0">
                {editTitle ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      value={titleVal}
                      onChange={(e) => setTitleVal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                      className="flex-1 text-sm font-semibold bg-transparent outline-none border-b"
                      style={{ borderColor: 'var(--accent-color)', color: 'var(--text-primary)' }}
                    />
                    <button onClick={handleSaveTitle} style={{ color: 'var(--accent-color)' }}><Check size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 group">
                    <h2 className="font-display font-semibold text-base leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {link.title || link.url}
                    </h2>
                    <button
                      onClick={() => { setTitleVal(link.title || ''); setEditTitle(true); }}
                      className="opacity-0 group-hover:opacity-100 mt-0.5 flex-shrink-0 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}

                {/* Meta row */}
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  {link.faviconUrl && <img src={link.faviconUrl} alt="" className="w-4 h-4 rounded" onError={(e) => e.currentTarget.style.display='none'} />}
                  <span className="text-xs font-medium" style={{ color: 'var(--accent-color)' }}>{link.domain}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(link.createdAt)}</span>
                  {space && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      {space.icon || '📁'} {space.name}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {linkTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {linkTags.map((tag) => (
                      <span key={tag.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--accent-color) 12%, transparent)', color: 'var(--accent-color)' }}>
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Close (if no thumbnail) */}
              {!link.thumbnailUrl && (
                <button onClick={close} className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0" style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Description */}
            {link.description && (
              <div className="px-5 pb-3">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{link.description}</p>
              </div>
            )}

            {/* Notes / Matters */}
            <div className="flex-1 overflow-y-auto px-5 pb-3 flex flex-col gap-3 min-h-0">
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Notes</span>
              </div>

              {/* Existing notes */}
              {(link.matters || []).length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notes yet — add your thoughts below.</p>
              )}
              {(link.matters || []).map((m) => (
                <div key={m.id} className="group flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)' }}>
                  <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{m.content}</p>
                  <button
                    onClick={() => handleDeleteNote(m.id)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {/* Add note */}
              <div className="flex gap-2">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a note…"
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none placeholder:text-[color:var(--text-muted)]"
                  style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'var(--accent-color)', color: '#fff', opacity: !newNote.trim() ? 0.5 : 1 }}
                >
                  {addingNote ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                </button>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-5 py-4 gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  title="Refresh metadata"
                >
                  <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{ background: 'color-mix(in srgb, #B23A34 10%, transparent)', color: '#D9635C', border: '1px solid color-mix(in srgb, #B23A34 20%, transparent)' }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'var(--accent-color)', color: '#fff' }}
              >
                Open link
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
