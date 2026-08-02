import BasicPage from '@/components/BasicPage';
import { Instagram, Facebook, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <BasicPage
      eyebrow="Contact"
      title="Get in Touch"
      description="We'd love to hear from you — whether it's a question, a custom request or a collaboration. Reach out and our team will respond soon."
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-surface border border-token p-6">
          <h3 className="font-display text-xl text-token mb-4">Reach Us</h3>
          <ul className="space-y-3 font-body text-sm text-muted">
            <li className="flex items-center gap-3"><Phone size={16} style={{ color: 'var(--anim-bronze)' }} /> Phone — to be provided</li>
            <li className="flex items-center gap-3"><Mail size={16} style={{ color: 'var(--anim-bronze)' }} /> Email — to be provided</li>
            <li className="flex items-center gap-3"><MapPin size={16} style={{ color: 'var(--anim-bronze)' }} /> Address — to be provided</li>
          </ul>
          <div className="flex items-center gap-3 mt-6">
            <span aria-label="Instagram" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer"><Instagram size={18} strokeWidth={1.6} /></span>
            <span aria-label="Facebook" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer"><Facebook size={18} strokeWidth={1.6} /></span>
            <span aria-label="WhatsApp" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer"><MessageCircle size={18} strokeWidth={1.6} /></span>
          </div>
          <p className="font-body text-[11px] text-muted mt-4 italic">GST number and full contact details will be added shortly.</p>
        </div>

        <form className="bg-surface border border-token p-6 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted">Name</label>
            <input className="mt-1.5 w-full bg-token-alt border border-token px-3 py-2.5 text-token font-body outline-none focus:border-primary" placeholder="Your name" />
          </div>
          <div>
            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted">Email</label>
            <input className="mt-1.5 w-full bg-token-alt border border-token px-3 py-2.5 text-token font-body outline-none focus:border-primary" placeholder="you@example.com" />
          </div>
          <div>
            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted">Message</label>
            <textarea rows={4} className="mt-1.5 w-full bg-token-alt border border-token px-3 py-2.5 text-token font-body outline-none focus:border-primary resize-none" placeholder="Tell us about your request" />
          </div>
          <button type="submit" className="btn-primary py-3 text-sm uppercase tracking-[0.2em] font-body">Send Message</button>
        </form>
      </div>
    </BasicPage>
  );
}
