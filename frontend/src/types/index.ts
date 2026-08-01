// ============================================================
// TypeScript interfaces matching backend Mongoose models
// ============================================================

export interface ISiteSettings {
  _id: string;
  siteName: string;
  siteLogo?: string;
  favicon?: string;
  metaTitle: string;
  metaDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  safetyCheckboxText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IThemeSettings {
  _id: string;
  activePreset: 'futuristic-blue' | 'luxury-dark' | 'clean-white' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: number;
  glassmorphismIntensity: number;
  createdAt: string;
  updatedAt: string;
}

export interface IHeroSlide {
  _id: string;
  heading: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayOpacity: number;
  includesList: string[];
  ctaText?: string;
  ctaLink?: string;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IService {
  _id: string;
  title: string;
  description: string;
  duration?: string;
  locationType: 'Public' | 'Virtual' | 'Flexible';
  image?: string;
  video?: string;
  thumbnail?: string;
  whatsIncluded: string[];
  buttonText: string;
  buttonLink?: string;
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFAQ {
  _id: string;
  question: string;
  answer: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITestimonial {
  _id: string;
  reviewerName: string;
  location?: string;
  reviewText: string;
  rating?: number;
  image?: string;
  isVerified: boolean;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICity {
  _id: string;
  cityName: string;
  state: string;
  country: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface IContactInquiry {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  serviceType: string;
  preferredDate?: string;
  message: string;
  safetyConfirmed: boolean;
  status: 'new' | 'reviewed' | 'contacted' | 'closed' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICompanionApplication {
  _id: string;
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  experience: string;
  whyJoin: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILegalPage {
  _id: string;
  slug: 'safety-policy' | 'terms-of-service' | 'privacy-policy' | 'refund-policy';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISocialLink {
  _id: string;
  platform: string;
  url: string;
  iconIdentifier: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface IHowItWorksStep {
  _id: string;
  stepNumber: number;
  title: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface IMedia {
  _id: string;
  originalFilename: string;
  storedFilename: string;
  fileType: 'image' | 'video';
  mimeType: string;
  fileSize: number;
  storagePath: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Generic API response wrappers
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    message: string;
    field?: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
