import BasicPage from '@/components/BasicPage';
import { motion } from 'framer-motion';
import { Wand2, Ruler, Sparkles, Heart } from 'lucide-react';

const STEPS = [
  { icon: Heart, title: 'Share Your Vision', text: 'Tell us about the occasion, mood, colors and silhouettes you love.' },
  { icon: Wand2, title: 'Co-create the Design', text: 'Our designers sketch and refine the piece with your input.' },
  { icon: Ruler, title: 'Measurements & Fit', text: 'Share your measurements — we perfect the fit for your body.' },
  { icon: Sparkles, title: 'Crafted & Delivered', text: 'Your custom piece is handcrafted in our atelier and delivered.' },
];

export default function CustomDesignsPage() {
  return (
    <BasicPage
      eyebrow="Custom Designs"
      title="Made Just for You"
      description="Bring your vision to our atelier. From first sketch to final stitch, we craft a piece that's uniquely yours."
      cta={{ label: 'Browse Boutique Creations', to: '/collections' }}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-surface border border-token p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-token mb-4" style={{ color: 'var(--anim-bronze)' }}>
                <Icon size={20} strokeWidth={1.5} />
              </span>
              <h3 className="font-display text-lg text-token">{s.title}</h3>
              <p className="font-body text-sm text-muted mt-2 leading-relaxed">{s.text}</p>
            </motion.div>
          );
        })}
      </div>
    </BasicPage>
  );
}
