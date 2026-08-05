import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Zap, Star } from 'lucide-react';
import type { Product } from '@/types';
import { useShop } from '@/context/ShopContext';
import { useToast } from '@/context/ToastContext';

interface Props {
  product: Product;
  index?: number;
}

function formatPrice(n: any) {
  console.log("PRICE =", n);

  if (n === undefined || n === null) {
    return "₹0";
  }

  return "₹" + Number(n).toLocaleString("en-IN");
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { isWished: checkWished, toggleWishlist, addToCart } = useShop();
  const { notify } = useToast();
  const navigate = useNavigate();
  const wished = checkWished(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
    notify(
      wished ? 'Removed from wishlist' : 'Added to wishlist',
      wished ? 'remove' : 'wishlist'
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const size = product.sizes.find((s) => s.inStock)?.label ?? 'Free Size';
    const color = product.colors[0]?.name ?? 'Default';
    addToCart({ productId: product.id, size, color, quantity: 1 });
    notify('Added to cart', 'cart');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    const size = product.sizes.find((s) => s.inStock)?.label ?? 'Free Size';
    const color = product.colors[0]?.name ?? 'Default';
    addToCart({ productId: product.id, size, color, quantity: 1 });
    navigate('/checkout');
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: 'easeOut' }}
      className="group relative flex flex-col bg-surface border border-token overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-token-alt">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {product.badge && (
              <span className="px-2.5 py-1 bg-primary text-[10px] uppercase tracking-[0.15em] font-body" style={{ color: 'var(--btn-text)' }}>
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 bg-token text-[10px] uppercase tracking-[0.15em] font-body border border-token" style={{ color: 'var(--anim-dark-brown)' }}>
                {discount}% off
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center rounded-full bg-token/80 backdrop-blur-sm border border-token hover:bg-primary transition-colors"
          >
            <motion.span
              animate={wished ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <Heart
                size={16}
                className={wished ? 'fill-current' : ''}
                style={wished ? { color: 'var(--primary)' } : { color: 'var(--text)' }}
              />
            </motion.span>
          </button>

          {/* Desktop hover actions */}
          <div className="hidden md:block">
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-sm border-t border-token flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs uppercase tracking-[0.15em] btn-primary"
              >
                <ShoppingBag size={13} /> Add
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs uppercase tracking-[0.15em] btn-outline"
              >
                <Zap size={13} /> Buy Now
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted">{product.category}</span>
            <div className="flex items-center gap-1 text-muted">
              <Star size={11} className="fill-current" style={{ color: 'var(--anim-bronze)' }} />
              <span className="text-xs font-body">{product.rating}</span>
              <span className="text-xs font-body opacity-60">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-display text-lg text-token leading-snug line-clamp-2">{product.name}</h3>

          <div className="flex items-center gap-2 mt-2">
            <span className="font-body text-base text-token font-medium">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="font-body text-sm text-muted line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Color indicators */}
          <div className="flex items-center gap-1.5 mt-3">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3.5 w-3.5 rounded-full border border-token"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.customizable && (
              <span className="ml-auto font-body text-[10px] uppercase tracking-[0.15em] text-muted">Customizable</span>
            )}
          </div>
        </div>
      </Link>

      {/* Mobile actions — always visible, touch friendly */}
      <div className="md:hidden px-4 pb-4 grid grid-cols-2 gap-2">
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs uppercase tracking-[0.15em] btn-primary"
        >
          <ShoppingBag size={13} /> Add
        </button>
        <button
          onClick={handleBuyNow}
          className="flex items-center justify-center gap-1.5 py-2.5 text-xs uppercase tracking-[0.15em] btn-outline"
        >
          <Zap size={13} /> Buy
        </button>
      </div>
    </motion.article>
  );
}
