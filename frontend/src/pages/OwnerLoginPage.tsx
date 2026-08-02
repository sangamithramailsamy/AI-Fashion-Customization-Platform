import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { useOwnerAuth } from '@/context/OwnerAuthContext';
import { useToast } from '@/context/ToastContext';
import BrandLogo from '@/components/BrandLogo';

export default function OwnerLoginPage() {
  const { user, login } = useOwnerAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/owner';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/owner" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const u = await login(email, password);
      notify(`Welcome, ${u.fullName.split(' ')[0]}`, 'info');
      navigate(from);
    } catch {
      setErrors({ password: 'Invalid owner credentials. Please contact your administrator if you have trouble signing in.' });
    } finally {
      setLoading(false);
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
            <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-4">Owner Portal</p>
            <h2 className="font-display text-4xl text-token leading-tight max-w-sm">
              Manage your boutique, products and orders.
            </h2>
            <p className="font-body text-base text-muted mt-5 max-w-md leading-relaxed">
              Sign in to the Shreemithra owner portal to oversee your atelier, catalog and customer orders.
            </p>
          </div>
          <p className="relative font-body text-xs text-muted">© Shreemithra Ladies Boutique</p>
        </div>

        {/* Right — form */}
        <div className="flex flex-col justify-center px-6 py-12 md:px-12">
          <div className="max-w-md w-full mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-8">
              <ArrowLeft size={14} /> Back to Store
            </Link>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="font-body uppercase tracking-[0.3em] text-xs text-muted mb-3">Owner Sign In</p>
              <h1 className="font-display text-4xl text-token mb-2">Portal Access</h1>
              <p className="font-body text-sm text-muted mb-8">Enter your owner credentials to continue.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="owner-email" className="font-body text-sm text-token block mb-1.5">Email</label>
                  <input
                    id="owner-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="owner@shreemithra.in"
                    className="w-full px-4 py-3 bg-surface border border-token font-body text-base text-token outline-none focus:border-primary transition-colors"
                    style={errors.email ? { borderColor: '#c0392b' } : {}}
                  />
                  {errors.email && <p className="font-body text-xs mt-1" style={{ color: '#c0392b' }}>{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="owner-password" className="font-body text-sm text-token block mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="owner-password"
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pr-11 bg-surface border border-token font-body text-base text-token outline-none focus:border-primary transition-colors"
                      style={errors.password ? { borderColor: '#c0392b' } : {}}
                    />
                    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                  {errors.password && <p className="font-body text-xs mt-1" style={{ color: '#c0392b' }}>{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only peer" />
                    <span className="h-4 w-4 border border-token flex items-center justify-center" style={remember ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}>
                      {remember && <span className="h-1.5 w-1.5" style={{ background: 'var(--btn-text)' }} />}
                    </span>
                    <span className="font-body text-sm text-token">Remember me</span>
                  </label>
                  <button type="button" onClick={() => notify('Password reset arrives with backend integration', 'info')} className="font-body text-sm text-muted hover:text-primary transition-colors">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? 'Signing in…' : (<>Sign In <ArrowRight size={15} /></>)}
                </button>
              </form>

              <p className="font-body text-xs text-muted text-center mt-4">
                Customer? <Link to="/login" className="text-primary hover:underline">Sign in here</Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
