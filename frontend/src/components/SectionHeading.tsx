import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  action,
}: SectionHeadingProps) {
  const isCenter = align === 'center';
  return (
    <div className={`mb-10 md:mb-14 ${isCenter ? 'text-center mx-auto max-w-2xl' : 'flex flex-col md:flex-row md:items-end md:justify-between gap-4'}`}>
      <div className={isCenter ? '' : 'max-w-xl'}>
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="font-body uppercase text-muted tracking-[0.3em] text-xs mb-3"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="font-display text-3xl md:text-4xl lg:text-5xl text-token"
        >
          {title}
        </motion.h2>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-body text-muted mt-4 text-base md:text-lg leading-relaxed"
          >
            {description}
          </motion.p>
        )}
      </div>
      {action && <div className={isCenter ? 'mt-6' : 'md:mb-2'}>{action}</div>}
    </div>
  );
}
