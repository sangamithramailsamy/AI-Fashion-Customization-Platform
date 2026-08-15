import { motion } from 'framer-motion';
import type { Collection } from '@/types';

interface Props {
  pattern: Collection['pattern'];
}

/**
 * Subtle animated decorative backgrounds for collection cards.
 * Each pattern is distinct but shares the Shreemithra palette.
 */
export default function CollectionPattern({ pattern }: Props) {
  const brown = 'var(--anim-dark-brown)';
  const olive = 'var(--anim-olive)';
  const bronze = 'var(--anim-bronze)';
  const secondary = 'var(--secondary)';

  switch (pattern) {
    case 'kolam':
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#fbf8e8]">

      {/* Static dotted background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(126,128,65,0.35) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '55% center',
        }}
      />

      {/* ONLY animated kolam lines */}
      <img
        src="/images/kolam-lines.svg"
        alt=""
        className="
          absolute
          right-[4%]
          top-1/2
          w-[42%]
          h-[88%]
          object-contain
        "
        style={{
          transform: 'translateY(-50%) scaleX(-1)',
          transformOrigin: 'center',
        }}
      />

    </div>
  );

    case 'slant':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.line
              key={i}
              x1={-20 + i * 18} y1={0}
              x2={20 + i * 18} y2={200}
              stroke={i % 3 === 0 ? bronze : i % 3 === 1 ? brown : olive}
              strokeWidth="0.8"
              opacity="0.4"
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 5 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            />
          ))}
          <motion.rect
            x="60" y="70" width="80" height="60"
            stroke={bronze} strokeWidth="1" fill="none" opacity="0.5"
            animate={{ rotate: [0, 4, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 100px' }}
          />
        </svg>
      );

    case 'textile':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="weave" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="none" />
              <line x1="0" y1="10" x2="20" y2="10" stroke={olive} strokeWidth="0.6" opacity="0.4" />
              <line x1="10" y1="0" x2="10" y2="20" stroke={brown} strokeWidth="0.6" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#weave)" />
          <motion.path
            d="M40 100 Q100 40 160 100 Q100 160 40 100"
            stroke={bronze} strokeWidth="1.2" fill="none" opacity="0.6"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M60 100 Q100 70 140 100 Q100 130 60 100"
            stroke={secondary} strokeWidth="0.8" fill="none" opacity="0.5"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 100px' }}
          />
        </svg>
      );

    case 'shimmer':
      return (
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid slice">
            <motion.circle cx="100" cy="100" r="60" stroke={bronze} strokeWidth="0.8" fill="none" opacity="0.4"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '100px 100px' }}
            />
            <motion.circle cx="100" cy="100" r="30" stroke={olive} strokeWidth="0.6" fill="none" opacity="0.4"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '100px 100px' }}
            />
          </svg>
          <motion.div
            className="absolute top-0 h-full w-1/3"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,163,115,0.18), transparent)' }}
            animate={{ x: ['-120%', '320%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
          />
        </div>
      );

    case 'casual':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid slice">
          <motion.circle cx="60" cy="70" r="30" stroke={olive} strokeWidth="0.8" fill="none" opacity="0.35"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle cx="140" cy="130" r="22" stroke={bronze} strokeWidth="0.8" fill="none" opacity="0.35"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.line x1="40" y1="150" x2="160" y2="50" stroke={brown} strokeWidth="0.6" opacity="0.3"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      );

    case 'editorial':
      return (
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none" preserveAspectRatio="xMidYMid slice">
            <motion.rect x="50" y="40" width="100" height="120" stroke={bronze} strokeWidth="0.8" fill="none" opacity="0.4"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.line x1="50" y1="100" x2="150" y2="100" stroke={olive} strokeWidth="0.6" opacity="0.4"
              animate={{ scaleX: [0.6, 1, 0.6] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '100px 100px' }}
            />
            <text x="100" y="105" textAnchor="middle" fill={brown} fontSize="6" opacity="0.5" className="font-display">
              New
            </text>
          </svg>
          <motion.div
            className="absolute top-0 h-full w-1/4"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(197,131,65,0.12), transparent)' }}
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
          />
        </div>
      );

    default:
      return null;
  }
}
