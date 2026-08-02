import type {
  SleeveType,
  NeckType,
  MeasurementFieldDef,
  Coupon,
  NotificationItem,
  ReviewItem,
  CustomerProfile,
  ShippingAddress,
  MeasurementVideo,
} from '@/types';

/**
 * Temporary demo data for the customer account & pre-order journey.
 * NOT real boutique data. Replaced by Django REST responses in a later phase.
 * Keep this isolated so service modules can swap mock -> API without touching UI.
 */

// ---------- Measurement definitions ----------
// Field definitions are centralized so the UI can render them dynamically.
// Later these come from Django MeasurementMaster / CommonMeasurement APIs.

const inchField = (id: string, label: string, helper: string, guideKey: string): MeasurementFieldDef => ({
  id,
  label,
  unit: 'in',
  helper,
  guideKey,
});

export const COMMON_MEASUREMENT_FIELDS: MeasurementFieldDef[] = [
  inchField('bust', 'Bust', 'Measure around the fullest part of your bust.', 'guide-bust'),
  inchField('waist', 'Waist', 'Measure around your natural waistline.', 'guide-waist'),
  inchField('hip', 'Hip', 'Measure around the fullest part of your hips.', 'guide-hip'),
  inchField('shoulder', 'Shoulder', 'Measure across from shoulder edge to edge.', 'guide-shoulder'),
  inchField('garment_length', 'Garment Length', 'From shoulder seam to desired hem.', 'guide-length'),
];

export const SLEEVE_TYPES: SleeveType[] = [
  {
    id: 'sleeveless',
    name: 'Sleeveless',
    description: 'No sleeve — armhole finished with a facing or binding.',
    illustration: 'sleeveless',
    measurementFields: [],
  },
  {
    id: 'short',
    name: 'Short Sleeve',
    description: 'Sleeve ending above the elbow.',
    illustration: 'short',
    measurementFields: [
      inchField('sleeve_length_short', 'Sleeve Length', 'From shoulder seam to desired sleeve hem.', 'guide-sleeve-short'),
      inchField('armhole_round', 'Armhole Round', 'Around the armhole at the shoulder.', 'guide-armhole'),
      inchField('bicep_round_short', 'Bicep Round', 'Around the fullest part of the upper arm.', 'guide-bicep'),
    ],
  },
  {
    id: 'elbow',
    name: 'Elbow Sleeve',
    description: 'Sleeve ending at the elbow.',
    illustration: 'elbow',
    measurementFields: [
      inchField('sleeve_length_elbow', 'Sleeve Length', 'From shoulder seam to elbow.', 'guide-sleeve-elbow'),
      inchField('armhole_round_elbow', 'Armhole Round', 'Around the armhole at the shoulder.', 'guide-armhole'),
      inchField('bicep_round_elbow', 'Bicep Round', 'Around the fullest part of the upper arm.', 'guide-bicep'),
      inchField('elbow_round', 'Elbow Round', 'Around the elbow.', 'guide-elbow-round'),
    ],
  },
  {
    id: 'three-quarter',
    name: 'Three-Quarter Sleeve',
    description: 'Sleeve ending between elbow and wrist.',
    illustration: 'three-quarter',
    measurementFields: [
      inchField('sleeve_length_3q', 'Sleeve Length', 'From shoulder seam to desired 3/4 hem.', 'guide-sleeve-3q'),
      inchField('armhole_round_3q', 'Armhole Round', 'Around the armhole at the shoulder.', 'guide-armhole'),
      inchField('bicep_round_3q', 'Bicep Round', 'Around the fullest part of the upper arm.', 'guide-bicep'),
      inchField('forearm_round', 'Forearm Round', 'Around the forearm at the sleeve hem.', 'guide-forearm'),
      inchField('cuff_opening_3q', 'Cuff Opening', 'Around the wrist / sleeve opening.', 'guide-cuff'),
    ],
  },
  {
    id: 'full',
    name: 'Full Sleeve',
    description: 'Sleeve ending at the wrist.',
    illustration: 'full',
    measurementFields: [
      inchField('sleeve_length_full', 'Sleeve Length', 'From shoulder seam to wrist.', 'guide-sleeve-full'),
      inchField('armhole_round_full', 'Armhole Round', 'Around the armhole at the shoulder.', 'guide-armhole'),
      inchField('bicep_round_full', 'Bicep Round', 'Around the fullest part of the upper arm.', 'guide-bicep'),
      inchField('forearm_round_full', 'Forearm Round', 'Around the forearm.', 'guide-forearm'),
      inchField('wrist_round', 'Wrist Round', 'Around the wrist.', 'guide-wrist'),
      inchField('cuff_opening_full', 'Cuff Opening', 'Opening at the cuff.', 'guide-cuff'),
    ],
  },
];

export const NECK_TYPES: NeckType[] = [
  {
    id: 'round',
    name: 'Round Neck',
    description: 'A smooth, curved neckline.',
    illustration: 'round',
    measurementFields: [
      inchField('neck_depth_round', 'Neck Depth', 'From base of throat down to the lowest point of the neckline.', 'guide-neck-depth'),
      inchField('neck_width_round', 'Neck Width', 'Across the neckline from shoulder to shoulder.', 'guide-neck-width'),
    ],
  },
  {
    id: 'v',
    name: 'V Neck',
    description: 'A neckline dipping into a V shape.',
    illustration: 'v',
    measurementFields: [
      inchField('neck_depth_v', 'Neck Depth', 'From base of throat to the point of the V.', 'guide-neck-depth'),
      inchField('neck_width_v', 'Neck Width', 'Across the neckline from shoulder to shoulder.', 'guide-neck-width'),
    ],
  },
  {
    id: 'square',
    name: 'Square Neck',
    description: 'A geometric, squared neckline.',
    illustration: 'square',
    measurementFields: [
      inchField('neck_depth_square', 'Neck Depth', 'From base of throat to the lower edge.', 'guide-neck-depth'),
      inchField('neck_width_square', 'Neck Width', 'Across the neckline from shoulder to shoulder.', 'guide-neck-width'),
    ],
  },
  {
    id: 'boat',
    name: 'Boat Neck',
    description: 'A wide, gently curved neckline.',
    illustration: 'boat',
    measurementFields: [
      inchField('neck_width_boat', 'Neck Width', 'Across the full neckline from shoulder to shoulder.', 'guide-neck-width'),
      inchField('neck_depth_boat', 'Neck Depth', 'Shallow depth from base of throat.', 'guide-neck-depth'),
    ],
  },
  {
    id: 'high',
    name: 'High Neck',
    description: 'A close-fitting neckline that sits higher.',
    illustration: 'high',
    measurementFields: [
      inchField('neck_depth_high', 'Neck Depth', 'From base of throat to the neckline edge.', 'guide-neck-depth'),
      inchField('neck_width_high', 'Neck Width', 'Across the neckline.', 'guide-neck-width'),
      inchField('neck_round_high', 'Neck Round', 'Full round of the neck at the collar.', 'guide-neck-round'),
    ],
  },
];

export const MEASUREMENT_VIDEOS: MeasurementVideo[] = [
  {
    id: 'mv-1',
    title: 'How to Measure — Bust, Waist & Hip',
    description: 'A short visual guide to taking the three most important body measurements accurately.',
    thumbnail: 'guide-bust',
    duration: '3:24',
  },
  {
    id: 'mv-2',
    title: 'Sleeve & Armhole Measurements',
    description: 'Demonstrates how to measure sleeve length, armhole and bicep for different sleeve styles.',
    thumbnail: 'guide-sleeve-full',
    duration: '4:10',
  },
  {
    id: 'mv-3',
    title: 'Neckline Measurements',
    description: 'How to measure neck depth and width for round, V, square and high necks.',
    thumbnail: 'guide-neck-depth',
    duration: '2:48',
  },
];

// ---------- Coupons (demo logic only) ----------

export const DEMO_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    type: 'percent',
    value: 10,
    minSubtotal: 1500,
  },
  {
    code: 'FESTIVE500',
    description: '₹500 off on orders above ₹5,000',
    type: 'flat',
    value: 500,
    minSubtotal: 5000,
  },
  {
    code: 'BOUTIQUE15',
    description: '15% off boutique creations',
    type: 'percent',
    value: 15,
    minSubtotal: 3000,
  },
];

// ---------- Notifications ----------

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'production',
    title: 'Your order is being crafted',
    message: 'Order SHR-2025-1042 is now in progress at our atelier.',
    read: false,
    createdAt: '2025-10-30T09:00:00Z',
    action: { label: 'Track Order', to: '/account/orders/ord-1/track' },
  },
  {
    id: 'n2',
    type: 'delivery',
    title: 'Order delivered',
    message: 'Order SHR-2025-1038 has been delivered. Share your experience!',
    read: false,
    createdAt: '2025-10-22T16:00:00Z',
    action: { label: 'Write Review', to: '/account/reviews' },
  },
  {
    id: 'n3',
    type: 'payment',
    title: 'Payment received',
    message: 'We received your advance payment for order SHR-2025-1042.',
    read: false,
    createdAt: '2025-10-28T15:00:00Z',
    action: { label: 'View Order', to: '/account/orders/ord-1' },
  },
  {
    id: 'n4',
    type: 'promotion',
    title: 'Festive collection now live',
    message: 'Explore our new Traditional edit — Kanjeevaram silks and temple borders.',
    read: true,
    createdAt: '2025-11-02T08:00:00Z',
    action: { label: 'Shop Now', to: '/collections/traditional' },
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Welcome to Shreemithra',
    message: 'Your account is ready. Add your measurements and address to make checkout effortless.',
    read: true,
    createdAt: '2025-10-30T12:00:00Z',
  },
];

// ---------- Reviews ----------

export const DEMO_REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    productId: 4,
    productName: 'Embroidered Lehenga Choli',
    productImage: 'https://images.pexels.com/photos/1445665/pexels-photo-1445665.jpeg?auto=compress&cs=tinysrgb&w=900',
    rating: 5,
    title: 'Absolutely stunning',
    body: 'The embroidery is even more beautiful in person. Perfect fit and the team was wonderful to work with.',
    createdAt: '2025-10-20T00:00:00Z',
    status: 'published',
  },
  {
    id: 'r2',
    productId: 1,
    productName: 'Kanjeevaram Silk Saree — Peacock Motif',
    productImage: 'https://images.pexels.com/photos/1104145/pexels-photo-1104145.jpeg?auto=compress&cs=tinysrgb&w=900',
    rating: 4,
    title: 'Heirloom quality',
    body: 'Genuine silk and the zari work is exquisite. Took a little longer to arrive but well worth it.',
    createdAt: '2025-10-12T00:00:00Z',
    status: 'published',
  },
];

// ---------- Demo customer profile & address ----------

export const DEMO_PROFILE: CustomerProfile = {
  id: 1,
  fullName: 'Ananya Krishnan',
  email: 'ananya@example.com',
  phone: '+91 98765 43210',
  dob: '1992-04-18',
  gender: 'female',
};

export const DEMO_ADDRESSES: ShippingAddress[] = [
  {
    id: 'addr-1',
    fullName: 'Ananya Krishnan',
    phone: '+91 98765 43210',
    line1: '12, Brindavan Terrace, 3rd Cross',
    line2: 'Jayanagar 4th Block',
    landmark: 'Near Jayanagar Metro',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560011',
    country: 'India',
    type: 'Home',
    isDefault: true,
  },
];

export const DEMO_MEASUREMENTS_UPDATED = '2025-11-04T10:20:00Z';
