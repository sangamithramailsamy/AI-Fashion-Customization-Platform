import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight, Eye } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useShop();
  const { getProductById } = useCatalog();
  const { notify } = useToast();

  const items = wishlist
  .map((item) => getProductById(item.design))
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (items.length === 0) {
    return (
      <div className="pt-28 md:pt-36 pb-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center py-20 bg-surface border border-token">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6" style={{ color: 'var(--anim-bronze)' }}>
            <Heart size={26} strokeWidth={1.5} />
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-token">Your wishlist is empty</h1>
          <p className="font-body text-base text-muted mt-3 max-w-md mx-auto">
            Tap the heart on any product to save it here for later.
          </p>
          <Link to="/shop" className="btn-primary mt-7 px-7 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            Explore Products <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="font-display text-3xl md:text-5xl text-token mb-2">Your Wishlist</h1>
        <p className="font-body text-sm text-muted mb-8">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence initial={false}>
            {items.map((p) => {
              const inStock = p.stock > 0;
              return (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 bg-surface border border-token p-4"
                >
                  <Link to={`/product/${p.id}`} className="shrink-0">
                    <img src={p.image} alt={p.name} className="w-20 h-28 object-cover bg-token-alt" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted">{p.category}</span>
                    <Link to={`/product/${p.id}`}>
                      <h3 className="font-display text-base text-token leading-snug hover:text-primary transition-colors line-clamp-2">{p.name}</h3>
                    </Link>
                    <p className="font-body text-sm text-token font-medium mt-1">{formatPrice(p.price)}</p>
                    <p className={`font-body text-xs mt-1 ${inStock ? '' : 'text-muted'}`} style={inStock ? { color: 'var(--anim-olive)' } : {}}>
                      {inStock ? 'In stock' : 'Out of stock'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-auto pt-3">
                      <button
                        onClick={() => {
                          const size = p.sizes.find((s) => s.inStock)?.label ?? 'Free Size';
                          const color = p.colors[0]?.name ?? 'Default';
                          addToCart({ productId: p.id, size, color, quantity: 1 });
                          notify('Added to cart', 'cart');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-[0.15em] btn-primary"
                      >
                        <ShoppingBag size={13} /> To Cart
                      </button>
                      <Link
                        to={`/product/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-[0.15em] btn-outline"
                      >
                        <Eye size={13} /> View
                      </Link>
                      <button
                        onClick={() => { removeFromWishlist(p.id); notify('Removed from wishlist', 'remove'); }}
                        aria-label="Remove from wishlist"
                        className="inline-flex items-center justify-center h-9 w-9 text-muted hover:text-primary transition-colors border border-token"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
