import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { setSelectedLinkId } from '../../store/linksSlice';

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

export function LinkCard({ link, index = 0 }) {
  const dispatch = useDispatch();
  const tags = useSelector((s) => s.tags.items);
  const linkTags = (link.tagIds || []).map((id) => tags.find((t) => t.id === id)).filter(Boolean);
  const hasThumb = !!link.thumbnailUrl;
  const hasMatter = link.matters?.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
      onClick={() => dispatch(setSelectedLinkId(link.id))}
    >
      {/* Thumbnail */}
      {hasThumb && (
        <div className="relative h-36 flex-shrink-0 overflow-hidden">
          <img
            src={link.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.parentElement.style.display = 'none';
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 40%, color-mix(in srgb, var(--bg-surface) 60%, transparent))' }}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Favicon + domain */}
        <div className="flex items-center gap-2">
          {link.faviconUrl ? (
            <img
              src={link.faviconUrl}
              alt=""
              className="w-4 h-4 rounded flex-shrink-0"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          ) : (
            <div className="w-4 h-4 rounded flex-shrink-0" style={{ background: 'var(--bg-surface-alt)' }} />
          )}
          <span className="text-xs font-medium truncate" style={{ color: 'var(--accent-color)' }}>
            {link.domain || ''}
          </span>
          <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {timeAgo(link.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-sm font-semibold leading-snug line-clamp-2 font-display"
          style={{ color: 'var(--text-primary)' }}
        >
          {link.title || link.url}
        </h3>

        {/* Description */}
        {link.description && !hasThumb && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {link.description}
          </p>
        )}

        {/* Note / Matter snippet */}
        {hasMatter && (
          <p
            className="text-xs leading-relaxed line-clamp-1 px-2.5 py-1.5 rounded-lg italic"
            style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)' }}
          >
            "{link.matters[0].content}"
          </p>
        )}

        {/* Tags */}
        {linkTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {linkTags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                  color: 'var(--accent-color)',
                }}
              >
                #{tag.name}
              </span>
            ))}
            {linkTags.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>
                +{linkTags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Open external */}
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer noopener"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
        style={{ background: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)', color: 'var(--text-muted)', backdropFilter: 'blur(6px)' }}
        title="Open link"
      >
        <ExternalLink size={12} />
      </a>
    </motion.article>
  );
}

export function LinkRow({ link, index = 0 }) {
  const dispatch = useDispatch();
  const tags = useSelector((s) => s.tags.items);
  const linkTags = (link.tagIds || []).map((id) => tags.find((t) => t.id === id)).filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.025, ease: [0.22, 1, 0.36, 1] }}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-surface)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
      }}
      onClick={() => dispatch(setSelectedLinkId(link.id))}
    >
      {/* Favicon / Thumb */}
      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-surface-alt)' }}>
        {link.thumbnailUrl
          ? <img src={link.thumbnailUrl} alt="" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display='none'} />
          : link.faviconUrl
            ? <img src={link.faviconUrl} alt="" className="w-full h-full object-contain p-1" onError={(e) => e.currentTarget.style.display='none'} />
            : <div className="w-full h-full" style={{ background: 'var(--bg-surface-alt)' }} />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {link.title || link.url}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: 'var(--accent-color)' }}>{link.domain}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(link.createdAt)}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="hidden sm:flex gap-1 flex-shrink-0">
        {linkTags.slice(0, 2).map((tag) => (
          <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-surface-alt)', color: 'var(--text-muted)' }}>
            #{tag.name}
          </span>
        ))}
      </div>

      {/* Open external */}
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer noopener"
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg transition-all"
        style={{ color: 'var(--text-muted)' }}
      >
        <ExternalLink size={13} />
      </a>
    </motion.article>
  );
}
