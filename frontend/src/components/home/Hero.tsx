import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
      {/* Decorative kolam-inspired corner motif */}
      <motion.svg
        aria-hidden
        className="absolute -top-10 -right-10 w-72 h-72 opacity-30 hidden md:block"
        viewBox="0 0 200 200" fill="none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <motion.g stroke="var(--anim-bronze)" strokeWidth="0.8" fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <circle cx="100" cy="100" r="40" />
          <circle cx="100" cy="100" r="60" />
          <circle cx="100" cy="100" r="80" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={100 + Math.cos(a) * 40} y1={100 + Math.sin(a) * 40} x2={100 + Math.cos(a) * 80} y2={100 + Math.sin(a) * 80} />;
          })}
        </motion.g>
      </motion.svg>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-body uppercase tracking-[0.35em] text-xs text-muted mb-5"
            >
              Shreemithra Ladies Boutique
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-token leading-[1.05]"
            >
              Designed for You.
              <br />
              <span className="italic" style={{ color: 'var(--anim-bronze)' }}>Made to Be Yours.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="font-body text-base md:text-lg text-muted mt-6 max-w-lg leading-relaxed"
            >
              Ready-made fashion, boutique creations and personalized designs —
              crafted with care for the modern woman.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 mt-8"
            >
              <Link to="/shop" className="btn-primary px-7 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
                Shop Collection <ArrowRight size={16} />
              </Link>
              <Link to="/collections" className="btn-outline px-7 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
                Explore Designs
              </Link>
              <Link to="/ai-design-studio" className="btn-outline px-7 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2" style={{ borderColor: 'var(--anim-bronze)', color: 'var(--anim-bronze)' }}>
                <Sparkles size={15} /> Design Your Dream Dress
              </Link>
            </motion.div>
          </div>

          {/* Editorial image composition */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
              className="relative grid grid-cols-6 grid-rows-6 gap-3 h-[420px] sm:h-[520px] lg:h-[600px]"
            >
              <div className="col-span-4 row-span-6 overflow-hidden bg-surface">
                <img
                  src="https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=900"
                  alt="Boutique fashion model in elegant attire"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden bg-surface mt-6">
                <img
                  src="https://images.pexels.com/photos/1104145/pexels-photo-1104145.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Traditional silk saree detail"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden bg-surface">
                <img
                  src="https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Western dress detail"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative caption tag */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -bottom-3 left-2 bg-token border border-token px-4 py-2"
              >
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-muted">Atelier · Est. with love</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
