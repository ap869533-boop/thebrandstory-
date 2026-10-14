import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { mediaUrl } from '@/config/api';
import {
  AppScreen,
  Card,
  ErrorText,
  FilterPill,
  Header,
  Muted,
  PrimaryButton,
  Title,
  uiStyles,
} from '@/components/ui';
import { colors, spacing } from '@/theme';
import { useAuth } from '@/context/auth';
import { useCreatorProfile } from '@/hooks/queries';
import { useAppStore } from '@/state/app-store';
import { Heart, Check, Star, ShieldCheck, ChevronRight } from 'lucide-react-native';

export default function CreatorProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user } = useAuth();
  const creatorQuery = useCreatorProfile(username);
  const creator = creatorQuery.data?.creator;

  const savedCreatorIds = useAppStore((state) => state.savedCreatorIds);
  const toggleSavedCreator = useAppStore((state) => state.toggleSavedCreator);
  const isSaved = creator ? savedCreatorIds.includes(String(creator.id)) : false;

  const followers = Number(creator?.followers) || 0;
  const followerTier =
    followers >= 1_000_000
      ? 'Superstar'
      : followers >= 500_000
      ? 'Mega'
      : followers >= 100_000
      ? 'Macro'
      : followers >= 50_000
      ? 'Mid-Tier'
      : followers >= 10_000
      ? 'Micro'
      : 'Nano';

  const formatFollowers = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(count >= 10_000 ? 0 : 1)}K`;
    return String(count);
  };

  const handleContact = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Navigate to chat or enquiry
    router.push({
      pathname: '/chat/[id]',
      params: { id: creator?.id || creator?.username || 'new' },
    });
  };

  const openInstagram = () => {
    if (creator?.username) {
      const url = `https://instagram.com/${creator.username.replace('@', '')}`;
      Linking.openURL(url).catch(() => Alert.alert('Could not open link'));
    }
  };

  return (
    <AppScreen>
      <Header
        title="Creator Profile"
        back
        rightAction={
          creator ? (
            <Pressable
              onPress={() => toggleSavedCreator(String(creator.id))}
              style={[styles.saveHeaderBtn, isSaved && styles.saveHeaderBtnActive]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Heart size={14} color={isSaved ? colors.red : colors.text} fill={isSaved ? colors.red : 'transparent'} />
                <Text style={[styles.saveHeaderIcon, isSaved && styles.saveHeaderIconActive]}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </View>
            </Pressable>
          ) : null
        }
      />

      {creatorQuery.error ? (
        <ErrorText>{creatorQuery.error.message}</ErrorText>
      ) : null}

      {creatorQuery.isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Muted>Loading creator profile…</Muted>
        </View>
      ) : creator ? (
        <View style={styles.profileContainer}>
          {/* 1. Cover Banner & Avatar */}
          <View style={styles.bannerWrapper}>
            <Image
              source={{
                uri: mediaUrl(
                  creator.coverImage ||
                    creator.reelThumbnailUrl ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
                ),
              }}
              style={styles.coverImage}
              contentFit="cover"
            />
            <View style={styles.coverOverlay} />

            {/* Avatar overlapping bottom of cover */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: mediaUrl(
                    creator.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
                  ),
                }}
                style={styles.avatarImage}
                contentFit="cover"
              />
              {creator.isVerified ? (
                <View style={styles.verifiedBadge}>
                  <Check size={11} color="#ffffff" strokeWidth={3} />
                </View>
              ) : null}
            </View>
          </View>

          {/* 2. Identity & Tier Details */}
          <View style={styles.identitySection}>
            <View style={styles.nameRow}>
              <Text style={styles.creatorName}>{creator.name}</Text>
            </View>

            <Text style={styles.creatorHandle}>
              @{creator.username} · {creator.currentCity || 'India'}
            </Text>

            <View style={styles.pillRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>
                  {creator.primaryCategory || 'Creator'}
                </Text>
              </View>
              <View style={styles.tierPill}>
                <Text style={styles.tierPillText}>{followerTier} Tier</Text>
              </View>
              {creator.rating ? (
                <View style={[styles.ratingPill, { flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
                  <Star size={11} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingPillText}>{Number(creator.rating).toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* 3. Key 4-Column Stats Strip */}
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statColumn}>
                <Text style={styles.statVal}>{formatFollowers(followers)}</Text>
                <Text style={styles.statLbl}>FOLLOWERS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statColumn}>
                <Text style={styles.statVal}>{formatFollowers(creator.avgViews || 0)}</Text>
                <Text style={styles.statLbl}>AVG VIEWS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statColumn}>
                <Text style={styles.statVal}>{formatFollowers(creator.avgLikes || 0)}</Text>
                <Text style={styles.statLbl}>AVG LIKES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statColumn}>
                <Text style={[styles.statVal, { color: colors.gold }]}>
                  {creator.brandCollaborationsCount || '15'}+
                </Text>
                <Text style={styles.statLbl}>COLLABS</Text>
              </View>
            </View>
          </Card>

          {/* 4. Pricing & Commercials Card */}
          <Card style={styles.pricingCard}>
            <View style={uiStyles.rowBetween}>
              <View>
                <Text style={styles.pricingTag}>COMMERCIAL RATE</Text>
                <Text style={styles.pricingAmount}>
                  {creator.hideCommercialRates
                    ? 'Rates On Request'
                    : `From ₹${Number(creator.startingPrice || 0).toLocaleString('en-IN')}`}
                </Text>
              </View>
              <View style={[styles.secureTag, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <ShieldCheck size={13} color="#10b981" />
                <Text style={styles.secureTagText}>100% Secure</Text>
              </View>
            </View>
            <Muted style={{ fontSize: 12, marginTop: 4 }}>
              Includes standard deliverables: Reels, Stories, or dedicated feature.
            </Muted>
          </Card>

          {/* 5. Bio & About Section */}
          <Card style={styles.infoCard}>
            <Title style={{ fontSize: 16 }}>About Creator</Title>
            <Text style={styles.bioText}>
              {creator.bio ||
                `${creator.name} is a leading ${creator.primaryCategory} influencer based in ${
                  creator.currentCity || 'India'
                }, known for authentic storytelling and brand promotions.`}
            </Text>

            {/* Languages & Content Tags */}
            {creator.languages && creator.languages.length > 0 ? (
              <View style={{ marginTop: 8, gap: 4 }}>
                <Text style={styles.subHead}>Languages:</Text>
                <View style={styles.tagWrap}>
                  {(Array.isArray(creator.languages) ? creator.languages : [creator.languages]).map(
                    (lang: string) => (
                      <View key={lang} style={styles.langPill}>
                        <Text style={styles.langPillText}>{lang}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            ) : null}
          </Card>

          {/* 6. Action CTAs */}
          <View style={styles.actionsWrap}>
            <PrimaryButton
              title="Collaborate / Send Message  ›"
              variant="gold"
              onPress={handleContact}
            />

            {creator.username ? (
              <PrimaryButton
                title="View Instagram Profile"
                variant="outline"
                onPress={openInstagram}
                style={{ marginTop: 8 }}
              />
            ) : null}
          </View>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveHeaderBtnActive: {
    backgroundColor: 'rgba(251, 113, 133, 0.2)',
    borderColor: colors.red,
  },
  saveHeaderIcon: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  saveHeaderIconActive: {
    color: colors.red,
  },

  profileContainer: {
    gap: 16,
    paddingBottom: 30,
  },

  /* Banner & Avatar */
  bannerWrapper: {
    height: 200,
    borderRadius: 24,
    overflow: 'visible',
    position: 'relative',
    marginBottom: 44,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 17, 38, 0.35)',
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -36,
    left: 20,
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3.5,
    borderColor: colors.background,
    backgroundColor: colors.surfaceRaised,
    zIndex: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0095F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  verifiedBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },

  /* Identity */
  identitySection: {
    paddingHorizontal: 6,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  creatorHandle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 163, 56, 0.15)',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  categoryPillText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
  },
  tierPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  ratingPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
  },
  ratingPillText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '800',
  },

  /* Stats */
  statsCard: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  statLbl: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },

  /* Pricing */
  pricingCard: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: '#0a1d3b',
  },
  pricingTag: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  pricingAmount: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  secureTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 201, 154, 0.15)',
  },
  secureTagText: {
    color: colors.green,
    fontSize: 10,
    fontWeight: '800',
  },

  /* Info */
  infoCard: {
    padding: 18,
    gap: 8,
  },
  bioText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  subHead: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },

  actionsWrap: {
    marginTop: 6,
  },
});
