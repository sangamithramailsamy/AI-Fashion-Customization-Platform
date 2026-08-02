import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AITeaser() {
  return (
    <section className="py-16 md:py-24 bg-token-alt">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden border border-token bg-surface px-6 py-14 md:px-16 md:py-20 text-center"
        >
          {/* Decorative AI motif */}
          <motion.svg
            aria-hidden
            className="absolute -top-16 -right-16 w-64 h-64 opacity-25"
            viewBox="0 0 200 200" fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <g stroke="var(--anim-bronze)" strokeWidth="0.8" fill="none">
              <circle cx="100" cy="100" r="30" />
              <circle cx="100" cy="100" r="55" strokeDasharray="4 6" />
              <circle cx="100" cy="100" r="80" />
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return <circle key={i} cx={100 + Math.cos(a) * 80} cy={100 + Math.sin(a) * 80} r="3" />;
              })}
            </g>
          </motion.svg>

          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-token mb-6"
            style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}
          >
            <Sparkles size={24} strokeWidth={1.5} />
          </motion.div>

          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3">Coming Soon</p>
          <h2 className="font-display text-3xl md:text-5xl text-token leading-tight">
            Design Your Dream Dress with AI
          </h2>
          <p className="font-body text-base md:text-lg text-muted mt-5 max-w-xl mx-auto leading-relaxed">
            Describe your vision. Explore styles. Create something uniquely yours.
          </p>
          <Link
            to="/ai-design-studio"
            className="btn-primary mt-8 px-8 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2"
          >
            Start Designing <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
