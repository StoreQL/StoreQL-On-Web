import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { removeToast } from '../../store/uiSlice';

const ICONS = {
  success: CheckCircle,
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { icon: '#5FAE78', bg: '#0d2b1c', border: '#1a4a2e', light_bg: '#ecfdf5', light_border: '#86efac', light_icon: '#16a34a' },
  danger: { icon: '#D9635C', bg: '#2d1010', border: '#4a1c1c', light_bg: '#fef2f2', light_border: '#fca5a5', light_icon: '#dc2626' },
  warning: { icon: '#D9A24E', bg: '#2a1f07', border: '#4a3510', light_bg: '#fffbeb', light_border: '#fcd34d', light_icon: '#d97706' },
  info: { icon: '#7BA7D9', bg: '#0f1f2d', border: '#1c3a52', light_bg: '#eff6ff', light_border: '#93c5fd', light_icon: '#2563eb' },
};

function ToastItem({ toast, isDark }) {
  const dispatch = useDispatch();
  const Icon = ICONS[toast.type] || Info;
  const c = COLORS[toast.type] || COLORS.info;

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3 rounded-2xl px-4 py-3 shadow-lg pointer-events-auto"
      style={{
        background: isDark ? c.bg : c.light_bg,
        border: `1px solid ${isDark ? c.border : c.light_border}`,
        minWidth: 260,
        maxWidth: 380,
      }}
    >
      <Icon size={18} style={{ color: isDark ? c.icon : c.light_icon, flexShrink: 0, marginTop: 1 }} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="mt-0.5 opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)', flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default function Toast() {
  const toasts = useSelector((s) => s.ui.toasts);
  const theme = useSelector((s) => s.ui.theme);
  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} isDark={isDark} />
        ))}
      </AnimatePresence>
    </div>
  );
}
