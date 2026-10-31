export interface Project {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  liveLink: string;
  githubLink?: string;
  assignTo?: string;
  type?: string;
  status?: string;
  orderId?: string;
  clientName?: string;
  profileName?: string;
  achievementValue?: number;
  totalProjectValue?: number;
  developerName?: string;
  docLink?: string;
  hasCaseStudy?: boolean;
}

export interface Service {
  _id?: string;
  title: string;
  desc: string;
  icon: string;
  tags?: string[];
}

export interface Skill {
  _id?: string;
  name: string;
  level: number;
  category: string;
  logoLink?: string;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export interface Review {
  _id?: string;
  clientName: string;
  description: string;
  rating: number; // 1-5
}

export interface AdminProfile {
  _id?: string;
  image: string;
  bio: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    facebook?: string;
    whatsapp?: string;
    messenger?: string;
  };
}

export interface Stat {
  label: string;
  value: string;
}

export interface HeroContent {
  _id?: string;
  badgeText: string;
  firstName: string;
  lastName: string;
  subheading: string;
  description: string;
  cvLink: string;
  codeSnippet: string;
  stats: { num: string; label: string; suffix?: string }[];
  socials: {
    facebook: string;
    linkedin: string;
    github: string;
    email: string;
  };
}

export interface GalleryItem {
  _id?: string;
  imageUrl: string;
}

export type StoreCategory = 
  | 'WordPress Themes' 
  | 'WordPress Plugins' 
  | 'Elementor Templates' 
  | 'Website Templates' 
  | 'UI Kits & Components' 
  | 'Canva Templates';

export interface DownloadableFile {
  name: string;
  url: string;
  size?: string;
}

export interface StoreProduct {
  _id?: string;
  id?: string;
  shopName?: string;
  title: string;
  slug: string;
  productCode?: string;
  sourceCodeZip?: string;
  sourceCodeVersion?: string;
  downloadFileName?: string;
  downloadInstructions?: string;
  productLicense?: string;
  downloadEnabled?: boolean;
  shortDescription: string;
  description: string;
  category: StoreCategory | string;
  thumbnail: string;
  galleryImages?: string[];
  demoImages?: string[];
  liveLink?: string;
  githubRepoUrl?: string;
  sourceCodeZipUrl?: string;
  price: number;
  discountPrice?: number;
  downloadableFiles?: DownloadableFile[];
  status: 'Published' | 'Draft' | 'Out of Stock';
  featured?: boolean;
  features?: string[];
  tags?: string[];
  salesCount?: number;
  rating?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface StoreUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt?: string | Date;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export type PaymentMethodType = 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'aamarpay' | 'card';
export type PaymentStatusType = 'Pending Payment' | 'Pending Verification' | 'Paid' | 'Rejected' | 'Refunded';
export type OrderStatusType = 'Pending Payment' | 'Pending Verification' | 'Paid' | 'Rejected' | 'Processing' | 'Delivered' | 'Refunded';

export interface OrderDeliveryHistoryItem {
  deliveredAt: string | Date;
  deliveredBy: string;
  method: 'automatic' | 'manual';
  recipientEmail: string;
  downloadLink?: string;
  status: string;
  notes?: string;
}

export interface OrderVerificationLogItem {
  action: string;
  adminUser: string;
  timestamp: string | Date;
  notes?: string;
}

export interface StoreOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  userId?: string;
  customer: OrderCustomerInfo;
  items: Array<{
    productId: string;
    title: string;
    slug: string;
    productCode?: string;
    price: number;
    thumbnail: string;
    downloadableFiles?: DownloadableFile[];
    githubRepoUrl?: string;
    sourceCodeZip?: string;
    sourceCodeZipUrl?: string;
    sourceCodeVersion?: string;
    downloadFileName?: string;
    downloadInstructions?: string;
    productLicense?: string;
  }>;
  subtotal: number;
  discount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatusType;
  paymentDetails: {
    senderNumber?: string;
    transactionId?: string;
    screenshotUrl?: string;
    gatewayResponse?: any;
    paidAt?: string | Date;
  };
  orderStatus: OrderStatusType;
  downloadToken?: string;
  downloadAccess?: boolean;
  downloadCount?: number;
  downloadLimit?: number;
  tokenExpiry?: string | Date;
  adminNotes?: string;
  githubCodeDelivered?: boolean;
  deliveredGithubLink?: string;
  deliveredZipUrl?: string;
  deliveredAt?: string | Date;
  emailDeliveryStatus?: 'Sent' | 'Failed' | 'Pending';
  emailDeliveryLog?: string;
  deliveryHistory?: OrderDeliveryHistoryItem[];
  verificationLogs?: OrderVerificationLogItem[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface StoreSettings {
  _id?: string;
  storeName: string;
  storeLogo?: string;
  storeDescription: string;
  currency: 'BDT' | 'USD';
  announcement?: string;
  bkash: {
    number: string;
    qrImage: string;
    instructions: string;
    enabled: boolean;
  };
  nagad: {
    number: string;
    qrImage: string;
    instructions: string;
    enabled: boolean;
  };
  rocket: {
    number: string;
    qrImage: string;
    instructions: string;
    enabled: boolean;
  };
  manualPaymentEnabled: boolean;
  gateway: {
    provider: 'sslcommerz' | 'aamarpay' | 'disabled';
    isLive: boolean;
    storeId: string;
    storePassword?: string;
  };
}