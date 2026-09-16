export type UserRole = 'GUEST' | 'CREATOR' | 'BRAND' | 'ADMIN' | 'SALES';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  avatar?: string;
  creatorProfile?: any;
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
  rating: number;
  reviewText: string;
  campaignType: string;
  date: string;
  verifiedCollaboration: boolean;
  ratingsBreakdown?: {
    communication: number;
    professionalism: number;
    contentQuality: number;
    timeliness: number;
    overall: number;
  };
}

export interface TrustSignals {
  profileCompleteness: number;
  phoneVerified: boolean;
  emailVerified: boolean;
  socialVerified: boolean;
  engagementQuality: number;
  audienceQuality: number;
  collaborationHistoryScore: number;
  verifiedReviewsCount: number;
  responseRate: number;
  campaignReliability: number;
  accountActivityScore: number;
}

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  reelVideoUrl?: string;
  bio: string;
  currentCity: string;
  state: string;
  preferredCities: string[];
  primaryCategory: string;
  subCategories: string[];
  languages: string[];
  gender?: 'Female' | 'Male' | 'Non-binary';
  ageGroup?: string;
  followers: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  totalPosts?: number;
  brandCollaborationsCount: number;
  trustScore?: number;
  trustSignals?: TrustSignals;
  isVerified: boolean;
  verificationRequested?: boolean;
  verificationStepsCompleted: string[];
  isTop20: boolean;
  isRising: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isSponsored?: boolean;
  sponsoredLabel?: string;
  status: 'active' | 'pending' | 'suspended';
  startingPrice: number;
  pricing: CreatorPricing;
  collaborationTypes: string[];
  socialPlatforms: SocialPlatformInfo[];
  audience: CreatorAudience;
  portfolio: PortfolioItem[];
  previousCollaborations: BrandCollaboration[];
  reviews: BrandReview[];
  phone?: string;
  email?: string;
  isContactPublic?: boolean;
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
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  brandName: string;
  contactPerson: string;
  email: string;
  phone: string;
  campaignType: string;
  campaignDescription: string;
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

export interface CampaignRequirement {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  campaignTitle: string;
  campaignDescription: string;
  city: string;
  influencersCount: string;
  followerRange: string;
  budget: string;
  category: string;
  collaborationType: string;
  campaignDate: string;
  platforms: string[];
  requirements: string;
  status: 'Open' | 'In Review' | 'Filled' | 'Completed';
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
  creatorsDisplay: string;
  citiesDisplay: string;
  categoriesDisplay: string;
  brandConnectionsDisplay: string;
  lastUpdated: string;
  customOverride: boolean;
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
