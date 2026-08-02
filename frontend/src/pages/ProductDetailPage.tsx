import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingBag, Zap, Wand2, Sparkles, Star, Minus, Plus,
  ArrowLeft, Check, AlertCircle,
} from 'lucide-react';
import { useCatalog } from '@/context/CatalogContext';
import { useShop } from '@/context/ShopContext';
import { useToast } from '@/context/ToastContext';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, loading } = useCatalog();
  const product = getProductById(Number(id));
  const { isWished, toggleWishlist, addToCart } = useShop();
  const { notify } = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="pt-36 pb-20 text-center">
        <p className="font-display text-3xl text-token">Product not found</p>
        <Link to="/shop" className="btn-primary mt-6 px-6 py-3 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
          <ArrowLeft size={15} /> Back to Shop
        </Link>
      </div>
    );
  }

  const wished = isWished(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const inStock = product.stock > 0;
  const sizeInStock = (label: string) => product.sizes.find((s) => s.label === label)?.inStock ?? false;

  const validateSelection = (): { size: string; color: string } | null => {
    if (product.sizes.length > 1 && !selectedSize) {
      notify('Please select a size', 'info');
      return null;
    }
    if (product.colors.length > 1 && !selectedColor) {
      notify('Please select a color', 'info');
      return null;
    }
    const size = selectedSize ?? product.sizes[0]?.label ?? 'Free Size';
    const color = selectedColor ?? product.colors[0]?.name ?? 'Default';
    return { size, color };
  };

  const handleAddToCart = () => {
    const sel = validateSelection();
    if (!sel) return;
    addToCart({ productId: product.id, size: sel.size, color: sel.color, quantity });
    notify('Added to cart', 'cart');
  };

  const handleBuyNow = () => {
    const sel = validateSelection();
    if (!sel) return;
    addToCart({ productId: product.id, size: sel.size, color: sel.color, quantity });
    navigate('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    notify(wished ? 'Removed from wishlist' : 'Added to wishlist', wished ? 'remove' : 'wishlist');
  };

  return (
    <div className="pt-24 md:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {product.images.map((im, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-primary' : 'border-token hover:border-primary'
                  }`}
                  style={activeImage === i ? { borderColor: 'var(--primary)' } : {}}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={im.src} alt={im.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main image */}
            <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-surface border border-token">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={product.images[activeImage].src}
                  alt={product.images[activeImage].alt}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-[10px] uppercase tracking-[0.15em] font-body" style={{ color: 'var(--btn-text)' }}>
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-muted">{product.category}</span>
            <h1 className="font-display text-3xl md:text-4xl text-token mt-2 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    className={i < Math.round(product.rating) ? 'fill-current' : ''}
                    style={{ color: i < Math.round(product.rating) ? 'var(--anim-bronze)' : 'var(--border)' }}
                  />
                ))}
              </div>
              <span className="font-body text-sm text-token">{product.rating}</span>
              <span className="font-body text-sm text-muted">· {product.reviewCount} reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mt-5">
              <span className="font-display text-3xl text-token">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="font-body text-lg text-muted line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {discount > 0 && (
                <span className="px-2.5 py-1 bg-token text-[10px] uppercase tracking-[0.15em] font-body border border-token" style={{ color: 'var(--anim-dark-brown)' }}>
                  {discount}% off
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mt-3">
              {inStock ? (
                <>
                  <Check size={15} style={{ color: 'var(--anim-olive)' }} />
                  <span className="font-body text-sm" style={{ color: 'var(--anim-olive)' }}>In stock — {product.stock} available</span>
                </>
              ) : (
                <>
                  <AlertCircle size={15} className="text-muted" />
                  <span className="font-body text-sm text-muted">Out of stock</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="font-body text-base text-muted mt-5 leading-relaxed">{product.description}</p>

            {/* Color */}
            {product.colors.length > 0 && (
              <div className="mt-6">
                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">
                  Color{selectedColor && <span className="ml-2 text-token normal-case tracking-normal">— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((c) => {
                    const selected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        title={c.name}
                        aria-label={c.name}
                        className={`h-9 w-9 rounded-full border-2 transition-all ${selected ? 'scale-110' : 'hover:scale-105'}`}
                        style={{
                          backgroundColor: c.hex,
                          borderColor: selected ? 'var(--primary)' : 'var(--border)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.length > 0 && (
              <div className="mt-6">
                <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Size</p>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((s) => {
                    const selected = selectedSize === s.label;
                    const disabled = !s.inStock;
                    return (
                      <button
                        key={s.label}
                        onClick={() => s.inStock && setSelectedSize(s.label)}
                        disabled={disabled}
                        className={`min-w-[3rem] px-3 py-2.5 text-sm font-body border transition-colors ${
                          selected
                            ? 'border-primary text-primary'
                            : disabled
                            ? 'border-token text-muted opacity-50 cursor-not-allowed line-through'
                            : 'border-token text-token hover:border-primary'
                        }`}
                        style={selected ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">Quantity</p>
              <div className="inline-flex items-center border border-token">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="h-11 w-11 flex items-center justify-center text-token hover:text-primary transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-body text-base text-token">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  aria-label="Increase quantity"
                  className="h-11 w-11 flex items-center justify-center text-token hover:text-primary transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button onClick={handleAddToCart} disabled={!inStock} className="btn-primary py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={!inStock} className="btn-outline py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Zap size={16} /> Buy Now
              </button>
            </div>

            {/* Secondary actions */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button onClick={handleWishlist} className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-body border border-token text-token hover:border-primary hover:text-primary transition-colors">
                <motion.span animate={wished ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                  <Heart size={15} className={wished ? 'fill-current' : ''} style={wished ? { color: 'var(--primary)' } : {}} />
                </motion.span>
                {wished ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              {product.customizable && (
                <>
                  <Link to="/custom-designs" className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-body border border-token text-token hover:border-primary hover:text-primary transition-colors">
                    <Wand2 size={15} /> Customize This Design
                  </Link>
                  <Link to="/ai-design-studio" className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-body border transition-colors" style={{ borderColor: 'var(--anim-bronze)', color: 'var(--anim-bronze)' }}>
                    <Sparkles size={15} /> Design with AI
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
