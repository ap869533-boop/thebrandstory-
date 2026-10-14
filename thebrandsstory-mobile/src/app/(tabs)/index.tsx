import React, { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Animated,
  DimensionValue,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import {
  AppScreen,
  BrandCampaignCard,
  Card,
  CreatorCard,
  FilterPill,
  Muted,
  PrimaryButton,
  Title,
  uiStyles,
} from '@/components/ui';
import { colors, spacing } from '@/theme';
import * as Location from 'expo-location';
import {
  useFeaturedBrands,
  useFeaturedCreators,
  useNearbyCreators,
  useOpenCampaigns,
  usePartnerBrands,
  usePlatformStats,
} from '@/hooks/queries';
import { useAuth } from '@/context/auth';
import { CATEGORIES } from '@/constants/data';
import { mediaUrl } from '@/config/api';
import {
  Search,
  Bell,
  MapPin,
  Check,
  Sparkles,
  Building2,
  ChevronRight,
  Trophy,
  Eye,
  Zap,
} from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const [howItWorksTab, setHowItWorksTab] = useState<'brands' | 'creators'>('brands');

  // Location Access State
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ready' | 'denied'>('idle');

  const requestLocation = async () => {
    try {
      setGeoStatus('loading');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoStatus('denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setGeoStatus('ready');
    } catch {
      setGeoStatus('denied');
    }
  };

  const creatorQuery = useFeaturedCreators(12);
  const nearbyQuery = useNearbyCreators(coords?.lat, coords?.lng, 10);
  const brandsQuery = useFeaturedBrands('');
  const campaignsQuery = useOpenCampaigns();
  const statsQuery = usePlatformStats();
  const partnerBrandsQuery = usePartnerBrands();
  const partnerBrands = partnerBrandsQuery.data?.brands || [];

  const creators = creatorQuery.data?.creators || [];
  const nearbyCreators =
    nearbyQuery.data?.creators && nearbyQuery.data.creators.length > 0
      ? nearbyQuery.data.creators
      : creators.slice(0, 8);
  const brands = brandsQuery.data?.brands || [];
  const campaigns = campaignsQuery.data?.campaigns || [];
  const stats = statsQuery.data?.stats || {};

  const isCreator = user?.role === 'CREATOR';
  const isBrand = user?.role === 'BRAND';

  return (
    <AppScreen contentStyle={styles.container}>
      {/* ================================================================
       * 1. FULL-BLEED HERO (matches website screenshot exactly)
       * ================================================================ */}
      <View style={styles.heroFull}>
        {/* Ambient background glows */}
        <View style={styles.heroGlowGold} />
        <View style={styles.heroGlowBlue} />

        {/* TOP BAR: Search pill + Notification Bell */}
        <View style={styles.heroTopBar}>
          <Pressable
            style={styles.heroSearchPill}
            onPress={() => router.navigate('/(tabs)/explore')}
          >
            <Search size={16} color="#9aabc2" strokeWidth={2.5} />
            <Text style={styles.heroSearchPlaceholder}>Search creators here...</Text>
          </Pressable>
          <Pressable
            style={styles.heroBellBtn}
            onPress={() => {
              if (user) {
                router.push('/(tabs)/account');
              } else {
                router.push('/login');
              }
            }}
          >
            <Bell size={20} color="#071326" strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* LOGO: thebrandsstory. (large centered) */}
        <View style={styles.heroLogoWrap}>
          <Text style={styles.heroLogo}>
            <Text style={styles.heroLogoThe}>the</Text>
            <Text style={styles.heroLogoBrands}>brands</Text>
            <Text style={styles.heroLogoStory}>story</Text>
            <Text style={styles.heroLogoDot}>.</Text>
          </Text>
        </View>

        {/* HEADING */}
        <Text style={styles.heroTitle}>Your next collab is here</Text>

        {/* STATS LINE */}
        <Text style={styles.heroStatsSub}>
          1,00,000+ Influencers <Text style={styles.dividerPipe}>|</Text> 10,000+ Brands
        </Text>

        {/* PERKS LINE (uses bullet dots • like screenshot) */}
        <Text style={styles.heroPerksSub}>
          No Middleman  <Text style={styles.dividerDot}>•</Text>  0% Commission  <Text style={styles.dividerDot}>•</Text>  100% Free
        </Text>

        {/* CREATOR SELFIE ILLUSTRATION */}
        <View style={styles.heroIllustrationWrap}>
          <Image
            source={require('../../../assets/creator-selfie.png')}
            style={styles.heroIllustration}
            contentFit="contain"
          />
        </View>

        {/* Centered pill-style hero CTAs */}
        <View style={styles.heroActionsStack}>
          {isCreator ? (
            <>
              <PrimaryButton
                title="Search Brands"
                variant="white"
                onPress={() => router.push('/(tabs)/campaigns')}
                style={styles.heroStackedBtn}
              />
              <PrimaryButton
                title="View Opportunities"
                variant="blue"
                onPress={() => router.push('/(tabs)/campaigns')}
                style={styles.heroStackedBtn}
              />
            </>
          ) : isBrand ? (
            <>
              <PrimaryButton
                title="Search Influencers"
                variant="white"
                onPress={() => router.navigate('/(tabs)/explore')}
                style={styles.heroStackedBtn}
              />
              <PrimaryButton
                title="My Campaigns"
                variant="blue"
                onPress={() => router.push('/my-campaigns')}
                style={styles.heroStackedBtn}
              />
            </>
          ) : (
            <>
              <PrimaryButton
                title="Sign in"
                variant="white"
                onPress={() =>
                  router.push({
                    pathname: '/login',
                    params: { mode: 'signin' },
                  })
                }
                style={styles.heroStackedBtn}
              />
              <PrimaryButton
                title="Get Started For Free"
                variant="blue"
                onPress={() =>
                  router.push({
                    pathname: '/login',
                    params: { mode: 'signup' },
                  })
                }
                style={styles.heroStackedBtn}
              />
            </>
          )}
        </View>
      </View>

      {/* ================================================================
       * REST OF PAGE — padded sections
       * ================================================================ */}
      <View style={styles.sectionsWrap}>

      {/* 3. Brand Partners Slider (Real API data with auto-scroll marquee) */}
      {partnerBrands.length > 0 && (
        <BrandMarquee brands={partnerBrands} />
      )}
      {/* 4.5. Nearby Influencers — only shown when location is granted */}
      {geoStatus === 'ready' ? (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Title style={styles.sectionMainTitle}>Nearby Influencers</Title>
              <Muted style={styles.sectionSubTitle}>
                Creators closest to you, based on your live location.
              </Muted>
            </View>
            <Pressable onPress={() => router.navigate('/(tabs)/explore')}>
              <Text style={styles.viewAllGoldLink}>View All ›</Text>
            </Pressable>
          </View>

          {nearbyQuery.isLoading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator color={colors.gold} />
              <Muted>Finding nearby influencers…</Muted>
            </View>
          ) : (
            <ScrollView
              horizontal
              style={styles.creatorCardsViewport}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.horizontalCardsScroll, styles.creatorCardsScrollContent]}
            >
              {nearbyCreators.map((creator) => (
                <CreatorCard
                  key={`nearby-${creator.id}`}
                  creator={creator}
                  variant="carousel"
                />
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        /* Location access prompt card — shown before permission is given */
        <View style={styles.geoPromptBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.geoPromptTitle}>
              {geoStatus === 'denied'
                ? 'Location access was denied'
                : 'Discover Nearby Influencers'}
            </Text>
            <Text style={styles.geoPromptSub}>
              {geoStatus === 'denied'
                ? 'Allow location in Settings to see creators near your city.'
                : 'Enable location to get hyper-local creator recommendations.'}
            </Text>
          </View>
          <Pressable
            onPress={requestLocation}
            disabled={geoStatus === 'loading'}
            style={styles.geoPromptBtn}
          >
            {geoStatus === 'loading' ? (
              <ActivityIndicator size="small" color="#071326" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} color="#071326" strokeWidth={2.5} />
                <Text style={styles.geoPromptBtnText}>
                  {geoStatus === 'denied' ? 'Retry' : 'Use Location'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      )}

      {/* 5. Top 20 Influencers in India (Exact web TopCreatorsSection) */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Title style={styles.sectionMainTitle}>Top 20 Influencers in India</Title>
            <Muted style={styles.sectionSubTitle}>
              Curated leaders with verified engagement & proven campaign ROI
            </Muted>
          </View>
          <Pressable onPress={() => router.navigate('/(tabs)/explore')}>
            <Text style={styles.viewAllGoldLink}>View Leaderboard ›</Text>
          </Pressable>
        </View>

        {creatorQuery.isLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator color={colors.gold} />
            <Muted>Loading top influencers…</Muted>
          </View>
        ) : creatorQuery.isError ? (
          <View style={styles.loaderBox}>
            <Muted style={{ color: colors.red, textAlign: 'center' }}>
              {(creatorQuery.error as any)?.message || 'Failed to load influencers'}
            </Muted>
            <Pressable
              onPress={() => creatorQuery.refetch()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 14,
                backgroundColor: colors.surfaceRaised,
                borderWidth: 1,
                borderColor: colors.border,
                marginTop: 6,
              }}
            >
              <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 12 }}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            style={styles.creatorCardsViewport}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalCardsScroll, styles.creatorCardsScrollContent]}
          >
            {creators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                variant="carousel"
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* 6. Brands & Campaign Hiring (Exact web FeaturedBrandsSection with White Cards) */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Title style={styles.sectionMainTitle}>Brands & Campaign Hiring</Title>
            <Muted style={styles.sectionSubTitle}>
              Registered brand profiles actively looking for creator collaborations
            </Muted>
          </View>
          <Pressable onPress={() => router.push('/brands')}>
            <Text style={styles.viewAllGoldLink}>View All Brands ›</Text>
          </Pressable>
        </View>

        {brandsQuery.isLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator color={colors.gold} />
            <Muted>Loading brand collabs…</Muted>
          </View>
        ) : brandsQuery.isError ? (
          <View style={styles.loaderBox}>
            <Muted style={{ color: colors.red, textAlign: 'center' }}>
              {(brandsQuery.error as any)?.message || 'Failed to load brand collabs'}
            </Muted>
            <Pressable
              onPress={() => brandsQuery.refetch()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 14,
                backgroundColor: colors.surfaceRaised,
                borderWidth: 1,
                borderColor: colors.border,
                marginTop: 6,
              }}
            >
              <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 12 }}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardsScroll}
          >
            {brands.map((brand, idx) => (
              <BrandCampaignCard
                key={`${brand.id || brand.brandName}-${idx}`}
                brand={brand}
                variant="carousel"
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* 7. Category Browser */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Title style={styles.sectionMainTitle}>Browse by Category</Title>
            <Muted style={styles.sectionSubTitle}>
              Target creators by industry niche
            </Muted>
          </View>
          <Pressable onPress={() => router.navigate('/(tabs)/explore')}>
            <Text style={styles.viewAllGoldLink}>View All (50+) ›</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {CATEGORIES.slice(1, 14).map((cat) => (
            <FilterPill
              key={cat.id}
              label={cat.name}
              active={false}
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/explore',
                  params: { category: cat.id },
                });
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* 8. How thebrandsstory. Works (Exact web HowItWorksSection) */}
      <View style={styles.sectionContainer}>
        <View style={{ alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Title style={[styles.sectionMainTitle, { textAlign: 'center' }]}>
            How thebrandsstory. Works
          </Title>
          <Muted style={{ textAlign: 'center', maxWidth: 300 }}>
            A frictionless ecosystem connecting India’s brands with verified creators in minutes.
          </Muted>

          {/* Interactive Toggle Switch */}
          <View style={styles.howItWorksToggle}>
            <Pressable
              onPress={() => setHowItWorksTab('brands')}
              style={[
                styles.toggleBtn,
                howItWorksTab === 'brands' && styles.toggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  howItWorksTab === 'brands' && styles.toggleBtnTextActive,
                ]}
              >
                For Brands
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setHowItWorksTab('creators')}
              style={[
                styles.toggleBtn,
                howItWorksTab === 'creators' && styles.toggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  howItWorksTab === 'creators' && styles.toggleBtnTextActive,
                ]}
              >
                For Creators
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 3 Steps */}
        {howItWorksTab === 'brands' ? (
          <View style={styles.stepsStack}>
            <Card style={styles.stepBox}>
              <View style={styles.stepNumRing}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <Text style={styles.stepHeading}>Search, Filter & Compare</Text>
              <Muted style={styles.stepDesc}>
                Discover creators across 50+ categories and 100+ cities with live engagement metrics and transparent pricing.
              </Muted>
            </Card>

            <Card style={styles.stepBox}>
              <View style={styles.stepNumRing}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <Text style={styles.stepHeading}>Post Brief or Direct Connect</Text>
              <Muted style={styles.stepDesc}>
                Publish a campaign brief with your budget, deliverables, and timeline, or send direct inquiries.
              </Muted>
            </Card>

            <Card style={styles.stepBox}>
              <View style={styles.stepNumRing}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <Text style={styles.stepHeading}>0% Commission Collaboration</Text>
              <Muted style={styles.stepDesc}>
                Review pitches, negotiate directly, and execute campaigns with zero agency markups or hidden fees.
              </Muted>
            </Card>
          </View>
        ) : (
          <View style={styles.stepsStack}>
            <Card style={styles.stepBox}>
              <View style={styles.stepNumRing}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <Text style={styles.stepHeading}>List Your Profile Free</Text>
              <Muted style={styles.stepDesc}>
                Create a verified media kit showcasing your portfolio, audience metrics, and collaboration rates.
              </Muted>
            </Card>

            <Card style={styles.stepBox}>
              <View style={styles.stepNumRing}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <Text style={styles.stepHeading}>Pitch for Live Brand Deals</Text>
              <Muted style={styles.stepDesc}>
                Browse real-time brand briefs and submit tailored pitches directly to marketing teams.
              </Muted>
            </Card>

            <Card style={styles.stepBox}>
              <View style={styles.stepNumRing}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <Text style={styles.stepHeading}>Direct Brand Payouts</Text>
              <Muted style={styles.stepDesc}>
                Deliver content, grow your personal brand, and keep 100% of your earnings with zero platform cuts.
              </Muted>
            </Card>
          </View>
        )}
      </View>

      {/* 9. Live Opportunities Board */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Title style={styles.sectionMainTitle}>Live Opportunities Board</Title>
            <Muted style={styles.sectionSubTitle}>
              Real-time campaign briefs open for pitches right now
            </Muted>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/campaigns')}>
            <Text style={styles.viewAllGoldLink}>View All ({campaigns.length}) ›</Text>
          </Pressable>
        </View>

        {campaigns.slice(0, 3).map((camp) => (
          <Card key={camp.id} style={styles.liveOppCard}>
            <View style={uiStyles.rowBetween}>
              <Text numberOfLines={1} style={styles.oppBrandName}>
                {camp.companyName || 'Verified Brand'} · {camp.city || 'Pan India'}
              </Text>
              <View style={styles.oppBudgetPill}>
                <Text style={styles.oppBudgetText}>
                  {camp.budget ? `₹${camp.budget}` : 'Flexible'}
                </Text>
              </View>
            </View>

            <Text style={styles.oppCampTitle}>{camp.campaignTitle}</Text>
            <Muted numberOfLines={2}>
              {camp.campaignDescription || camp.requirements}
            </Muted>

            <View style={[uiStyles.rowBetween, { marginTop: 4 }]}>
              <Text style={styles.oppMeta}>
                {camp.category || 'All Categories'} · {camp.collaborationType || 'Paid Collab'}
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/campaigns')}
                style={styles.oppPitchBtn}
              >
                <Text style={styles.oppPitchBtnText}>Apply Now ›</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </View>

      {/* 10. Dual CTA Banners (Exact Website CTABanners.tsx) */}
      <View style={styles.ctaStack}>
        {/* Banner 1: For Brands */}
        <View style={styles.ctaCardBrand}>
          <View style={styles.ctaTagPill}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Building2 size={11} color={colors.gold} strokeWidth={2.5} />
              <Text style={styles.ctaTagText}>FOR BRANDS, AGENCIES & BUSINESSES</Text>
            </View>
          </View>
          <Text style={styles.ctaCardTitle}>Need Influencers For Your Next Launch?</Text>
          <Text style={styles.ctaCardSub}>
            Post your campaign brief in under 2 minutes. Receive curated creator proposals, rate cards, and verified metrics.
          </Text>
          <View style={styles.ctaPerksRow}>
            <View style={styles.ctaPerkItemRow}>
              <Check size={11} color={colors.gold} strokeWidth={3} />
              <Text style={styles.ctaPerkItem}>0% Middleman Markups</Text>
            </View>
            <View style={styles.ctaPerkItemRow}>
              <Check size={11} color={colors.gold} strokeWidth={3} />
              <Text style={styles.ctaPerkItem}>Verified Creators</Text>
            </View>
            <View style={styles.ctaPerkItemRow}>
              <Check size={11} color={colors.gold} strokeWidth={3} />
              <Text style={styles.ctaPerkItem}>Direct Briefs</Text>
            </View>
          </View>
          <PrimaryButton
            title="Search Influencers  ›"
            variant="gold"
            onPress={() => router.navigate('/(tabs)/explore')}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Banner 2: For Creators */}
        <View style={styles.ctaCardCreator}>
          <View style={styles.ctaTagPill}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Sparkles size={11} color={colors.gold} strokeWidth={2.5} />
              <Text style={styles.ctaTagText}>100% FREE CREATOR LISTING</Text>
            </View>
          </View>
          <Text style={styles.ctaCardTitle}>Are You a Creator? List Yourself FREE</Text>
          <Text style={styles.ctaCardSub}>
            Get discovered by thousands of active brands across India. Build your verified profile and receive direct paid enquiries.
          </Text>
          <View style={styles.ctaPerksRow}>
            <View style={styles.ctaPerkItemRow}>
              <Check size={11} color={colors.gold} strokeWidth={3} />
              <Text style={styles.ctaPerkItem}>Instant Public Profile</Text>
            </View>
            <View style={styles.ctaPerkItemRow}>
              <Check size={11} color={colors.gold} strokeWidth={3} />
              <Text style={styles.ctaPerkItem}>Zero Commission Cuts</Text>
            </View>
            <View style={styles.ctaPerkItemRow}>
              <Check size={11} color={colors.gold} strokeWidth={3} />
              <Text style={styles.ctaPerkItem}>Direct Inquiries</Text>
            </View>
          </View>
          <PrimaryButton
            title="List Yourself — FREE in 60s  ›"
            variant="white"
            onPress={() => router.push('/login')}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
      </View>
    </AppScreen>
  );
}

/* ================================================================
 * BRAND MARQUEE — infinite auto-scroll like the website
 * ================================================================ */
const CARD_WIDTH = 140;
const CARD_GAP = 10;

function BrandMarquee({ brands }: { brands: { id: string; name: string; logoUrl: string }[] }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  // Triplicate for seamless loop
  const displayBrands = [...brands, ...brands, ...brands];
  const singleSetWidth = brands.length * (CARD_WIDTH + CARD_GAP);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -singleSetWidth,
        duration: brands.length * 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [brands.length, singleSetWidth]);

  return (
    <View style={styles.brandSliderWrap}>
    
      <View style={{ overflow: 'hidden' }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: CARD_GAP,
            transform: [{ translateX: scrollX }],
          }}
        >
          {displayBrands.map((brand, idx) => (
            <View key={`${brand.id}-${idx}`} style={styles.brandSliderCard}>
              {brand.logoUrl ? (
                <Image
                  source={{ uri: mediaUrl(brand.logoUrl) }}
                  style={styles.brandSliderImg}
                  contentFit="contain"
                  transition={200}
                />
              ) : (
                <View style={styles.brandSliderFallback}>
                  <Text style={styles.brandSliderFallbackText}>
                    {brand.name?.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text numberOfLines={1} style={styles.brandSliderName}>
                {brand.name}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingBottom: 50,
    gap: 0,
  },
  sectionsWrap: {
    gap: 22,
    paddingBottom: 10,
  },

  /* ====== FULL-BLEED HERO (matches screenshot) ====== */
  heroFull: {
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 36,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    gap: 6,
  },
  heroGlowGold: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 300,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(212, 163, 56, 0.10)',
  },
  heroGlowBlue: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 260,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },

  /* Top bar: Search pill + Hamburger */
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
    marginBottom: 14,
  },
  heroSearchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#3b5998',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    gap: 10,
  },
  heroSearchIcon: {
    fontSize: 16,
  },
  heroSearchPlaceholder: {
    color: '#9aabc2',
    fontSize: 14,
    fontWeight: '500',
  },
  heroBellBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBellIcon: {
    fontSize: 20,
    color: '#071326',
  },

  /* Logo */
  heroLogoWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  heroLogo: {
    fontSize: 34,
    letterSpacing: -0.5,
  },
  heroLogoThe: {
    color: '#ffffff',
    fontWeight: '400',
    fontSize: 34,
  },
  heroLogoBrands: {
    color: '#D4A338',
    fontWeight: '900',
    fontSize: 34,
  },
  heroLogoStory: {
    color: '#ffffff',
    fontWeight: '400',
    fontSize: 34,
  },
  heroLogoDot: {
    color: '#D4A338',
    fontWeight: '900',
    fontSize: 34,
  },

  /* Hero Text */
  heroTitle: {
    color: '#ffffff',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.6,
    marginTop: 10,
    marginBottom: 6,
  },
  heroStatsSub: {
    color: '#8eb6ff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  heroPerksSub: {
    color: 'rgba(142, 182, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  dividerPipe: {
    color: 'rgba(255, 255, 255, 0.35)',
  },
  dividerDot: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },

  /* Creator Illustration */
  heroIllustrationWrap: {
    width: '80%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  heroIllustration: {
    width: '100%',
    height: '100%',
  },

  /* Hero Buttons — stacked vertically */
  heroActionsStack: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 18,
    marginTop: 10,
  },
  heroStackedBtn: {
    width: '80%',
    maxWidth: 280,
    alignSelf: 'center',
    height: 42,
    borderRadius: 28,
  },

  /* Brand Partners Slider */
  brandSliderWrap: {
    gap: 10,
    marginVertical: 4,
    marginHorizontal: spacing.md,
  },
  sliderLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  brandSliderScroll: {
    gap: 10,
    paddingRight: 10,
  },
  brandSliderCard: {
    width: 130,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  brandSliderImg: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  brandSliderName: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },

  /* Live Stats Strip */
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  statVal: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  statLbl: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },

  /* Section Styles */
  sectionContainer: {
    gap: 12,
    paddingHorizontal: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionMainTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  sectionSubTitle: {
    fontSize: 11,
    marginTop: 2,
  },
  viewAllGoldLink: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  horizontalCardsScroll: {
    paddingLeft: spacing.md,
    paddingRight: 14,
    paddingVertical: 4,
    gap: 14,
  },
  creatorCardsViewport: {
    height: 324,
  },
  creatorCardsScrollContent: {
    minHeight: 324,
    alignItems: 'flex-start',
  },
  pillsScroll: {
    gap: 8,
    paddingLeft: spacing.md,
    paddingRight: 10,
  },
  loaderBox: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  /* Geo Prompt Banner (Matches website location banner) */
  geoPromptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#0c1e3d',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 56, 0.35)',
    gap: 12,
  },
  geoPromptTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  geoPromptSub: {
    color: '#94a3b8',
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 15,
  },
  geoPromptBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  geoPromptBtnText: {
    color: '#071326',
    fontSize: 11,
    fontWeight: '900',
  },

  /* How It Works Section */
  howItWorksToggle: {
    flexDirection: 'row',
    backgroundColor: '#0d224b',
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  toggleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
  },
  toggleBtnActive: {
    backgroundColor: colors.gold,
  },
  toggleBtnText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  toggleBtnTextActive: {
    color: '#071326',
  },
  stepsStack: {
    gap: 10,
    marginTop: 4,
  },
  stepBox: {
    padding: 16,
    gap: 6,
    borderRadius: 20,
    backgroundColor: '#091b3b',
    borderColor: '#1e3357',
  },
  stepNumRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 163, 56, 0.2)',
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  stepNumText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900',
  },
  stepHeading: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 18,
  },

  /* Live Opportunities */
  liveOppCard: {
    gap: 8,
    padding: 16,
    borderRadius: 20,
  },
  oppBrandName: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  oppBudgetPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  oppBudgetText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
  },
  oppCampTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  oppMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  oppPitchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  oppPitchBtnText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
  },

  /* CTA Banners */
  ctaStack: {
    gap: 16,
    marginTop: 4,
    marginHorizontal: spacing.md,
  },
  ctaCardBrand: {
    padding: 22,
    borderRadius: 26,
    backgroundColor: '#0b1d3d',
    borderWidth: 1.5,
    borderColor: '#1e3863',
    gap: 10,
  },
  ctaCardCreator: {
    padding: 22,
    borderRadius: 26,
    backgroundColor: '#0c244f',
    borderWidth: 1.5,
    borderColor: colors.gold,
    gap: 10,
  },
  ctaTagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 163, 56, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 56, 0.3)',
  },
  ctaTagText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  ctaCardTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  ctaCardSub: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
  ctaPerksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  ctaPerkItem: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  ctaPerkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandSliderFallback: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSliderFallbackText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '900',
  },
});