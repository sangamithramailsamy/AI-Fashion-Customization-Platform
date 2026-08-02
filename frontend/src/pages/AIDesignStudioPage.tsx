import { motion } from 'framer-motion';
import { Sparkles, Shirt, Palette, Scissors, Type, Grid3x3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeading from '@/components/SectionHeading';

const OPTIONS = [
  { icon: Shirt, label: 'Garment Type', desc: 'Saree, lehenga, kurti, gown, dress, co-ord set and more.' },
  { icon: Palette, label: 'Fabric', desc: 'Silk, cotton, linen, chiffon, organza and bespoke blends.' },
  { icon: Type, label: 'Color', desc: 'From earthy naturals to vivid festive tones.' },
  { icon: Grid3x3, label: 'Neckline', desc: 'Round, V, boat, sweetheart, high-collar and more.' },
  { icon: Scissors, label: 'Sleeve', desc: 'Sleeveless, cap, three-quarter, bell, full.' },
  { icon: Sparkles, label: 'Embroidery & Pattern', desc: 'Thread work, mirror, zari, hand-paint, prints.' },
];

export default function AIDesignStudioPage() {
  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Intro */}
        <div className="text-center">
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6"
            style={{ background: 'var(--primary)', color: 'var(--btn-text)' }}
          >
            <Sparkles size={28} strokeWidth={1.5} />
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3"
          >
            AI Design Studio · Coming Soon
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl text-token leading-tight"
          >
            Design Your Dream Dress with AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-base md:text-lg text-muted mt-5 max-w-2xl mx-auto leading-relaxed"
          >
            The Shreemithra AI Design Studio is being crafted to help you describe your
            vision and explore styles — then bring it to life with our atelier. This is a
            preview of the options you'll soon be able to customize.
          </motion.p>
        </div>

        {/* Options grid */}
        <div className="mt-14">
          <SectionHeading eyebrow="Customization Options" title={<>What You'll Be Able to Personalize</>} align="center" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OPTIONS.map((o, i) => {
              const Icon = o.icon;
              return (
                <motion.div
                  key={o.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-surface border border-token p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-token mb-4" style={{ color: 'var(--anim-bronze)' }}>
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <h3 className="font-display text-xl text-token">{o.label}</h3>
                  <p className="font-body text-sm text-muted mt-2 leading-relaxed">{o.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Note + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center border border-token bg-surface px-6 py-12 md:px-12"
        >
          <p className="font-body text-sm text-muted max-w-xl mx-auto leading-relaxed">
            AI generation will be enabled once the Django backend is connected.
            For now, explore our boutique creations and custom designs — our team
            is happy to bring your vision to life by hand.
          </p>
          <Link to="/custom-designs" className="btn-primary mt-6 px-7 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            Explore Custom Designs <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
