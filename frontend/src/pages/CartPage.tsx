import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, Heart, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

const DELIVERY_THRESHOLD = 5000;
const DELIVERY_CHARGE = 150;

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, moveCartToWishlist } = useShop();
  const { getProductById } = useCatalog();
  const { notify } = useToast();
  const navigate = useNavigate();

  const lines = cart
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter((l) => l.product);

  const subtotal = lines.reduce(
    (sum, { item, product }) => sum + (product ? product.price * item.quantity : 0),
    0
  );
  const discount = lines.reduce((sum, { item, product }) => {
    if (!product || !product.originalPrice) return sum;
    return sum + (product.originalPrice - product.price) * item.quantity;
  }, 0);
  const delivery = subtotal >= DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_CHARGE;
  const total = subtotal + delivery;

  if (lines.length === 0) {
    return (
      <div className="pt-28 md:pt-36 pb-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center py-20 bg-surface border border-token">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6" style={{ color: 'var(--anim-bronze)' }}>
            <ShoppingBag size={26} strokeWidth={1.5} />
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-token">Your cart is empty</h1>
          <p className="font-body text-base text-muted mt-3 max-w-md mx-auto">
            Looks like you haven't added anything yet. Explore our collections and find something you love.
          </p>
          <Link to="/shop" className="btn-primary mt-7 px-7 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2">
            Continue Shopping <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="font-display text-3xl md:text-5xl text-token mb-2">Your Cart</h1>
        <p className="font-body text-sm text-muted mb-8">{lines.length} {lines.length === 1 ? 'item' : 'items'} in your cart</p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Items */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {lines.map(({ item, product }) => {
                if (!product) return null;
                return (
                  <motion.div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-4 bg-surface border border-token p-4"
                  >
                    <Link to={`/product/${product.id}`} className="shrink-0">
                      <img src={product.image} alt={product.name} className="w-24 h-32 sm:w-28 sm:h-36 object-cover bg-token-alt" />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-muted">{product.category}</span>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-display text-lg text-token leading-snug hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                          </Link>
                        </div>
                        <button
                          onClick={() => { removeFromCart(item.productId, item.size, item.color); notify('Removed from cart', 'remove'); }}
                          aria-label="Remove from cart"
                          className="text-muted hover:text-primary transition-colors shrink-0"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 font-body text-xs text-muted">
                        <span>Size: <span className="text-token">{item.size}</span></span>
                        <span>Color: <span className="text-token">{item.color}</span></span>
                      </div>

                      <div className="flex items-end justify-between mt-auto pt-3">
                        {/* Quantity */}
                        <div className="inline-flex items-center border border-token">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="h-9 w-9 flex items-center justify-center text-token hover:text-primary transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-body text-sm text-token">{item.quantity}</span>
                          <button
                            onClick={() => { updateQuantity(item.productId, item.size, item.color, item.quantity + 1); notify('Quantity updated', 'info'); }}
                            aria-label="Increase quantity"
                            className="h-9 w-9 flex items-center justify-center text-token hover:text-primary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-body text-base text-token font-medium">{formatPrice(product.price * item.quantity)}</p>
                          {product.originalPrice && (
                            <p className="font-body text-xs text-muted line-through">{formatPrice(product.originalPrice * item.quantity)}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => { moveCartToWishlist(item.productId, item.size, item.color); notify('Moved to wishlist', 'wishlist'); }}
                        className="self-start mt-3 inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors"
                      >
                        <Heart size={13} /> Move to wishlist
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <Link to="/shop" className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mt-4">
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 self-start bg-surface border border-token p-6 h-fit">
            <h2 className="font-display text-2xl text-token mb-5">Order Summary</h2>
            <dl className="space-y-3 font-body text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-token">{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount</dt>
                  <dd style={{ color: 'var(--anim-olive)' }}>− {formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="text-token">{delivery === 0 ? 'Free' : formatPrice(delivery)}</dd>
              </div>
              {delivery > 0 && (
                <p className="text-xs text-muted italic">
                  Add {formatPrice(DELIVERY_THRESHOLD - subtotal)} more for free delivery.
                </p>
              )}
            </dl>
            <div className="border-t border-token mt-5 pt-5 flex justify-between items-baseline">
              <span className="font-display text-lg text-token">Estimated Total</span>
              <span className="font-display text-2xl text-token">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-6 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={15} />
            </button>
            <p className="font-body text-[11px] text-muted text-center mt-3 italic">
              Checkout and payments arrive in a later phase.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
