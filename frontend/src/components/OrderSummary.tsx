import type { CartItem } from '@/context/ShopContext';
import { useCatalog } from '@/context/CatalogContext';
import type { AppliedCoupon } from '@/types';

interface Props {
  cart: CartItem[];
  coupon?: AppliedCoupon | null;
  deliveryCharge?: number;
  freeDeliveryThreshold?: number;
  title?: string;
  compact?: boolean;
}

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function OrderSummary({
  cart,
  coupon = null,
  deliveryCharge,
  freeDeliveryThreshold = 5000,
  title = 'Order Summary',
  compact = false,
}: Props) {
  const { getProductById } = useCatalog();

  const lines = cart
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter((l) => l.product);

  const subtotal = lines.reduce(
    (sum, { item, product }) => sum + (product ? product.price * item.quantity : 0),
    0
  );
  const discount = coupon?.discountAmount ?? 0;

const computedDelivery =
  coupon
    ? 0
    : deliveryCharge !== undefined
      ? deliveryCharge
      : subtotal >= freeDeliveryThreshold || subtotal === 0
        ? 0
        : 150;

const total = Math.max(0, subtotal - discount) + computedDelivery;

  return (
    <div className="bg-surface border border-token p-5">
      <h2 className="font-display text-2xl text-token mb-4">{title}</h2>

      {!compact && (
        <ul className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
          {lines.map(({ item, product }) => {
            if (!product) return null;
            return (
              <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                <img src={product.image} alt={product.name} className="w-12 h-16 object-cover bg-token-alt shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm text-token leading-snug line-clamp-1">{product.name}</p>
                  <p className="font-body text-xs text-muted">
                    {item.size} · {item.color} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-body text-sm text-token font-medium whitespace-nowrap">
                  {formatPrice(product.price * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <dl className="space-y-2.5 font-body text-sm border-t border-token pt-4">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="text-token">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">Coupon ({coupon?.code})</dt>
            <dd style={{ color: 'var(--anim-olive)' }}>− {formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">Delivery</dt>
          <dd className="text-token">{computedDelivery === 0 ? 'Free' : formatPrice(computedDelivery)}</dd>
        </div>
        {computedDelivery > 0 && subtotal < freeDeliveryThreshold && (
          <p className="text-xs text-muted italic">
            Add {formatPrice(freeDeliveryThreshold - subtotal)} more for free delivery.
          </p>
        )}
      </dl>

      <div className="border-t border-token mt-4 pt-4 flex justify-between items-baseline">
        <span className="font-display text-lg text-token">Total</span>
        <span className="font-display text-2xl text-token">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
