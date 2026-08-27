// =========================================================
// Phase 3 — Customer Account & Pre-Order Journey Types
// Shapes mirror expected Django REST responses for clean swap-in.
// =========================================================

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSize {
  label: string;
  inStock: boolean;
}

// ---------- Product Variants ----------

export interface ProductVariant {
  id: number;
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
  isActive?: boolean;
  design?: number;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export type ProductBadge =
  | 'New'
  | 'Bestseller'
  | 'Limited'
  | 'Custom';

export type ProductCategory =
  | 'Traditional'
  | 'Western'
  | 'Ethnic'
  | 'Party Wear'
  | 'Casual Wear'
  | 'Boutique Creation';

export interface Product {
  id: number;
  name: string;
  description: string;

  category: ProductCategory;
  collection: string;

  images: ProductImage[];
  image: string;

  price: number;
  originalPrice?: number;

  sizes: ProductSize[];
  colors: ProductColor[];

  // Backend DesignVariant data
  variants?: ProductVariant[];

  stock: number;

  rating: number;
  reviewCount: number;

  featured?: boolean;
  newArrival?: boolean;
  customizable?: boolean;
  active?: boolean;

  badge?: ProductBadge;

  createdAt: string;
  popularity: number;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;

  image: string;

  itemCount: number;

  pattern:
    | 'kolam'
    | 'slant'
    | 'textile'
    | 'shimmer'
    | 'casual'
    | 'editorial';
}

export interface NavItem {
  label: string;
  path: string;
}

// ---------- Auth ----------

export type UserRole =
  | 'customer'
  | 'owner'
  | 'admin';

export interface AuthUser {
  id: number;
  username?: string;
  fullName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

// ---------- Customer Profile ----------

export type Gender =
  | 'MALE'
  | 'FEMALE'
  | 'OTHER';

export interface CustomerProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  profile_image_url?: string;
  gender?: Gender;
  avatar?: string;
}

// ---------- Addresses ----------

export type AddressType =
  | 'Home'
  | 'Work'
  | 'Other';

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: AddressType;
  isDefault: boolean;
}

// ---------- Measurements ----------

export interface SleeveType {
  id: string;
  name: string;
  description: string;
  illustration: string;
  measurementFields: MeasurementFieldDef[];
}

export interface NeckType {
  id: string;
  name: string;
  description: string;
  illustration: string;
  measurementFields: MeasurementFieldDef[];
}

export interface MeasurementFieldDef {
  id: string;
  label: string;
  unit: string;
  helper: string;
  guideKey: string;
}

export interface MeasurementValue {
  fieldId: string;
  value: string;
}

export interface CustomerMeasurement {
  sleeveTypeId: string | null;
  neckTypeId: string | null;
  common: MeasurementValue[];
  sleeve: MeasurementValue[];
  neck: MeasurementValue[];
  updatedAt: string;
}

export interface MeasurementVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
}

// ---------- Coupons ----------

export type CouponStatus =
  | 'idle'
  | 'applied'
  | 'invalid'
  | 'expired';

export interface Coupon {
  code: string;
  description: string;
  type: 'percent' | 'flat';
  value: number;
  minSubtotal?: number;
  expiresAt?: string;
}

export interface AppliedCoupon {
  code: string;
  description: string;
  discountAmount: number;
}

// ---------- Notifications ----------

export type NotificationType =
  | 'order'
  | 'payment'
  | 'production'
  | 'delivery'
  | 'review'
  | 'measurement'
  | 'promotion'
  | 'system';

export interface NotificationAction {
  label: string;
  to: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: NotificationAction;
}

// ---------- Reviews ----------

export interface ReviewMedia {
  id: string;
  name: string;
  preview: string;
}

export interface ReviewItem {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  status: 'published' | 'pending';
  media?: ReviewMedia[];
}

// ---------- Orders ----------

export type OrderStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'FAILED';

export type PaymentMethod =
  | 'upi'
  | 'card'
  | 'cod';

export interface OrderItem {
  id?: number;

  // Backend order item
  order?: number;
  variant?: number | null;
  itemType: string;

  // Product information
  productId?: number;
  productName?: string;
  productImage?: string;

  // Selected product options
  size?: string;
  color?: string;

  // Customization information
  customizable?: boolean;
  hasMeasurements?: boolean;

  // Quantity and pricing
  quantity: number;
  unitPrice: number;
  subtotal?: number;

  // Additional information
  notes?: string;
}

export interface Order {
  id: string;

  orderNumber: string;

  orderDate: string;

  deliveryDate?: string;

  boutique: number;

  items: OrderItem[];

  totalAmount: number;

  advancePaid: number;

  balanceAmount: number;

  status: OrderStatus;

  paymentStatus: PaymentStatus;

  paymentMethod?: PaymentMethod;

  couponCode?: string;

  couponDiscount?: number;

  deliveryCharge: number;

  shippingAddress: ShippingAddress;

  customerName: string;

  customerEmail: string;

  notes?: string;

  cancellationReason?: string;

  createdAt: string;

  updatedAt: string;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  label: string;
  description: string;
  timestamp?: string;
}

// ---------- Owner / Admin ----------

export interface OwnerUser {
  id: number;
  fullName: string;
  email: string;
  role: 'owner' | 'admin';
}

export interface BoutiqueProfile {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email: string;

  line1: string;
  line2?: string;

  city: string;
  state: string;
  pincode: string;

  description: string;

  openingTime: string;
  closingTime: string;

  active: boolean;

  logo?: string;
}

export interface OwnerProduct {
  id: number;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  customizable: boolean;
  active: boolean;
  image: string;
  createdAt: string;
}

export interface OwnerCustomer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
  addressCount: number;
  measurementsCount: number;
  paymentHistoryCount: number;
}

// ---------- Employees ----------

export type EmployeeRole =
  | 'Tailor'
  | 'Designer'
  | 'Reception'
  | 'Delivery Staff';

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  active: boolean;
  joinedAt: string;
  assignedOrders: number;
}

// ---------- Production ----------

export type ProductionStatus =
  | 'Pending'
  | 'Designing'
  | 'Cutting'
  | 'Stitching'
  | 'Embroidery'
  | 'Quality Check'
  | 'Ready'
  | 'Delivered';

export interface ProductionItem {
  id: number;
  orderId: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  productImage: string;
  status: ProductionStatus;

  tailorId: number | null;
  tailorName: string | null;

  designerId: number | null;
  designerName: string | null;

  updatedAt: string;
}

// ---------- Payments ----------

export type PaymentType =
  | 'Full Payment'
  | 'Advance Payment'
  | 'Balance Payment';

export type PaymentState =
  | 'Paid'
  | 'Pending'
  | 'Refunded';

export interface PaymentRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  type: PaymentType;
  state: PaymentState;
  method: PaymentMethod | 'cod';
  date: string;
}

// ---------- Reviews (Owner moderation) ----------

export interface OwnerReview {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  hidden: boolean;
  reply?: string;
  repliedAt?: string;
}

// ---------- Reports / Stats ----------

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalEmployees: number;
  lowStockCount: number;
  pendingProduction: number;
  pendingPayments: number;
  totalProducts: number;
  totalReviews: number;
  totalNotifications: number;
  
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

export interface ReportsData {
  revenueSeries: MonthlyPoint[];
  ordersSeries: MonthlyPoint[];
  customersSeries: MonthlyPoint[];

  totalRevenue: number;

  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

export interface CustomerDetail {
  customer: OwnerCustomer;
  orders: Order[];
  measurements: CustomerMeasurement | null;
  addresses: ShippingAddress[];
  payments: PaymentRecord[];
}

// ---------- Notifications (Owner) ----------

export type OwnerNotificationType =
  | 'broadcast'
  | 'order'
  | 'payment'
  | 'production';

export interface OwnerNotification {
  id: string;
  type: OwnerNotificationType;
  title: string;
  message: string;
  audience: 'all' | 'order';
  sentAt: string;
  read?: boolean;
}