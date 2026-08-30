import { useState } from 'react';
import BasicPage from '@/components/BasicPage';
import {
  Instagram,
  Facebook,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import apiClient from '@/services/apiClient';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      setIsSubmitting(true);

      await apiClient.post('/contact/', {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      setSuccessMessage(
        'Thank you! Your message has been sent successfully.'
      );

      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      console.error('Contact form error:', error);

      const apiError = error?.response?.data;

      if (apiError?.detail) {
        setErrorMessage(String(apiError.detail));
      } else if (apiError?.email) {
        setErrorMessage(
          Array.isArray(apiError.email)
            ? apiError.email[0]
            : String(apiError.email)
        );
      } else {
        setErrorMessage(
          'Unable to send your message. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BasicPage
      eyebrow="Contact"
      title="Get in Touch"
      description="We'd love to hear from you — whether it's a question, a custom request or a collaboration. Reach out and our team will respond soon."
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-surface border border-token p-6">
          <h3 className="font-display text-xl text-token mb-4">
            Reach Us
          </h3>

          <ul className="space-y-3 font-body text-sm text-muted">
            <li className="flex items-center gap-3">
              <Phone
                size={16}
                style={{ color: 'var(--anim-bronze)' }}
              />
              Phone — 6381147062
            </li>

            <li className="flex items-center gap-3">
              <Mail
                size={16}
                style={{ color: 'var(--anim-bronze)' }}
              />
              Email — sugunamithra05@gmail.com
            </li>

            <li className="flex items-center gap-3">
              <MapPin
                size={16}
                style={{ color: 'var(--anim-bronze)' }}
              />
              Address — to be provided
            </li>
          </ul>

          <div className="flex items-center gap-3 mt-6">
            <span
              aria-label="Instagram"
              className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer"
            >
              <Instagram size={18} strokeWidth={1.6} />
            </span>

            <span
              aria-label="Facebook"
              className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer"
            >
              <Facebook size={18} strokeWidth={1.6} />
            </span>

            <span
              aria-label="WhatsApp"
              className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer"
            >
              <MessageCircle size={18} strokeWidth={1.6} />
            </span>
          </div>

          <p className="font-body text-[11px] text-muted mt-4 italic">
            GST number and full contact details will be added shortly.
          </p>
        </div>

        <form
          className="bg-surface border border-token p-6 flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted">
              Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full bg-token-alt border border-token px-3 py-2.5 text-token font-body outline-none focus:border-primary"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full bg-token-alt border border-token px-3 py-2.5 text-token font-body outline-none focus:border-primary"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="font-body text-xs uppercase tracking-[0.2em] text-muted">
              Message
            </label>

            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 w-full bg-token-alt border border-token px-3 py-2.5 text-token font-body outline-none focus:border-primary resize-none"
              placeholder="Tell us about your request"
              required
            />
          </div>

          {successMessage && (
            <p className="font-body text-sm text-green-700">
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="font-body text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary py-3 text-sm uppercase tracking-[0.2em] font-body disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </BasicPage>
  );
}