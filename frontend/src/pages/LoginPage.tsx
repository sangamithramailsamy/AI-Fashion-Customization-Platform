import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { FormField, PasswordField } from '@/components/FormField';
import BrandLogo from '@/components/BrandLogo';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      const user = await login({ email, password });
      notify(`Welcome back, ${user.fullName.split(' ')[0]}`, 'info');
      navigate(from);
    } catch {
      setErrors({ password: 'Unable to sign in. Check your email and password.' });
    }
  };

  return (
    <div className="pt-16 md:pt-20 min-h-screen flex">
      <div className="grid lg:grid-cols-2 w-full">
        {/* Left — brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-surface border-r border-token relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(var(--anim-dark-brown) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          <div className="relative">
            <BrandLogo size="md" />
          </div>
          <div className="relative">
            <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-4">Welcome back</p>
            <h2 className="font-display text-4xl text-token leading-tight max-w-sm">
              Your wardrobe of heirlooms and bespoke pieces awaits.
            </h2>
            <p className="font-body text-base text-muted mt-5 max-w-md leading-relaxed">
              Sign in to continue to your measurements, saved addresses and the pieces you love.
            </p>
          </div>
          <p className="relative font-body text-xs text-muted">© Shreemithra Ladies Boutique</p>
        </div>

        {/* Right — form */}
        <div className="flex flex-col justify-center px-6 py-12 md:px-12">
          <div className="max-w-md w-full mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-8">
              <ArrowLeft size={14} /> Home
            </Link>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3">Sign In</p>
              <h1 className="font-display text-4xl text-token mb-2">Welcome back</h1>
              <p className="font-body text-sm text-muted mb-8">Enter your details to continue.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  id="login-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email ?? null}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <PasswordField
                  id="login-password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password ?? null}
                  show={show}
                  onToggleShow={() => setShow((s) => !s)}
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only peer" />
                    <span className="h-4 w-4 border border-token flex items-center justify-center" style={remember ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                      {remember && <span className="h-1.5 w-1.5" style={{ background: 'var(--btn-text)' }} />}
                    </span>
                    <span className="font-body text-sm text-token">Remember me</span>
                  </label>
                  <Link to="/login" className="font-body text-sm text-muted hover:text-primary transition-colors">Forgot password?</Link>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? 'Signing in…' : (<>Sign In <ArrowRight size={15} /></>)}
                </button>
              </form>

              <p className="font-body text-sm text-muted text-center mt-6">
                New to Shreemithra?{' '}
                <Link to="/register" className="text-primary hover:underline">Create an account</Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
