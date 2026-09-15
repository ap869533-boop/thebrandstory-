import { Creator, CategoryInfo, CityInfo, IndustryCardInfo, PlatformStatsConfig, CampaignRequirement, BlogPost } from '../types';

export const INITIAL_STATS: PlatformStatsConfig = {
  creatorsDisplay: '50,000+',
  citiesDisplay: '500+',
  categoriesDisplay: '100+',
  brandConnectionsDisplay: '10,000+',
  lastUpdated: new Date().toISOString(),
  customOverride: false,
};

export const CATEGORIES_LIST: CategoryInfo[] = [
  { id: 'fashion', name: 'Fashion', slug: 'fashion', iconName: 'Shirt', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=80', description: 'Trendy style, street looks, haute couture & outfit inspiration', count: 4820 },
  { id: 'beauty', name: 'Beauty', slug: 'beauty', iconName: 'Sparkles', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80', description: 'Skincare, makeup tutorials, cosmetics reviews & grooming', count: 3950 },
  { id: 'food', name: 'Food', slug: 'food', iconName: 'Utensils', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80', description: 'Street food, fine dining, recipes, cafe hops & culinary reviews', count: 5210 },
  { id: 'travel', name: 'Travel', slug: 'travel', iconName: 'Compass', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&auto=format&fit=crop&q=80', description: 'Destination guides, luxury stays, road trips & wanderlust', count: 3410 },
  { id: 'lifestyle', name: 'Lifestyle', slug: 'lifestyle', iconName: 'Heart', image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=80', description: 'Daily vlogs, wellness routines, home aesthetic & city life', count: 6100 },
  { id: 'fitness', name: 'Fitness', slug: 'fitness', iconName: 'Dumbbell', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80', description: 'Workouts, gym motivation, diet plans & athletic performance', count: 2890 },
  { id: 'technology', name: 'Technology', slug: 'technology', iconName: 'Laptop', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80', description: 'Smartphone reviews, gadgets, AI tools & unboxings', count: 2430 },
  { id: 'gaming', name: 'Gaming', slug: 'gaming', iconName: 'Gamepad2', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80', description: 'Esports, game streams, PC builds & gameplay tips', count: 1840 },
  { id: 'finance', name: 'Finance', slug: 'finance', iconName: 'TrendingUp', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80', description: 'Stock market, mutual funds, personal taxation & crypto', count: 1980 },
  { id: 'automotive', name: 'Automotive', slug: 'automotive', iconName: 'Car', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80', description: 'Car launches, bike test rides, EV reviews & modding', count: 1250 },
  { id: 'real-estate', name: 'Real Estate', slug: 'real-estate', iconName: 'Building2', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=80', description: 'Luxury property tours, architecture & home buying guides', count: 870 },
  { id: 'education', name: 'Education', slug: 'education', iconName: 'GraduationCap', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80', description: 'Career guidance, competitive exams, coding & soft skills', count: 1720 },
  { id: 'parenting', name: 'Parenting', slug: 'parenting', iconName: 'Baby', image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=500&auto=format&fit=crop&q=80', description: 'Motherhood journeys, baby care, nutrition & parenting tips', count: 1120 },
  { id: 'comedy', name: 'Comedy', slug: 'comedy', iconName: 'Smile', image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500&auto=format&fit=crop&q=80', description: 'Standup sketches, relatable comedy, desi memes & roasting', count: 2650 },
  { id: 'entertainment', name: 'Entertainment', slug: 'entertainment', iconName: 'Film', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80', description: 'Bollywood updates, movie reactions, OTT series & celebrity news', count: 3200 },
  { id: 'luxury', name: 'Luxury', slug: 'luxury', iconName: 'Gem', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80', description: 'High-end watches, premium automobiles & bespoke luxury', count: 680 },
  { id: 'photography', name: 'Photography', slug: 'photography', iconName: 'Camera', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=500&auto=format&fit=crop&q=80', description: 'Cinematography, mobile photography, editing & lighting', count: 1420 },
  { id: 'business', name: 'Business', slug: 'business', iconName: 'Briefcase', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80', description: 'Startup stories, business case studies, D2C & growth hacks', count: 1540 },
  { id: 'healthcare', name: 'Healthcare', slug: 'healthcare', iconName: 'Stethoscope', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80', description: 'Doctor insights, mental health, Ayurveda & preventative care', count: 910 },
  { id: 'motivation', name: 'Motivation', slug: 'motivation', iconName: 'Flame', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80', description: 'Mindset shifts, daily motivation, productivity & discipline', count: 1350 },
  { id: 'jewellery', name: 'Jewellery', slug: 'jewellery', iconName: 'Sparkle', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80', description: 'Bridal jewellery, gold ornaments, diamond collections & silver styling', count: 760 },
  { id: 'home-interiors', name: 'Home & Interiors', slug: 'home-interiors', iconName: 'Home', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=80', description: 'Room makeovers, aesthetic decor, minimalist furniture & DIY', count: 940 },
  { id: 'wedding', name: 'Wedding', slug: 'wedding', iconName: 'PartyPopper', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80', description: 'Bridal lehengas, destination wedding ideas, choreography & decor', count: 830 },
  { id: 'events', name: 'Events', slug: 'events', iconName: 'CalendarCheck', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=80', description: 'Concerts, college fests, store launches & meet-and-greets', count: 710 },
  { id: 'local-creators', name: 'Local Creators', slug: 'local-creators', iconName: 'MapPin', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=500&auto=format&fit=crop&q=80', description: 'Hyperlocal regional voices, regional languages & city influencers', count: 3200 },
];

export const CITIES_LIST: CityInfo[] = [
  { id: 'delhi', name: 'Delhi NCR', slug: 'delhi', state: 'Delhi', tier: 1, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&auto=format&fit=crop&q=80', count: 9400 },
  { id: 'mumbai', name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', tier: 1, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=500&auto=format&fit=crop&q=80', count: 11200 },
  { id: 'bangalore', name: 'Bangalore', slug: 'bangalore', state: 'Karnataka', tier: 1, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&auto=format&fit=crop&q=80', count: 7800 },
  { id: 'hyderabad', name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana', tier: 1, image: 'https://images.unsplash.com/photo-1605007493699-ce65834f8742?w=500&auto=format&fit=crop&q=80', count: 5200 },
  { id: 'pune', name: 'Pune', slug: 'pune', state: 'Maharashtra', tier: 1, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80', count: 3900 },
  { id: 'noida', name: 'Noida', slug: 'noida', state: 'Uttar Pradesh', tier: 1, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&auto=format&fit=crop&q=80', count: 3400 },
  { id: 'gurgaon', name: 'Gurgaon', slug: 'gurgaon', state: 'Haryana', tier: 1, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=80', count: 4100 },
  { id: 'jaipur', name: 'Jaipur', slug: 'jaipur', state: 'Rajasthan', tier: 2, image: 'https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?w=500&auto=format&fit=crop&q=80', count: 2400 },
  { id: 'chandigarh', name: 'Chandigarh', slug: 'chandigarh', state: 'Punjab/Haryana', tier: 2, image: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=500&auto=format&fit=crop&q=80', count: 2100 },
  { id: 'lucknow', name: 'Lucknow', slug: 'lucknow', state: 'Uttar Pradesh', tier: 2, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=80', count: 1850 },
  { id: 'kolkata', name: 'Kolkata', slug: 'kolkata', state: 'West Bengal', tier: 1, image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=500&auto=format&fit=crop&q=80', count: 4600 },
  { id: 'chennai', name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu', tier: 1, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=80', count: 4300 },
  { id: 'ahmedabad', name: 'Ahmedabad', slug: 'ahmedabad', state: 'Gujarat', tier: 1, image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=500&auto=format&fit=crop&q=80', count: 3200 },
];

export const INDUSTRIES_LIST: IndustryCardInfo[] = [
  { id: 'restaurants', name: 'Restaurants & Cafes', slug: 'restaurants', iconName: 'UtensilsCrossed', description: 'Food vloggers, local foodies, chef reviews and reel tastings for buzz and footfall', recommendedCategories: ['Food', 'Lifestyle', 'Local Creators'], image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80' },
  { id: 'hotels', name: 'Hotels & Resorts', slug: 'hotels', iconName: 'Hotel', description: 'Travel influencers, staycation vloggers and luxury creators for property showcases', recommendedCategories: ['Travel', 'Luxury', 'Lifestyle'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80' },
  { id: 'travel-agencies', name: 'Travel & Tourism', slug: 'travel-agencies', iconName: 'PlaneTakeoff', description: 'Adventure and wanderlust creators driving package bookings and experiential trips', recommendedCategories: ['Travel', 'Photography', 'Lifestyle'], image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80' },
  { id: 'fashion-brands', name: 'Fashion & Apparel', slug: 'fashion-brands', iconName: 'Shirt', description: 'Stylists, lookbook creators and haul influencers boosting seasonal collections', recommendedCategories: ['Fashion', 'Lifestyle', 'Beauty'], image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=80' },
  { id: 'beauty-brands', name: 'Beauty & Skincare', slug: 'beauty-brands', iconName: 'Sparkles', description: 'Dermat-aware reviewers, makeup artists and UGC creators showcasing results', recommendedCategories: ['Beauty', 'Healthcare', 'Lifestyle'], image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80' },
  { id: 'real-estate', name: 'Real Estate & Builders', slug: 'real-estate', iconName: 'Building', description: 'Home tour vloggers, luxury living creators and architect reviewers for lead gen', recommendedCategories: ['Real Estate', 'Luxury', 'Business'], image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=80' },
  { id: 'startups', name: 'Startups & Apps', slug: 'startups', iconName: 'Rocket', description: 'Tech reviewers, productivity gurus and finance creators for app downloads & CAC drops', recommendedCategories: ['Technology', 'Business', 'Finance'], image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80' },
  { id: 'd2c-brands', name: 'D2C Consumer Goods', slug: 'd2c-brands', iconName: 'ShoppingBag', description: 'Authentic unboxing, product demonstrations, UGC reel packs and promo codes', recommendedCategories: ['Lifestyle', 'Food', 'Beauty'], image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&auto=format&fit=crop&q=80' },
  { id: 'ecommerce', name: 'E-commerce Platforms', slug: 'ecommerce', iconName: 'Store', description: 'Mega sale promotions, festive deals creators and affiliate ambassadors', recommendedCategories: ['Fashion', 'Technology', 'Lifestyle'], image: 'https://images.unsplash.com/photo-1556742049-0a67e557b567?w=500&auto=format&fit=crop&q=80' },
  { id: 'events', name: 'Events & Concerts', slug: 'events', iconName: 'Ticket', description: 'Celebrity attendees, live event storytellers and buzz multipliers for ticket sales', recommendedCategories: ['Events', 'Entertainment', 'Comedy'], image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=80' },
  { id: 'gyms', name: 'Gyms & Wellness Centers', slug: 'gyms', iconName: 'Activity', description: 'Fitness athletes, certified trainers and nutritionists for studio memberships', recommendedCategories: ['Fitness', 'Healthcare', 'Lifestyle'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80' },
  { id: 'jewellery', name: 'Jewellery & Bridal', slug: 'jewellery', iconName: 'Gem', description: 'Bridal wear creators, festive stylists and luxury editors showcasing designs', recommendedCategories: ['Jewellery', 'Wedding', 'Luxury'], image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80' },
  { id: 'automotive', name: 'Automotive & EVs', slug: 'automotive', iconName: 'Gauge', description: 'Auto journalists, track riders and EV enthusiasts testing performance', recommendedCategories: ['Automotive', 'Technology', 'Travel'], image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80' },
  { id: 'education', name: 'EdTech & Institutes', slug: 'education', iconName: 'BookOpen', description: 'Educators, study influencers and career mentors driving webinar signups', recommendedCategories: ['Education', 'Business', 'Technology'], image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80' },
  { id: 'healthcare', name: 'Healthcare & Clinics', slug: 'healthcare', iconName: 'HeartPulse', description: 'Qualified health professionals and wellness creators building trust and patient footfalls', recommendedCategories: ['Healthcare', 'Fitness', 'Lifestyle'], image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80' },
  { id: 'local-businesses', name: 'Local Businesses & Retail', slug: 'local-businesses', iconName: 'MapPin', description: 'City vloggers and regional creators driving neighbourhood walk-ins & local fame', recommendedCategories: ['Local Creators', 'Food', 'Events'], image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=500&auto=format&fit=crop&q=80' },
];

export const INITIAL_CREATORS: Creator[] = [
  {
    id: 'c1',
    name: 'Priya Sharma',
    username: 'priyasharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    bio: 'Delhi NCR fashion & lifestyle creator. Specializing in high-conversion Instagram Reels, aesthetic lookbooks, and authentic styling for Gen-Z & young professionals across India.',
    currentCity: 'Delhi NCR',
    state: 'Delhi',
    preferredCities: ['Delhi NCR', 'Noida', 'Gurgaon', 'Mumbai', 'Jaipur'],
    primaryCategory: 'Fashion',
    subCategories: ['Lifestyle', 'Luxury', 'Beauty'],
    languages: ['Hindi', 'English', 'Punjabi'],
    gender: 'Female',
    ageGroup: '22-29',
    followers: 125000,
    avgViews: 84000,
    avgLikes: 7250,
    avgComments: 410,
    brandCollaborationsCount: 32,
    trustScore: 94,
    trustSignals: {
      profileCompleteness: 98,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 92,
      audienceQuality: 96,
      collaborationHistoryScore: 95,
      verifiedReviewsCount: 14,
      responseRate: 98,
      campaignReliability: 96,
      accountActivityScore: 94,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity', 'Social Ownership', 'Profile Quality'],
    isTop20: true,
    isRising: false,
    isFeatured: true,
    isTrending: true,
    status: 'active',
    startingPrice: 8000,
    pricing: {
      reelPrice: 12000,
      storyPrice: 4000,
      postPrice: 8000,
      ugcPrice: 9000,
      youtubePrice: 25000,
      eventPrice: 20000,
      isNegotiable: true,
      isBarterAvailable: false,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'UGC', 'Event', 'Brand Ambassador', 'Product Review'],
    socialPlatforms: [
      { platform: 'instagram', username: 'priyasharma.official', url: 'https://instagram.com/priyasharma', followers: 125000, avgViews: 84000, verified: true },
      { platform: 'youtube', username: 'PriyaSharmaStyle', url: 'https://youtube.com', followers: 45000, avgViews: 32000, verified: true },
      { platform: 'linkedin', username: 'priya-sharma-creator', url: 'https://linkedin.com', followers: 8200, avgViews: 5000, verified: false }
    ],
    audience: {
      topCities: [
        { city: 'Delhi NCR', percentage: 44 },
        { city: 'Mumbai', percentage: 22 },
        { city: 'Bangalore', percentage: 14 },
        { city: 'Chandigarh', percentage: 11 },
        { city: 'Jaipur', percentage: 9 }
      ],
      topCountries: [
        { country: 'India', percentage: 92 },
        { country: 'UAE', percentage: 4 },
        { country: 'UK', percentage: 2 },
        { country: 'Others', percentage: 2 }
      ],
      ageGroups: [
        { bracket: '18-24', percentage: 52 },
        { bracket: '25-34', percentage: 38 },
        { bracket: '35-44', percentage: 8 },
        { bracket: '45+', percentage: 2 }
      ],
      genderSplit: [
        { gender: 'Female', percentage: 76 },
        { gender: 'Male', percentage: 24 }
      ],
      topInterests: ['Fashion & Apparel', 'Skincare & Cosmetics', 'Cafe Hopping', 'Travel & Staycations', 'Luxury Goods'],
      avgReach: 145000,
      avgImpressions: 210000
    },
    portfolio: [
      { id: 'p1', type: 'reel', title: 'Monsoon Wardrobe Styling Guide', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80', views: 142000, likes: 11200, brandName: 'Zara India' },
      { id: 'p2', type: 'reel', title: '5 Indo-Western Festive Fits', thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&auto=format&fit=crop&q=80', views: 98000, likes: 8900, brandName: 'FabIndia' },
      { id: 'p3', type: 'ugc', title: 'Clean Beauty Morning Routine', thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80', views: 76000, likes: 6400, brandName: 'Plum Goodness' },
      { id: 'p4', type: 'brand_work', title: 'Luxury Hotel Staycation Reel', thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80', views: 115000, likes: 9700, brandName: 'Taj Hotels' }
    ],
    previousCollaborations: [
      { id: 'b1', brandName: 'Nykaa Fashion', campaignType: 'Sponsored Reel + Story Set', contentType: 'Video', year: '2025', verified: true },
      { id: 'b2', brandName: 'Myntra Big Fashion Festival', campaignType: 'Haul & Try-On Reels', contentType: 'Video', year: '2025', verified: true },
      { id: 'b3', brandName: 'Sugar Cosmetics', campaignType: 'Product Launch UGC Campaign', contentType: 'UGC Video', year: '2024', verified: true },
      { id: 'b4', brandName: 'Westside India', campaignType: 'Store Launch Event Appearance', contentType: 'Event + Reel', year: '2024', verified: true }
    ],
    reviews: [
      {
        id: 'r1',
        brandName: 'Nykaa Brand Lead',
        rating: 5,
        reviewText: 'Priya was punctual, followed our brief precisely while retaining her natural creator voice. Her reel outperformed our benchmark by 180% engagement.',
        campaignType: 'Influencer Marketing Campaign',
        date: '14 Feb 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      },
      {
        id: 'r2',
        brandName: 'Plum Marketing Team',
        rating: 5,
        reviewText: 'Super fast turn-around on raw UGC assets. Clean lighting, great audio clarity, and authentic demonstration.',
        campaignType: 'UGC Creation',
        date: '28 Jan 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 4.8, contentQuality: 5, timeliness: 5, overall: 4.9 }
      }
    ],
    profileViews: 14200,
    savedCount: 380,
    createdAt: '2024-04-12'
  },
  {
    id: 'c2',
    name: 'Rahul Verma',
    username: 'rahulverma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    bio: 'Passionate food critic & street food explorer in Noida and Delhi. Showcasing hidden culinary gems, trending cafe menus, and authentic food reviews with honest ratings.',
    currentCity: 'Noida',
    state: 'Uttar Pradesh',
    preferredCities: ['Noida', 'Delhi NCR', 'Gurgaon', 'Lucknow', 'Jaipur'],
    primaryCategory: 'Food',
    subCategories: ['Travel', 'Lifestyle', 'Local Creators'],
    languages: ['Hindi', 'English'],
    gender: 'Male',
    ageGroup: '25-34',
    followers: 82000,
    avgViews: 92000,
    avgLikes: 5800,
    avgComments: 520,
    brandCollaborationsCount: 24,
    trustScore: 92,
    trustSignals: {
      profileCompleteness: 95,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 94,
      audienceQuality: 91,
      collaborationHistoryScore: 90,
      verifiedReviewsCount: 9,
      responseRate: 94,
      campaignReliability: 93,
      accountActivityScore: 95,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity'],
    isTop20: true,
    isRising: false,
    isFeatured: true,
    isTrending: true,
    status: 'active',
    startingPrice: 5000,
    pricing: {
      reelPrice: 7500,
      storyPrice: 2500,
      postPrice: 5000,
      ugcPrice: 6000,
      youtubePrice: 18000,
      eventPrice: 12000,
      isNegotiable: true,
      isBarterAvailable: true,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'Barter', 'Event', 'UGC', 'Product Review'],
    socialPlatforms: [
      { platform: 'instagram', username: 'rahul.foodtravels', url: 'https://instagram.com', followers: 82000, avgViews: 92000, verified: true },
      { platform: 'youtube', username: 'RahulVermaEats', url: 'https://youtube.com', followers: 28000, avgViews: 24000, verified: false }
    ],
    audience: {
      topCities: [
        { city: 'Noida', percentage: 38 },
        { city: 'Delhi NCR', percentage: 35 },
        { city: 'Gurgaon', percentage: 15 },
        { city: 'Lucknow', percentage: 7 },
        { city: 'Others', percentage: 5 }
      ],
      topCountries: [{ country: 'India', percentage: 97 }, { country: 'Others', percentage: 3 }],
      ageGroups: [
        { bracket: '18-24', percentage: 46 },
        { bracket: '25-34', percentage: 44 },
        { bracket: '35-44', percentage: 8 },
        { bracket: '45+', percentage: 2 }
      ],
      genderSplit: [
        { gender: 'Male', percentage: 58 },
        { gender: 'Female', percentage: 42 }
      ],
      topInterests: ['Street Food & Dhabas', 'Fine Dining Cafes', 'Weekend Food Walks', 'Beverages & Coffee'],
      avgReach: 120000,
      avgImpressions: 165000
    },
    portfolio: [
      { id: 'p21', type: 'reel', title: 'Top 5 Butter Chicken Spots in Old Delhi', thumbnail: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80', views: 240000, likes: 18400, brandName: 'Local Special' },
      { id: 'p22', type: 'reel', title: 'New Korean Cafe in Sector 104 Noida', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80', views: 110000, likes: 9200, brandName: 'K-Bites Cafe' }
    ],
    previousCollaborations: [
      { id: 'b21', brandName: 'Swiggy Gourmet', campaignType: 'Restaurant Discovery Reels', contentType: 'Video', year: '2025', verified: true },
      { id: 'b22', brandName: 'Haldirams', campaignType: 'Festive Sweet Box Tasting', contentType: 'Reel + Story', year: '2024', verified: true }
    ],
    reviews: [
      {
        id: 'r21',
        brandName: 'The Beer Cafe Noida',
        rating: 5,
        reviewText: 'Rahul drove over 120+ table bookings within 48 hours of posting his reel. Highly credible food creator.',
        campaignType: 'Cafe Launch Campaign',
        date: '02 Feb 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 11500,
    savedCount: 290,
    createdAt: '2024-06-18'
  },
  {
    id: 'c3',
    name: 'Ananya Kapoor',
    username: 'ananyak',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
    bio: 'Mumbai-based skincare & luxury beauty enthusiast. Tested 500+ cosmetic products. Focused on clean ingredients, glass-skin routines, and high-aesthetic brand storytelling.',
    currentCity: 'Mumbai',
    state: 'Maharashtra',
    preferredCities: ['Mumbai', 'Pune', 'Bangalore', 'Delhi NCR', 'Goa'],
    primaryCategory: 'Beauty',
    subCategories: ['Fashion', 'Luxury', 'Healthcare'],
    languages: ['English', 'Hindi', 'Marathi'],
    gender: 'Female',
    ageGroup: '22-29',
    followers: 210000,
    avgViews: 145000,
    avgLikes: 10400,
    avgComments: 630,
    brandCollaborationsCount: 42,
    trustScore: 96,
    trustSignals: {
      profileCompleteness: 100,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 95,
      audienceQuality: 98,
      collaborationHistoryScore: 97,
      verifiedReviewsCount: 22,
      responseRate: 97,
      campaignReliability: 98,
      accountActivityScore: 96,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity', 'Social Ownership', 'Profile Quality'],
    isTop20: true,
    isRising: false,
    isFeatured: true,
    isTrending: true,
    status: 'active',
    startingPrice: 15000,
    pricing: {
      reelPrice: 22000,
      storyPrice: 7000,
      postPrice: 15000,
      ugcPrice: 14000,
      youtubePrice: 40000,
      eventPrice: 35000,
      isNegotiable: false,
      isBarterAvailable: false,
      pricingDisplayType: 'exact',
    },
    collaborationTypes: ['Paid', 'UGC', 'Brand Ambassador', 'Event', 'Product Review'],
    socialPlatforms: [
      { platform: 'instagram', username: 'ananyakapoor.beauty', url: 'https://instagram.com', followers: 210000, avgViews: 145000, verified: true },
      { platform: 'youtube', username: 'AnanyaBeautyIndia', url: 'https://youtube.com', followers: 98000, avgViews: 65000, verified: true }
    ],
    audience: {
      topCities: [
        { city: 'Mumbai', percentage: 48 },
        { city: 'Pune', percentage: 18 },
        { city: 'Bangalore', percentage: 14 },
        { city: 'Delhi NCR', percentage: 12 },
        { city: 'Hyderabad', percentage: 8 }
      ],
      topCountries: [{ country: 'India', percentage: 89 }, { country: 'UAE', percentage: 6 }, { country: 'Singapore', percentage: 3 }, { country: 'Others', percentage: 2 }],
      ageGroups: [
        { bracket: '18-24', percentage: 42 },
        { bracket: '25-34', percentage: 48 },
        { bracket: '35-44', percentage: 8 },
        { bracket: '45+', percentage: 2 }
      ],
      genderSplit: [{ gender: 'Female', percentage: 84 }, { gender: 'Male', percentage: 16 }],
      topInterests: ['Dermatological Skincare', 'Luxury Fragrances', 'Korean Beauty Routine', 'Hair Treatments'],
      avgReach: 240000,
      avgImpressions: 380000
    },
    portfolio: [
      { id: 'p31', type: 'reel', title: '7 Days to Barrier Repair with Ceramides', thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80', views: 280000, likes: 21000, brandName: 'Minimalist' },
      { id: 'p32', type: 'reel', title: 'Luxury French Fragrance Unboxing', thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=80', views: 180000, likes: 14200, brandName: 'Dior Beauty' }
    ],
    previousCollaborations: [
      { id: 'b31', brandName: 'L\'Oreal Paris', campaignType: 'Hyaluronic Acid Serum Launch', contentType: 'Reel + Story', year: '2025', verified: true },
      { id: 'b32', brandName: 'Minimalist', campaignType: 'Brand Ambassador Campaign', contentType: 'Multi-post series', year: '2025', verified: true },
      { id: 'b33', brandName: 'Forest Essentials', campaignType: 'Ayurvedic Skincare Heritage Tour', contentType: 'Reels + Event', year: '2024', verified: true }
    ],
    reviews: [
      {
        id: 'r31',
        brandName: 'Minimalist D2C Marketing',
        rating: 5,
        reviewText: 'One of the most knowledgeable skincare creators in India. Her comments section converts into direct checkout cart additions.',
        campaignType: 'Performance Influencer Campaign',
        date: '10 Jan 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 28900,
    savedCount: 840,
    createdAt: '2023-11-10'
  },
  {
    id: 'c4',
    name: 'Karan Mehra',
    username: 'karanmehra_tech',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    bio: 'Bangalore tech reviewer & gadgets geek. Deep-dive benchmark comparisons, smartphone camera shootouts, AI productivity stacks & consumer electronic buying guides.',
    currentCity: 'Bangalore',
    state: 'Karnataka',
    preferredCities: ['Bangalore', 'Hyderabad', 'Chennai', 'Mumbai', 'Delhi NCR'],
    primaryCategory: 'Technology',
    subCategories: ['Gaming', 'Business', 'Education'],
    languages: ['English', 'Hindi', 'Kannada'],
    gender: 'Male',
    ageGroup: '25-34',
    followers: 180000,
    avgViews: 130000,
    avgLikes: 8900,
    avgComments: 820,
    brandCollaborationsCount: 38,
    trustScore: 95,
    trustSignals: {
      profileCompleteness: 97,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 96,
      audienceQuality: 95,
      collaborationHistoryScore: 94,
      verifiedReviewsCount: 16,
      responseRate: 96,
      campaignReliability: 97,
      accountActivityScore: 95,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity', 'Social Ownership'],
    isTop20: true,
    isRising: false,
    isFeatured: true,
    isTrending: false,
    status: 'active',
    startingPrice: 12000,
    pricing: {
      reelPrice: 18000,
      storyPrice: 6000,
      postPrice: 12000,
      ugcPrice: 15000,
      youtubePrice: 45000,
      eventPrice: 25000,
      isNegotiable: true,
      isBarterAvailable: false,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'UGC', 'Product Review', 'Event', 'Affiliate'],
    socialPlatforms: [
    ],
    audience: {
      topCities: [
        { city: 'Bangalore', percentage: 42 },
        { city: 'Hyderabad', percentage: 20 },
        { city: 'Pune', percentage: 14 },
        { city: 'Delhi NCR', percentage: 12 },
        { city: 'Chennai', percentage: 12 }
      ],
      topCountries: [{ country: 'India', percentage: 91 }, { country: 'USA', percentage: 4 }, { country: 'Others', percentage: 5 }],
      ageGroups: [
        { bracket: '18-24', percentage: 38 },
        { bracket: '25-34', percentage: 52 },
        { bracket: '35-44', percentage: 9 },
        { bracket: '45+', percentage: 1 }
      ],
      genderSplit: [{ gender: 'Male', percentage: 79 }, { gender: 'Female', percentage: 21 }],
      topInterests: ['Smartphones & Laptops', 'AI Automation Tools', 'EV Mobility', 'Audio Gear', 'PC Hardware'],
      avgReach: 210000,
      avgImpressions: 310000
    },
    portfolio: [
      { id: 'p41', type: 'youtube', title: 'Top 5 Laptops for Coding & Creator Work in 2026', thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80', views: 320000, likes: 24000, brandName: 'Dell India' },
      { id: 'p42', type: 'reel', title: 'Flagship Smartphone Camera Blind Test', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80', views: 190000, likes: 14000, brandName: 'OnePlus' }
    ],
    previousCollaborations: [
      { id: 'b41', brandName: 'Samsung India', campaignType: 'Galaxy S Series Launch Partner', contentType: 'YouTube + Reels', year: '2026', verified: true },
      { id: 'b42', brandName: 'Nothing Tech', campaignType: 'Phone Review Exclusive', contentType: 'Video', year: '2025', verified: true }
    ],
    reviews: [
      {
        id: 'r41',
        brandName: 'Samsung Product Marketing',
        rating: 5,
        reviewText: 'Karan explains nuanced technical specifications in simple terms. Outstanding viewer retention and genuine community engagement.',
        campaignType: 'Product Launch Campaign',
        date: '20 Jan 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 24200,
    savedCount: 610,
    createdAt: '2023-08-04'
  },
  {
    id: 'c5',
    name: 'Dr. Tanvi Joshi',
    username: 'drtanvifit',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    bio: 'Physiotherapist & Functional Fitness Coach in Pune. Debunking workout myths, posture correction, women fitness over 30, and sustainable Indian meal planning.',
    currentCity: 'Pune',
    state: 'Maharashtra',
    preferredCities: ['Pune', 'Mumbai', 'Goa', 'Bangalore', 'Hyderabad'],
    primaryCategory: 'Fitness',
    subCategories: ['Healthcare', 'Lifestyle', 'Education'],
    languages: ['Marathi', 'Hindi', 'English'],
    gender: 'Female',
    ageGroup: '25-34',
    followers: 95000,
    avgViews: 110000,
    avgLikes: 7900,
    avgComments: 690,
    brandCollaborationsCount: 19,
    trustScore: 96,
    trustSignals: {
      profileCompleteness: 99,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 98,
      audienceQuality: 97,
      collaborationHistoryScore: 93,
      verifiedReviewsCount: 11,
      responseRate: 99,
      campaignReliability: 98,
      accountActivityScore: 95,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity', 'Social Ownership', 'Profile Quality'],
    isTop20: true,
    isRising: true,
    isFeatured: true,
    isTrending: true,
    status: 'active',
    startingPrice: 6000,
    pricing: {
      reelPrice: 9500,
      storyPrice: 3000,
      postPrice: 6000,
      ugcPrice: 8000,
      youtubePrice: 20000,
      eventPrice: 15000,
      isNegotiable: true,
      isBarterAvailable: false,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'UGC', 'Brand Ambassador', 'Product Review'],
    socialPlatforms: [
      { platform: 'instagram', username: 'drtanvi.physiofit', url: 'https://instagram.com', followers: 95000, avgViews: 110000,verified: true }
    ],
    audience: {
      topCities: [
        { city: 'Pune', percentage: 46 },
        { city: 'Mumbai', percentage: 30 },
        { city: 'Ahmedabad', percentage: 10 },
        { city: 'Bangalore', percentage: 8 },
        { city: 'Others', percentage: 6 }
      ],
      topCountries: [{ country: 'India', percentage: 96 }, { country: 'Others', percentage: 4 }],
      ageGroups: [
        { bracket: '18-24', percentage: 22 },
        { bracket: '25-34', percentage: 56 },
        { bracket: '35-44', percentage: 18 },
        { bracket: '45+', percentage: 4 }
      ],
      genderSplit: [{ gender: 'Female', percentage: 68 }, { gender: 'Male', percentage: 32 }],
      topInterests: ['Posture Rehabilitation', 'Strength Training', 'Clean Whey Supplements', 'Home Gym Gear'],
      avgReach: 160000,
      avgImpressions: 220000
    },
    portfolio: [
      { id: 'p51', type: 'reel', title: '5 Desk Stretches to Cure Lower Back Pain', thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80', views: 410000, likes: 32000, brandName: 'Ergonomic Brand' }
    ],
    previousCollaborations: [
      { id: 'b51', brandName: 'Fast&Up India', campaignType: 'Electrolyte & Protein Ambassador', contentType: 'Reels + Stories', year: '2025', verified: true },
      { id: 'b52', brandName: 'Cult.fit', campaignType: 'Posture Awareness Workshop', contentType: 'Event + Reel', year: '2024', verified: true }
    ],
    reviews: [
      {
        id: 'r51',
        brandName: 'Fast&Up Growth Team',
        rating: 5,
        reviewText: 'Dr. Tanvi brings immense clinical credibility. Her audience trusts every supplement recommendation she makes.',
        campaignType: 'Product Review Campaign',
        date: '18 Jan 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 16800,
    savedCount: 490,
    createdAt: '2024-02-19'
  },
  {
    id: 'c6',
    name: 'Aarav Singhania',
    username: 'aaravtravels',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80',
    bio: 'Jaipur & Delhi based luxury travel storyteller and drone cinematographer. Creating cinematic reels of royal heritage palaces, Himalayan escapes & boutique homestays.',
    currentCity: 'Jaipur',
    state: 'Rajasthan',
    preferredCities: ['Jaipur', 'Delhi NCR', 'Udaipur', 'Chandigarh', 'Goa'],
    primaryCategory: 'Travel',
    subCategories: ['Photography', 'Luxury', 'Lifestyle'],
    languages: ['Hindi', 'English', 'Rajasthani'],
    gender: 'Male',
    ageGroup: '25-34',
    followers: 140000,
    avgViews: 160000,
    avgLikes: 11200,
    avgComments: 740,
    brandCollaborationsCount: 28,
    trustScore: 93,
    trustSignals: {
      profileCompleteness: 96,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 94,
      audienceQuality: 94,
      collaborationHistoryScore: 92,
      verifiedReviewsCount: 13,
      responseRate: 95,
      campaignReliability: 94,
      accountActivityScore: 93,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity'],
    isTop20: true,
    isRising: false,
    isFeatured: true,
    isTrending: true,
    status: 'active',
    startingPrice: 10000,
    pricing: {
      reelPrice: 15000,
      storyPrice: 5000,
      postPrice: 10000,
      ugcPrice: 12000,
      youtubePrice: 35000,
      eventPrice: 25000,
      isNegotiable: true,
      isBarterAvailable: true,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'Barter', 'UGC', 'Event', 'Brand Ambassador'],
    socialPlatforms: [
    ],
    audience: {
      topCities: [
        { city: 'Delhi NCR', percentage: 36 },
        { city: 'Jaipur', percentage: 24 },
        { city: 'Mumbai', percentage: 20 },
        { city: 'Chandigarh', percentage: 12 },
        { city: 'Others', percentage: 8 }
      ],
      topCountries: [{ country: 'India', percentage: 88 }, { country: 'UAE', percentage: 5 }, { country: 'UK', percentage: 4 }, { country: 'Others', percentage: 3 }],
      ageGroups: [
        { bracket: '18-24', percentage: 34 },
        { bracket: '25-34', percentage: 54 },
        { bracket: '35-44', percentage: 10 },
        { bracket: '45+', percentage: 2 }
      ],
      genderSplit: [{ gender: 'Male', percentage: 54 }, { gender: 'Female', percentage: 46 }],
      topInterests: ['Boutique Resorts', 'Drone Cinematography', 'Himalayan Treks', 'Road Trips', 'Luggage & Gear'],
      avgReach: 190000,
      avgImpressions: 290000
    },
    portfolio: [
      { id: 'p61', type: 'reel', title: 'Hidden Stepwell Palace in Rajasthan', thumbnail: 'https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?w=400&auto=format&fit=crop&q=80', views: 520000, likes: 44000, brandName: 'Rajasthan Tourism' }
    ],
    previousCollaborations: [
      { id: 'b61', brandName: 'MakeMyTrip Homestays', campaignType: 'Villa Showcase Reels', contentType: 'Reels', year: '2025', verified: true },
      { id: 'b62', brandName: 'Samsonite India', campaignType: 'Durable Luggage Campaign', contentType: 'Reel + UGC', year: '2025', verified: true }
    ],
    reviews: [
      {
        id: 'r61',
        brandName: 'MakeMyTrip Marketing',
        rating: 5,
        reviewText: 'Cinematography level was breathtaking. 4K color-graded footage that made the property look like a dream.',
        campaignType: 'Tourism Promotion',
        date: '25 Jan 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 19400,
    savedCount: 520,
    createdAt: '2023-12-05'
  },
  {
    id: 'c7',
    name: 'Sneha Deshmukh',
    username: 'snehadeshmukh',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    bio: 'Certified Financial Planner & content creator in Hyderabad. Simplifying Indian tax laws, mutual fund SIPs, term insurance, and early retirement wealth strategies.',
    currentCity: 'Hyderabad',
    state: 'Telangana',
    preferredCities: ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Pune'],
    primaryCategory: 'Finance',
    subCategories: ['Business', 'Education', 'Lifestyle'],
    languages: ['Telugu', 'English', 'Hindi'],
    gender: 'Female',
    ageGroup: '25-34',
    followers: 165000,
    avgViews: 120000,
    avgLikes: 7400,
    avgComments: 910,
    brandCollaborationsCount: 31,
    trustScore: 97,
    trustSignals: {
      profileCompleteness: 100,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 97,
      audienceQuality: 98,
      collaborationHistoryScore: 96,
      verifiedReviewsCount: 18,
      responseRate: 98,
      campaignReliability: 99,
      accountActivityScore: 96,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity', 'Social Ownership', 'Profile Quality'],
    isTop20: true,
    isRising: false,
    isFeatured: true,
    isTrending: false,
    status: 'active',
    startingPrice: 12000,
    pricing: {
      reelPrice: 16000,
      storyPrice: 5000,
      postPrice: 12000,
      ugcPrice: 14000,
      youtubePrice: 38000,
      eventPrice: 28000,
      isNegotiable: true,
      isBarterAvailable: false,
      pricingDisplayType: 'exact',
    },
    collaborationTypes: ['Paid', 'UGC', 'Brand Ambassador', 'Event', 'Product Review'],
    socialPlatforms: [
    ],
    audience: {
      topCities: [
        { city: 'Hyderabad', percentage: 40 },
        { city: 'Bangalore', percentage: 28 },
        { city: 'Chennai', percentage: 16 },
        { city: 'Mumbai', percentage: 10 },
        { city: 'Others', percentage: 6 }
      ],
      topCountries: [{ country: 'India', percentage: 93 }, { country: 'USA (NRIs)', percentage: 4 }, { country: 'UAE', percentage: 3 }],
      ageGroups: [
        { bracket: '18-24', percentage: 28 },
        { bracket: '25-34', percentage: 58 },
        { bracket: '35-44', percentage: 12 },
        { bracket: '45+', percentage: 2 }
      ],
      genderSplit: [{ gender: 'Male', percentage: 56 }, { gender: 'Female', percentage: 44 }],
      topInterests: ['Index Funds & Stocks', 'Credit Card Hacks', 'Real Estate Buying', 'FinTech Apps'],
      avgReach: 195000,
      avgImpressions: 285000
    },
    portfolio: [
      { id: 'p71', type: 'reel', title: 'How to Save ₹15,000 on Income Tax Old vs New Regime', thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80', views: 360000, likes: 28000, brandName: 'TaxSpanner' }
    ],
    previousCollaborations: [
      { id: 'b71', brandName: 'Groww', campaignType: 'SIP Education Campaign', contentType: 'Reels + YouTube', year: '2025', verified: true },
      { id: 'b72', brandName: 'HDFC Life', campaignType: 'Term Insurance Awareness', contentType: 'Reel + Story', year: '2025', verified: true }
    ],
    reviews: [
      {
        id: 'r71',
        brandName: 'Groww Marketing Team',
        rating: 5,
        reviewText: 'Sneha adheres to SEBI guidelines meticulously. High trust, high retention, exceptional conversion on app install campaigns.',
        campaignType: 'App Acquisition Campaign',
        date: '05 Feb 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 21300,
    savedCount: 590,
    createdAt: '2024-01-14'
  },
  {
    id: 'c8',
    name: 'Rohan Joshi & Team',
    username: 'rohancomedy',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&auto=format&fit=crop&q=80',
    bio: 'Gurgaon-based comedy sketches & corporate humor duo. Viral reels on startup hustle culture, office meetings, Indian weddings & modern dating.',
    currentCity: 'Gurgaon',
    state: 'Haryana',
    preferredCities: ['Gurgaon', 'Delhi NCR', 'Noida', 'Mumbai', 'Chandigarh'],
    primaryCategory: 'Comedy',
    subCategories: ['Entertainment', 'Lifestyle', 'Business'],
    languages: ['Hindi', 'English', 'Haryanvi'],
    gender: 'Male',
    ageGroup: '25-34',
    followers: 290000,
    avgViews: 380000,
    avgLikes: 26000,
    avgComments: 1800,
    brandCollaborationsCount: 46,
    trustScore: 95,
    trustSignals: {
      profileCompleteness: 96,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 97,
      audienceQuality: 95,
      collaborationHistoryScore: 96,
      verifiedReviewsCount: 20,
      responseRate: 94,
      campaignReliability: 96,
      accountActivityScore: 97,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity', 'Social Ownership'],
    isTop20: true,
    isRising: false,
    isFeatured: true,
    isTrending: true,
    status: 'active',
    startingPrice: 18000,
    pricing: {
      reelPrice: 28000,
      storyPrice: 8000,
      postPrice: 18000,
      ugcPrice: 20000,
      youtubePrice: 50000,
      eventPrice: 40000,
      isNegotiable: true,
      isBarterAvailable: false,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'UGC', 'Brand Ambassador', 'Event', 'Product Review'],
    socialPlatforms: [
    ],
    audience: {
      topCities: [
        { city: 'Delhi NCR', percentage: 38 },
        { city: 'Gurgaon', percentage: 22 },
        { city: 'Mumbai', percentage: 18 },
        { city: 'Noida', percentage: 12 },
        { city: 'Chandigarh', percentage: 10 }
      ],
      topCountries: [{ country: 'India', percentage: 95 }, { country: 'Others', percentage: 5 }],
      ageGroups: [
        { bracket: '18-24', percentage: 48 },
        { bracket: '25-34', percentage: 46 },
        { bracket: '35-44', percentage: 5 },
        { bracket: '45+', percentage: 1 }
      ],
      genderSplit: [{ gender: 'Male', percentage: 62 }, { gender: 'Female', percentage: 38 }],
      topInterests: ['Startup Culture', 'Weekend Parties', 'OTT Shows', 'Snacks & Quick Commerce'],
      avgReach: 420000,
      avgImpressions: 680000
    },
    portfolio: [
      { id: 'p81', type: 'reel', title: 'Types of Employees on a Friday 5 PM Zoom Call', thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80', views: 890000, likes: 62000, brandName: 'Slack India' }
    ],
    previousCollaborations: [
      { id: 'b81', brandName: 'Blinkit', campaignType: '10-Minute Delivery Sketch', contentType: 'Reels', year: '2025', verified: true },
      { id: 'b82', brandName: 'Zomato Gold', campaignType: 'Dining Out Humor', contentType: 'Reels', year: '2025', verified: true }
    ],
    reviews: [
      {
        id: 'r81',
        brandName: 'Blinkit Brand Strategy',
        rating: 5,
        reviewText: 'The integration was seamless and hilarious without feeling like a forced ad. Over 1.2M impressions delivered organically.',
        campaignType: 'Viral Brand Integration',
        date: '12 Feb 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 34100,
    savedCount: 920,
    createdAt: '2023-09-22'
  },
  {
    id: 'c9',
    name: 'Ishaan Aggarwal',
    username: 'ishaan_drives',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
    bio: 'Automotive journalist and supercar reviewer in Chandigarh. Real-world EV range tests, track drag races, luxury sedan reviews and modified car builds.',
    currentCity: 'Chandigarh',
    state: 'Punjab/Haryana',
    preferredCities: ['Chandigarh', 'Delhi NCR', 'Gurgaon', 'Jaipur', 'Mumbai'],
    primaryCategory: 'Automotive',
    subCategories: ['Technology', 'Luxury', 'Travel'],
    languages: ['Punjabi', 'Hindi', 'English'],
    gender: 'Male',
    ageGroup: '25-34',
    followers: 115000,
    avgViews: 140000,
    avgLikes: 9800,
    avgComments: 890,
    brandCollaborationsCount: 22,
    trustScore: 93,
    trustSignals: {
      profileCompleteness: 95,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 95,
      audienceQuality: 93,
      collaborationHistoryScore: 92,
      verifiedReviewsCount: 10,
      responseRate: 94,
      campaignReliability: 94,
      accountActivityScore: 93,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity'],
    isTop20: true,
    isRising: true,
    isFeatured: true,
    isTrending: true,
    status: 'active',
    startingPrice: 9000,
    pricing: {
      reelPrice: 14000,
      storyPrice: 4500,
      postPrice: 9000,
      ugcPrice: 11000,
      youtubePrice: 32000,
      eventPrice: 22000,
      isNegotiable: true,
      isBarterAvailable: false,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'UGC', 'Product Review', 'Event', 'Brand Ambassador'],
    socialPlatforms: [
    ],
    audience: {
      topCities: [
        { city: 'Chandigarh', percentage: 38 },
        { city: 'Delhi NCR', percentage: 32 },
        { city: 'Ludhiana', percentage: 14 },
        { city: 'Jaipur', percentage: 10 },
        { city: 'Others', percentage: 6 }
      ],
      topCountries: [{ country: 'India', percentage: 92 }, { country: 'Canada (Punjabi Diaspora)', percentage: 5 }, { country: 'Others', percentage: 3 }],
      ageGroups: [
        { bracket: '18-24', percentage: 44 },
        { bracket: '25-34', percentage: 48 },
        { bracket: '35-44', percentage: 7 },
        { bracket: '45+', percentage: 1 }
      ],
      genderSplit: [{ gender: 'Male', percentage: 86 }, { gender: 'Female', percentage: 14 }],
      topInterests: ['EV Cars', 'Superbikes', 'Car Detailing & Ceramic', 'Off-Roading 4x4'],
      avgReach: 175000,
      avgImpressions: 260000
    },
    portfolio: [
      { id: 'p91', type: 'reel', title: 'Delhi to Chandigarh EV Real Range Test', thumbnail: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&auto=format&fit=crop&q=80', views: 390000, likes: 27000, brandName: 'Tata EV' }
    ],
    previousCollaborations: [
      { id: 'b91', brandName: 'Tata Motors EV', campaignType: 'Nexon EV Long Distance Drive', contentType: 'YouTube + Reel', year: '2025', verified: true },
      { id: 'b92', brandName: 'Castrol India', campaignType: 'Engine Oil Performance Test', contentType: 'Reel', year: '2025', verified: true }
    ],
    reviews: [
      {
        id: 'r91',
        brandName: 'Tata Motors Digital PR',
        rating: 5,
        reviewText: 'Detailed, objective, transparent review with exact telemetry and charging data. Highly respected voice in North India.',
        campaignType: 'Car Launch Drive',
        date: '08 Feb 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 17200,
    savedCount: 430,
    createdAt: '2024-03-11'
  },
  {
    id: 'c10',
    name: 'Kavita Menon',
    username: 'kavitahomedecor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
    bio: 'Interior Stylist & Home Makeover creator in Chennai. Transforming compact Indian apartments into aesthetic, functional spaces with thrift finds, brass accents & plant decor.',
    currentCity: 'Chennai',
    state: 'Tamil Nadu',
    preferredCities: ['Chennai', 'Bangalore', 'Hyderabad', 'Kochi', 'Mumbai'],
    primaryCategory: 'Home & Interiors',
    subCategories: ['Lifestyle', 'Luxury', 'Real Estate'],
    languages: ['Tamil', 'English', 'Hindi', 'Malayalam'],
    gender: 'Female',
    ageGroup: '25-34',
    followers: 88000,
    avgViews: 95000,
    avgLikes: 6100,
    avgComments: 490,
    brandCollaborationsCount: 21,
    trustScore: 94,
    trustSignals: {
      profileCompleteness: 98,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 95,
      audienceQuality: 96,
      collaborationHistoryScore: 92,
      verifiedReviewsCount: 12,
      responseRate: 97,
      campaignReliability: 96,
      accountActivityScore: 94,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity'],
    isTop20: true,
    isRising: false,
    isFeatured: false,
    isTrending: false,
    status: 'active',
    startingPrice: 6000,
    pricing: {
      reelPrice: 9000,
      storyPrice: 3000,
      postPrice: 6000,
      ugcPrice: 7500,
      youtubePrice: 22000,
      eventPrice: 15000,
      isNegotiable: true,
      isBarterAvailable: true,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'Barter', 'UGC', 'Product Review', 'Brand Ambassador'],
    socialPlatforms: [
    ],
    audience: {
      topCities: [
        { city: 'Chennai', percentage: 44 },
        { city: 'Bangalore', percentage: 26 },
        { city: 'Hyderabad', percentage: 14 },
        { city: 'Mumbai', percentage: 10 },
        { city: 'Others', percentage: 6 }
      ],
      topCountries: [{ country: 'India', percentage: 94 }, { country: 'Singapore', percentage: 3 }, { country: 'Others', percentage: 3 }],
      ageGroups: [
        { bracket: '18-24', percentage: 20 },
        { bracket: '25-34', percentage: 58 },
        { bracket: '35-44', percentage: 18 },
        { bracket: '45+', percentage: 4 }
      ],
      genderSplit: [{ gender: 'Female', percentage: 78 }, { gender: 'Male', percentage: 22 }],
      topInterests: ['Modern Indian Decor', 'Indoor Plants', 'Modular Kitchens', 'Ceramics & Tableware'],
      avgReach: 135000,
      avgImpressions: 195000
    },
    portfolio: [
      { id: 'p101', type: 'reel', title: 'Balcony Makeover on a ₹5000 Budget', thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80', views: 340000, likes: 24000, brandName: 'IKEA India' }
    ],
    previousCollaborations: [
      { id: 'b101', brandName: 'IKEA India', campaignType: 'Festive Home Refresh', contentType: 'Reel + UGC', year: '2025', verified: true },
      { id: 'b102', brandName: 'Asian Paints', campaignType: 'Accent Wall Stencil DIY', contentType: 'Reels', year: '2025', verified: true }
    ],
    reviews: [
      {
        id: 'r101',
        brandName: 'IKEA Social Agency',
        rating: 5,
        reviewText: 'Kavita’s home aesthetic is immaculate. High save-rate on her reels and immense brand loyalty from homeowners.',
        campaignType: 'Product Placement',
        date: '15 Jan 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 14600,
    savedCount: 390,
    createdAt: '2024-04-01'
  },
  {
    id: 'c11',
    name: 'Zoya Khan',
    username: 'zoyakhan_vlogs',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&auto=format&fit=crop&q=80',
    bio: 'Lucknow lifestyle and Awadhi cultural creator. Showcasing Chikan embroidery heritage, Nawabi food trails, aesthetic wedding fashion, and everyday Lucknow city vlogs.',
    currentCity: 'Lucknow',
    state: 'Uttar Pradesh',
    preferredCities: ['Lucknow', 'Delhi NCR', 'Kanpur', 'Noida', 'Varanasi'],
    primaryCategory: 'Lifestyle',
    subCategories: ['Food', 'Fashion', 'Local Creators'],
    languages: ['Urdu', 'Hindi', 'English'],
    gender: 'Female',
    ageGroup: '22-29',
    followers: 68000,
    avgViews: 88000,
    avgLikes: 5400,
    avgComments: 460,
    brandCollaborationsCount: 16,
    trustScore: 91,
    trustSignals: {
      profileCompleteness: 94,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 96,
      audienceQuality: 92,
      collaborationHistoryScore: 89,
      verifiedReviewsCount: 7,
      responseRate: 96,
      campaignReliability: 93,
      accountActivityScore: 94,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram'],
    isTop20: true,
    isRising: true,
    isFeatured: false,
    isTrending: true,
    status: 'active',
    startingPrice: 4000,
    pricing: {
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
    collaborationTypes: ['Paid', 'Barter', 'UGC', 'Event', 'Product Review'],
    socialPlatforms: [
    ],
    audience: {
      topCities: [
        { city: 'Lucknow', percentage: 52 },
        { city: 'Delhi NCR', percentage: 22 },
        { city: 'Kanpur', percentage: 12 },
        { city: 'Noida', percentage: 8 },
        { city: 'Others', percentage: 6 }
      ],
      topCountries: [{ country: 'India', percentage: 97 }, { country: 'Others', percentage: 3 }],
      ageGroups: [
        { bracket: '18-24', percentage: 54 },
        { bracket: '25-34', percentage: 38 },
        { bracket: '35-44', percentage: 6 },
        { bracket: '45+', percentage: 2 }
      ],
      genderSplit: [{ gender: 'Female', percentage: 72 }, { gender: 'Male', percentage: 28 }],
      topInterests: ['Awadhi Cuisine', 'Chikan Kurtis', 'Shaadi Shopping', 'Cafe Openings in Gomti Nagar'],
      avgReach: 105000,
      avgImpressions: 155000
    },
    portfolio: [
      { id: 'p111', type: 'reel', title: 'Top 3 Hidden Chikan Embroidery Wholesalers in Chowk', thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80', views: 210000, likes: 16000, brandName: 'Local Heritage' }
    ],
    previousCollaborations: [
      { id: 'b111', brandName: 'FabAlley', campaignType: 'Festive Ethnic Wear Showcase', contentType: 'Reels', year: '2025', verified: true }
    ],
    reviews: [
      {
        id: 'r111',
        brandName: 'FabAlley Influencer Team',
        rating: 5,
        reviewText: 'Great engagement from Tier-2 UP markets. Zoya delivered quality content well before the campaign deadline.',
        campaignType: 'Regional Influencer Push',
        date: '22 Jan 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 10800,
    savedCount: 240,
    createdAt: '2024-05-10'
  },
  {
    id: 'c12',
    name: 'Devansh Parekh',
    username: 'devansh_builds',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    bio: 'Ahmedabad startup advisor & D2C growth creator. Breaking down Indian business case studies, zero-cost marketing strategies, unit economics, and founder interviews.',
    currentCity: 'Ahmedabad',
    state: 'Gujarat',
    preferredCities: ['Ahmedabad', 'Surat', 'Mumbai', 'Bangalore', 'Pune'],
    primaryCategory: 'Business',
    subCategories: ['Finance', 'Education', 'Technology'],
    languages: ['Gujarati', 'Hindi', 'English'],
    gender: 'Male',
    ageGroup: '25-34',
    followers: 74000,
    avgViews: 85000,
    avgLikes: 4900,
    avgComments: 580,
    brandCollaborationsCount: 20,
    trustScore: 92,
    trustSignals: {
      profileCompleteness: 96,
      phoneVerified: true,
      emailVerified: true,
      socialVerified: true,
      engagementQuality: 94,
      audienceQuality: 95,
      collaborationHistoryScore: 91,
      verifiedReviewsCount: 9,
      responseRate: 97,
      campaignReliability: 95,
      accountActivityScore: 93,
    },
    isVerified: true,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram', 'Identity'],
    isTop20: true,
    isRising: true,
    isFeatured: false,
    isTrending: false,
    status: 'active',
    startingPrice: 7000,
    pricing: {
      reelPrice: 10000,
      storyPrice: 3500,
      postPrice: 7000,
      ugcPrice: 8500,
      youtubePrice: 24000,
      eventPrice: 18000,
      isNegotiable: true,
      isBarterAvailable: false,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: ['Paid', 'UGC', 'Brand Ambassador', 'Event', 'Product Review'],
    socialPlatforms: [
    ],
    audience: {
      topCities: [
        { city: 'Ahmedabad', percentage: 42 },
        { city: 'Surat', percentage: 22 },
        { city: 'Mumbai', percentage: 18 },
        { city: 'Bangalore', percentage: 12 },
        { city: 'Others', percentage: 6 }
      ],
      topCountries: [{ country: 'India', percentage: 95 }, { country: 'USA', percentage: 3 }, { country: 'Others', percentage: 2 }],
      ageGroups: [
        { bracket: '18-24', percentage: 30 },
        { bracket: '25-34', percentage: 56 },
        { bracket: '35-44', percentage: 12 },
        { bracket: '45+', percentage: 2 }
      ],
      genderSplit: [{ gender: 'Male', percentage: 72 }, { gender: 'Female', percentage: 28 }],
      topInterests: ['Startup Growth Hacks', 'SaaS Tools', 'D2C Supply Chain', 'Angel Investing'],
      avgReach: 110000,
      avgImpressions: 160000
    },
    portfolio: [
      { id: 'p121', type: 'reel', title: 'How an Ahmedabad Textile Brand Scaled to ₹100 Cr with WhatsApp Commerce', thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80', views: 290000, likes: 21000, brandName: 'Case Study' }
    ],
    previousCollaborations: [
      { id: 'b121', brandName: 'Shopify India', campaignType: 'D2C Masterclass Series', contentType: 'Reels + Webinar', year: '2025', verified: true }
    ],
    reviews: [
      {
        id: 'r121',
        brandName: 'Shopify Growth Partner',
        rating: 5,
        reviewText: 'Devansh delivers high-utility business breakdowns. The quality of comments and inbound founder inquiries was phenomenal.',
        campaignType: 'Partner Webinar Campaign',
        date: '02 Feb 2026',
        verifiedCollaboration: true,
        ratingsBreakdown: { communication: 5, professionalism: 5, contentQuality: 5, timeliness: 5, overall: 5 }
      }
    ],
    profileViews: 12200,
    savedCount: 310,
    createdAt: '2024-02-28'
  }
,
  {
    "id": "c13",
    "name": "Siddharth Malhotra",
    "username": "siddharth_mumbai",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80",
    "bio": "Bandra Mumbai-based luxury menswear, streetwear styling and grooming creator. Collaborating with top Indian & international fashion brands.",
    "currentCity": "Mumbai",
    "state": "Maharashtra",
    "preferredCities": [
      "Mumbai",
      "Pune",
      "Goa"
    ],
    "primaryCategory": "Fashion",
    "subCategories": [
      "Lifestyle",
      "Luxury",
      "Beauty"
    ],
    "languages": [
      "Hindi",
      "English",
      "Marathi"
    ],
    "gender": "Male",
    "ageGroup": "25-34",
    "followers": 165000,
    "avgViews": 112000,
    "avgLikes": 8900,
    "avgComments": 520,
    "brandCollaborationsCount": 38,
    "trustScore": 95,
    "trustSignals": {
      "profileCompleteness": 98,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 94,
      "audienceQuality": 96,
      "collaborationHistoryScore": 95,
      "verifiedReviewsCount": 18,
      "responseRate": 96,
      "campaignReliability": 97,
      "accountActivityScore": 95
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity",
      "Social Ownership",
      "Profile Quality"
    ],
    "isTop20": true,
    "isRising": false,
    "isFeatured": true,
    "isTrending": true,
    "status": "active",
    "startingPrice": 12000,
    "pricing": {
      "reelPrice": 18000,
      "storyPrice": 6000,
      "postPrice": 12000,
      "ugcPrice": 11000,
      "youtubePrice": 32000,
      "eventPrice": 28000,
      "isNegotiable": false,
      "isBarterAvailable": false,
      "pricingDisplayType": "exact"
    },
    "collaborationTypes": [
      "Paid",
      "UGC",
      "Brand Ambassador",
      "Event"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "siddharth_mumbai",
        "url": "https://instagram.com",
        "followers": 165000,
        "avgViews": 112000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Mumbai",
          "percentage": 55
        },
        {
          "city": "Pune",
          "percentage": 20
        },
        {
          "city": "Delhi NCR",
          "percentage": 15
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 92
        },
        {
          "country": "UAE",
          "percentage": 5
        },
        {
          "country": "Others",
          "percentage": 3
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 38
        },
        {
          "bracket": "25-34",
          "percentage": 52
        },
        {
          "bracket": "35-44",
          "percentage": 10
        }
      ],
      "genderSplit": [
        {
          "gender": "Male",
          "percentage": 65
        },
        {
          "gender": "Female",
          "percentage": 35
        }
      ],
      "topInterests": [
        "Menswear",
        "Sneakers",
        "Luxury Watches",
        "Grooming"
      ],
      "avgReach": 180000,
      "avgImpressions": 260000
    },
    "portfolio": [
      {
        "id": "p131",
        "type": "reel",
        "title": "Summer Linen Capsule Wardrobe in South Bombay",
        "thumbnail": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&auto=format&fit=crop&q=80",
        "views": 195000,
        "likes": 16200,
        "brandName": "Zara Man"
      }
    ],
    "previousCollaborations": [
      {
        "id": "b131",
        "brandName": "Raymond",
        "campaignType": "Custom Tailoring Series",
        "contentType": "Reels",
        "year": "2025",
        "verified": true
      }
    ],
    "reviews": [],
    "profileViews": 19800,
    "savedCount": 540,
    "createdAt": "2024-01-15"
  },
  {
    "id": "c14",
    "name": "Natasha D'Souza",
    "username": "natasha_bites_mumbai",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
    "bio": "Mumbai food explorer & cafe critic. Covering Bandra, Colaba, BKC and hidden coastal seafood joints. High-converting restaurant footfall reviews.",
    "currentCity": "Mumbai",
    "state": "Maharashtra",
    "preferredCities": [
      "Mumbai",
      "Pune",
      "Goa"
    ],
    "primaryCategory": "Food",
    "subCategories": [
      "Travel",
      "Lifestyle",
      "Local Creators"
    ],
    "languages": [
      "English",
      "Hindi"
    ],
    "gender": "Female",
    "ageGroup": "22-29",
    "followers": 98000,
    "avgViews": 125000,
    "avgLikes": 9400,
    "avgComments": 710,
    "brandCollaborationsCount": 45,
    "trustScore": 94,
    "trustSignals": {
      "profileCompleteness": 97,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 96,
      "audienceQuality": 95,
      "collaborationHistoryScore": 94,
      "verifiedReviewsCount": 16,
      "responseRate": 98,
      "campaignReliability": 96,
      "accountActivityScore": 95
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": true,
    "isRising": true,
    "isFeatured": true,
    "isTrending": true,
    "status": "active",
    "startingPrice": 9000,
    "pricing": {
      "reelPrice": 14000,
      "storyPrice": 4500,
      "postPrice": 9000,
      "ugcPrice": 10000,
      "youtubePrice": 26000,
      "eventPrice": 22000,
      "isNegotiable": true,
      "isBarterAvailable": true,
      "pricingDisplayType": "starting"
    },
    "collaborationTypes": [
      "Paid",
      "Barter",
      "UGC",
      "Event"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "natasha_bites_mumbai",
        "url": "https://instagram.com",
        "followers": 98000,
        "avgViews": 125000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Mumbai",
          "percentage": 68
        },
        {
          "city": "Pune",
          "percentage": 18
        },
        {
          "city": "Thane",
          "percentage": 14
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 95
        },
        {
          "country": "UAE",
          "percentage": 3
        },
        {
          "country": "Others",
          "percentage": 2
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 44
        },
        {
          "bracket": "25-34",
          "percentage": 46
        },
        {
          "bracket": "35-44",
          "percentage": 10
        }
      ],
      "genderSplit": [
        {
          "gender": "Female",
          "percentage": 55
        },
        {
          "gender": "Male",
          "percentage": 45
        }
      ],
      "topInterests": [
        "Food Tasting",
        "Cocktail Lounges",
        "Dessert Spots",
        "Cafe Culture"
      ],
      "avgReach": 160000,
      "avgImpressions": 220000
    },
    "portfolio": [
      {
        "id": "p141",
        "type": "reel",
        "title": "Top 5 Rooftop Sunsets in Bandra with Cocktails",
        "thumbnail": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80",
        "views": 210000,
        "likes": 18400,
        "brandName": "Bastian"
      }
    ],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 16500,
    "savedCount": 420,
    "createdAt": "2024-03-20"
  },
  {
    "id": "c15",
    "name": "Kabir Saxena",
    "username": "kabir_fitness_mumbai",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80",
    "bio": "Mumbai strength & mobility coach. Clean nutrition, progressive overload workouts, and science-backed supplement reviews.",
    "currentCity": "Mumbai",
    "state": "Maharashtra",
    "preferredCities": [
      "Mumbai",
      "Pune",
      "Goa"
    ],
    "primaryCategory": "Fitness",
    "subCategories": [
      "Healthcare",
      "Lifestyle"
    ],
    "languages": [
      "Hindi",
      "English"
    ],
    "gender": "Male",
    "ageGroup": "25-34",
    "followers": 142000,
    "avgViews": 110000,
    "avgLikes": 7800,
    "avgComments": 460,
    "brandCollaborationsCount": 29,
    "trustScore": 93,
    "trustSignals": {
      "profileCompleteness": 96,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 93,
      "audienceQuality": 95,
      "collaborationHistoryScore": 92,
      "verifiedReviewsCount": 11,
      "responseRate": 95,
      "campaignReliability": 96,
      "accountActivityScore": 94
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": true,
    "isRising": false,
    "isFeatured": false,
    "isTrending": true,
    "status": "active",
    "startingPrice": 10000,
    "pricing": {
      "reelPrice": 15000,
      "storyPrice": 5000,
      "postPrice": 10000,
      "ugcPrice": 12000,
      "youtubePrice": 28000,
      "eventPrice": 25000,
      "isNegotiable": true,
      "isBarterAvailable": false,
      "pricingDisplayType": "starting"
    },
    "collaborationTypes": [
      "Paid",
      "UGC",
      "Brand Ambassador"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "kabir_fitness_mumbai",
        "url": "https://instagram.com",
        "followers": 142000,
        "avgViews": 110000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Mumbai",
          "percentage": 62
        },
        {
          "city": "Pune",
          "percentage": 22
        },
        {
          "city": "Nashik",
          "percentage": 8
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 94
        },
        {
          "country": "Others",
          "percentage": 6
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 35
        },
        {
          "bracket": "25-34",
          "percentage": 55
        },
        {
          "bracket": "35-44",
          "percentage": 10
        }
      ],
      "genderSplit": [
        {
          "gender": "Male",
          "percentage": 70
        },
        {
          "gender": "Female",
          "percentage": 30
        }
      ],
      "topInterests": [
        "Strength Training",
        "Whey Protein",
        "Gym Wear",
        "Meal Prep"
      ],
      "avgReach": 150000,
      "avgImpressions": 210000
    },
    "portfolio": [],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 14100,
    "savedCount": 390,
    "createdAt": "2024-02-10"
  },
  {
    "id": "c16",
    "name": "Ria Mehta",
    "username": "ria_mumbai_tales",
    "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80",
    "bio": "Visual artist & Mumbai lifestyle creator. Aesthetic reel transitions, heritage architecture, monsoon walks, and curated weekend getaways from Mumbai.",
    "currentCity": "Mumbai",
    "state": "Maharashtra",
    "preferredCities": [
      "Mumbai",
      "Pune",
      "Goa"
    ],
    "primaryCategory": "Travel",
    "subCategories": [
      "Photography",
      "Lifestyle",
      "Local Creators"
    ],
    "languages": [
      "English",
      "Hindi",
      "Gujarati"
    ],
    "gender": "Female",
    "ageGroup": "22-29",
    "followers": 110000,
    "avgViews": 135000,
    "avgLikes": 11200,
    "avgComments": 640,
    "brandCollaborationsCount": 26,
    "trustScore": 94,
    "trustSignals": {
      "profileCompleteness": 98,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 96,
      "audienceQuality": 97,
      "collaborationHistoryScore": 93,
      "verifiedReviewsCount": 14,
      "responseRate": 98,
      "campaignReliability": 97,
      "accountActivityScore": 96
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": false,
    "isRising": true,
    "isFeatured": true,
    "isTrending": true,
    "status": "active",
    "startingPrice": 11000,
    "pricing": {
      "reelPrice": 16000,
      "storyPrice": 5000,
      "postPrice": 11000,
      "ugcPrice": 12000,
      "youtubePrice": 30000,
      "eventPrice": 24000,
      "isNegotiable": true,
      "isBarterAvailable": false,
      "pricingDisplayType": "exact"
    },
    "collaborationTypes": [
      "Paid",
      "UGC",
      "Hotel Showcase"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "ria_mumbai_tales",
        "url": "https://instagram.com",
        "followers": 110000,
        "avgViews": 135000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Mumbai",
          "percentage": 65
        },
        {
          "city": "Pune",
          "percentage": 20
        },
        {
          "city": "Goa",
          "percentage": 15
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 93
        },
        {
          "country": "Others",
          "percentage": 7
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 48
        },
        {
          "bracket": "25-34",
          "percentage": 45
        },
        {
          "bracket": "35-44",
          "percentage": 7
        }
      ],
      "genderSplit": [
        {
          "gender": "Female",
          "percentage": 68
        },
        {
          "gender": "Male",
          "percentage": 32
        }
      ],
      "topInterests": [
        "Heritage Travel",
        "Aesthetic Photography",
        "Staycations",
        "Art Galleries"
      ],
      "avgReach": 170000,
      "avgImpressions": 240000
    },
    "portfolio": [],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 15300,
    "savedCount": 460,
    "createdAt": "2024-04-05"
  },
  {
    "id": "c17",
    "name": "Vikram Rane",
    "username": "vikram_pune_eats",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
    "bio": "Koregaon Park & FC Road food explorer. Discovering authentic Puneri misal, artisanal breweries, and trending cafe hotspots across Pune.",
    "currentCity": "Pune",
    "state": "Maharashtra",
    "preferredCities": [
      "Pune",
      "Mumbai"
    ],
    "primaryCategory": "Food",
    "subCategories": [
      "Lifestyle",
      "Local Creators"
    ],
    "languages": [
      "Marathi",
      "Hindi",
      "English"
    ],
    "gender": "Male",
    "ageGroup": "22-29",
    "followers": 88000,
    "avgViews": 95000,
    "avgLikes": 7400,
    "avgComments": 510,
    "brandCollaborationsCount": 31,
    "trustScore": 93,
    "trustSignals": {
      "profileCompleteness": 95,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 94,
      "audienceQuality": 95,
      "collaborationHistoryScore": 93,
      "verifiedReviewsCount": 12,
      "responseRate": 97,
      "campaignReliability": 96,
      "accountActivityScore": 94
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": true,
    "isRising": true,
    "isFeatured": true,
    "isTrending": false,
    "status": "active",
    "startingPrice": 6000,
    "pricing": {
      "reelPrice": 9500,
      "storyPrice": 3000,
      "postPrice": 6000,
      "ugcPrice": 7500,
      "youtubePrice": 18000,
      "eventPrice": 15000,
      "isNegotiable": true,
      "isBarterAvailable": true,
      "pricingDisplayType": "starting"
    },
    "collaborationTypes": [
      "Paid",
      "Barter",
      "Event"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "vikram_pune_eats",
        "url": "https://instagram.com",
        "followers": 88000,
        "avgViews": 95000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Pune",
          "percentage": 74
        },
        {
          "city": "Mumbai",
          "percentage": 18
        },
        {
          "city": "Others",
          "percentage": 8
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 97
        },
        {
          "country": "Others",
          "percentage": 3
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 52
        },
        {
          "bracket": "25-34",
          "percentage": 40
        },
        {
          "bracket": "35-44",
          "percentage": 8
        }
      ],
      "genderSplit": [
        {
          "gender": "Male",
          "percentage": 54
        },
        {
          "gender": "Female",
          "percentage": 46
        }
      ],
      "topInterests": [
        "Pune Food",
        "Misal Trails",
        "Cafes",
        "Weekend Foodies"
      ],
      "avgReach": 120000,
      "avgImpressions": 175000
    },
    "portfolio": [],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 13400,
    "savedCount": 360,
    "createdAt": "2024-03-12"
  },
  {
    "id": "c18",
    "name": "Aditi Kulkarni",
    "username": "aditi_puneri_vibe",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80",
    "bio": "Pune-based sustainable fashion & lifestyle creator. Celebrating contemporary Maharashtrian weaves, thrift culture, and aesthetic campus life.",
    "currentCity": "Pune",
    "state": "Maharashtra",
    "preferredCities": [
      "Pune",
      "Mumbai"
    ],
    "primaryCategory": "Fashion",
    "subCategories": [
      "Lifestyle",
      "Beauty"
    ],
    "languages": [
      "Marathi",
      "English",
      "Hindi"
    ],
    "gender": "Female",
    "ageGroup": "22-29",
    "followers": 120000,
    "avgViews": 105000,
    "avgLikes": 8200,
    "avgComments": 490,
    "brandCollaborationsCount": 28,
    "trustScore": 94,
    "trustSignals": {
      "profileCompleteness": 98,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 95,
      "audienceQuality": 96,
      "collaborationHistoryScore": 94,
      "verifiedReviewsCount": 15,
      "responseRate": 98,
      "campaignReliability": 97,
      "accountActivityScore": 95
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": true,
    "isRising": false,
    "isFeatured": true,
    "isTrending": true,
    "status": "active",
    "startingPrice": 8500,
    "pricing": {
      "reelPrice": 13000,
      "storyPrice": 4000,
      "postPrice": 8500,
      "ugcPrice": 9500,
      "youtubePrice": 24000,
      "eventPrice": 20000,
      "isNegotiable": true,
      "isBarterAvailable": false,
      "pricingDisplayType": "exact"
    },
    "collaborationTypes": [
      "Paid",
      "UGC",
      "Brand Ambassador"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "aditi_puneri_vibe",
        "url": "https://instagram.com",
        "followers": 120000,
        "avgViews": 105000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Pune",
          "percentage": 70
        },
        {
          "city": "Mumbai",
          "percentage": 20
        },
        {
          "city": "Kolhapur",
          "percentage": 10
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 96
        },
        {
          "country": "Others",
          "percentage": 4
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 55
        },
        {
          "bracket": "25-34",
          "percentage": 38
        },
        {
          "bracket": "35-44",
          "percentage": 7
        }
      ],
      "genderSplit": [
        {
          "gender": "Female",
          "percentage": 78
        },
        {
          "gender": "Male",
          "percentage": 22
        }
      ],
      "topInterests": [
        "Sustainable Fashion",
        "Indian Handlooms",
        "Thrift Shopping",
        "Skincare"
      ],
      "avgReach": 140000,
      "avgImpressions": 195000
    },
    "portfolio": [],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 15800,
    "savedCount": 480,
    "createdAt": "2024-02-18"
  },
  {
    "id": "c19",
    "name": "Nikhil Shinde",
    "username": "nikhil_pune_tech",
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
    "bio": "Pune tech enthusiast & EV reviewer. Hinjewadi IT corridor tech life, gadget tear downs, and everyday electric scooter real-world range tests.",
    "currentCity": "Pune",
    "state": "Maharashtra",
    "preferredCities": [
      "Pune",
      "Mumbai"
    ],
    "primaryCategory": "Technology",
    "subCategories": [
      "Automotive",
      "Business"
    ],
    "languages": [
      "Marathi",
      "English",
      "Hindi"
    ],
    "gender": "Male",
    "ageGroup": "25-34",
    "followers": 76000,
    "avgViews": 82000,
    "avgLikes": 5300,
    "avgComments": 410,
    "brandCollaborationsCount": 22,
    "trustScore": 92,
    "trustSignals": {
      "profileCompleteness": 94,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 93,
      "audienceQuality": 94,
      "collaborationHistoryScore": 92,
      "verifiedReviewsCount": 9,
      "responseRate": 96,
      "campaignReliability": 95,
      "accountActivityScore": 93
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": false,
    "isRising": true,
    "isFeatured": false,
    "isTrending": false,
    "status": "active",
    "startingPrice": 6500,
    "pricing": {
      "reelPrice": 10000,
      "storyPrice": 3500,
      "postPrice": 6500,
      "ugcPrice": 8000,
      "youtubePrice": 20000,
      "eventPrice": 16000,
      "isNegotiable": true,
      "isBarterAvailable": false,
      "pricingDisplayType": "starting"
    },
    "collaborationTypes": [
      "Paid",
      "UGC",
      "Product Review"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "nikhil_pune_tech",
        "url": "https://instagram.com",
        "followers": 76000,
        "avgViews": 82000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Pune",
          "percentage": 72
        },
        {
          "city": "Mumbai",
          "percentage": 18
        },
        {
          "city": "Others",
          "percentage": 10
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 95
        },
        {
          "country": "Others",
          "percentage": 5
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 38
        },
        {
          "bracket": "25-34",
          "percentage": 52
        },
        {
          "bracket": "35-44",
          "percentage": 10
        }
      ],
      "genderSplit": [
        {
          "gender": "Male",
          "percentage": 82
        },
        {
          "gender": "Female",
          "percentage": 18
        }
      ],
      "topInterests": [
        "Electric Vehicles",
        "Smartphone Reviews",
        "IT Workspaces",
        "Audio Tech"
      ],
      "avgReach": 105000,
      "avgImpressions": 145000
    },
    "portfolio": [],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 11800,
    "savedCount": 290,
    "createdAt": "2024-04-10"
  },
  {
    "id": "c20",
    "name": "Meera Sengupta",
    "username": "meera_delhi_glam",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    "bio": "South Delhi beauty & bridal aesthetic content creator. Luxury cosmetic unboxings, dermat skincare, and cocktail evening party glam.",
    "currentCity": "Delhi NCR",
    "state": "Delhi",
    "preferredCities": [
      "Delhi NCR",
      "Noida",
      "Gurgaon"
    ],
    "primaryCategory": "Beauty",
    "subCategories": [
      "Fashion",
      "Luxury"
    ],
    "languages": [
      "Hindi",
      "English",
      "Bengali"
    ],
    "gender": "Female",
    "ageGroup": "22-29",
    "followers": 195000,
    "avgViews": 140000,
    "avgLikes": 9800,
    "avgComments": 580,
    "brandCollaborationsCount": 36,
    "trustScore": 95,
    "trustSignals": {
      "profileCompleteness": 99,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 95,
      "audienceQuality": 97,
      "collaborationHistoryScore": 95,
      "verifiedReviewsCount": 17,
      "responseRate": 98,
      "campaignReliability": 97,
      "accountActivityScore": 96
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": true,
    "isRising": false,
    "isFeatured": true,
    "isTrending": true,
    "status": "active",
    "startingPrice": 14000,
    "pricing": {
      "reelPrice": 20000,
      "storyPrice": 6500,
      "postPrice": 14000,
      "ugcPrice": 13000,
      "youtubePrice": 38000,
      "eventPrice": 32000,
      "isNegotiable": false,
      "isBarterAvailable": false,
      "pricingDisplayType": "exact"
    },
    "collaborationTypes": [
      "Paid",
      "UGC",
      "Event",
      "Brand Ambassador"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "meera_delhi_glam",
        "url": "https://instagram.com",
        "followers": 195000,
        "avgViews": 140000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Delhi NCR",
          "percentage": 65
        },
        {
          "city": "Noida",
          "percentage": 15
        },
        {
          "city": "Gurgaon",
          "percentage": 12
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 94
        },
        {
          "country": "Others",
          "percentage": 6
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 40
        },
        {
          "bracket": "25-34",
          "percentage": 50
        },
        {
          "bracket": "35-44",
          "percentage": 10
        }
      ],
      "genderSplit": [
        {
          "gender": "Female",
          "percentage": 86
        },
        {
          "gender": "Male",
          "percentage": 14
        }
      ],
      "topInterests": [
        "Bridal Makeup",
        "Luxury Skincare",
        "Perfumes",
        "Jewellery"
      ],
      "avgReach": 190000,
      "avgImpressions": 270000
    },
    "portfolio": [],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 21500,
    "savedCount": 620,
    "createdAt": "2024-01-20"
  },
  {
    "id": "c21",
    "name": "Arjun Chawla",
    "username": "arjun_delhi_ai",
    "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
    "bio": "Delhi NCR software engineer & AI tools creator. Practical workflows with Claude, ChatGPT, Cursor, and hardware benchmarks.",
    "currentCity": "Delhi NCR",
    "state": "Delhi",
    "preferredCities": [
      "Delhi NCR",
      "Noida",
      "Gurgaon"
    ],
    "primaryCategory": "Technology",
    "subCategories": [
      "Business",
      "Education"
    ],
    "languages": [
      "Hindi",
      "English"
    ],
    "gender": "Male",
    "ageGroup": "25-34",
    "followers": 140000,
    "avgViews": 118000,
    "avgLikes": 8100,
    "avgComments": 630,
    "brandCollaborationsCount": 25,
    "trustScore": 94,
    "trustSignals": {
      "profileCompleteness": 97,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 95,
      "audienceQuality": 96,
      "collaborationHistoryScore": 93,
      "verifiedReviewsCount": 13,
      "responseRate": 97,
      "campaignReliability": 96,
      "accountActivityScore": 95
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": true,
    "isRising": false,
    "isFeatured": false,
    "isTrending": true,
    "status": "active",
    "startingPrice": 10000,
    "pricing": {
      "reelPrice": 15000,
      "storyPrice": 5000,
      "postPrice": 10000,
      "ugcPrice": 11000,
      "youtubePrice": 28000,
      "eventPrice": 22000,
      "isNegotiable": true,
      "isBarterAvailable": false,
      "pricingDisplayType": "starting"
    },
    "collaborationTypes": [
      "Paid",
      "UGC",
      "Product Review"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "arjun_delhi_ai",
        "url": "https://instagram.com",
        "followers": 140000,
        "avgViews": 118000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Delhi NCR",
          "percentage": 52
        },
        {
          "city": "Bangalore",
          "percentage": 22
        },
        {
          "city": "Hyderabad",
          "percentage": 14
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 91
        },
        {
          "country": "USA",
          "percentage": 5
        },
        {
          "country": "Others",
          "percentage": 4
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 42
        },
        {
          "bracket": "25-34",
          "percentage": 50
        },
        {
          "bracket": "35-44",
          "percentage": 8
        }
      ],
      "genderSplit": [
        {
          "gender": "Male",
          "percentage": 78
        },
        {
          "gender": "Female",
          "percentage": 22
        }
      ],
      "topInterests": [
        "Artificial Intelligence",
        "Coding Tools",
        "MacBook & Laptops",
        "Productivity"
      ],
      "avgReach": 160000,
      "avgImpressions": 230000
    },
    "portfolio": [],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 17200,
    "savedCount": 490,
    "createdAt": "2024-03-01"
  },
  {
    "id": "c22",
    "name": "Deepa Ramanathan",
    "username": "deepa_bengaluru_bites",
    "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    "coverImage": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
    "bio": "Bangalore culinary storyteller & craft brewery explorer. Indiranagar, Koramangala & traditional South Indian filter coffee & dosa trails.",
    "currentCity": "Bangalore",
    "state": "Karnataka",
    "preferredCities": [
      "Bangalore",
      "Mysore"
    ],
    "primaryCategory": "Food",
    "subCategories": [
      "Lifestyle",
      "Local Creators"
    ],
    "languages": [
      "Kannada",
      "English",
      "Tamil",
      "Hindi"
    ],
    "gender": "Female",
    "ageGroup": "22-29",
    "followers": 115000,
    "avgViews": 130000,
    "avgLikes": 9100,
    "avgComments": 640,
    "brandCollaborationsCount": 33,
    "trustScore": 94,
    "trustSignals": {
      "profileCompleteness": 98,
      "phoneVerified": true,
      "emailVerified": true,
      "socialVerified": true,
      "engagementQuality": 95,
      "audienceQuality": 96,
      "collaborationHistoryScore": 94,
      "verifiedReviewsCount": 14,
      "responseRate": 98,
      "campaignReliability": 96,
      "accountActivityScore": 95
    },
    "isVerified": true,
    "verificationStepsCompleted": [
      "Phone",
      "Email",
      "Instagram",
      "Identity"
    ],
    "isTop20": true,
    "isRising": false,
    "isFeatured": true,
    "isTrending": true,
    "status": "active",
    "startingPrice": 8000,
    "pricing": {
      "reelPrice": 13000,
      "storyPrice": 4000,
      "postPrice": 8000,
      "ugcPrice": 9500,
      "youtubePrice": 25000,
      "eventPrice": 20000,
      "isNegotiable": true,
      "isBarterAvailable": true,
      "pricingDisplayType": "starting"
    },
    "collaborationTypes": [
      "Paid",
      "Barter",
      "UGC",
      "Event"
    ],
    "socialPlatforms": [
      {
        "platform": "instagram",
        "username": "deepa_bengaluru_bites",
        "url": "https://instagram.com",
        "followers": 115000,
        "avgViews": 130000,
        "verified": true
      }
    ],
    "audience": {
      "topCities": [
        {
          "city": "Bangalore",
          "percentage": 76
        },
        {
          "city": "Chennai",
          "percentage": 12
        },
        {
          "city": "Hyderabad",
          "percentage": 8
        }
      ],
      "topCountries": [
        {
          "country": "India",
          "percentage": 96
        },
        {
          "country": "Others",
          "percentage": 4
        }
      ],
      "ageGroups": [
        {
          "bracket": "18-24",
          "percentage": 46
        },
        {
          "bracket": "25-34",
          "percentage": 48
        },
        {
          "bracket": "35-44",
          "percentage": 6
        }
      ],
      "genderSplit": [
        {
          "gender": "Female",
          "percentage": 58
        },
        {
          "gender": "Male",
          "percentage": 42
        }
      ],
      "topInterests": [
        "Bangalore Cafes",
        "South Indian Food",
        "Craft Breweries",
        "Weekend Brunches"
      ],
      "avgReach": 155000,
      "avgImpressions": 215000
    },
    "portfolio": [],
    "previousCollaborations": [],
    "reviews": [],
    "profileViews": 16100,
    "savedCount": 440,
    "createdAt": "2024-02-25"
  }
];

export const INITIAL_CAMPAIGNS: CampaignRequirement[] = [
  {
    id: 'req-1',
    companyName: 'Zest Naturals D2C',
    contactPerson: 'Aditi Nair',
    email: 'aditi@zestnaturals.com',
    phone: '+91 98765 43210',
    industry: 'Beauty & Skincare',
    campaignTitle: 'Summer Sunscreen Launch UGC & Reel Push',
    campaignDescription: 'Looking for 15 authentic skincare creators in Delhi NCR, Mumbai, and Bangalore with high engagement (4%+) to test and showcase our SPF 50 Invisible Sunscreen Gel.',
    city: 'Delhi NCR',
    influencersCount: '15 Creators',
    followerRange: '20K - 100K',
    budget: '₹1,50,000 Total Budget',
    category: 'Beauty',
    collaborationType: 'Paid + Product Gift',
    campaignDate: '15 March 2026',
    platforms: ['Instagram', 'YouTube Shorts'],
    requirements: '1 dedicated Instagram Reel + 2 Stories with trackable coupon link. Genuine application test required.',
    status: 'Open',
    applicantsCount: 0,
    applicants: [],
    createdAt: '2026-02-20'
  },
  {
    id: 'req-2',
    companyName: 'Spice & Sizzle Bistro',
    contactPerson: 'Karan Bhasin',
    email: 'karan@spicesizzle.in',
    phone: '+91 98111 22334',
    industry: 'Restaurants & Cafes',
    campaignTitle: 'New Rooftop Lounge Launch in Sector 104 Noida',
    campaignDescription: 'Inviting 10 Noida and Delhi NCR food bloggers for an exclusive VIP food tasting table and experiential reel showcase before public opening.',
    city: 'Noida',
    influencersCount: '10 Creators',
    followerRange: '10K - 80K',
    budget: '₹75,000 + Complimentary Feast for 2',
    category: 'Food',
    collaborationType: 'Paid + Barter Tasting',
    campaignDate: '05 March 2026',
    platforms: ['Instagram'],
    requirements: '1 Aesthetic Reel featuring rooftop ambiance, signature cocktails, and tandoori platters.',
    status: 'Open',
    applicantsCount: 0,
    applicants: [],
    createdAt: '2026-02-24'
  },
  {
    id: 'req-3',
    companyName: 'AeroRide Electric Bikes',
    contactPerson: 'Saurabh Roy',
    email: 'marketing@aeroride.in',
    phone: '+91 99220 88771',
    industry: 'Automotive & EVs',
    campaignTitle: 'AeroRide Pro Commuter EV Test Ride Series',
    campaignDescription: 'Seeking 5 tech/auto/lifestyle influencers in Bangalore and Pune to ride our new electric bicycle across city traffic and review commute savings.',
    city: 'Bangalore',
    influencersCount: '5 Creators',
    followerRange: '50K - 200K',
    budget: '₹1,20,000 Total',
    category: 'Technology',
    collaborationType: 'Paid',
    campaignDate: '20 March 2026',
    platforms: ['Instagram', 'YouTube'],
    requirements: '1 Reel + 1 YouTube Shorts demonstrating battery life, acceleration, and foldability.',
    status: 'Open',
    applicantsCount: 0,
    applicants: [],
    createdAt: '2026-02-25'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'influencer-marketing-pricing-india-2026-guide',
    title: 'Influencer Marketing Pricing in India: Complete 2026 Rate Card Guide',
    excerpt: 'How much should you pay Instagram creators in Delhi, Mumbai & Bangalore? Understand realistic costs for Reels, Stories, UGC, and Barter partnerships.',
    readTime: '6 min read',
    category: 'Influencer Pricing',
    date: '24 Feb 2026',
    author: 'thebrandsstory. Editorial Team',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    tags: ['Pricing', 'Campaigns', 'ROI', 'Negotiations'],
    relatedCategories: ['fashion', 'food', 'beauty'],
    relatedCities: ['delhi', 'mumbai', 'bangalore'],
    content: `
### Understanding Influencer Rates Across Indian Cities

In 2026, the Indian influencer economy has matured from arbitrary pricing into data-backed metrics driven by **Trust Score**, **Audience City Concentration**, and **Engagement Quality**.

#### Standard Rate Benchmarks in India:
- **Nano Creators (1K–10K followers)**: Barter / ₹1,500 – ₹4,000 per Reel. High local trust for restaurants and boutique stores.
- **Micro Creators (10K–50K followers)**: ₹4,000 – ₹12,000 per Reel. The highest ROI tier for D2C brands, skincare, and fashion.
- **Mid-Tier Creators (50K–200K followers)**: ₹12,000 – ₹35,000 per Reel. Established niche authority across tech, finance, fitness, and lifestyle.
- **Macro Creators (200K–1M followers)**: ₹35,000 – ₹1,50,000+ per Reel. Broad reach, brand awareness, and large-scale product launches.

#### Why Location Matters:
Tier-1 cities like Delhi NCR, Mumbai, and Bangalore command a 20–35% premium over Tier-2 hubs due to higher purchasing power and urban disposable income. However, regional creators in Lucknow, Jaipur, and Chandigarh frequently deliver higher direct conversion rates for hyperlocal footfall.
    `
  },
  {
    id: 'blog-2',
    slug: 'how-to-calculate-influencer-engagement-rate-accurately',
    title: 'How to Calculate Real Influencer Engagement Rate (And Spot Fake Followers)',
    excerpt: 'Why raw follower count is a vanity metric. Learn the exact formula used by thebrandsstory. to grade creator engagement and audience quality.',
    readTime: '5 min read',
    category: 'Analytics & Trust',
    date: '18 Feb 2026',
    author: 'Siddharth Rao, Head of Data',
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    tags: ['Engagement', 'Trust Score', 'Analytics', 'Brand Safety'],
    relatedCategories: ['technology', 'business'],
    relatedCities: ['delhi', 'mumbai'],
    content: `
### The True Engagement Formula

Many agencies still calculate engagement by simply dividing total likes by followers. In modern algorithmic distribution, this creates massive distortion.

#### The thebrandsstory. Weighted Formula:
\`\`\`
Engagement Rate % = ((Total Likes + (Total Comments * 2.5) + (Total Saves * 3.0)) / Total Views per Reel) * 100
\`\`\`

#### Key Red Flags to Watch Out For:
1. **Generic Comments**: 100 comments with just 🔥 or ❤️ emojis indicate automated pod groups.
2. **Sudden Follower Spikes**: Overnight jumps of 20,000 followers without a viral reel.
3. **Audience Geographic Mismatch**: A creator posting Hindi lifestyle content with 40% followers based outside South Asia.
    `
  },
  {
    id: 'blog-3',
    slug: 'best-fashion-influencers-delhi-ncr-campaigns',
    title: 'Top Fashion Creators in Delhi NCR for Viral Brand Campaigns',
    excerpt: 'From street style aesthetics in Hauz Khas to festive bridal glam in Chandni Chowk, discover top vetted fashion influencers in Delhi, Noida & Gurgaon.',
    readTime: '7 min read',
    category: 'City Spotlight',
    date: '12 Feb 2026',
    author: 'Anjali Mehra, Brand Partnerships',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    tags: ['Delhi NCR', 'Fashion', 'Apparel', 'Lookbooks'],
    relatedCategories: ['fashion', 'luxury', 'wedding'],
    relatedCities: ['delhi', 'noida', 'gurgaon'],
    content: `
### The Delhi NCR Creator Landscape

Delhi NCR remains India's largest fashion content production hub. With diverse micro-cultures spanning South Delhi luxury, Gurgaon corporate chic, and Noida Gen-Z street aesthetics, brands can tailor hyper-specific campaign narratives.

Explore verified creators on thebrandsstory. filtered by **Delhi NCR**, starting prices from ₹5,000 to ₹50,000 with transparent audience demographics.
    `
  }
];

export const BLOG_POSTS_DATA = BLOG_POSTS;

export const CAMPAIGN_TYPES = [
  'Instagram Reel Campaign',
  'Instagram Story Set (with Link)',
  'Dedicated YouTube Video',
  'YouTube Short / Mid-Roll',
  'UGC / Ad Creative Video',
  'Store Visit / Event Appearance',
  'Barter / Product Gifting Review',
  'Brand Ambassador (3-6 Months)',
];
