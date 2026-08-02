import { motion } from 'framer-motion';
import { Compass, Wand2, Ruler, Sparkles } from 'lucide-react';

const STEPS = [
  { icon: Compass, title: 'Discover', text: 'Browse ready-made and boutique creations across our collections.' },
  { icon: Wand2, title: 'Customize', text: 'Tweak a design or describe your own — fabric, color, embroidery, fit.' },
  { icon: Ruler, title: 'Perfect the Fit', text: 'Share your measurements. We refine every detail to your body.' },
  { icon: Sparkles, title: 'Made for You', text: 'Your piece is crafted in our atelier and delivered to your door.' },
];

export default function CustomerJourney() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-16">
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3">The Shreemithra Way</p>
          <h2 className="font-display text-3xl md:text-5xl text-token">Your Journey, Step by Step</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px border-t border-dashed border-token" />

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-full bg-surface border border-token mb-5 mx-auto">
                  <Icon size={26} strokeWidth={1.5} style={{ color: 'var(--anim-bronze)' }} />
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center font-body text-[10px] font-medium" style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl text-token">{s.title}</h3>
                <p className="font-body text-sm text-muted mt-2 max-w-[220px] mx-auto leading-relaxed">{s.text}</p>
                {i < STEPS.length - 1 && (
                  <span className="md:hidden inline-block text-muted mt-3 text-2xl">↓</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
