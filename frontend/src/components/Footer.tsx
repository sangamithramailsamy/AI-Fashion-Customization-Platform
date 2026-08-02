import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';

const FOOTER_LINKS: { heading: string; links: { label: string; path: string }[] }[] = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', path: '/shop' },
      { label: 'New Arrivals', path: '/new-arrivals' },
      { label: 'Collections', path: '/collections' },
      { label: 'Custom Designs', path: '/custom-designs' },
    ],
  },
  {
    heading: 'Collections',
    links: [
      { label: 'Traditional', path: '/collections' },
      { label: 'Western', path: '/collections' },
      { label: 'Ethnic', path: '/collections' },
      { label: 'Party Wear', path: '/collections' },
    ],
  },
  {
    heading: 'Customer Care',
    links: [
      { label: 'Contact', path: '/contact' },
      { label: 'About', path: '/about' },
      { label: 'AI Design Studio', path: '/ai-design-studio' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In', path: '/contact' },
      { label: 'Wishlist', path: '/shop' },
      { label: 'Cart', path: '/shop' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-token-alt border-t border-token mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <BrandLogo size="md" asLink={false} />
            <p className="font-body text-sm text-muted mt-5 max-w-xs leading-relaxed">
              A premium women's fashion boutique — ready-made, boutique creations and personalized designs, crafted with care.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <span aria-label="Instagram" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer">
                <Instagram size={18} strokeWidth={1.6} />
              </span>
              <span aria-label="Facebook" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer">
                <Facebook size={18} strokeWidth={1.6} />
              </span>
              <span aria-label="WhatsApp" className="h-10 w-10 flex items-center justify-center border border-token text-token hover:text-primary hover:border-primary transition-colors cursor-pointer">
                <MessageCircle size={18} strokeWidth={1.6} />
              </span>
            </div>
            <p className="font-body text-[11px] text-muted mt-5 italic">
              Contact details and links to be provided.
            </p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="font-body text-xs uppercase tracking-[0.2em] text-token mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.path} className="font-body text-sm text-muted hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-token flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-muted">
            © {new Date().getFullYear()} Shreemithra Ladies Boutique. All rights reserved.
          </p>
          <p className="font-body text-xs text-muted">Designed for You. Made to Be Yours.</p>
        </div>
      </div>
    </footer>
  );
}
