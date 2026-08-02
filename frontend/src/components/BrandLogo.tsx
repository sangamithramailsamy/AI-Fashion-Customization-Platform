import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  onClick?: () => void;
}

/**
 * Typography-based brand mark. The real logo can be dropped in here later
 * by replacing the inner markup with an <img> — the API stays the same.
 */
export default function BrandLogo({ size = 'md', asLink = true, onClick }: BrandLogoProps) {
  const sizes = {
    sm: { name: 'text-xl', tag: 'text-[9px]', tracking: 'tracking-[0.35em]' },
    md: { name: 'text-2xl', tag: 'text-[10px]', tracking: 'tracking-[0.4em]' },
    lg: { name: 'text-4xl md:text-5xl', tag: 'text-xs md:text-sm', tracking: 'tracking-[0.5em]' },
  }[size];

  const inner = (
    <div className="flex flex-col items-center leading-none select-none">
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`font-display font-semibold text-token ${sizes.name}`}
        style={{ letterSpacing: '0.02em' }}
      >
        Shreemithra
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className={`font-body uppercase text-muted ${sizes.tag} ${sizes.tracking} mt-1.5`}
      >
        Ladies Boutique
      </motion.span>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" onClick={onClick} aria-label="Shreemithra Ladies Boutique — Home" className="inline-block">
        {inner}
      </Link>
    );
  }
  return inner;
}
