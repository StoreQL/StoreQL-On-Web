import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Hash } from 'lucide-react';
import { setCreateSpaceModalOpen, addToast } from '../../store/uiSlice';
import { createSpace } from '../../store/spacesSlice';

const EMOJIS = ['📁', '📚', '💼', '🏋️', '✈️', '🎯', '💡', '🔖', '🎨', '💻', '🔬', '⚡', '🌍', '🎵', '📊', '🏠', '☕', '🎮', '🍕', '🚀', '📷', '📝', '🛠️', '💰'];

const COLORS = [
  '#B5451B', '#2D6A4F', '#1D3557', '#9B2226',
  '#6A4C93', '#2B6CB0', '#744210', '#2D3748',
  '#D97A4C', '#5FAE78', '#7BA7D9', '#D9635C',
];

export default function CreateSpaceModal() {
  const dispatch = useDispatch();
  const { createSpaceModalOpen } = useSelector((s) => s.ui);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const close = () => {
    dispatch(setCreateSpaceModalOpen(false));
    setName(''); setIcon('📁'); setColor(COLORS[0]);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const res = await dispatch(createSpace({ name: name.trim(), icon, color }));
    setSaving(false);
    if (!res.error) {
      dispatch(addToast({ type: 'success', title: 'Space created!', message: `"${name}" is ready.` }));
      close();
    } else {
      dispatch(addToast({ type: 'danger', title: 'Failed', message: res.payload || 'Could not create space.' }));
    }
  };

  return (
    <AnimatePresence>
      {createSpaceModalOpen && (
        <div className="fixed inset-0 z-[996] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0"
            style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          >
            {/* Header strip with chosen color */}
            <div className="h-2 w-full" style={{ background: color }} />

            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>New Space</h2>
                <button onClick={close} className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>

              {/* Preview badge */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg" style={{ background: color + '22', border: `2px solid ${color}` }}>
                  {icon}
                </div>
              </div>

              {/* Name */}
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Space name…"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4 font-medium"
                style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />

              {/* Emoji picker */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Icon</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setIcon(e)}
                    className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{
                      background: icon === e ? 'color-mix(in srgb, var(--accent-color) 15%, transparent)' : 'var(--bg-surface-alt)',
                      border: `1.5px solid ${icon === e ? 'var(--accent-color)' : 'transparent'}`,
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Color</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full transition-all hover:scale-110"
                    style={{
                      background: c,
                      boxShadow: color === c ? `0 0 0 2px var(--bg-surface), 0 0 0 4px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={close}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: color, color: '#fff', opacity: (!name.trim() || saving) ? 0.6 : 1 }}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  Create Space
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
