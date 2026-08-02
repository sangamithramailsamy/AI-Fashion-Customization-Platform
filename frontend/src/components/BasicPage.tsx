import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  cta?: { label: string; to: string };
}

export default function BasicPage({ eyebrow, title, description, children, cta }: Props) {
  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3 text-center"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl md:text-6xl text-token text-center leading-tight"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-body text-base md:text-lg text-muted mt-6 max-w-2xl mx-auto text-center leading-relaxed"
        >
          {description}
        </motion.p>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-12"
          >
            {children}
          </motion.div>
        )}

        {cta && (
          <div className="text-center mt-12">
            <Link to={cta.to} className="btn-primary px-7 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
              {cta.label} <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
