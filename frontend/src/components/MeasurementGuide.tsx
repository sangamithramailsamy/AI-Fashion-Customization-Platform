import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

interface GuideContent {
  title: string;
  instructions: string[];
}

const GUIDES: Record<string, GuideContent> = {
  'guide-bust': {
    title: 'How to Measure Bust',
    instructions: [
      'Wear a well-fitting, unpadded bra.',
      'Wrap the tape around the fullest part of your bust.',
      'Keep the tape parallel to the floor and snug, not tight.',
      'Breathe normally and stand relaxed.',
    ],
  },
  'guide-waist': {
    title: 'How to Measure Waist',
    instructions: [
      'Find your natural waistline — the narrowest part of your torso.',
      'Wrap the tape around this point, parallel to the floor.',
      'Do not pull the tape tight; leave a finger\'s width of ease.',
    ],
  },
  'guide-hip': {
    title: 'How to Measure Hip',
    instructions: [
      'Stand with feet together.',
      'Wrap the tape around the fullest part of your hips.',
      'Keep the tape level all the way around.',
    ],
  },
  'guide-shoulder': {
    title: 'How to Measure Shoulder',
    instructions: [
      'Measure from the edge of one shoulder to the other.',
      'Place the tape at the shoulder seam point on each side.',
      'Keep the tape straight across the back.',
    ],
  },
  'guide-length': {
    title: 'How to Measure Garment Length',
    instructions: [
      'Start at the shoulder seam near the neck.',
      'Measure down to your desired hemline.',
      'Stand straight and look ahead.',
    ],
  },
  'guide-sleeve-short': { title: 'Short Sleeve Length', instructions: ['From the shoulder seam, measure down to where you want the short sleeve to end, above the elbow.'] },
  'guide-sleeve-elbow': { title: 'Elbow Sleeve Length', instructions: ['From the shoulder seam, measure down to the elbow.'] },
  'guide-sleeve-3q': { title: 'Three-Quarter Sleeve Length', instructions: ['From the shoulder seam, measure down to between elbow and wrist.'] },
  'guide-sleeve-full': { title: 'Full Sleeve Length', instructions: ['From the shoulder seam, measure down to the wrist bone.'] },
  'guide-armhole': { title: 'Armhole Round', instructions: ['Measure around the armhole at the shoulder, from armpit around and back.'] },
  'guide-bicep': { title: 'Bicep Round', instructions: ['Measure around the fullest part of your upper arm, with the arm relaxed.'] },
  'guide-elbow-round': { title: 'Elbow Round', instructions: ['Measure around the elbow with the arm slightly bent.'] },
  'guide-forearm': { title: 'Forearm Round', instructions: ['Measure around the forearm at the sleeve hem point.'] },
  'guide-wrist': { title: 'Wrist Round', instructions: ['Measure around the wrist bone.'] },
  'guide-cuff': { title: 'Cuff Opening', instructions: ['Measure the desired opening at the cuff — usually the wrist round plus ease.'] },
  'guide-neck-depth': { title: 'Neck Depth', instructions: ['From the base of the throat (hollow), measure down to the lowest point of the neckline.'] },
  'guide-neck-width': { title: 'Neck Width', instructions: ['Measure across the neckline from one shoulder point to the other.'] },
  'guide-neck-round': { title: 'Neck Round', instructions: ['Measure the full circumference around the base of the neck.'] },
};

interface Props {
  guideKey: string;
}

export function MeasurementGuideButton({ guideKey }: Props) {
  const [open, setOpen] = useState(false);
  const guide = GUIDES[guideKey];

  if (!guide) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`How to measure: ${guide.title}`}
        className="inline-flex items-center gap-1 font-body text-xs text-muted hover:text-primary transition-colors"
      >
        <Info size={13} /> Guide
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[95] flex justify-center"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md mt-16 mb-8 mx-4 bg-token border border-token shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-token">
                <h3 className="font-display text-xl text-token">{guide.title}</h3>
                <button onClick={() => setOpen(false)} aria-label="Close guide" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5">
                {/* Neutral illustration area — replaced by real boutique media later */}
                <div className="aspect-[4/3] bg-surface border border-token flex items-center justify-center mb-5">
                  <GuideIllustration guideKey={guideKey} />
                </div>
                <ol className="space-y-2.5">
                  {guide.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-display text-lg leading-none" style={{ color: 'var(--primary)' }}>{i + 1}</span>
                      <span className="font-body text-sm text-token leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GuideIllustration({ guideKey }: { guideKey: string }) {
  // Neutral, on-brand figure illustration showing where to measure.
  const stroke = 'var(--anim-dark-brown)';
  const accent = 'var(--primary)';
  return (
    <svg viewBox="0 0 200 150" style={{ width: '70%', height: '70%' }} role="img" aria-label="Measurement illustration">
      {/* simple figure silhouette */}
      <circle cx="100" cy="28" r="14" fill="none" stroke={stroke} strokeWidth={1.5} />
      <path d="M100 42 L100 130" fill="none" stroke={stroke} strokeWidth={1.2} opacity={0.5} />
      <path d="M70 70 L100 50 L130 70" fill="none" stroke={stroke} strokeWidth={1.2} opacity={0.5} />
      {/* highlight band depending on guide */}
      {guideKey.includes('bust') && <ellipse cx="100" cy="62" rx="34" ry="8" fill="none" stroke={accent} strokeWidth={2} />}
      {guideKey.includes('waist') && <ellipse cx="100" cy="82" rx="26" ry="6" fill="none" stroke={accent} strokeWidth={2} />}
      {guideKey.includes('hip') && <ellipse cx="100" cy="98" rx="32" ry="8" fill="none" stroke={accent} strokeWidth={2} />}
      {guideKey.includes('shoulder') && <line x1="72" y1="68" x2="128" y2="68" stroke={accent} strokeWidth={2} />}
      {guideKey.includes('length') && <line x1="100" y1="50" x2="100" y2="128" stroke={accent} strokeWidth={2} />}
      {guideKey.includes('sleeve') && <line x1="70" y1="70" x2="50" y2="100" stroke={accent} strokeWidth={2} />}
      {guideKey.includes('armhole') && <ellipse cx="72" cy="70" rx="10" ry="14" fill="none" stroke={accent} strokeWidth={2} />}
      {guideKey.includes('bicep') && <ellipse cx="60" cy="82" rx="8" ry="6" fill="none" stroke={accent} strokeWidth={2} />}
      {guideKey.includes('neck') && <path d="M88 42 Q100 52 112 42" fill="none" stroke={accent} strokeWidth={2} />}
    </svg>
  );
}
