import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Check, Ruler, Play, X, Edit2,
  Info, Clock, Sparkles,
} from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { useToast } from '@/context/ToastContext';
import GarmentIllustration from '@/components/GarmentIllustration';
import { MeasurementGuideButton } from '@/components/MeasurementGuide';
import {
  SLEEVE_TYPES,
  NECK_TYPES,
  COMMON_MEASUREMENT_FIELDS,
  MEASUREMENT_VIDEOS,
} from '@/data/accountData';
import type { MeasurementFieldDef, CustomerMeasurement, MeasurementValue } from '@/types';

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  'Introduction',
  'Sleeve Style',
  'Neck Style',
  'Common',
  'Sleeve',
  'Neck',
  'Review',
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AccountMeasurementsPage() {
  const { measurements, hasMeasurements, saveMeasurements } = useCustomer();
  const { notify } = useToast();
  const [step, setStep] = useState<Step>(0);
  const [editing, setEditing] = useState(false);

  const [sleeveId, setSleeveId] = useState<string | null>(measurements?.sleeveTypeId ?? null);
  const [neckId, setNeckId] = useState<string | null>(measurements?.neckTypeId ?? null);
  const [common, setCommon] = useState<MeasurementValue[]>(measurements?.common ?? []);
  const [sleeve, setSleeve] = useState<MeasurementValue[]>(measurements?.sleeve ?? []);
  const [neck, setNeck] = useState<MeasurementValue[]>(measurements?.neck ?? []);
  const [saving, setSaving] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const sleeveType = SLEEVE_TYPES.find((s) => s.id === sleeveId) ?? null;
  const neckType = NECK_TYPES.find((n) => n.id === neckId) ?? null;

  // If already has measurements and not editing, show summary view
  if (hasMeasurements && !editing && step === 0) {
    return (
      <SavedMeasurementsView
        measurements={measurements!}
        onEdit={() => { setEditing(true); setStep(0); }}
      />
    );
  }

  const getValue = (list: MeasurementValue[], fieldId: string) =>
    list.find((v) => v.fieldId === fieldId)?.value ?? '';

  const setValue = (list: MeasurementValue[], fieldId: string, value: string) => {
    const exists = list.find((v) => v.fieldId === fieldId);
    if (exists) return list.map((v) => (v.fieldId === fieldId ? { ...v, value } : v));
    return [...list, { fieldId, value }];
  };

  const validateStep = (): boolean => {
    if (step === 1 && !sleeveId) { notify('Please select a sleeve style', 'info'); return false; }
    if (step === 2 && !neckId) { notify('Please select a neck style', 'info'); return false; }
    if (step === 3) {
      const missing = COMMON_MEASUREMENT_FIELDS.some((f) => !getValue(common, f.id));
      if (missing) { notify('Please fill all common measurements', 'info'); return false; }
    }
    if (step === 4 && sleeveType && sleeveType.measurementFields.length > 0) {
      const missing = sleeveType.measurementFields.some((f) => !getValue(sleeve, f.id));
      if (missing) { notify('Please fill all sleeve measurements', 'info'); return false; }
    }
    if (step === 5 && neckType && neckType.measurementFields.length > 0) {
      const missing = neckType.measurementFields.some((f) => !getValue(neck, f.id));
      if (missing) { notify('Please fill all neck measurements', 'info'); return false; }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(6, (s + 1)) as Step);
  };
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: CustomerMeasurement = {
        sleeveTypeId: sleeveId,
        neckTypeId: neckId,
        common,
        sleeve,
        neck,
        updatedAt: new Date().toISOString(),
      };
      await saveMeasurements(data);
      notify('Measurements saved', 'info');
      setEditing(false);
      setStep(0);
    } catch {
      notify('Unable to save measurements', 'remove');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Measurements</p>
        <h1 className="font-display text-3xl md:text-4xl text-token">
          {hasMeasurements ? 'Update Measurements' : 'Guided Measurements'}
        </h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((label, i) => {
          const active = step === i;
          const done = step > i;
          return (
            <button
              key={label}
              onClick={() => setStep(i as Step)}
              className={`flex items-center gap-2 px-3 py-2 font-body text-xs whitespace-nowrap transition-colors ${
                active ? 'text-primary' : done ? 'text-token' : 'text-muted hover:text-token'
              }`}
            >
              <span
                className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] border"
                style={{
                  borderColor: active ? 'var(--primary)' : done ? 'var(--anim-olive)' : 'var(--border)',
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? 'var(--btn-text)' : done ? 'var(--anim-olive)' : 'var(--text-muted)',
                }}
              >
                {done ? <Check size={12} /> : i + 1}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* STEP 0 — Introduction */}
          {step === 0 && (
            <div className="bg-surface border border-token p-6 md:p-8">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-token mb-5" style={{ color: 'var(--anim-bronze)' }}>
                <Ruler size={24} strokeWidth={1.5} />
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-token">Let's get your measurements</h2>
              <p className="font-body text-base text-muted mt-3 max-w-xl leading-relaxed">
                Accurate measurements help our atelier create the perfect fit for your custom and boutique pieces.
                This guided process takes about 5–7 minutes. You'll need a soft measuring tape and a well-fitting garment for reference.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="border border-token p-4">
                  <p className="font-display text-lg text-token">What you'll provide</p>
                  <ul className="mt-2 space-y-1.5 font-body text-sm text-muted">
                    <li className="flex items-center gap-2"><Check size={14} style={{ color: 'var(--anim-olive)' }} /> Sleeve &amp; neck style</li>
                    <li className="flex items-center gap-2"><Check size={14} style={{ color: 'var(--anim-olive)' }} /> Common body measurements</li>
                    <li className="flex items-center gap-2"><Check size={14} style={{ color: 'var(--anim-olive)' }} /> Sleeve &amp; neck measurements</li>
                  </ul>
                </div>
                <div className="border border-token p-4">
                  <p className="font-display text-lg text-token">Before you begin</p>
                  <ul className="mt-2 space-y-1.5 font-body text-sm text-muted">
                    <li className="flex items-center gap-2"><Info size={14} style={{ color: 'var(--anim-bronze)' }} /> Wear a fitted garment</li>
                    <li className="flex items-center gap-2"><Info size={14} style={{ color: 'var(--anim-bronze)' }} /> Use a soft measuring tape</li>
                    <li className="flex items-center gap-2"><Info size={14} style={{ color: 'var(--anim-bronze)' }} /> Stand relaxed, breathe normally</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={next} className="btn-primary px-6 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
                  Start Measurements <ArrowRight size={15} />
                </button>
                <button onClick={() => setVideoOpen(true)} className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2">
                  <Play size={15} /> View Measurement Guide
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 — Sleeve Style */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl text-token mb-1">Choose your sleeve style</h2>
              <p className="font-body text-sm text-muted mb-6">Select the sleeve type you'd like. You can always update this later.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {SLEEVE_TYPES.map((s) => {
                  const selected = sleeveId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSleeveId(s.id)}
                      className={`flex flex-col items-center bg-surface border-2 p-4 transition-all ${
                        selected ? 'border-primary' : 'border-token hover:border-primary'
                      }`}
                      style={selected ? { borderColor: 'var(--primary)' } : {}}
                      aria-pressed={selected}
                    >
                      <div className="w-24 h-28 mb-3">
                        <GarmentIllustration type="sleeve" variant={s.illustration} selected={selected} />
                      </div>
                      <span className={`font-display text-base ${selected ? 'text-primary' : 'text-token'}`}>{s.name}</span>
                      <span className="font-body text-[10px] text-muted text-center mt-1 leading-tight">{s.description}</span>
                      {selected && <Check size={16} className="mt-2" style={{ color: 'var(--primary)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Neck Style */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl text-token mb-1">Choose your neck style</h2>
              <p className="font-body text-sm text-muted mb-6">Select the neckline you prefer.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {NECK_TYPES.map((n) => {
                  const selected = neckId === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setNeckId(n.id)}
                      className={`flex flex-col items-center bg-surface border-2 p-4 transition-all ${
                        selected ? 'border-primary' : 'border-token hover:border-primary'
                      }`}
                      style={selected ? { borderColor: 'var(--primary)' } : {}}
                      aria-pressed={selected}
                    >
                      <div className="w-24 h-28 mb-3">
                        <GarmentIllustration type="neck" variant={n.illustration} selected={selected} />
                      </div>
                      <span className={`font-display text-base ${selected ? 'text-primary' : 'text-token'}`}>{n.name}</span>
                      <span className="font-body text-[10px] text-muted text-center mt-1 leading-tight">{n.description}</span>
                      {selected && <Check size={16} className="mt-2" style={{ color: 'var(--primary)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Common Measurements */}
          {step === 3 && (
            <MeasurementInputs
              title="Common Body Measurements"
              subtitle="These apply to all garments. Take them once and reuse."
              fields={COMMON_MEASUREMENT_FIELDS}
              values={common}
              onChange={(id, val) => setCommon((c) => setValue(c, id, val))}
            />
          )}

          {/* STEP 4 — Sleeve Measurements */}
          {step === 4 && (
            <>
              {sleeveType && sleeveType.measurementFields.length > 0 ? (
                <MeasurementInputs
                  title={`${sleeveType.name} Measurements`}
                  subtitle="Measurements specific to your selected sleeve style."
                  fields={sleeveType.measurementFields}
                  values={sleeve}
                  onChange={(id, val) => setSleeve((s) => setValue(s, id, val))}
                />
              ) : (
                <div className="bg-surface border border-token p-8 text-center">
                  <Check size={28} className="mx-auto mb-3" style={{ color: 'var(--anim-olive)' }} />
                  <h2 className="font-display text-2xl text-token">No sleeve measurements needed</h2>
                  <p className="font-body text-sm text-muted mt-2 max-w-md mx-auto">
                    Your selected sleeve style ({sleeveType?.name}) doesn't require additional sleeve measurements. You can continue.
                  </p>
                </div>
              )}
            </>
          )}

          {/* STEP 5 — Neck Measurements */}
          {step === 5 && (
            <>
              {neckType && neckType.measurementFields.length > 0 ? (
                <MeasurementInputs
                  title={`${neckType.name} Measurements`}
                  subtitle="Measurements specific to your selected neckline."
                  fields={neckType.measurementFields}
                  values={neck}
                  onChange={(id, val) => setNeck((n) => setValue(n, id, val))}
                />
              ) : (
                <div className="bg-surface border border-token p-8 text-center">
                  <Check size={28} className="mx-auto mb-3" style={{ color: 'var(--anim-olive)' }} />
                  <h2 className="font-display text-2xl text-token">No neck measurements needed</h2>
                  <p className="font-body text-sm text-muted mt-2 max-w-md mx-auto">
                    Your selected neck style ({neckType?.name}) doesn't require additional neck measurements. You can continue.
                  </p>
                </div>
              )}
            </>
          )}

          {/* STEP 6 — Review & Save */}
          {step === 6 && (
            <div>
              <h2 className="font-display text-2xl text-token mb-1">Review your measurements</h2>
              <p className="font-body text-sm text-muted mb-6">Please check everything looks right before saving.</p>

              <div className="space-y-4">
                <ReviewSection label="Sleeve Style" value={sleeveType?.name ?? '—'} />
                <ReviewSection label="Neck Style" value={neckType?.name ?? '—'} />
                <ReviewSection
                  label="Common Measurements"
                  fields={COMMON_MEASUREMENT_FIELDS}
                  values={common}
                  onEdit={() => setStep(3)}
                />
                {sleeveType && sleeveType.measurementFields.length > 0 && (
                  <ReviewSection
                    label={`${sleeveType.name} Measurements`}
                    fields={sleeveType.measurementFields}
                    values={sleeve}
                    onEdit={() => setStep(4)}
                  />
                )}
                {neckType && neckType.measurementFields.length > 0 && (
                  <ReviewSection
                    label={`${neckType.name} Measurements`}
                    fields={neckType.measurementFields}
                    values={neck}
                    onEdit={() => setStep(5)}
                  />
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary mt-8 px-8 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? 'Saving…' : (<><Check size={16} /> Save Measurements</>)}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step > 0 && step < 6 && (
        <div className="flex items-center justify-between mt-8">
          <button onClick={back} className="btn-outline px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={next} className="btn-primary px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            Continue <ArrowRight size={14} />
          </button>
        </div>
      )}
      {step === 6 && (
        <div className="mt-6">
          <button onClick={back} className="btn-outline px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      )}

      {/* Video guide modal */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[95] flex justify-center"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setVideoOpen(false)} />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl mt-16 mb-8 mx-4 bg-token border border-token shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-token sticky top-0 bg-token z-10">
                <h3 className="font-display text-2xl text-token">Measurement Guide</h3>
                <button onClick={() => setVideoOpen(false)} aria-label="Close" className="h-9 w-9 flex items-center justify-center text-token hover:text-primary">
                  <X size={22} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {MEASUREMENT_VIDEOS.map((v) => (
                  <div key={v.id} className="bg-surface border border-token overflow-hidden">
                    <div className="aspect-video bg-token-alt flex items-center justify-center relative group cursor-pointer">
                      <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'radial-gradient(var(--anim-dark-brown) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }} />
                      <button className="relative h-14 w-14 rounded-full bg-primary flex items-center justify-center" style={{ color: 'var(--btn-text)' }} aria-label={`Play: ${v.title}`}>
                        <Play size={22} className="ml-1" fill="currentColor" />
                      </button>
                      <span className="absolute bottom-3 right-3 px-2 py-1 text-[10px] font-body bg-token/80 text-token flex items-center gap-1">
                        <Clock size={10} /> {v.duration}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-display text-lg text-token">{v.title}</h4>
                      <p className="font-body text-sm text-muted mt-1">{v.description}</p>
                    </div>
                  </div>
                ))}
                <p className="font-body text-xs text-muted text-center italic flex items-center justify-center gap-1.5">
                  <Sparkles size={12} /> Video guides will be loaded from the boutique library once available.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Sub-components ----------

function MeasurementInputs({
  title,
  subtitle,
  fields,
  values,
  onChange,
}: {
  title: string;
  subtitle: string;
  fields: MeasurementFieldDef[];
  values: MeasurementValue[];
  onChange: (fieldId: string, value: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-token mb-1">{title}</h2>
      <p className="font-body text-sm text-muted mb-6">{subtitle}</p>
      {fields.length === 0 ? (
        <p className="font-body text-muted">No measurements required for this selection.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {fields.map((f) => {
            const val = values.find((v) => v.fieldId === f.id)?.value ?? '';
            return (
              <div key={f.id} className="bg-surface border border-token p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor={f.id} className="font-body text-sm text-token">{f.label}</label>
                  <MeasurementGuideButton guideKey={f.guideKey} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id={f.id}
                    type="number"
                    inputMode="decimal"
                    step="0.25"
                    min="0"
                    value={val}
                    onChange={(e) => onChange(f.id, e.target.value)}
                    placeholder="0.0"
                    className="flex-1 px-4 py-3 bg-token-alt border border-token font-body text-base text-token outline-none focus:border-primary transition-colors"
                  />
                  <span className="font-body text-sm text-muted w-10 text-center">{f.unit}</span>
                </div>
                <p className="font-body text-xs text-muted mt-1.5">{f.helper}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReviewSection({
  label,
  value,
  fields,
  values,
  onEdit,
}: {
  label: string;
  value?: string;
  fields?: MeasurementFieldDef[];
  values?: MeasurementValue[];
  onEdit?: () => void;
}) {
  return (
    <div className="bg-surface border border-token p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-token">{label}</h3>
        {onEdit && (
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors">
            <Edit2 size={13} /> Edit
          </button>
        )}
      </div>
      {value && <p className="font-body text-sm text-token">{value}</p>}
      {fields && values && (
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
          {fields.map((f) => {
            const v = values.find((x) => x.fieldId === f.id)?.value;
            return (
              <div key={f.id} className="flex justify-between border-b border-token pb-1">
                <dt className="font-body text-sm text-muted">{f.label}</dt>
                <dd className="font-body text-sm text-token">{v ? `${v} ${f.unit}` : '—'}</dd>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}

function SavedMeasurementsView({
  measurements,
  onEdit,
}: {
  measurements: CustomerMeasurement;
  onEdit: () => void;
}) {
  const sleeveType = SLEEVE_TYPES.find((s) => s.id === measurements.sleeveTypeId);
  const neckType = NECK_TYPES.find((n) => n.id === measurements.neckTypeId);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-2">Measurements</p>
          <h1 className="font-display text-3xl md:text-4xl text-token">Your Measurements</h1>
          <p className="font-body text-sm text-muted mt-2 flex items-center gap-1.5">
            <Check size={14} style={{ color: 'var(--anim-olive)' }} /> Profile saved · Last updated {fmtDate(measurements.updatedAt)}
          </p>
        </div>
        <button onClick={onEdit} className="btn-primary px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <Edit2 size={14} /> Update
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface border border-token p-5 flex items-center gap-4">
          <div className="w-20 h-24 shrink-0">
            <GarmentIllustration type="sleeve" variant={sleeveType?.illustration ?? 'sleeveless'} selected />
          </div>
          <div>
            <p className="font-body text-xs uppercase tracking-[0.2em] text-muted">Sleeve Style</p>
            <p className="font-display text-xl text-token">{sleeveType?.name ?? '—'}</p>
            <p className="font-body text-xs text-muted mt-1">{sleeveType?.description}</p>
          </div>
        </div>
        <div className="bg-surface border border-token p-5 flex items-center gap-4">
          <div className="w-20 h-24 shrink-0">
            <GarmentIllustration type="neck" variant={neckType?.illustration ?? 'round'} selected />
          </div>
          <div>
            <p className="font-body text-xs uppercase tracking-[0.2em] text-muted">Neck Style</p>
            <p className="font-display text-xl text-token">{neckType?.name ?? '—'}</p>
            <p className="font-body text-xs text-muted mt-1">{neckType?.description}</p>
          </div>
        </div>
      </div>

      <ReviewSection label="Common Measurements" fields={COMMON_MEASUREMENT_FIELDS} values={measurements.common} onEdit={onEdit} />
      {sleeveType && sleeveType.measurementFields.length > 0 && (
        <div className="mt-4">
          <ReviewSection label={`${sleeveType.name} Measurements`} fields={sleeveType.measurementFields} values={measurements.sleeve} onEdit={onEdit} />
        </div>
      )}
      {neckType && neckType.measurementFields.length > 0 && (
        <div className="mt-4">
          <ReviewSection label={`${neckType.name} Measurements`} fields={neckType.measurementFields} values={measurements.neck} onEdit={onEdit} />
        </div>
      )}
    </div>
  );
}
