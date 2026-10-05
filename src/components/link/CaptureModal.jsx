import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Loader2, Plus, ChevronDown, Tag, FileText } from 'lucide-react';
import { setCaptureModalOpen, addToast } from '../../store/uiSlice';
import { createLink, previewUrl, clearPreview } from '../../store/linksSlice';

function isValidUrl(str) {
  try {
    const u = new URL(str.startsWith('http') ? str : `https://${str}`);
    return u.hostname.includes('.');
  } catch {
    return false;
  }
}

function normalizeUrl(str) {
  if (!str) return str;
  return str.startsWith('http') ? str : `https://${str}`;
}

export default function CaptureModal() {
  const dispatch = useDispatch();
  const { captureModalOpen } = useSelector((s) => s.ui);
  const { previewData, previewLoading } = useSelector((s) => s.links);
  const spaces = useSelector((s) => s.spaces.items);
  const tags = useSelector((s) => s.tags.items);

  const [url, setUrl] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [matterText, setMatterText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [spaceDropOpen, setSpaceDropOpen] = useState(false);
  const [tagDropOpen, setTagDropOpen] = useState(false);
  const debounceRef = useRef(null);

  const close = () => {
    dispatch(setCaptureModalOpen(false));
    dispatch(clearPreview());
    setUrl(''); setSelectedSpaceId(''); setSelectedTagIds([]);
    setMatterText(''); setCustomTitle(''); setSaving(false);
  };

  // Debounced live preview
  const triggerPreview = useCallback((raw) => {
    const normalized = normalizeUrl(raw.trim());
    if (!isValidUrl(raw.trim())) { dispatch(clearPreview()); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(previewUrl(normalized));
    }, 700);
  }, [dispatch]);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    triggerPreview(e.target.value);
  };

  useEffect(() => {
    if (previewData?.title && !customTitle) {
      setCustomTitle(previewData.title);
    }
  }, [previewData]);

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!url.trim()) return;
    setSaving(true);
    try {
      const linkData = {
        url: normalizeUrl(url.trim()),
        title: customTitle || previewData?.title || undefined,
        spaceId: selectedSpaceId || undefined,
        tagIds: selectedTagIds.length ? selectedTagIds : undefined,
        matter: matterText.trim() || undefined,
      };
      const res = await dispatch(createLink(linkData));
      if (!res.error) {
        dispatch(addToast({ type: 'success', title: 'Link saved!', message: customTitle || previewData?.title || 'Captured successfully.' }));
        close();
      } else {
        dispatch(addToast({ type: 'danger', title: 'Save failed', message: res.error?.message || 'Could not save link.' }));
      }
    } finally {
      setSaving(false);
    }
  };

  const preview = previewData;
  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId);
  const selectedTagNames = tags.filter((t) => selectedTagIds.includes(t.id)).map((t) => t.name);

  return (
    <AnimatePresence>
      {captureModalOpen && (
        <div className="fixed inset-0 z-[998] flex items-start justify-center p-4 pt-[10vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0"
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent-color) 15%, transparent)' }}>
                  <Link2 size={15} style={{ color: 'var(--accent-color)' }} />
                </div>
                <span className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Capture Link
                </span>
              </div>
              <button onClick={close} className="w-7 h-7 flex items-center justify-center rounded-full transition-all" style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* URL input */}
              <div>
                <div
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 transition-all"
                  style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)' }}
                >
                  {previewLoading ? (
                    <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: 'var(--accent-color)' }} />
                  ) : (
                    preview?.faviconUrl
                      ? <img src={preview.faviconUrl} alt="" className="w-4 h-4 rounded flex-shrink-0" />
                      : <Link2 size={16} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <input
                    autoFocus
                    value={url}
                    onChange={handleUrlChange}
                    placeholder="Paste or type a URL…"
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-[color:var(--text-muted)]"
                    style={{ color: 'var(--text-primary)' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                </div>
              </div>

              {/* Live Preview card */}
              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-2xl"
                    style={{ border: '1px solid var(--border-color)' }}
                  >
                    {preview.thumbnailUrl && (
                      <img
                        src={preview.thumbnailUrl}
                        alt=""
                        className="w-full h-32 object-cover"
                        style={{ borderBottom: '1px solid var(--border-color)' }}
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    )}
                    <div className="p-3">
                      <input
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Link title"
                        className="w-full bg-transparent outline-none text-sm font-semibold mb-1 placeholder:text-[color:var(--text-muted)]"
                        style={{ color: 'var(--text-primary)' }}
                      />
                      {preview.description && (
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {preview.description}
                        </p>
                      )}
                      {preview.domain && (
                        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent-color)' }}>
                          {preview.domain}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Space picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setSpaceDropOpen(!spaceDropOpen); setTagDropOpen(false); }}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all"
                  style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', color: selectedSpaceId ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  <div className="flex items-center gap-2">
                    <span>{selectedSpace ? `${selectedSpace.icon || '📁'} ${selectedSpace.name}` : 'Select space…'}</span>
                  </div>
                  <ChevronDown size={14} />
                </button>
                <AnimatePresence>
                  {spaceDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl overflow-hidden shadow-lg glass-dropdown"
                      style={{ border: '1px solid var(--border-color)' }}
                    >
                      <button
                        className="w-full text-left px-3.5 py-2.5 text-sm transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-alt)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => { setSelectedSpaceId(''); setSpaceDropOpen(false); }}
                      >
                        No space
                      </button>
                      {spaces.map((sp) => (
                        <button
                          key={sp.id}
                          className="w-full text-left px-3.5 py-2.5 text-sm transition-all"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-alt)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => { setSelectedSpaceId(sp.id); setSpaceDropOpen(false); }}
                        >
                          {sp.icon || '📁'} {sp.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags picker */}
              {tags.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setTagDropOpen(!tagDropOpen); setSpaceDropOpen(false); }}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all"
                    style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', color: selectedTagIds.length ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Tag size={14} />
                      <span>{selectedTagIds.length ? selectedTagNames.join(', ') : 'Add tags…'}</span>
                    </div>
                    <ChevronDown size={14} />
                  </button>
                  <AnimatePresence>
                    {tagDropOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 left-0 right-0 z-50 rounded-xl overflow-hidden shadow-lg glass-dropdown p-2 flex flex-wrap gap-1.5"
                        style={{ border: '1px solid var(--border-color)' }}
                      >
                        {tags.map((tag) => {
                          const active = selectedTagIds.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                              style={{
                                background: active ? 'var(--accent-color)' : 'var(--bg-surface-alt)',
                                color: active ? '#fff' : 'var(--text-secondary)',
                                border: `1px solid ${active ? 'var(--accent-color)' : 'var(--border-color)'}`,
                              }}
                            >
                              #{tag.name}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Note / Matter */}
              <div className="relative">
                <FileText size={14} className="absolute left-3.5 top-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <textarea
                  value={matterText}
                  onChange={(e) => setMatterText(e.target.value)}
                  placeholder="Add a note (why you saved this)…"
                  rows={2}
                  className="w-full resize-none pl-9 pr-3.5 py-2.5 rounded-xl text-sm outline-none transition-all placeholder:text-[color:var(--text-muted)]"
                  style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={close}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !url.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: 'var(--accent-color)',
                    color: '#fff',
                    opacity: (saving || !url.trim()) ? 0.6 : 1,
                  }}
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {saving ? 'Saving…' : 'Save link'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
