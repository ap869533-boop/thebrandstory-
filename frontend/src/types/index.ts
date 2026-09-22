export type UserRole = 'GUEST' | 'CREATOR' | 'BRAND' | 'ADMIN' | 'SALES';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  company_name?: string;
  phone?: string;
  gstNumber?: string;
  industry?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  avatar?: string;
  creatorProfile?: any; // Full creator profile object, populated after signup/login
}


export interface SocialPlatformInfo {
  platform: 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'snapchat';
  username: string;
  url: string;
  followers: number;
  avgViews: number;
  verified: boolean;
}

export interface PricingService {
  name: string;
  price: number;
  unit: string;
  description?: string;
}

export interface CreatorPricing {
  startingPrice?: number;
  reelPrice?: number;
  storyPrice?: number;
  postPrice?: number;
  ugcPrice?: number;
  youtubePrice?: number;
  eventPrice?: number;
  isNegotiable: boolean;
  isBarterAvailable: boolean;
  pricingDisplayType: 'exact' | 'starting' | 'contact' | 'barter_only';
  customServices?: PricingService[];
}

export interface AudienceCity {
  city: string;
  percentage: number;
}

export interface AudienceAge {
  bracket: string;
  percentage: number;
}

export interface AudienceGender {
  gender: 'Female' | 'Male' | 'Other';
  percentage: number;
}

export interface CreatorAudience {
  topCities: AudienceCity[];
  topCountries: { country: string; percentage: number }[];
  ageGroups: AudienceAge[];
  genderSplit: AudienceGender[];
  topInterests: string[];
  avgReach: number;
  avgImpressions: number;
}

export interface PortfolioItem {
  id: string;
  type: 'reel' | 'post' | 'youtube' | 'ugc' | 'brand_work';
  title: string;
  thumbnail: string;
  url?: string;
  views?: number;
  likes?: number;
  plays?: string | number;
  engagement?: string;
  comments?: string | number;
  brandName?: string;
}

export interface BrandCollaboration {
  id: string;
  brandName: string;
  brandLogo?: string;
  campaignType: string;
  contentType: string;
  year: string;
  verified: boolean;
}

export interface BrandReview {
  id: string;
  brandName: string;
  brandLogo?: string;
  rating: number; // 1-5
  reviewText: string;
  campaignType: string;
  date: string;
  verifiedCollaboration: boolean;
  reviewerName?: string;
  ratingsBreakdown?: {
    communication: number;
    professionalism: number;
    contentQuality: number;
    timeliness: number;
    overall: number;
  };
}

export interface TrustSignals {
  profileCompleteness: number; // 0-100
  phoneVerified: boolean;
  emailVerified: boolean;
  socialVerified: boolean;
  engagementQuality: number; // 0-100
  audienceQuality: number; // 0-100
  collaborationHistoryScore: number; // 0-100
  verifiedReviewsCount: number;
  responseRate: number; // e.g. 95%
  campaignReliability: number; // 0-100
  accountActivityScore: number; // 0-100
}

export interface Creator {
  id: string;
  name: string;
  username: string; // e.g. "priyasharma"
  avatar: string;
  coverImage?: string;
  reelVideoUrl?: string; // New field for background autoplay video
  bio: string;
  currentCity: string;
  state: string;
  preferredCities: string[];
  primaryCategory: string;
  subCategories: string[];
  languages: string[];
  gender?: 'Female' | 'Male' | 'Non-binary';
  ageGroup?: string;
  
  // Metrics
  followers: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  totalPosts?: number;
  brandCollaborationsCount: number;
  
  // Trust
  trustScore?: number; // 0-100
  trustSignals?: TrustSignals;
  isVerified: boolean;
  verificationRequested?: boolean;
  verificationStepsCompleted: string[];
  
  // Badges & Flags
  isTop20: boolean;
  isRising: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isSponsored?: boolean;
  sponsoredLabel?: string;
  status: 'active' | 'pending' | 'suspended';
  
  // Commercials
  startingPrice: number;
  pricing: CreatorPricing;
  collaborationTypes: string[]; // ['Paid', 'Barter', 'UGC', 'Event', 'Affiliate', 'Brand Ambassador', 'Product Review']
  
  // Deep data
  socialPlatforms: SocialPlatformInfo[];
  audience: CreatorAudience;
  portfolio: PortfolioItem[];
  previousCollaborations: BrandCollaboration[];
  reviews: BrandReview[];
  
  // Contact details (Private unless enabled)
  phone?: string;
  email?: string;
  isContactPublic?: boolean;
  
  // Metadata
  profileViews: number;
  savedCount: number;
  createdAt: string;
}

export interface SavedFolder {
  id: string;
  name: string;
  creatorIds: string[];
  createdAt: string;
}

export interface EnquiryLead {
  id: string; // e.g. SC-ENQ-102938
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  brandName: string;
  contactPerson: string;
  email: string;
  phone: string;
  campaignType: string;
  collaborationType?: string;
  campaignDescription?: string;
  city: string;
  budget: string;
  influencersRequired: number;
  preferredDate: string;
  message: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Negotiation' | 'Converted' | 'Closed' | 'Lost';
  assignedTeamMember?: string;
  createdAt: string;
  isReadByCreator: boolean;
  creatorReply?: string;
  brandNotes?: string;
}

export interface BrandInquiryLead {
  id: string; // e.g. SC-BRAND-INQ-1234
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  brandId: string;
  brandName: string;
  campaignId?: string | null;
  message: string;
  status: 'New' | 'Read' | 'Confirmed' | 'Replied' | 'Archived' | 'Declined';
  conversationId?: string | null;
  createdAt: string;
}

export interface ConversationThread {
  id: string;
  brandUserId: string;
  creatorId: string;
  creatorUserId?: string | null;
  campaignId?: string | null;
  inquiryId?: string | null;
  brandName: string;
  creatorName: string;
  creatorUsername?: string;
  peerName: string;
  peerAvatar: string;
  lastMessage: string;
  lastMessageAt?: string | null;
  unreadCount: number;
  online: boolean;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreatorPost {
  id: string;
  creatorId: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export interface CampaignRequirement {
  id: string;
  userId?: string | null;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  campaignTitle: string;
  campaignDescription?: string;
  city: string;
  maleCount?: number;
  femaleCount?: number;
  totalCount?: number;
  genderPreference?: string;
  ageRange?: string;
  language?: string;
  followerRange: string;
  budget: string;
  category: string;
  collaborationType?: string;
  campaignDate?: string;
  validUntil?: string;
  deliverablesNeeded?: string;
  isBarter?: boolean;
  campaignStartDate?: string;
  customInstructions?: string;
  platforms?: string[];
  requirements?: string;
  status: 'Open' | 'In Review' | 'Filled' | 'Completed';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  applicantsCount: number;
  applicants: {
    creatorId: string;
    creatorName: string;
    creatorAvatar: string;
    pitch: string;
    appliedAt: string;
    status: 'Pending' | 'Shortlisted' | 'Accepted' | 'Declined';
  }[];
  createdAt: string;
}

export interface PlatformStatsConfig {
  creatorsDisplay: string; // e.g. "50,000+"
  citiesDisplay: string; // e.g. "500+"
  categoriesDisplay: string; // e.g. "100+"
  brandConnectionsDisplay: string; // e.g. "10,000+"
  lastUpdated: string;
  customOverride: boolean;
}

export interface AIMatchingFormInput {
  industry: string;
  objective: string;
  city: string;
  budget: string;
  category: string;
  targetAudience: string;
  followerRange: string;
  influencersCount: number;
  platform: string;
}

export interface AIMatchResult {
  creator: Creator;
  matchScore: number; // 0-100
  reasons: string[];
  budgetFit: 'Exact' | 'Within Range' | 'Slightly Above';
  audienceFit: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  date: string;
  publishedAt?: string;
  author: string;
  coverImage: string;
  content: string;
  tags: string[];
  relatedCategories?: string[];
  relatedCities?: string[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  icon?: string;
  image: string;
  description: string;
  count: number;
}

export interface CityInfo {
  id: string;
  name: string;
  slug: string;
  state: string;
  tier: 1 | 2;
  image: string;
  count: number;
  influencersCount?: number;
}

export interface IndustryCardInfo {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  recommendedCategories: string[];
  image: string;
}

export interface BrandPartner {
  id: string;
  name: string;
  category: string;
  logoUrl: string;
  website?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BrandProfile {
  id: string;
  userId: string;
  brandName: string;
  gstNumber?: string;
  logoUrl?: string;
  coverUrl?: string;
  description?: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  industry?: string;
  city?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isFeatured: boolean;
  totalHiringCount?: number;
  createdAt: string;
}
