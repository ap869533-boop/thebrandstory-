import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import {
  Creator,
  UserRole,
  AuthUser,
  SavedFolder,
  EnquiryLead,
  CampaignRequirement,
  PlatformStatsConfig,
  AIMatchingFormInput,
  AIMatchResult,
  BlogPost,
  BrandPartner,
  CategoryInfo,
  CityInfo,
  IndustryCardInfo
} from '../types';
import {
  INITIAL_CREATORS,
  INITIAL_CAMPAIGNS,
  INITIAL_STATS,
  BLOG_POSTS,
  CATEGORIES_LIST,
  CITIES_LIST,
  INDUSTRIES_LIST
} from '../data/initialData';

export interface FilterState {
  searchQuery: string;
  category: string;
  city: string;
  followerRange: string; // 'all' | '1k-10k' | '10k-50k' | '50k-100k' | '100k-500k' | '500k-1m' | '1m+'
  minEngagement: number; // 0, 1, 3, 5, 8
  priceRange: string; // 'all' | 'barter' | 'under-5k' | '5k-10k' | '10k-25k' | '25k-50k' | '50k+'
  collaborationType: string; // 'all' | 'Paid' | 'Barter' | 'UGC' | 'Event' | 'Affiliate' | 'Brand Ambassador' | 'Product Review'
  platform: string; // 'all' | 'instagram' | 'youtube' | 'linkedin' | 'snapchat'
  verifiedOnly: boolean;
  risingOnly: boolean;
  highEngagementOnly: boolean;
  isTop20?: boolean;
  sortBy: 'recommended' | 'trust_score' | 'followers' | 'engagement' | 'lowest_price' | 'collaborations' | 'recently_joined' | 'rising';
}

export const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  category: 'all',
  city: 'all',
  followerRange: 'all',
  minEngagement: 0,
  priceRange: 'all',
  collaborationType: 'all',
  platform: 'all',
  verifiedOnly: false,
  risingOnly: false,
  highEngagementOnly: false,
  sortBy: 'recommended',
};

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'enquiry' | 'campaign' | 'verification' | 'review' | 'system';
  linkTo?: string;
}

interface PlatformContextType {
  // Navigation / Route View
  currentView: string; // 'home' | 'influencer-detail' | 'city-page' | 'category-page' | 'city-category-page' | 'explore' | 'post-requirement' | 'opportunities' | 'brand-dashboard' | 'creator-dashboard' | 'admin-dashboard' | 'blog' | 'blog-post'
  viewParams: { id?: string; slug?: string; username?: string; citySlug?: string; categorySlug?: string; blogSlug?: string };
  navigateTo: (view: string, params?: { id?: string; slug?: string; username?: string; citySlug?: string; categorySlug?: string; blogSlug?: string }) => void;

  // Role & Auth
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeCreatorId: string;
  setActiveCreatorId: (id: string) => void;
  activeBrandName: string;

  // Creators & Database
  creators: Creator[];
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredCreators: Creator[];

  // Saved Creators & Folders
  savedFolders: SavedFolder[];
  savedCreatorIds: string[];
  isCreatorSaved: (creatorId: string) => boolean;
  toggleSaveCreator: (creatorId: string, folderName?: string) => void;
  createFolder: (name: string) => void;
  deleteFolder: (folderId: string) => void;
  removeCreatorFromFolder: (creatorId: string, folderId: string) => void;
  savedDrawerOpen: boolean;
  setSavedDrawerOpen: (open: boolean) => void;
  openSavedDrawer: () => void;
  closeSavedDrawer: () => void;
  clearAllSaved: () => void;

  // Compare Creators
  compareList: Creator[];
  addToCompare: (creator: Creator) => void;
  removeFromCompare: (creatorId: string) => void;
  clearCompare: () => void;
  isComparing: (creatorId: string) => boolean;

  // Enquiries & Leads
  enquiries: EnquiryLead[];
  submitEnquiry: (leadData: Omit<EnquiryLead, 'id' | 'createdAt' | 'status' | 'isReadByCreator'>) => string;
  updateEnquiryStatus: (leadId: string, status: EnquiryLead['status'], assignedTeamMember?: string, creatorReply?: string) => void;
  unreadEnquiriesCount: number;

  // Campaigns & Requirements
  campaigns: CampaignRequirement[];
  postCampaignRequirement: (campaign: Omit<CampaignRequirement, 'id' | 'applicantsCount' | 'applicants' | 'createdAt' | 'status'>) => string;
  applyToCampaign: (campaignId: string, creatorId: string, pitch: string) => void;

  // Stats
  platformStats: PlatformStatsConfig;
  updatePlatformStats: (stats: Partial<PlatformStatsConfig>) => void;

  // Creator Actions
  registerCreator: (newCreator: Partial<Creator>) => Creator;
  updateCreatorProfile: (creatorId: string, updates: Partial<Creator>) => void;
  requestVerification: (creatorId: string) => void;
  addCreatorReview: (creatorId: string, review: Omit<Creator['reviews'][0], 'id' | 'date'>) => void;

  // Admin Controls
  adminToggleVerify: (creatorId: string) => void;
  adminToggleBadge: (creatorId: string, badgeType: 'isFeatured' | 'isTop20' | 'isRising' | 'isTrending' | 'isSponsored') => void;
  adminUpdateCreatorStatus: (creatorId: string, status: 'active' | 'pending' | 'suspended') => void;

  // Modals & UI States
  enquiryModalCreator: Creator | null;
  openEnquiryModal: (creator?: Creator) => void;
  closeEnquiryModal: () => void;

  creatorDetailModalCreator: Creator | null;
  openCreatorDetailModal: (creator: Creator) => void;
  closeCreatorDetailModal: () => void;

  onboardingModalOpen: boolean;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;

  // Auth State
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  authModalOpen: boolean;
  authModalInitialMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  logout: () => void;

  aiMatcherModalOpen: boolean;
  openAIMatcherModal: () => void;
  closeAIMatcherModal: () => void;

  trustScoreModalOpen: boolean;
  openTrustScoreModal: () => void;
  closeTrustScoreModal: () => void;

  compareDrawerOpen: boolean;
  setCompareDrawerOpen: (open: boolean) => void;
  siteLogo: string;
  updateSiteLogo: (url: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Blog Posts
  blogPosts: BlogPost[];

  // Partner Brands
  partnerBrands: BrandPartner[];
  addPartnerBrand: (brand: Omit<BrandPartner, 'id'>) => Promise<void>;
  deletePartnerBrand: (id: string) => Promise<void>;

  // Categories
  categories: CategoryInfo[];
  addCategory: (categoryData: Omit<CategoryInfo, 'id' | 'count'> & { id?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Cities
  cities: CityInfo[];

  // Industries
  industries: IndustryCardInfo[];
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/admin') return 'admin-dashboard';
    return 'home';
  });
  const [viewParams, setViewParams] = useState<{ username?: string; citySlug?: string; categorySlug?: string; blogSlug?: string }>({});

  const navigateTo = (view: string, params: { id?: string; slug?: string; username?: string; citySlug?: string; categorySlug?: string; blogSlug?: string } = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Sync the browser URL to match the view
    if (view === 'admin-dashboard') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'home') {
      window.history.pushState({}, '', '/');
    }
  };

  // Role
  const [currentRole, setCurrentRole] = useState<UserRole>('GUEST');
  const [activeCreatorId, setActiveCreatorId] = useState<string>('c1');
  const [activeBrandName] = useState<string>('Urban Style Brands Ltd');

  // Auth State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('sc_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (window.location.pathname === '/login') {
      setAuthModalInitialMode('login');
      setAuthModalOpen(true);
      // Clean up the URL visually without reloading
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalInitialMode(mode);
    setAuthModalOpen(true);
  };
  const closeAuthModal = () => setAuthModalOpen(false);
  const logout = () => {
    localStorage.removeItem('sc_auth_token');
    localStorage.removeItem('sc_auth_user');
    setAuthUser(null);
    setCurrentRole('GUEST');
    navigateTo('home');
  };

  // Creators State
  const [creators, setCreators] = useState<Creator[]>(() => {
    const saved = localStorage.getItem('sc_creators');
    return saved ? JSON.parse(saved) : INITIAL_CREATORS;
  });

  useEffect(() => {
    localStorage.setItem('sc_creators', JSON.stringify(creators));
  }, [creators]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('sc_auth_user', JSON.stringify(authUser));
      if (authUser.role === 'CREATOR') {
        setCurrentRole('CREATOR');
        const myCreator = creators.find(
          (c) =>
            c.email?.toLowerCase() === authUser.email?.toLowerCase() ||
            c.id === authUser.id ||
            c.id === authUser.creatorProfile?.id ||
            (c as any).user_id === authUser.id ||
            (authUser.name && c.name?.toLowerCase() === authUser.name.toLowerCase()) ||
            (authUser.name && c.username?.toLowerCase() === authUser.name.toLowerCase().replace(/[^a-z0-9_]/g, ''))
        ) || authUser.creatorProfile;
        if (myCreator) {
          setActiveCreatorId(myCreator.id);
        }
      } else if (authUser.role === 'BRAND') {
        setCurrentRole('BRAND');
      } else if (authUser.role === 'ADMIN' || authUser.role === 'SALES') {
        setCurrentRole('ADMIN');
      }
    } else {
      localStorage.removeItem('sc_auth_user');
    }
  }, [authUser, creators]);

  // Categories State
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORIES_LIST);

  // Cities State
  const [cities, setCities] = useState<CityInfo[]>(CITIES_LIST);

  // Industries State
  const [industries, setIndustries] = useState<IndustryCardInfo[]>(INDUSTRIES_LIST);

  // Blog Posts State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(BLOG_POSTS);

  const addCategory = async (categoryData: Omit<CategoryInfo, 'id' | 'count'> & { id?: string }) => {
    try {
      const res = await fetch(apiUrl('/api/categories'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) => {
          const idx = prev.findIndex((c) => c.id === data.category.id || c.slug === data.category.slug);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = data.category;
            return copy;
          }
          return [data.category, ...prev];
        });
        addNotification({
          title: '🏷️ Category Created',
          message: `Category "${data.category.name}" created successfully.`,
          type: 'system',
        });
      } else {
        alert(data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Network error while adding category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/categories/${id}`), {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
        addNotification({
          title: '🗑️ Category Removed',
          message: `Category deleted successfully.`,
          type: 'system',
        });
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Network error while deleting category');
    }
  };

  // Direct MySQL Database Synchronization on Mount
  useEffect(() => {
    const fetchLiveDatabaseData = async () => {
      try {
        const [
          creatorsRes,
          campaignsRes,
          enquiriesRes,
          categoriesRes,
          citiesRes,
          industriesRes,
          blogsRes,
          statsRes,
          brandsRes,
        ] = await Promise.all([
          fetch(apiUrl('/api/creators')),
          fetch(apiUrl('/api/campaigns')),
          fetch(apiUrl('/api/enquiries')),
          fetch(apiUrl('/api/categories')),
          fetch(apiUrl('/api/cities')),
          fetch(apiUrl('/api/industries')),
          fetch(apiUrl('/api/blogs')),
          fetch(apiUrl('/api/stats')),
          fetch(apiUrl('/api/partner-brands')),
        ]);

        if (creatorsRes.ok) {
          const cData = await creatorsRes.json();
          if (cData.creators && cData.creators.length > 0) {
            setCreators(cData.creators);
          }
        }

        if (campaignsRes.ok) {
          const campData = await campaignsRes.json();
          if (campData.campaigns && campData.campaigns.length > 0) {
            setCampaigns(campData.campaigns);
          }
        }

        if (enquiriesRes.ok) {
          const enqData = await enquiriesRes.json();
          if (enqData.enquiries && enqData.enquiries.length > 0) {
            setEnquiries(enqData.enquiries);
          }
        }

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          if (catData.categories && catData.categories.length > 0) {
            setCategories(catData.categories);
          }
        }

        if (citiesRes.ok) {
          const cityData = await citiesRes.json();
          if (cityData.cities && cityData.cities.length > 0) {
            setCities(cityData.cities);
          }
        }

        if (industriesRes.ok) {
          const indData = await industriesRes.json();
          if (indData.industries && indData.industries.length > 0) {
            setIndustries(indData.industries);
          }
        }

        if (blogsRes.ok) {
          const blogData = await blogsRes.json();
          if (blogData.posts && blogData.posts.length > 0) {
            setBlogPosts(blogData.posts);
          }
        }

        if (statsRes.ok) {
          const sData = await statsRes.json();
          if (sData.stats) {
            setPlatformStats(sData.stats);
          }
        }

        if (brandsRes.ok) {
          const brandData = await brandsRes.json();
          if (brandData.brands && brandData.brands.length > 0) {
            setPartnerBrands(brandData.brands);
          }
        }
      } catch (err) {
        console.warn('Initial live database sync notice:', err);
      }
    };

    fetchLiveDatabaseData();
  }, []);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const resetFilters = () => setFilters(INITIAL_FILTERS);

  // Saved Creators State (Guaranteed 100% Empty and Reset)
  const [savedCreatorIds, setSavedCreatorIds] = useState<string[]>(() => {
    try {
      // Completely wipe any stale saved keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sc_saved')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sc_saved_creator_ids_active', JSON.stringify(savedCreatorIds));
  }, [savedCreatorIds]);

  const [savedFolders, setSavedFolders] = useState<SavedFolder[]>([
    { id: 'f_default', name: 'My Saved Creators', creatorIds: [], createdAt: new Date().toISOString().split('T')[0] }
  ]);

  const isCreatorSaved = (creatorIdOrUsername: string) => {
    if (!creatorIdOrUsername) return false;
    if (savedCreatorIds.includes(creatorIdOrUsername)) return true;
    const target = creators.find((c) => c.id === creatorIdOrUsername || c.username === creatorIdOrUsername);
    if (!target) return false;
    return savedCreatorIds.includes(target.id) || savedCreatorIds.includes(target.username);
  };

  const toggleSaveCreator = (creatorId: string, folderName = 'My Saved Creators') => {
    setSavedCreatorIds((prev) => {
      const target = creators.find((c) => c.id === creatorId || c.username === creatorId);
      const targetId = target ? target.id : creatorId;
      const targetName = target ? target.name : 'Creator';

      const alreadySaved = prev.includes(targetId) || (target ? prev.includes(target.username) : false);
      const isNowSaved = !alreadySaved;

      const next = alreadySaved
        ? prev.filter((id) => id !== targetId && (target ? id !== target.username : true))
        : [...prev, targetId];

      // Update creator saved counter
      setCreators((cList) =>
        cList.map((c) =>
          c.id === targetId || (target && c.username === target.username)
            ? { ...c, savedCount: Math.max(0, (c.savedCount || 0) + (isNowSaved ? 1 : -1)) }
            : c
        )
      );

      // Notification
      addNotification({
        title: isNowSaved ? '❤️ Added to Saved' : '🤍 Removed from Saved',
        message: isNowSaved
          ? `${targetName} bookmarked to your shortlist.`
          : `${targetName} removed from your shortlist.`,
        type: 'campaign',
      });

      // Background MySQL sync
      fetch(apiUrl('/api/shortlists'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'f_default',
          name: folderName,
          creatorIds: next,
        }),
      }).catch(() => {});

      return next;
    });
  };

  const createFolder = (name: string) => {
    if (!name.trim()) return;
    const newFolder: SavedFolder = {
      id: `f_${Date.now()}`,
      name: name.trim(),
      creatorIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSavedFolders(prev => [newFolder, ...prev]);

    fetch(apiUrl('/api/shortlists'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFolder),
    }).catch(() => {});
  };

  const removeCreatorFromFolder = (creatorId: string, folderId: string) => {
    setSavedFolders(prev => {
      const updated = prev.map(f => f.id === folderId ? { ...f, creatorIds: f.creatorIds.filter(id => id !== creatorId) } : f);
      const target = updated.find(f => f.id === folderId);
      if (target) {
        fetch(`/api/shortlists/${folderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorIds: target.creatorIds }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const deleteFolder = (folderId: string) => {
    if (folderId === 'f_default') return;
    setSavedFolders(prev => prev.filter(folder => folder.id !== folderId));
    fetch(apiUrl(`/api/shortlists/${folderId}`), { method: 'DELETE' }).catch(() => {});
  };

  // Compare Creators State
  const [compareList, setCompareList] = useState<Creator[]>([]);
  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false);

  // App Settings / Theme
  const [siteLogo, setSiteLogo] = useState<string>(() => {
    const saved = localStorage.getItem('sc_site_logo');
    if (!saved || saved === '/logo.png') {
      return '/thebrandsstory-logo.svg';
    }
    return saved;
  });

  const updateSiteLogo = (url: string) => {
    setSiteLogo(url);
    localStorage.setItem('sc_site_logo', url);
  };

  const addToCompare = (creator: Creator) => {
    if (compareList.find(c => c.id === creator.id)) return;
    if (compareList.length >= 4) {
      alert('You can compare up to 4 creators at once.');
      return;
    }
    setCompareList(prev => [...prev, creator]);
    setCompareDrawerOpen(true);
  };

  const removeFromCompare = (creatorId: string) => {
    setCompareList(prev => prev.filter(c => c.id !== creatorId));
  };

  const clearCompare = () => setCompareList([]);

  const isComparing = (creatorId: string) => compareList.some(c => c.id === creatorId);

  // Enquiries & Leads State
  const [enquiries, setEnquiries] = useState<EnquiryLead[]>(() => {
    const saved = localStorage.getItem('sc_enquiries');
    return saved ? JSON.parse(saved) : [
      {
        id: 'SC-ENQ-102938',
        creatorId: 'c1',
        creatorName: 'Priya Sharma',
        creatorUsername: 'priyasharma',
        creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        brandName: 'Urban Chic Apparel',
        contactPerson: 'Meera Kapur',
        email: 'meera@urbanchic.in',
        phone: '+91 98112 33445',
        campaignType: 'Sponsored Instagram Reel + Story Set',
        campaignDescription: 'Launching our Summer Indo-Western collection. Looking for an aesthetic 60s Reel with styling transitions.',
        city: 'Delhi NCR',
        budget: '₹25,000',
        influencersRequired: 1,
        preferredDate: '2026-03-10',
        message: 'Hi Priya! We love your feed aesthetics and feel you would be the perfect face for our spring launch.',
        status: 'New',
        assignedTeamMember: 'Rajesh K (Growth Lead)',
        createdAt: '2026-02-27',
        isReadByCreator: false,
      },
      {
        id: 'SC-ENQ-102939',
        creatorId: 'c2',
        creatorName: 'Rahul Verma',
        creatorUsername: 'rahulverma',
        creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        brandName: 'Spice & Sizzle Bistro',
        contactPerson: 'Karan Bhasin',
        email: 'karan@spicesizzle.in',
        phone: '+91 98111 22334',
        campaignType: 'Restaurant Launch Food Tasting',
        campaignDescription: 'Invite to new rooftop lounge opening in Noida Sector 104.',
        city: 'Noida',
        budget: '₹12,000 + Complimentary Dinner',
        influencersRequired: 1,
        preferredDate: '2026-03-05',
        message: 'Hey Rahul, we would love to host you and your team for the grand tasting.',
        status: 'Contacted',
        assignedTeamMember: 'Pooja V',
        createdAt: '2026-02-26',
        isReadByCreator: true,
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sc_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  const submitEnquiry = (leadData: Omit<EnquiryLead, 'id' | 'createdAt' | 'status' | 'isReadByCreator'>) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const enquiryId = `SC-ENQ-${randomNum}`;
    const newEnquiry: EnquiryLead = {
      ...leadData,
      id: enquiryId,
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0],
      isReadByCreator: false,
    };
    setEnquiries(prev => [newEnquiry, ...prev]);

    // Background sync with Backend REST API
    fetch(apiUrl('/api/enquiries'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    }).catch(err => console.warn('Backend enquiry sync notice:', err));

    // Send notifications
    addNotification({
      title: 'New Collaboration Request',
      message: `${leadData.brandName} submitted enquiry ${enquiryId} for ${leadData.creatorName}. Budget: ${leadData.budget}`,
      type: 'enquiry',
      linkTo: 'enquiries',
    });

    return enquiryId;
  };

  const updateEnquiryStatus = (leadId: string, status: EnquiryLead['status'], assignedTeamMember?: string, creatorReply?: string) => {
    setEnquiries(prev => prev.map(enq => {
      if (enq.id === leadId) {
        return {
          ...enq,
          status,
          assignedTeamMember: assignedTeamMember !== undefined ? assignedTeamMember : enq.assignedTeamMember,
          creatorReply: creatorReply !== undefined ? creatorReply : enq.creatorReply,
          isReadByCreator: true,
        };
      }
      return enq;
    }));

    // Background sync with Backend REST API
    fetch(`/api/enquiries/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, creatorReply }),
    }).catch(err => console.warn('Backend enquiry update notice:', err));
  };

  const unreadEnquiriesCount = enquiries.filter(e => !e.isReadByCreator).length;

  // Campaigns State
  const [campaigns, setCampaigns] = useState<CampaignRequirement[]>(() => {
    const saved = localStorage.getItem('sc_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  useEffect(() => {
    localStorage.setItem('sc_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const postCampaignRequirement = (campaign: Omit<CampaignRequirement, 'id' | 'applicantsCount' | 'applicants' | 'createdAt' | 'status'>) => {
    const newId = `req-${Date.now()}`;
    const newCamp: CampaignRequirement = {
      ...campaign,
      id: newId,
      status: 'Open',
      applicantsCount: 0,
      applicants: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns(prev => [newCamp, ...prev]);

    // Background sync with Backend REST API
    fetch(apiUrl('/api/campaigns'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    }).catch(err => console.warn('Backend campaign sync notice:', err));

    addNotification({
      title: 'New Campaign Requirement Published',
      message: `${campaign.companyName} posted "${campaign.campaignTitle}" in ${campaign.city}`,
      type: 'campaign',
    });
    return newId;
  };

  const applyToCampaign = (campaignId: string, creatorId: string, pitch: string) => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;

    setCampaigns(prev => prev.map(camp => {
      if (camp.id === campaignId) {
        const alreadyApplied = camp.applicants.some(a => a.creatorId === creatorId);
        if (alreadyApplied) return camp;
        const newApplicant = {
          creatorId: creator.id,
          creatorName: creator.name,
          creatorAvatar: creator.avatar,
          pitch,
          appliedAt: 'Just now',
          status: 'Pending' as const,
        };
        return {
          ...camp,
          applicantsCount: camp.applicantsCount + 1,
          applicants: [...camp.applicants, newApplicant],
        };
      }
      return camp;
    }));

    // Background sync with Backend REST API
    fetch(apiUrl(`/api/campaigns/${campaignId}/apply`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, pitch }),
    }).catch(err => console.warn('Backend pitch sync notice:', err));

    addNotification({
      title: 'Application Submitted!',
      message: `You applied to campaign "${campaigns.find(c => c.id === campaignId)?.campaignTitle}"`,
      type: 'campaign',
    });
  };

  // Platform Stats
  const [platformStats, setPlatformStats] = useState<PlatformStatsConfig>(() => {
    const saved = localStorage.getItem('sc_platform_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  useEffect(() => {
    localStorage.setItem('sc_platform_stats', JSON.stringify(platformStats));
  }, [platformStats]);

  const updatePlatformStats = (stats: Partial<PlatformStatsConfig>) => {
    setPlatformStats(prev => {
      const next = {
        ...prev,
        ...stats,
        lastUpdated: new Date().toISOString(),
        customOverride: true,
      };
      fetch(apiUrl('/api/stats'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch(err => console.warn('Backend stats sync notice:', err));
      return next;
    });
  };

  // Creator Registration & Updates
  const registerCreator = (newCreatorData: Partial<Creator>): Creator => {
    const newId = `c_${Date.now()}`;
    const cleanUsername = (newCreatorData.username || newCreatorData.name || 'creator')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    const completeCreator: Creator = {
      id: newId,
      name: newCreatorData.name || 'New Creator',
      username: cleanUsername,
      avatar: newCreatorData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      coverImage: newCreatorData.coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
      bio: newCreatorData.bio || 'Content creator on thebrandsstory.',
      currentCity: newCreatorData.currentCity || 'Delhi NCR',
      state: newCreatorData.state || 'Delhi',
      preferredCities: newCreatorData.preferredCities || [newCreatorData.currentCity || 'Delhi NCR'],
      primaryCategory: newCreatorData.primaryCategory || 'Fashion',
      subCategories: newCreatorData.subCategories || ['Lifestyle'],
      languages: newCreatorData.languages || ['Hindi', 'English'],
      gender: newCreatorData.gender || 'Female',
      ageGroup: newCreatorData.ageGroup || '22-29',
      followers: newCreatorData.followers || 15000,
      engagementRate: newCreatorData.engagementRate || 4.5,
      avgViews: newCreatorData.avgViews || 12000,
      avgLikes: newCreatorData.avgLikes || 1200,
      avgComments: newCreatorData.avgComments || 85,
      brandCollaborationsCount: newCreatorData.brandCollaborationsCount || 2,
      trustScore: 88,
      trustSignals: {
        profileCompleteness: 85,
        phoneVerified: true,
        emailVerified: true,
        socialVerified: true,
        engagementQuality: 88,
        audienceQuality: 86,
        collaborationHistoryScore: 82,
        verifiedReviewsCount: 1,
        responseRate: 95,
        campaignReliability: 90,
        accountActivityScore: 92,
      },
      isVerified: false,
      verificationStepsCompleted: ['Phone', 'Email'],
      isTop20: false,
      isRising: true,
      isFeatured: false,
      isTrending: false,
      status: 'active',
      startingPrice: newCreatorData.startingPrice || 4000,
      pricing: newCreatorData.pricing || {
        reelPrice: 6000,
        storyPrice: 2000,
        postPrice: 4000,
        ugcPrice: 5000,
        youtubePrice: 15000,
        eventPrice: 10000,
        isNegotiable: true,
        isBarterAvailable: true,
        pricingDisplayType: 'starting',
      },
      collaborationTypes: newCreatorData.collaborationTypes || ['Paid', 'Barter', 'UGC', 'Product Review'],
      socialPlatforms: newCreatorData.socialPlatforms || [
        { platform: 'instagram', username: cleanUsername, url: `https://instagram.com/${cleanUsername}`, followers: newCreatorData.followers || 15000, avgViews: 12000, engagementRate: 4.5, verified: true }
      ],
      audience: newCreatorData.audience || {
        topCities: [{ city: newCreatorData.currentCity || 'Delhi NCR', percentage: 55 }, { city: 'Mumbai', percentage: 25 }, { city: 'Bangalore', percentage: 10 }, { city: 'Others', percentage: 10 }],
        topCountries: [{ country: 'India', percentage: 96 }, { country: 'Others', percentage: 4 }],
        ageGroups: [{ bracket: '18-24', percentage: 50 }, { bracket: '25-34', percentage: 40 }, { bracket: '35-44', percentage: 8 }, { bracket: '45+', percentage: 2 }],
        genderSplit: [{ gender: 'Female', percentage: 65 }, { gender: 'Male', percentage: 35 }],
        topInterests: ['Fashion & Lifestyle', 'Photography', 'Cafes & Food'],
        avgReach: 25000,
        avgImpressions: 40000
      },
      portfolio: newCreatorData.portfolio || [
        { id: `p_${Date.now()}`, type: 'reel', title: 'Featured Creator Highlight', thumbnail: newCreatorData.avatar || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80', views: 24000, likes: 2100 }
      ],
      previousCollaborations: [],
      reviews: [],
      phone: newCreatorData.phone || '+91 98765 00000',
      email: newCreatorData.email || `${cleanUsername}@example.com`,
      isContactPublic: false,
      profileViews: 120,
      savedCount: 4,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCreators(prev => [completeCreator, ...prev]);
    setActiveCreatorId(completeCreator.id);
    setCurrentRole('CREATOR');

    addNotification({
      title: 'Welcome to thebrandsstory.!',
      message: `Your free creator profile @${cleanUsername} is now live and searchable across India.`,
      type: 'verification',
    });

    return completeCreator;
  };

  const updateCreatorProfile = (creatorId: string, updates: Partial<Creator>) => {
    setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, ...updates } : c));

    // Also keep authUser and authUser.creatorProfile in sync with all updates
    setAuthUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev };
      if (updates.avatar !== undefined) updatedUser.avatar = updates.avatar;
      if (prev.creatorProfile && (prev.creatorProfile.id === creatorId || prev.id === creatorId)) {
        updatedUser.creatorProfile = {
          ...prev.creatorProfile,
          ...updates,
        };
      }
      localStorage.setItem('sc_auth_user', JSON.stringify(updatedUser));
      return updatedUser;
    });

    fetch(apiUrl(`/api/creators/${creatorId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(e => console.warn('Failed to sync creator update to MySQL DB:', e));
  };

  const requestVerification = (creatorId: string) => {
    setCreators(prev => prev.map(c => {
      if (c.id === creatorId) {
        return {
          ...c,
          verificationRequested: true,
        };
      }
      return c;
    }));

    fetch(`/api/creators/${creatorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationRequested: true }),
    }).catch(e => console.warn('Verification request sync notice:', e));

    addNotification({
      title: 'Verification Request Submitted',
      message: 'Our compliance team is auditing your social metrics. Decision in 24-48 hours.',
      type: 'verification',
    });
  };

  const addCreatorReview = (creatorId: string, reviewData: Omit<Creator['reviews'][0], 'id' | 'date'>) => {
    const newReview = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      date: 'Just now',
    };
    setCreators(prev => prev.map(c => {
      if (c.id === creatorId) {
        const updatedReviews = [newReview, ...c.reviews];
        const newScore = Math.min(99, c.trustScore + 1);
        return {
          ...c,
          reviews: updatedReviews,
          trustScore: newScore,
          brandCollaborationsCount: c.brandCollaborationsCount + 1,
          trustSignals: {
            ...c.trustSignals,
            verifiedReviewsCount: c.trustSignals.verifiedReviewsCount + 1,
            collaborationHistoryScore: Math.min(100, c.trustSignals.collaborationHistoryScore + 2),
          }
        };
      }
      return c;
    }));

    // Direct MySQL Database Sync
    fetch(`/api/creators/${creatorId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandName: reviewData.brandName,
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        campaignType: reviewData.campaignType,
      }),
    }).catch(e => console.warn('Review database sync notice:', e));
  };

  // Admin Controls with MySQL Sync
  const adminToggleVerify = (creatorId: string) => {
    let nextVerified = false;
    setCreators(prev => prev.map(c => {
      if (c.id === creatorId) {
        nextVerified = !c.isVerified;
        return {
          ...c,
          isVerified: nextVerified,
          trustScore: nextVerified ? Math.min(99, c.trustScore + 4) : Math.max(70, c.trustScore - 4),
          verificationStepsCompleted: nextVerified
            ? ['Phone', 'Email', 'Instagram', 'Identity', 'Social Ownership', 'Profile Quality']
            : ['Phone', 'Email'],
        };
      }
      return c;
    }));

    fetch(`/api/creators/${creatorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified: nextVerified }),
    }).catch(e => console.warn('Admin verify sync notice:', e));
  };

  const adminToggleBadge = (creatorId: string, badgeType: 'isFeatured' | 'isTop20' | 'isRising' | 'isTrending' | 'isSponsored') => {
    let nextVal = false;
    setCreators(prev => prev.map(c => {
      if (c.id === creatorId) {
        nextVal = !c[badgeType];
        return { ...c, [badgeType]: nextVal };
      }
      return c;
    }));

    fetch(`/api/creators/${creatorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [badgeType]: nextVal }),
    }).catch(e => console.warn('Admin badge sync notice:', e));
  };

  const adminUpdateCreatorStatus = (creatorId: string, status: 'active' | 'pending' | 'suspended') => {
    setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, status } : c));
    fetch(`/api/creators/${creatorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(e => console.warn('Admin status sync notice:', e));
  };

  // Modals & Popups
  const [enquiryModalCreator, setEnquiryModalCreator] = useState<Creator | null>(null);
  const openEnquiryModal = (creator?: Creator) => setEnquiryModalCreator(creator || creators[0] || null);
  const closeEnquiryModal = () => setEnquiryModalCreator(null);

  const [creatorDetailModalCreator, setCreatorDetailModalCreator] = useState<Creator | null>(null);
  const openCreatorDetailModal = (creator: Creator) => setCreatorDetailModalCreator(creator);
  const closeCreatorDetailModal = () => setCreatorDetailModalCreator(null);

  const [onboardingModalOpen, setOnboardingModalOpen] = useState<boolean>(false);
  const openOnboardingModal = () => setOnboardingModalOpen(true);
  const closeOnboardingModal = () => setOnboardingModalOpen(false);

  const [aiMatcherModalOpen, setAIMatcherModalOpen] = useState<boolean>(false);
  const openAIMatcherModal = () => setAIMatcherModalOpen(true);
  const closeAIMatcherModal = () => setAIMatcherModalOpen(false);

  const [trustScoreModalOpen, setTrustScoreModalOpen] = useState<boolean>(false);
  const openTrustScoreModal = () => setTrustScoreModalOpen(true);
  const closeTrustScoreModal = () => setTrustScoreModalOpen(false);

  const [savedDrawerOpen, setSavedDrawerOpen] = useState<boolean>(false);
  const openSavedDrawer = () => setSavedDrawerOpen(true);
  const closeSavedDrawer = () => setSavedDrawerOpen(false);
  const clearAllSaved = () => {
    setSavedCreatorIds([]);
    try {
      localStorage.removeItem('sc_saved_creator_ids_active');
    } catch {}
    addNotification({
      title: 'Shortlist Cleared',
      message: 'All bookmarked creators have been removed from your shortlist.',
      type: 'system',
    });
  };

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Welcome to thebrandsstory.',
      message: 'India’s Biggest Influencer Platform is live with 50,000+ creators across 500+ cities.',
      timestamp: '1 hour ago',
      read: false,
      type: 'system',
    },
    {
      id: 'notif-2',
      title: 'New Collaboration Lead',
      message: 'Urban Chic Apparel submitted collaboration request SC-ENQ-102938.',
      timestamp: '2 hours ago',
      read: false,
      type: 'enquiry',
    }
  ]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newN: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newN, ...prev]);
  };

  // Partner Brands Management
  const [partnerBrands, setPartnerBrands] = useState<BrandPartner[]>([
    {
      id: 'bp_1',
      name: 'KukuTrip Holiday Pvt Ltd',
      category: 'Travel & Tourism',
      logoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&auto=format&fit=crop&q=80',
      website: 'https://kukutrip.com',
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 'bp_2',
      name: 'SK Equipments',
      category: 'Industrial & Quality Testing',
      logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=80',
      website: 'https://skequipments.com',
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 'bp_3',
      name: 'Yes Officer',
      category: 'EdTech & Government Prep',
      logoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&auto=format&fit=crop&q=80',
      website: 'https://yesofficer.com',
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 'bp_4',
      name: 'Sleepwell',
      category: 'Mattresses & Comfort Living',
      logoUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=300&auto=format&fit=crop&q=80',
      website: 'https://mysleepwell.com',
      sortOrder: 4,
      isActive: true,
    },
    {
      id: 'bp_5',
      name: 'Travenzo',
      category: 'Heritage Tour & Travel',
      logoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&auto=format&fit=crop&q=80',
      website: 'https://travenzo.com',
      sortOrder: 5,
      isActive: true,
    },
    {
      id: 'bp_6',
      name: 'Classic Escape',
      category: 'Luxury Exploration',
      logoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
      website: 'https://classicescape.com',
      sortOrder: 6,
      isActive: true,
    },
    {
      id: 'bp_7',
      name: 'ZynCRM',
      category: 'SaaS & Enterprise Growth',
      logoUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80',
      website: 'https://zyncrm.com',
      sortOrder: 7,
      isActive: true,
    },
    {
      id: 'bp_8',
      name: 'Chicago Pizza',
      category: 'F&B Food Chain',
      logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
      website: 'https://chicagopizza.in',
      sortOrder: 8,
      isActive: true,
    },
    {
      id: 'bp_9',
      name: 'Little Genius',
      category: 'Kids Education & Learning',
      logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&auto=format&fit=crop&q=80',
      website: 'https://littlegenius.in',
      sortOrder: 9,
      isActive: true,
    },
    {
      id: 'bp_10',
      name: 'Shriram Capital PPLT20',
      category: 'Sports & Cricket League',
      logoUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300&auto=format&fit=crop&q=80',
      website: 'https://shriramcapital.com',
      sortOrder: 10,
      isActive: true,
    },
    {
      id: 'bp_11',
      name: 'Nykaa',
      category: 'Beauty & Wellness',
      logoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
      website: 'https://nykaa.com',
      sortOrder: 11,
      isActive: true,
    },
    {
      id: 'bp_12',
      name: 'boAt',
      category: 'Audio & Lifestyle Wearables',
      logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
      website: 'https://boat-lifestyle.com',
      sortOrder: 12,
      isActive: true,
    },
    {
      id: 'bp_13',
      name: 'Mamaearth',
      category: 'Toxin-Free D2C Beauty',
      logoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
      website: 'https://mamaearth.in',
      sortOrder: 13,
      isActive: true,
    },
    {
      id: 'bp_14',
      name: 'Swiggy',
      category: 'Food & Quick Commerce',
      logoUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&auto=format&fit=crop&q=80',
      website: 'https://swiggy.com',
      sortOrder: 14,
      isActive: true,
    },
    {
      id: 'bp_15',
      name: 'Zomato',
      category: 'Restaurant Discovery',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
      website: 'https://zomato.com',
      sortOrder: 15,
      isActive: true,
    },
    {
      id: 'bp_16',
      name: 'Lenskart',
      category: 'Eyewear Tech',
      logoUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&auto=format&fit=crop&q=80',
      website: 'https://lenskart.com',
      sortOrder: 16,
      isActive: true,
    },
  ]);

  useEffect(() => {
    fetch(apiUrl('/api/partner-brands'))
      .then(res => res.json())
      .then(data => {
        if (data.success && data.brands?.length) {
          setPartnerBrands(data.brands);
        }
      })
      .catch(() => {});
  }, []);

  const addPartnerBrand = async (brand: Omit<BrandPartner, 'id'>) => {
    try {
      const res = await fetch(apiUrl('/api/partner-brands'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      });
      const data = await res.json();
      if (data.success && data.brand) {
        setPartnerBrands(prev => [data.brand, ...prev]);
        addNotification({
          title: 'Brand Partner Added',
          message: `${brand.name} has been added to the slider carousel.`,
          type: 'system',
        });
      }
    } catch {
      const localBrand: BrandPartner = {
        ...brand,
        id: `bp_${Date.now()}`,
      };
      setPartnerBrands(prev => [localBrand, ...prev]);
    }
  };

  const deletePartnerBrand = async (id: string) => {
    setPartnerBrands(prev => prev.filter(b => b.id !== id));
    try {
      await fetch(`/api/partner-brands/${id}`, { method: 'DELETE' });
    } catch {}
    addNotification({
      title: 'Brand Partner Removed',
      message: 'Brand removed from homepage slider.',
      type: 'system',
    });
  };

  // Filtered Creators Engine
  const filteredCreators = creators.filter(creator => {
    if (creator.status === 'suspended') return false;

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = creator.name.toLowerCase().includes(q);
      const matchUsername = creator.username.toLowerCase().includes(q);
      const matchCategory = creator.primaryCategory.toLowerCase().includes(q) || creator.subCategories.some(s => s.toLowerCase().includes(q));
      const matchCity = creator.currentCity.toLowerCase().includes(q) || creator.preferredCities.some(c => c.toLowerCase().includes(q));
      const matchBio = creator.bio.toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchCategory && !matchCity && !matchBio) {
        return false;
      }
    }

    // Category filter
    if (filters.category !== 'all') {
      const catMatches = creator.primaryCategory.toLowerCase() === filters.category.toLowerCase() ||
        creator.subCategories.some(sub => sub.toLowerCase() === filters.category.toLowerCase());
      if (!catMatches) return false;
    }

    // City filter
    if (filters.city !== 'all') {
      const cityMatches = creator.currentCity.toLowerCase().includes(filters.city.toLowerCase()) ||
        creator.preferredCities.some(c => c.toLowerCase().includes(filters.city.toLowerCase()));
      if (!cityMatches) return false;
    }

    // Verified only
    if (filters.verifiedOnly && !creator.isVerified) return false;

    // Rising stars only
    if (filters.risingOnly && !creator.isRising && creator.followers >= 25000) return false;

    // High Engagement only (>= 4.5%)
    if (filters.highEngagementOnly && creator.engagementRate < 4.5) return false;

    // Engagement filter
    if (filters.minEngagement > 0 && creator.engagementRate < filters.minEngagement) return false;

    // Followers range
    if (filters.followerRange !== 'all') {
      const f = creator.followers;
      if (filters.followerRange === '1k-10k' && (f < 1000 || f > 10000)) return false;
      if (filters.followerRange === '10k-50k' && (f < 10000 || f > 50000)) return false;
      if (filters.followerRange === '50k-100k' && (f < 50000 || f > 100000)) return false;
      if (filters.followerRange === '100k-500k' && (f < 100000 || f > 500000)) return false;
      if (filters.followerRange === '500k-1m' && (f < 500000 || f > 1000000)) return false;
      if (filters.followerRange === '1m+' && f < 1000000) return false;
    }

    // Pricing range
    if (filters.priceRange !== 'all') {
      const p = creator.startingPrice;
      if (filters.priceRange === 'barter' && !creator.pricing.isBarterAvailable) return false;
      if (filters.priceRange === 'under-5k' && p > 5000) return false;
      if (filters.priceRange === '5k-10k' && (p < 5000 || p > 10000)) return false;
      if (filters.priceRange === '10k-25k' && (p < 10000 || p > 25000)) return false;
      if (filters.priceRange === '25k-50k' && (p < 25000 || p > 50000)) return false;
      if (filters.priceRange === '50k+' && p < 50000) return false;
    }

    // Collaboration type
    if (filters.collaborationType !== 'all') {
      if (!creator.collaborationTypes.some(ct => ct.toLowerCase() === filters.collaborationType.toLowerCase())) {
        return false;
      }
    }

    // Platform
    if (filters.platform !== 'all') {
      if (!creator.socialPlatforms.some(sp => sp.platform.toLowerCase() === filters.platform.toLowerCase())) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'trust_score') return b.trustScore - a.trustScore;
    if (filters.sortBy === 'followers') return b.followers - a.followers;
    if (filters.sortBy === 'engagement') return b.engagementRate - a.engagementRate;
    if (filters.sortBy === 'lowest_price') return a.startingPrice - b.startingPrice;
    if (filters.sortBy === 'collaborations') return b.brandCollaborationsCount - a.brandCollaborationsCount;
    if (filters.sortBy === 'recently_joined') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (filters.sortBy === 'rising') return (b.isRising ? 1 : 0) - (a.isRising ? 1 : 0);
    // Recommended default: weighted score
    return (b.trustScore * 1.5 + (b.isVerified ? 10 : 0) + (b.isFeatured ? 15 : 0)) -
           (a.trustScore * 1.5 + (a.isVerified ? 10 : 0) + (a.isFeatured ? 15 : 0));
  });

  return (
    <PlatformContext.Provider
      value={{
        currentView,
        viewParams,
        navigateTo,

        currentRole,
        setCurrentRole,
        activeCreatorId,
        setActiveCreatorId,
        activeBrandName,

        authUser,
        setAuthUser,
        authModalOpen,
        authModalInitialMode,
        openAuthModal,
        closeAuthModal,
        logout,

        creators,
        setCreators,
        filters,
        setFilters,
        resetFilters,
        filteredCreators,

        savedFolders,
        savedCreatorIds,
        isCreatorSaved,
        toggleSaveCreator,
        createFolder,
        deleteFolder,
        removeCreatorFromFolder,
        savedDrawerOpen,
        setSavedDrawerOpen,
        openSavedDrawer,
        closeSavedDrawer,
        clearAllSaved,

        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,

        enquiries,
        submitEnquiry,
        updateEnquiryStatus,
        unreadEnquiriesCount,

        campaigns,
        postCampaignRequirement,
        applyToCampaign,

        platformStats,
        updatePlatformStats,

        registerCreator,
        updateCreatorProfile,
        requestVerification,
        addCreatorReview,

        adminToggleVerify,
        adminToggleBadge,
        adminUpdateCreatorStatus,

        enquiryModalCreator,
        openEnquiryModal,
        closeEnquiryModal,

        creatorDetailModalCreator,
        openCreatorDetailModal,
        closeCreatorDetailModal,

        onboardingModalOpen,
        openOnboardingModal,
        closeOnboardingModal,

        aiMatcherModalOpen,
        openAIMatcherModal,
        closeAIMatcherModal,

        trustScoreModalOpen,
        openTrustScoreModal,
        closeTrustScoreModal,

        compareDrawerOpen,
        setCompareDrawerOpen,
        siteLogo,
        updateSiteLogo,

        notifications,
        markNotificationRead,
        clearAllNotifications,
        addNotification,

        blogPosts,

        partnerBrands,
        addPartnerBrand,
        deletePartnerBrand,

        categories,
        addCategory,
        deleteCategory,

        cities,
        industries,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};


