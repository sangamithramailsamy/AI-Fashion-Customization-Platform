import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Check,
  ArrowRight,
  ArrowLeft,
  Lock,
  User,
  MapPin,
  Ruler,
  Tag,
  ShoppingBag,
  X,
  Plus,
  CreditCard,
  Smartphone,
  Wallet,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useCustomer } from '@/context/CustomerContext';
import { useShop } from '@/context/ShopContext';
import { useCatalog } from '@/context/CatalogContext';
import { useToast } from '@/context/ToastContext';
import { useOrders } from '@/context/OrderContext';

import { couponService } from '@/services/couponService';
import { paymentService } from '@/services/paymentService';
import { orderService } from '@/services/orderService';
import apiClient from '@/services/apiClient';

import OrderSummary from '@/components/OrderSummary';
import AddressModal from '@/components/AddressModal';

import type {
  AppliedCoupon,
  Order,
  OrderItem,
  PaymentMethod,
} from '@/types';

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

const STAGES = [
  { label: 'Customer', icon: User },
  { label: 'Address', icon: MapPin },
  { label: 'Fit', icon: Ruler },
  { label: 'Coupon', icon: Tag },
  { label: 'Review', icon: ShoppingBag },
  { label: 'Payment', icon: Lock },
];

const DELIVERY_THRESHOLD = 5000;
const DELIVERY_CHARGE = 150;

function formatPrice(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

/**
 * Find the backend DesignVariant ID using
 * the selected size + color.
 *
 * Example:
 * XS + Cream -> variant 47
 */
async function getVariantId(
  productId: number,
  size: string,
  color: string
): Promise<number | null> {
  try {
    const response = await apiClient.get(
      `/catalog/designs/${productId}/`
    );

    const variants = Array.isArray(response.data?.variants)
      ? response.data.variants
      : [];

    const matchedVariant = variants.find(
      (variant: any) =>
        String(variant.size ?? '').toLowerCase() ===
          String(size ?? '').toLowerCase() &&
        String(variant.color ?? '').toLowerCase() ===
          String(color ?? '').toLowerCase()
    );

    return matchedVariant?.id
      ? Number(matchedVariant.id)
      : null;
  } catch (error) {
    console.error(
      `Unable to find variant for product ${productId}`,
      error
    );

    return null;
  }
}

export default function CheckoutPage() {
  const { user } = useAuth();

  const {
    addresses,
    defaultAddress,
    addAddress,
    setDefaultAddress,
    hasMeasurements,
  } = useCustomer();

  const {
    cart,
    clearCart,
  } = useShop();

  const {
    getProductById,
  } = useCatalog();

  const {
    notify,
  } = useToast();

  const {
    createOrder,
  } = useOrders();

  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>(0);

  const [selectedAddressId, setSelectedAddressId] =
    useState<string | null>(
      defaultAddress?.id ??
      addresses[0]?.id ??
      null
    );

  const [addressModalOpen, setAddressModalOpen] =
    useState(false);

  const [couponCode, setCouponCode] =
    useState('');

  const [coupon, setCoupon] =
    useState<AppliedCoupon | null>(null);

  const [couponStatus, setCouponStatus] =
    useState<
      'idle' |
      'loading' |
      'applied' |
      'error'
    >('idle');

  const [couponError, setCouponError] =
    useState('');

  const [useMeasurements, setUseMeasurements] =
    useState(hasMeasurements);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const [paymentMode, setPaymentMode] =
    useState<'full' | 'advance'>('full');

  const [processing, setProcessing] =
    useState(false);

  const createdOrderRef =
    useRef<Order | null>(null);

  const lines = cart
    .map((item) => ({
      item,
      product: getProductById(item.productId),
    }))
    .filter((l) => l.product);

  const subtotal = lines.reduce(
    (
      sum,
      { item, product }
    ) =>
      sum +
      (
        product
          ? product.price * item.quantity
          : 0
      ),
    0
  );

  const discount =
    coupon?.discountAmount ?? 0;

  const delivery =
    subtotal >= DELIVERY_THRESHOLD ||
    subtotal === 0
      ? 0
      : DELIVERY_CHARGE;

  const total =
    Math.max(
      0,
      subtotal - discount
    ) + delivery;

  const hasCustomizable =
    lines.some(
      (l) => l.product?.customizable
    );

  // --------------------------------------------------
  // EMPTY CART
  // --------------------------------------------------

  if (lines.length === 0) {
    return (
      <div className="pt-28 md:pt-36 pb-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center py-20 bg-surface border border-token">

          <span
            className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-token mb-6"
            style={{
              color: 'var(--anim-bronze)',
            }}
          >
            <ShoppingBag
              size={26}
              strokeWidth={1.5}
            />
          </span>

          <h1 className="font-display text-3xl md:text-4xl text-token">
            Nothing to check out
          </h1>

          <p className="font-body text-base text-muted mt-3">
            Your cart is empty. Add a few pieces first.
          </p>

          <Link
            to="/shop"
            className="btn-primary mt-7 px-7 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center gap-2"
          >
            Continue Shopping
            <ArrowRight size={15} />
          </Link>

        </div>
      </div>
    );
  }

  const selectedAddress =
    addresses.find(
      (a) => a.id === selectedAddressId
    ) ?? null;

  const canProceed = (): boolean => {
    if (stage === 0) {
      return Boolean(user);
    }

    if (stage === 1) {
      return Boolean(selectedAddress);
    }

    if (stage === 2) {
      return (
        !hasCustomizable ||
        useMeasurements ||
        !hasMeasurements
      );
    }

    if (stage === 5) {
      return Boolean(paymentMethod);
    }

    return true;
  };

  const next = () => {
    if (!canProceed()) {
      if (stage === 0) {
        notify(
          'Please sign in to continue',
          'info'
        );
      }

      if (stage === 1) {
        notify(
          'Please select a shipping address',
          'info'
        );
      }

      if (stage === 5) {
        notify(
          'Please select a payment method',
          'info'
        );
      }

      return;
    }

    setStage(
      (s) =>
        Math.min(
          5,
          s + 1
        ) as Stage
    );
  };

  const back = () => {
    setStage(
      (s) =>
        Math.max(
          0,
          s - 1
        ) as Stage
    );
  };

  // --------------------------------------------------
  // COUPON
  // --------------------------------------------------

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      return;
    }

    setCouponStatus('loading');
    setCouponError('');

    try {
      const applied =
        await couponService.validate(
          couponCode,
          subtotal
        );

      setCoupon(applied);
      setCouponStatus('applied');

      notify(
        `Coupon ${applied.code} applied`,
        'info'
      );
    } catch (e) {
      const err =
        e as {
          message?: string;
        };

      setCouponStatus('error');

      setCouponError(
        err.message ??
        'Invalid coupon code.'
      );

      setCoupon(null);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode('');
    setCouponStatus('idle');
    setCouponError('');
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="pt-24 md:pt-28 pb-20">

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Edit Cart
        </Link>

        <h1 className="font-display text-3xl md:text-5xl text-token mb-2">
          Checkout
        </h1>

        <p className="font-body text-sm text-muted mb-8">
          Complete your order in a few simple steps.
        </p>

        {/* --------------------------------------------------
            STEPPER
        -------------------------------------------------- */}

        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">

          {STAGES.map((s, i) => {
            const Icon = s.icon;

            const active =
              stage === i;

            const done =
              stage > i;

            return (
              <button
                key={s.label}
                onClick={() =>
                  i <= stage &&
                  setStage(i as Stage)
                }
                className={`flex items-center gap-2 px-3 py-2 font-body text-xs whitespace-nowrap transition-colors ${
                  active
                    ? 'text-primary'
                    : done
                      ? 'text-token'
                      : 'text-muted'
                }`}
              >

                <span
                  className="h-7 w-7 rounded-full flex items-center justify-center border"
                  style={{
                    borderColor:
                      active
                        ? 'var(--primary)'
                        : done
                          ? 'var(--anim-olive)'
                          : 'var(--border)',

                    background:
                      active
                        ? 'var(--primary)'
                        : 'transparent',

                    color:
                      active
                        ? 'var(--btn-text)'
                        : done
                          ? 'var(--anim-olive)'
                          : 'var(--text-muted)',
                  }}
                >
                  {done ? (
                    <Check size={13} />
                  ) : (
                    <Icon size={13} />
                  )}
                </span>

                {s.label}

              </button>
            );
          })}

        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">

          {/* ==================================================
              MAIN
          ================================================== */}

          <div>

            <AnimatePresence mode="wait">

              <motion.div
                key={stage}
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                }}
                transition={{
                  duration: 0.3,
                }}
              >

                {/* ==================================================
                    STAGE 0 — CUSTOMER
                ================================================== */}

                {stage === 0 && (
                  <div className="bg-surface border border-token p-6 md:p-8">

                    <h2 className="font-display text-2xl text-token mb-1">
                      Customer
                    </h2>

                    <p className="font-body text-sm text-muted mb-6">
                      Sign in to continue with your saved details.
                    </p>

                    {user ? (

                      <div className="flex items-center gap-4 p-4 border border-token bg-token-alt">

                        <span
                          className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-display text-xl"
                          style={{
                            color: 'var(--btn-text)',
                          }}
                        >
                          {(
                            user.fullName ??
                            user.username ??
                            'U'
                          ).charAt(0)}
                        </span>

                        <div>
                          <p className="font-display text-lg text-token">
                            {user.fullName ??
                              user.username}
                          </p>

                          <p className="font-body text-sm text-muted">
                            {user.email}
                          </p>
                        </div>

                        <Check
                          size={20}
                          className="ml-auto"
                          style={{
                            color:
                              'var(--anim-olive)',
                          }}
                        />

                      </div>

                    ) : (

                      <div className="text-center py-8">

                        <span
                          className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-token mb-4"
                          style={{
                            color:
                              'var(--anim-bronze)',
                          }}
                        >
                          <User
                            size={22}
                            strokeWidth={1.5}
                          />
                        </span>

                        <h3 className="font-display text-xl text-token">
                          Sign in to continue checkout
                        </h3>

                        <p className="font-body text-sm text-muted mt-2 max-w-sm mx-auto">
                          Your cart is saved. Sign in to use your saved addresses and measurements.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5">

                          <Link
                            to="/login"
                            state={{
                              from: '/checkout',
                            }}
                            className="btn-primary px-6 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2"
                          >
                            Sign In
                            <ArrowRight size={15} />
                          </Link>

                          <Link
                            to="/register"
                            state={{
                              from: '/checkout',
                            }}
                            className="btn-outline px-6 py-3 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2"
                          >
                            Create Account
                          </Link>

                        </div>

                      </div>

                    )}

                  </div>
                )}

                {/* ==================================================
                    STAGE 1 — ADDRESS
                ================================================== */}

                {stage === 1 && (
                  <div className="bg-surface border border-token p-6 md:p-8">

                    <div className="flex items-center justify-between mb-1">

                      <h2 className="font-display text-2xl text-token">
                        Shipping Address
                      </h2>

                      <button
                        onClick={() =>
                          setAddressModalOpen(true)
                        }
                        className="btn-outline px-4 py-2 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        Add
                      </button>

                    </div>

                    <p className="font-body text-sm text-muted mb-6">
                      Choose where to deliver your order.
                    </p>

                    {addresses.length === 0 ? (

                      <div className="text-center py-8 border border-token">

                        <p className="font-display text-lg text-token">
                          No saved addresses
                        </p>

                        <p className="font-body text-sm text-muted mt-1">
                          Add an address to continue.
                        </p>

                        <button
                          onClick={() =>
                            setAddressModalOpen(true)
                          }
                          className="btn-primary mt-4 px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-body inline-flex items-center gap-1.5"
                        >
                          <Plus size={14} />
                          Add Address
                        </button>

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {addresses.map((addr) => {

                          const selected =
                            selectedAddressId ===
                            addr.id;

                          return (
                            <button
                              key={addr.id}
                              onClick={() =>
                                setSelectedAddressId(
                                  addr.id
                                )
                              }
                              className={`w-full text-left p-4 border-2 transition-colors flex items-start gap-3 ${
                                selected
                                  ? 'border-primary'
                                  : 'border-token hover:border-primary'
                              }`}
                              style={
                                selected
                                  ? {
                                      borderColor:
                                        'var(--primary)',
                                    }
                                  : {}
                              }
                            >

                              <span
                                className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                                style={
                                  selected
                                    ? {
                                        borderColor:
                                          'var(--primary)',
                                      }
                                    : {
                                        borderColor:
                                          'var(--border)',
                                      }
                                }
                              >
                                {selected && (
                                  <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                      background:
                                        'var(--primary)',
                                    }}
                                  />
                                )}
                              </span>

                              <div className="flex-1 min-w-0">

                                <div className="flex items-center gap-2">

                                  <span className="font-display text-base text-token">
                                    {addr.fullName}
                                  </span>

                                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-body border border-token text-muted">
                                    {addr.type}
                                  </span>

                                  {addr.isDefault && (
                                    <span
                                      className="text-[10px] uppercase tracking-[0.15em] font-body"
                                      style={{
                                        color:
                                          'var(--anim-olive)',
                                      }}
                                    >
                                      Default
                                    </span>
                                  )}

                                </div>

                                <p className="font-body text-sm text-muted mt-1 leading-relaxed">
                                  {addr.line1}
                                  {addr.line2
                                    ? `, ${addr.line2}`
                                    : ''}
                                  , {addr.city},{' '}
                                  {addr.state} —{' '}
                                  {addr.pincode}
                                </p>

                                <p className="font-body text-xs text-muted mt-1">
                                  {addr.phone}
                                </p>

                              </div>

                              {!addr.isDefault && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDefaultAddress(
                                      addr.id
                                    );
                                  }}
                                  className="font-body text-xs uppercase tracking-[0.15em] text-muted hover:text-primary transition-colors"
                                >
                                  Set default
                                </span>
                              )}

                            </button>
                          );
                        })}

                      </div>
                    )}

                  </div>
                )}

                {/* ==================================================
                    STAGE 2 — MEASUREMENTS
                ================================================== */}

                {stage === 2 && (
                  <div className="bg-surface border border-token p-6 md:p-8">

                    <h2 className="font-display text-2xl text-token mb-1">
                      Fit &amp; Measurements
                    </h2>

                    <p className="font-body text-sm text-muted mb-6">
                      {hasCustomizable
                        ? "Your order includes customizable pieces. Choose how you'd like them to fit."
                        : 'Ready-made pieces use the sizes you selected. No measurements needed.'}
                    </p>

                    {!hasCustomizable ? (

                      <div className="flex items-center gap-3 p-4 border border-token bg-token-alt">

                        <Check
                          size={18}
                          style={{
                            color:
                              'var(--anim-olive)',
                          }}
                        />

                        <p className="font-body text-sm text-token">
                          Your selected sizes will be used. No measurements required for ready-made pieces.
                        </p>

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {hasMeasurements && (
                          <button
                            onClick={() =>
                              setUseMeasurements(
                                true
                              )
                            }
                            className={`w-full text-left p-4 border-2 transition-colors flex items-start gap-3 ${
                              useMeasurements
                                ? 'border-primary'
                                : 'border-token hover:border-primary'
                            }`}
                            style={
                              useMeasurements
                                ? {
                                    borderColor:
                                      'var(--primary)',
                                  }
                                : {}
                            }
                          >

                            <span
                              className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                              style={
                                useMeasurements
                                  ? {
                                      borderColor:
                                        'var(--primary)',
                                    }
                                  : {
                                      borderColor:
                                        'var(--border)',
                                    }
                              }
                            >
                              {useMeasurements && (
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{
                                    background:
                                      'var(--primary)',
                                  }}
                                />
                              )}
                            </span>

                            <div>
                              <p className="font-display text-base text-token">
                                Use my saved measurements
                              </p>

                              <p className="font-body text-sm text-muted mt-1">
                                Your measurement profile will be used for custom pieces.
                              </p>
                            </div>

                          </button>
                        )}

                        <button
                          onClick={() =>
                            setUseMeasurements(
                              false
                            )
                          }
                          className={`w-full text-left p-4 border-2 transition-colors flex items-start gap-3 ${
                            !useMeasurements
                              ? 'border-primary'
                              : 'border-token hover:border-primary'
                          }`}
                          style={
                            !useMeasurements
                              ? {
                                  borderColor:
                                    'var(--primary)',
                                }
                              : {}
                          }
                        >

                          <span
                            className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                            style={
                              !useMeasurements
                                ? {
                                    borderColor:
                                      'var(--primary)',
                                  }
                                : {
                                    borderColor:
                                      'var(--border)',
                                  }
                            }
                          >
                            {!useMeasurements && (
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  background:
                                    'var(--primary)',
                                }}
                              />
                            )}
                          </span>

                          <div className="flex-1">

                            <p className="font-display text-base text-token">
                              {hasMeasurements
                                ? 'Update measurements'
                                : 'Add measurements'}
                            </p>

                            <p className="font-body text-sm text-muted mt-1">
                              {hasMeasurements
                                ? 'Edit your measurement profile before placing this order.'
                                : 'Add your measurements for the best custom fit.'}
                            </p>

                            <Link
                              to="/account/measurements"
                              className="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.15em] text-primary mt-2"
                            >
                              Go to Measurements
                              <ArrowRight
                                size={13}
                              />
                            </Link>

                          </div>

                        </button>

                      </div>
                    )}

                  </div>
                )}

                {/* ==================================================
                    STAGE 3 — COUPON
                ================================================== */}

                {stage === 3 && (
                  <div className="bg-surface border border-token p-6 md:p-8">

                    <h2 className="font-display text-2xl text-token mb-1">
                      Apply Coupon
                    </h2>

                    <p className="font-body text-sm text-muted mb-6">
                      Save on your order with a valid coupon code.
                    </p>

                    {coupon &&
                    couponStatus === 'applied' ? (

                      <div
                        className="flex items-center justify-between p-4 border-2 border-token bg-token-alt"
                        style={{
                          borderColor:
                            'var(--anim-olive)',
                        }}
                      >

                        <div className="flex items-center gap-3">

                          <Tag
                            size={18}
                            style={{
                              color:
                                'var(--anim-olive)',
                            }}
                          />

                          <div>

                            <p className="font-display text-base text-token">
                              {coupon.code}
                            </p>

                            <p className="font-body text-xs text-muted">
                              {coupon.description} · You save{' '}
                              {formatPrice(
                                coupon.discountAmount
                              )}
                            </p>

                          </div>

                        </div>

                        <button
                          onClick={removeCoupon}
                          className="text-muted hover:text-primary transition-colors"
                          aria-label="Remove coupon"
                        >
                          <X size={18} />
                        </button>

                      </div>

                    ) : (

                      <div>

                        <div className="flex gap-2">

                          <input
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(
                                e.target.value
                              )
                            }
                            placeholder="Enter coupon code"
                            className="flex-1 px-4 py-3 bg-token-alt border border-token font-body text-base text-token outline-none focus:border-primary transition-colors uppercase tracking-wider"
                          />

                          <button
                            onClick={
                              handleApplyCoupon
                            }
                            disabled={
                              couponStatus ===
                                'loading' ||
                              !couponCode.trim()
                            }
                            className="btn-primary px-6 py-3 text-sm uppercase tracking-[0.2em] font-body disabled:opacity-60"
                          >
                            {couponStatus ===
                            'loading'
                              ? 'Applying…'
                              : 'Apply'}
                          </button>

                        </div>

                        {couponStatus ===
                          'error' && (
                          <motion.p
                            initial={{
                              opacity: 0,
                              y: -6,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            className="font-body text-xs mt-2"
                            style={{
                              color: '#c0392b',
                            }}
                          >
                            {couponError}
                          </motion.p>
                        )}

                        <div className="mt-5">

                          <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-2">
                            Try a demo code
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {[
                              'WELCOME10',
                              'FESTIVE500',
                              'BOUTIQUE15',
                            ].map((c) => (

                              <button
                                key={c}
                                onClick={() =>
                                  setCouponCode(c)
                                }
                                className="px-3 py-1.5 text-xs font-body border border-token text-token hover:border-primary hover:text-primary transition-colors"
                              >
                                {c}
                              </button>

                            ))}

                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* ==================================================
                    STAGE 4 — REVIEW
                ================================================== */}

                {stage === 4 && (
                  <div className="bg-surface border border-token p-6 md:p-8">

                    <h2 className="font-display text-2xl text-token mb-1">
                      Review Your Order
                    </h2>

                    <p className="font-body text-sm text-muted mb-6">
                      Please confirm everything is correct.
                    </p>

                    <ul className="space-y-3 mb-6">

                      {lines.map(
                        ({
                          item,
                          product,
                        }) => {

                          if (!product) {
                            return null;
                          }

                          return (
                            <li
                              key={`${item.productId}-${item.size}-${item.color}`}
                              className="flex gap-3 p-3 border border-token"
                            >

                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-20 object-cover bg-token-alt shrink-0"
                              />

                              <div className="flex-1 min-w-0">

                                <h3 className="font-display text-base text-token leading-snug line-clamp-1">
                                  {product.name}
                                </h3>

                                <p className="font-body text-xs text-muted mt-0.5">
                                  {item.size} ·{' '}
                                  {item.color} · Qty{' '}
                                  {item.quantity}
                                </p>

                                {product.customizable && (
                                  <p
                                    className="font-body text-xs mt-1"
                                    style={{
                                      color:
                                        'var(--anim-bronze)',
                                    }}
                                  >
                                    Customizable piece
                                  </p>
                                )}

                                <p className="font-body text-sm text-token font-medium mt-1">
                                  {formatPrice(
                                    product.price *
                                      item.quantity
                                  )}
                                </p>

                              </div>

                            </li>
                          );
                        }
                      )}

                    </ul>

                    <div className="space-y-3 border-t border-token pt-4">

                      <ReviewRow
                        label="Customer"
                        value={
                          user?.fullName ??
                          '—'
                        }
                      />

                      <ReviewRow
                        label="Shipping to"
                        value={
                          selectedAddress
                            ? `${selectedAddress.fullName}, ${selectedAddress.city}, ${selectedAddress.state} — ${selectedAddress.pincode}`
                            : '—'
                        }
                      />

                      <ReviewRow
                        label="Fit"
                        value={
                          hasCustomizable
                            ? useMeasurements
                              ? 'Using saved measurements'
                              : 'Measurements to be added'
                            : 'Ready-made sizes'
                        }
                      />

                      {coupon && (
                        <ReviewRow
                          label="Coupon"
                          value={`${coupon.code} (− ${formatPrice(
                            coupon.discountAmount
                          )})`}
                        />
                      )}

                    </div>

                  </div>
                )}

                {/* ==================================================
                    STAGE 5 — PAYMENT
                ================================================== */}

                {stage === 5 && (
                  <div className="bg-surface border border-token p-6 md:p-8">

                    <h2 className="font-display text-2xl text-token mb-1">
                      Payment Method
                    </h2>

                    <p className="font-body text-sm text-muted mb-6">
                      Choose how you'd like to pay. Payment processing arrives in the next phase.
                    </p>

                    {/* PAYMENT MODE */}

                    <div className="mb-6">

                      <p className="font-body text-xs uppercase tracking-[0.2em] text-muted mb-3">
                        Payment Option
                      </p>

                      <div className="grid sm:grid-cols-2 gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            setPaymentMode(
                              'full'
                            )
                          }
                          className={`text-left p-4 border-2 transition-colors ${
                            paymentMode ===
                            'full'
                              ? 'border-primary'
                              : 'border-token hover:border-primary'
                          }`}
                          style={
                            paymentMode ===
                            'full'
                              ? {
                                  borderColor:
                                    'var(--primary)',
                                }
                              : {}
                          }
                        >

                          <p className="font-display text-base text-token">
                            Full Payment
                          </p>

                          <p className="font-body text-xs text-muted mt-1">
                            Pay{' '}
                            {formatPrice(
                              total
                            )}{' '}
                            now
                          </p>

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setPaymentMode(
                              'advance'
                            )
                          }
                          className={`text-left p-4 border-2 transition-colors ${
                            paymentMode ===
                            'advance'
                              ? 'border-primary'
                              : 'border-token hover:border-primary'
                          }`}
                          style={
                            paymentMode ===
                            'advance'
                              ? {
                                  borderColor:
                                    'var(--primary)',
                                }
                              : {}
                          }
                        >

                          <p className="font-display text-base text-token">
                            Advance (50%)
                          </p>

                          <p className="font-body text-xs text-muted mt-1">
                            Pay{' '}
                            {formatPrice(
                              Math.round(
                                total / 2
                              )
                            )}{' '}
                            now, balance on delivery
                          </p>

                        </button>

                      </div>

                    </div>

                    {/* PAYMENT METHODS */}

                    <div className="space-y-3">

                      {paymentService
                        .getEnabledOptions()
                        .map((opt) => (

                          <PaymentOption
                            key={opt.method}
                            label={opt.label}
                            desc={
                              opt.description
                            }
                            icon={
                              opt.method ===
                              'upi'
                                ? Smartphone
                                : opt.method ===
                                  'card'
                                  ? CreditCard
                                  : Wallet
                            }
                            selected={
                              paymentMethod ===
                              opt.method
                            }
                            onSelect={() =>
                              setPaymentMethod(
                                opt.method
                              )
                            }
                          />

                        ))}

                    </div>

                    {/* AMOUNT SUMMARY */}

                    <div className="mt-6 p-4 border border-token bg-token-alt space-y-2 font-body text-sm">

                      <div className="flex justify-between">

                        <span className="text-muted">
                          Total Amount
                        </span>

                        <span className="text-token">
                          {formatPrice(
                            total
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-muted">
                          Amount to Pay Now
                        </span>

                        <span className="text-token font-medium">
                          {formatPrice(
                            paymentMode ===
                              'advance'
                              ? Math.round(
                                  total / 2
                                )
                              : total
                          )}
                        </span>

                      </div>

                      {paymentMode ===
                        'advance' && (

                        <div className="flex justify-between">

                          <span className="text-muted">
                            Balance (on delivery)
                          </span>

                          <span
                            style={{
                              color:
                                'var(--anim-bronze)',
                            }}
                          >
                            {formatPrice(
                              Math.round(
                                total / 2
                              )
                            )}
                          </span>

                        </div>

                      )}

                    </div>

                    <div className="flex items-center gap-2 mt-4 p-3 border border-token bg-token-alt">

                      <Lock
                        size={15}
                        className="text-muted"
                      />

                      <p className="font-body text-xs text-muted">
                        This is a development preview. No payment will be processed. Real gateway integration arrives in the next phase.
                      </p>

                    </div>

                    {/* ==================================================
                        CREATE ORDER
                    ================================================== */}

                    <button
                      onClick={async () => {

                        if (!paymentMethod) {
                          notify(
                            'Please select a payment method',
                            'info'
                          );
                          return;
                        }

                        if (!selectedAddress) {
                          notify(
                            'Please select a shipping address',
                            'info'
                          );
                          return;
                        }

                        setProcessing(true);

                        try {

                          const amountToPay =
                            paymentMode ===
                            'advance'
                              ? Math.round(
                                  total / 2
                                )
                              : total;

                          /*
                           * IMPORTANT:
                           *
                           * For every cart item:
                           *
                           * productId + size + color
                           *             ↓
                           * backend variant ID
                           *
                           * Example:
                           * chudi + XS + Cream
                           *             ↓
                           * variant 47
                           */

                          const orderItems: OrderItem[] =
                            await Promise.all(

                              lines.map(
                                async ({
                                  item,
                                  product,
                                }) => {

                                  if (!product) {
                                    throw new Error(
                                      'Missing product'
                                    );
                                  }

                                  const variantId =
                                    await getVariantId(
                                      product.id,
                                      item.size,
                                      item.color
                                    );

                                  /*
                                   * A variant is required for
                                   * normal catalog products.
                                   */
                                  if (!variantId) {
                                    throw new Error(
                                      `Unable to find variant for ${product.name} (${item.size} / ${item.color})`
                                    );
                                  }

                                  return {

                                    id: undefined,

                                    order:
                                      undefined,

                                    variant:
                                      variantId,

                                    itemType:
                                      'OTHERS',

                                    productId:
                                      product.id,

                                    productName:
                                      product.name,

                                    productImage:
                                      product.image,

                                    size:
                                      item.size,

                                    color:
                                      item.color,

                                    customizable:
                                      Boolean(
                                        product.customizable
                                      ),

                                    hasMeasurements:
                                      Boolean(
                                        product.customizable &&
                                        useMeasurements &&
                                        hasMeasurements
                                      ),

                                    quantity:
                                      item.quantity,

                                    unitPrice:
                                      product.price,

                                    subtotal:
                                      product.price *
                                      item.quantity,

                                    notes: [
                                      `Product: ${product.name}`,

                                      item.size
                                        ? `Size: ${item.size}`
                                        : '',

                                      item.color
                                        ? `Color: ${item.color}`
                                        : '',

                                      product.customizable &&
                                      useMeasurements &&
                                      hasMeasurements
                                        ? 'Measurements provided'
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join(
                                        ' | '
                                      ),
                                  };
                                }
                              )
                            );

                          /*
                           * Build the order.
                           *
                           * shippingAddress.id is important.
                           * orderService will convert it into:
                           *
                           * shipping_address_id
                           */

                          const order: Order = {

                            id: '',

                            orderNumber:
                              orderService.generateOrderNumber(),

                            orderDate:
                              new Date().toISOString(),

                            deliveryDate:
                              new Date(
                                Date.now() +
                                  14 *
                                    86400000
                              ).toISOString(),

                            boutique: 2,

                            items:
                              orderItems,

                            totalAmount:
                              total,

                            advancePaid:
                              amountToPay,

                            balanceAmount:
                              total -
                              amountToPay,

                            status:
                              'PENDING',

                            paymentStatus:
                              paymentMode ===
                              'advance'
                                ? 'PARTIALLY_PAID'
                                : 'PAID',

                            paymentMethod,

                            couponCode:
                              coupon?.code,

                            couponDiscount:
                              discount > 0
                                ? discount
                                : undefined,

                            deliveryCharge:
                              delivery,

                            /*
                             * IMPORTANT:
                             * Keep the complete selected
                             * address here.
                             *
                             * orderService extracts:
                             * selectedAddress.id
                             */

                            shippingAddress:
                              selectedAddress,

                            customerName:
                              user?.fullName ??
                              user?.username ??
                              '',

                            customerEmail:
                              user?.email ??
                              '',

                            createdAt:
                              new Date().toISOString(),

                            updatedAt:
                              new Date().toISOString(),
                          };

                          console.log(
                            'FINAL ORDER BEFORE CREATE:',
                            order
                          );

                          /*
                           * FIRST create the Django order.
                           */

                          let createdOrder =
                            createdOrderRef.current;

                          if (!createdOrder) {

                            createdOrder =
                              await createOrder(
                                order
                              );

                            createdOrderRef.current =
                              createdOrder;
                          }

                          /*
                           * Use the SAME order for payment/retry.
                           */

                          await paymentService.processPayment(
                            {
                              orderId:
                                String(
                                  createdOrder.id
                                ),

                              amount:
                                amountToPay,

                              method:
                                paymentMethod,

                              isAdvance:
                                paymentMode ===
                                'advance',
                            }
                          );

                          clearCart();

                          notify(
                            'Payment completed',
                            'info'
                          );

                          navigate(
                            `/order-confirmation/${createdOrder.id}`
                          );

                        } catch (error) {

                          console.error(
                            'ORDER CREATION ERROR:',
                            error
                          );

                          const message =
                            error instanceof
                            Error
                              ? error.message
                              : 'Unable to complete payment';

                          notify(
                            message,
                            'remove'
                          );

                        } finally {

                          setProcessing(
                            false
                          );
                        }

                      }}
                      disabled={
                        !paymentMethod ||
                        processing
                      }
                      className="btn-primary w-full mt-6 py-3.5 text-sm uppercase tracking-[0.2em] font-body inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >

                      {processing ? (
                        'Processing…'
                      ) : (
                        <>
                          <Lock
                            size={15}
                          />
                          Continue to Payment
                        </>
                      )}

                    </button>

                  </div>
                )}

              </motion.div>

            </AnimatePresence>

            {/* ==================================================
                NAV BUTTONS
            ================================================== */}

            {stage < 5 && (

              <div className="flex items-center justify-between mt-6">

                {stage > 0 ? (

                  <button
                    onClick={back}
                    className="btn-outline px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2"
                  >
                    <ArrowLeft
                      size={14}
                    />
                    Back
                  </button>

                ) : (
                  <span />
                )}

                <button
                  onClick={next}
                  className="btn-primary px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2"
                >
                  Continue
                  <ArrowRight
                    size={14}
                  />
                </button>

              </div>

            )}

            {stage === 5 && (

              <div className="mt-6">

                <button
                  onClick={back}
                  className="btn-outline px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-body inline-flex items-center gap-2"
                >
                  <ArrowLeft
                    size={14}
                  />
                  Back
                </button>

              </div>

            )}

          </div>

          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <aside className="lg:sticky lg:top-24 self-start">

            <OrderSummary
              cart={cart}
              coupon={coupon}
              deliveryCharge={delivery}
              freeDeliveryThreshold={
                DELIVERY_THRESHOLD
              }
            />

          </aside>

        </div>

      </div>

      {/* ==================================================
          ADDRESS MODAL
      ================================================== */}

      <AddressModal
        open={addressModalOpen}
        onClose={() =>
          setAddressModalOpen(false)
        }
        onSubmit={async (addr) => {
          await addAddress(addr);

          notify(
            'Address added',
            'info'
          );
        }}
        title="Add Address"
      />

    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4">

      <span className="font-body text-sm text-muted shrink-0">
        {label}
      </span>

      <span className="font-body text-sm text-token text-right">
        {value}
      </span>

    </div>
  );
}

function PaymentOption({
  label,
  desc,
  icon: Icon,
  selected,
  onSelect,
}: {
  label: string;
  desc: string;
  icon: typeof CreditCard;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 border-2 transition-colors flex items-center gap-4 ${
        selected
          ? 'border-primary'
          : 'border-token hover:border-primary'
      }`}
      style={
        selected
          ? {
              borderColor:
                'var(--primary)',
            }
          : {}
      }
    >

      <span
        className="h-10 w-10 flex items-center justify-center border border-token shrink-0"
        style={{
          color:
            'var(--anim-bronze)',
        }}
      >
        <Icon
          size={18}
          strokeWidth={1.6}
        />
      </span>

      <div className="flex-1">

        <p className="font-display text-base text-token">
          {label}
        </p>

        <p className="font-body text-xs text-muted">
          {desc}
        </p>

      </div>

      <span
        className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0"
        style={
          selected
            ? {
                borderColor:
                  'var(--primary)',
              }
            : {
                borderColor:
                  'var(--border)',
              }
        }
      >
        {selected && (
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background:
                'var(--primary)',
            }}
          />
        )}
      </span>

    </button>
  );
}