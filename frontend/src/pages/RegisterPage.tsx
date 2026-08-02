import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { extractError } from '@/services/authService';
import { useToast } from '@/context/ToastContext';
import { FormField, PasswordField } from '@/components/FormField';
import BrandLogo from '@/components/BrandLogo';

const PW_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pwMet = PW_RULES.map((r) => r.test(password));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[+\d][\d\s-]{8,}$/.test(phone.trim())) e.phone = 'Enter a valid phone number';
    if (!password) e.password = 'Password is required';
    else if (!PW_RULES.every((r) => r.test(password))) e.password = 'Password does not meet all requirements';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    if (!terms) e.terms = 'Please accept the Terms & Conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const user = await register({ fullName, email, phone, password });
      notify(`Welcome, ${user.fullName.split(' ')[0]}`, 'info');
      navigate('/account');
    } catch (err: any) {
      const apiErr = extractError(err);
      if (apiErr.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(apiErr.errors)) {
          const mapped = key === 'full_name' ? 'fullName' : key === 'password' ? 'password' : key === 'email' ? 'email' : key === 'phone' ? 'phone' : key;
          fieldErrors[mapped] = messages[0];
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ email: apiErr.message });
      }
    }
  };

  return (
    <div className="pt-16 md:pt-20 min-h-screen flex">
      <div className="grid lg:grid-cols-2 w-full">
        {/* Left — form */}
        <div className="flex flex-col justify-center px-6 py-12 md:px-12 order-2 lg:order-1">
          <div className="max-w-md w-full mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-8">
              <ArrowLeft size={14} /> Home
            </Link>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3">Create Account</p>
              <h1 className="font-display text-4xl text-token mb-2">Join Shreemithra</h1>
              <p className="font-body text-sm text-muted mb-8">Begin your journey of bespoke and heirloom pieces.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField id="reg-name" label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName ?? null} autoComplete="name" />
                <FormField id="reg-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email ?? null} autoComplete="email" />
                <FormField id="reg-phone" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone ?? null} helper="Include country code, e.g. +91 98765 43210" autoComplete="tel" inputMode="tel" />

                <PasswordField id="reg-password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password ?? null} show={show} onToggleShow={() => setShow((s) => !s)} autoComplete="new-password" />

                {/* Password guidance */}
                <ul className="space-y-1.5">
                  {PW_RULES.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 font-body text-xs">
                      <span style={{ color: pwMet[i] ? 'var(--anim-olive)' : 'var(--text-muted)' }}>
                        {pwMet[i] ? <Check size={13} /> : <span className="inline-block h-3 w-3 rounded-full border border-token" />}
                      </span>
                      <span style={{ color: pwMet[i] ? 'var(--anim-olive)' : 'var(--text-muted)' }}>{r.label}</span>
                    </li>
                  ))}
                </ul>

                <PasswordField id="reg-confirm" label="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm ?? null} show={show} onToggleShow={() => setShow((s) => !s)} autoComplete="new-password" />

                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="sr-only peer mt-0.5" />
                    <span className="h-4 w-4 border border-token flex items-center justify-center shrink-0 mt-0.5" style={terms ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                      {terms && <span className="h-1.5 w-1.5" style={{ background: 'var(--btn-text)' }} />}
                    </span>
                    <span className="font-body text-sm text-token">
                      I agree to the <span className="text-primary">Terms & Conditions</span> and <span className="text-primary">Privacy Policy</span>.
                    </span>
                  </label>
                  {errors.terms && <p className="font-body text-xs mt-1.5" style={{ color: '#c0392b' }}>{errors.terms}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? 'Creating account…' : (<>Create Account <ArrowRight size={15} /></>)}
                </button>
              </form>

              <p className="font-body text-sm text-muted text-center mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right — brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-surface border-l border-token relative overflow-hidden order-1 lg:order-2">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(var(--anim-dark-brown) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          <div className="relative flex justify-end">
            <BrandLogo size="md" />
          </div>
          <div className="relative text-right">
            <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-4">Become a member</p>
            <h2 className="font-display text-4xl text-token leading-tight max-w-sm ml-auto">
              Where heritage craft meets pieces made just for you.
            </h2>
            <p className="font-body text-base text-muted mt-5 max-w-md ml-auto leading-relaxed">
              Save measurements, addresses and favourites. Enjoy a checkout built around you.
            </p>
          </div>
          <p className="relative font-body text-xs text-muted text-right">© Shreemithra Ladies Boutique</p>
        </div>
      </div>
    </div>
  );
}
