import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing } from '@/theme';
import { mediaUrl } from '@/config/api';
import { useAppStore } from '@/state/app-store';
import {
  MapPin,
  ChevronRight,
  ChevronLeft,
  Heart,
  Check,
  Users,
  Gift,
  Calendar,
  Building2,
} from 'lucide-react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';

export function AppScreen({
  children,
  scroll = true,
  contentStyle,
}: React.PropsWithChildren<{ scroll?: boolean; contentStyle?: StyleProp<ViewStyle> }>) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Header({
  title,
  subtitle,
  back = false,
  rightAction,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  rightAction?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      {back && (
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back} hitSlop={10}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>
            <Text style={{ color: colors.text }}>the</Text>
            <Text style={{ color: colors.gold }}>brands</Text>
            <Text style={{ color: colors.text }}>story.</Text>
          </Text>
        </View>
        {title ? <Text style={styles.headerTitle}>{title}</Text> : null}
        {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
      </View>
      {rightAction ? <View>{rightAction}</View> : null}
    </View>
  );
}

export function Title({ children, style }: React.PropsWithChildren<{ style?: StyleProp<ViewStyle | object> }>) {
  return <Text style={[styles.title, style as any]}>{children}</Text>;
}

export function Body({ children, style }: React.PropsWithChildren<{ style?: StyleProp<ViewStyle | object> }>) {
  return <Text style={[styles.body, style as any]}>{children}</Text>;
}

export function Muted({ children, style, ...props }: React.PropsWithChildren<TextProps>) {
  return <Text {...props} style={[styles.muted, style]}>{children}</Text>;
}

export function Card({ children, style }: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  busy = false,
  variant = 'gold',
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: 'gold' | 'white' | 'blue' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const getBtnStyle = () => {
    switch (variant) {
      case 'white':
        return styles.btnWhite;
      case 'blue':
        return styles.btnBlue;
      case 'outline':
        return styles.btnOutline;
      default:
        return styles.btnGold;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'white':
        return '#071326';
      case 'outline':
        return colors.gold;
      default:
        return '#ffffff';
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'white':
        return '#ffffff';
      case 'blue':
        return '#759BF6';
      case 'outline':
        return 'transparent';
      default:
        return colors.gold;
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [styles.button, getBtnStyle(), (disabled || busy) && styles.disabled, pressed && styles.pressed, style]}
    >
      {variant !== 'outline' ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.buttonBackground, { backgroundColor: getBackgroundColor() }]}
        />
      ) : null}
      {busy ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.buttonText, textStyle, { color: getTextColor() }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />;
}

export function FilterPill({
  label,
  active,
  onPress,
  badge,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  badge?: string | number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active ? styles.pillActive : styles.pillInactive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
        {label}
      </Text>
      {badge !== undefined ? (
        <View style={[styles.pillBadge, active ? styles.pillBadgeActive : styles.pillBadgeInactive]}>
          <Text style={[styles.pillBadgeText, active ? styles.pillBadgeTextActive : styles.pillBadgeTextInactive]}>
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/* --------------------------------------------------------------------------
 * CREATOR CARD
 * Every variant uses the same fixed card dimensions; only carousel spacing differs.
 * -------------------------------------------------------------------------- */

export function CreatorCard({
  creator,
  variant = 'grid',
  onPress,
}: {
  creator: any;
  variant?: 'grid' | 'carousel' | 'compact';
  onPress?: () => void;
}) {
  const followers = Number(creator.followers) || 0;
  const savedCreatorIds = useAppStore((state) => state.savedCreatorIds);
  const toggleSavedCreator = useAppStore((state) => state.toggleSavedCreator);
  const isSaved = savedCreatorIds.includes(String(creator.id));

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/creator/[username]',
        params: { username: encodeURIComponent(creator.username || creator.id) },
      });
    }
  };

  const handleSaveClick = (e: any) => {
    e.stopPropagation?.();
    toggleSavedCreator(String(creator.id));
  };

  const displayImage =
    creator.reelThumbnailUrl ||
    creator.coverImage ||
    creator.portfolio?.[0]?.thumbnail ||
    creator.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';

  const initials = (creator.name || 'CR')
    .split(/\s+/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CR';

  const categoryLabel = creator.primaryCategory || 'Creator';
  const cityLabel = creator.currentCity || 'India';

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

  const followerTierColors: Record<string, { bg: string; text: string; border: string }> = {
    Superstar: { bg: 'rgba(117, 80, 168, 0.95)', text: '#ffffff', border: '#c5a9f2' },
    Mega: { bg: 'rgba(166, 79, 112, 0.95)', text: '#ffffff', border: '#e7a8be' },
    Macro: { bg: 'rgba(63, 109, 155, 0.95)', text: '#ffffff', border: '#9bc4ed' },
    'Mid-Tier': { bg: 'rgba(154, 112, 40, 0.95)', text: '#ffffff', border: '#e9c879' },
    Micro: { bg: 'rgba(57, 116, 86, 0.95)', text: '#ffffff', border: '#8bc4a0' },
    Nano: { bg: 'rgba(89, 97, 109, 0.95)', text: '#ffffff', border: '#aeb6c0' },
  };

  const currentTier = followerTierColors[followerTier] || followerTierColors.Nano;
  const gradientId = `cardGrad-${String(creator.id || creator.username || 'creator').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  const tierBorderColor =
    followers > 1_000_000
      ? '#68d9e8' // Diamond glow
      : followers > 100_000
      ? '#D4A338' // Gold metallic
      : followers > 50_000
      ? '#b7c0ca' // Silver metallic
      : 'rgba(255, 255, 255, 0.55)';

  const cardShadow =
    followers > 1_000_000
      ? {
          shadowColor: '#68d9e8',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 6,
        }
      : followers > 100_000
      ? {
          shadowColor: '#D4A338',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5,
        }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 3,
        };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.fullCard,
        variant === 'carousel' && styles.carouselCard,
        cardShadow,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.cardInner}>
      {/* 1. Full poster image */}
      <Image
        source={{ uri: mediaUrl(displayImage) }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />

      <View pointerEvents="none" style={styles.cardFullOverlay} />

      {/* 2. Full-card tint with stronger shading toward the bottom */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#020617" stopOpacity="0.05" />
            <Stop offset="1" stopColor="#020617" stopOpacity="0.3" />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>

      {/* 3. Top bar */}
      <View style={styles.cardTopBar}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text numberOfLines={1} style={styles.categoryBadgeText}>
              {categoryLabel}
            </Text>
          </View>
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: currentTier.bg, borderColor: currentTier.border },
            ]}
          >
            <Text numberOfLines={1} style={[styles.tierBadgeText, { color: currentTier.text }]}>
              {followerTier}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSaveClick}
          hitSlop={10}
          style={[styles.saveBtnCircle, isSaved && styles.saveBtnCircleActive]}
        >
          <Heart size={16} color="#ffffff" fill={isSaved ? '#ffffff' : 'transparent'} />
        </Pressable>
      </View>

      {/* Spacer pushes bottom info down */}
      <View style={{ flex: 1 }} />

      {/* 4. Bottom info */}
      <View style={styles.cardBottom}>
        <View style={styles.creatorIdentityRow}>
          {creator.avatar ? (
            <Image
              source={{ uri: mediaUrl(creator.avatar) }}
              style={styles.cardAvatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.cardAvatarFallback}>
              <Text style={styles.cardAvatarFallbackText}>{initials}</Text>
            </View>
          )}

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} style={[styles.cardCreatorName, { flexShrink: 1 }]}>
                {creator.name || 'Creator'}
              </Text>
              {creator.isVerified ? (
                <View style={styles.verifiedDot}>
                  <Check size={9} color="#ffffff" strokeWidth={3} />
                </View>
              ) : null}
            </View>
            <Text numberOfLines={1} style={styles.cardCreatorHandle}>
              @{creator.username || 'creator'} · {cityLabel}
            </Text>
          </View>
        </View>

        <View style={styles.cardStatsRow}>
          <Text numberOfLines={1} style={styles.cardFollowersText}>
            {formatFollowers(followers)} followers
          </Text>
          <Text numberOfLines={1} style={styles.cardPriceText}>
            {creator.hideCommercialRates
              ? 'On Request'
              : `From ₹${Number(creator.startingPrice || 0).toLocaleString('en-IN')}`}
          </Text>
        </View>
      </View>

      {/* Border drawn on top so the image never hides it */}
      <View pointerEvents="none" style={[styles.cardBorderOverlay, { borderColor: tierBorderColor }]} />
      </View>
    </Pressable>
  );
}

/* --------------------------------------------------------------------------
 * BRAND CAMPAIGN CARD (matches website BrandCampaignCard)
 * Layout: big gold-ringed logo, name, industry, bio, city,
 * 3-column stats box (HIRING / BUDGET / DEADLINE) and a navy "View collab" pill.
 * Height is fixed for carousel/default so every card is the same size.
 * -------------------------------------------------------------------------- */

export function BrandCampaignCard({
  brand,
  onPress,
}: {
  brand: any;
  onPress?: () => void;
  variant?: 'default' | 'featured' | 'carousel';
}) {
  const [logoFailed, setLogoFailed] = React.useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/brand/[id]',
        params: { id: encodeURIComponent(brand.id || brand.userId || brand.brandName) },
      });
    }
  };

  const formatCurrency = (amount: number) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  // Same as web: new Date(`${date}T12:00:00`) -> "15 Oct 2026"
  const formatDate = (date: string) => {
    if (!date) return '';
    try {
      const raw = String(date);
      const d = new Date(raw.length >= 10 ? `${raw.slice(0, 10)}T12:00:00` : raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(date);
    }
  };

  // Same rule as web: budget shows when campaignBudgetMin is set; amount = max ?? min
  const hasBudget = brand.campaignBudgetMin !== null && brand.campaignBudgetMin !== undefined;
  const budgetValue = brand.campaignBudgetMax ?? brand.campaignBudgetMin;
  const hasDeadline = !!brand.lastHiringDate;
  const hiringCount = Number(brand.totalHiringCount || 0);
  const ringGradId = `brandRing-${String(brand.id || brand.brandName || 'brand').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.brandCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.brandInner}>
        {/* TOP: logo, name, industry, bio, city */}
        <View style={styles.brandTop}>
          {/* Logo with gold gradient ring + glow */}
          <View style={styles.brandLogoGlow}>
            <View style={styles.brandLogoRing}>
              <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                <Defs>
                  <SvgLinearGradient id={ringGradId} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#D4A338" />
                    <Stop offset="0.5" stopColor="#fde68a" />
                    <Stop offset="1" stopColor="#D4A338" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${ringGradId})`} />
              </Svg>
              {brand.logoUrl && !logoFailed ? (
                <Image
                  source={{ uri: mediaUrl(brand.logoUrl) }}
                  style={styles.brandLogo}
                  contentFit="cover"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <View style={styles.brandLogoFallback}>
                  <Building2 size={24} color="#D4A338" />
                </View>
              )}
            </View>
          </View>

          <Text numberOfLines={1} style={styles.brandCardTitle}>
            {brand.brandName || 'Brand'}
          </Text>

          {brand.approvalStatus === 'pending' ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>REGISTRATION UNDER REVIEW</Text>
            </View>
          ) : null}

          <Text numberOfLines={1} style={styles.brandIndustry}>
            {brand.industry || 'Industry not added yet'}
          </Text>

          <Text numberOfLines={2} style={styles.brandDescription}>
            {brand.description?.trim() || 'Brand bio not added yet.'}
          </Text>

          <Text numberOfLines={1} style={styles.brandCity}>
            {brand.city || ' '}
          </Text>
        </View>

        {/* BOTTOM: stats grid + button (pinned to the bottom, like mt-auto) */}
        <View style={styles.brandBottom}>
          <View style={styles.brandStatsGrid}>
            {/* HIRING */}
            <View style={styles.brandStatCol}>
              <View style={styles.brandStatLabelRow}>
                <Users size={10} color="#9fb2cf" strokeWidth={2.5} />
                <Text numberOfLines={1} style={styles.brandStatLabel}>HIRING</Text>
              </View>
              <Text numberOfLines={2} style={styles.brandHiringValue}>
                {hiringCount.toLocaleString('en-IN')}
                <Text style={styles.brandHiringSub}> + Creators</Text>
              </Text>
            </View>

            {/* BUDGET */}
            <View style={[styles.brandStatCol, styles.brandStatBorder]}>
              <View style={styles.brandStatLabelRow}>
                <Gift size={10} color="#9fb2cf" strokeWidth={2.5} />
                <Text numberOfLines={1} style={styles.brandStatLabel}>BUDGET</Text>
              </View>
              {hasBudget ? (
                <Text numberOfLines={2}>
                  <Text style={styles.brandBudgetUpto}>upto </Text>
                  <Text style={styles.brandBudgetValue}>{formatCurrency(budgetValue)}</Text>
                </Text>
              ) : (
                <Text numberOfLines={2} style={styles.brandNotSpecified}>Not specified</Text>
              )}
            </View>

            {/* DEADLINE */}
            <View style={styles.brandStatCol}>
              <View style={styles.brandStatLabelRow}>
                <Calendar size={10} color="#9fb2cf" strokeWidth={2.5} />
                <Text numberOfLines={1} style={styles.brandStatLabel}>DEADLINE</Text>
              </View>
              {hasDeadline ? (
                <Text numberOfLines={2} style={styles.brandDeadlineValue}>
                  {formatDate(brand.lastHiringDate)}
                </Text>
              ) : (
                <Text numberOfLines={2} style={styles.brandNotSpecified}>Not specified</Text>
              )}
            </View>
          </View>

          <View style={styles.brandActionBtn}>
            <Text style={styles.brandActionBtnText}>View collab</Text>
            <ArrowRightIcon />
          </View>
        </View>
      </View>

      {/* Gold border drawn on top, same radius as the card */}
      <View pointerEvents="none" style={styles.brandBorderOverlay} />
    </Pressable>
  );
}

function ArrowRightIcon() {
  return <ChevronRight size={15} color="#ffffff" strokeWidth={2.5} />;
}

export function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value);
}

export function ErrorText({ children }: React.PropsWithChildren) {
  return <Text accessibilityRole="alert" style={styles.error}>{children}</Text>;
}

export const uiStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  section: { gap: spacing.md, marginTop: spacing.lg },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  fill: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: spacing.md, paddingBottom: 44, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.sm },
  back: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  backText: { fontSize: 30, lineHeight: 32, color: colors.text },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brand: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  headerTitle: { marginTop: 4, color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.6 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  card: { padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface, gap: spacing.sm },

  button: { minHeight: 48, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  buttonBackground: { borderRadius: 28 },
  btnGold: { backgroundColor: colors.gold },
  btnWhite: { backgroundColor: '#ffffff' },
  btnBlue: { backgroundColor: '#759BF6' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.gold },
  buttonText: { fontWeight: '900', fontSize: 14 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },

  input: { height: 48, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 14, color: colors.text, backgroundColor: colors.surface, fontSize: 14 },

  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, gap: 6 },
  pillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  pillInactive: { backgroundColor: colors.surface, borderColor: colors.border },
  pillText: { fontSize: 12, fontWeight: '800' },
  pillTextActive: { color: '#071326' },
  pillTextInactive: { color: colors.text },
  pillBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  pillBadgeActive: { backgroundColor: '#071326' },
  pillBadgeInactive: { backgroundColor: colors.surfaceRaised },
  pillBadgeText: { fontSize: 10, fontWeight: '800' },
  pillBadgeTextActive: { color: colors.gold },
  pillBadgeTextInactive: { color: colors.muted },

  /* ---------- Creator card ---------- */
  fullCard: {
    width: 200,
    height: 380,
    borderRadius: 28,
    backgroundColor: '#020617',
    marginBottom: 12,
    alignSelf: 'center',
    flexShrink: 0,
    flexGrow: 0,
  },
  carouselCard: { marginRight: 16 },
  cardInner: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#020617',
  },
  cardFullOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 6, 23, 0.15)',
  },
  cardBorderOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
    borderWidth: 2,
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    gap: 6,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, minWidth: 0 },
  categoryBadge: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    flexShrink: 1,
    maxWidth: 100,
  },
  categoryBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  tierBadge: { height: 22, paddingHorizontal: 8, borderRadius: 11, borderWidth: 1, justifyContent: 'center' },
  tierBadgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.4 },
  saveBtnCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnCircleActive: { backgroundColor: '#e11d48', borderColor: '#fb7185' },
  cardBottom: { paddingHorizontal: 10, paddingBottom: 12, paddingTop: 8, gap: 8 },
  creatorIdentityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: colors.surfaceRaised,
  },
  cardAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: '#D4A338',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarFallbackText: { color: '#020617', fontSize: 12, fontWeight: '900' },
  cardCreatorName: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: -0.2 },
  verifiedDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#0095F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCreatorHandle: { color: '#cbd5e1', fontSize: 10, fontWeight: '500', marginTop: 1 },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingTop: 8,
    gap: 6,
  },
  cardFollowersText: { color: '#fff', fontSize: 10.5, fontWeight: '800', flexShrink: 1 },
  cardPriceText: { color: '#fff', fontSize: 10.5, fontWeight: '800', flexShrink: 1 },

  /* ---------- Brand card (dark navy, gold border) ---------- */
  // Outer shell: fixed size so every card is identical
  brandCard: {
    width: 250,
    minWidth: 250,
    maxWidth: 250,
    flexBasis: 250,
    height: 355,
    borderRadius: 24,
    backgroundColor: '#18233f',
    alignSelf: 'flex-start',
    flexShrink: 0,
    flexGrow: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  // Inner clip + padding
  brandInner: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#18233f',
    padding: 18,
    justifyContent: 'space-between',
  },
  brandBorderOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 163, 56, 0.75)',
  },
  brandTop: { alignSelf: 'stretch', alignItems: 'center', marginTop: 4 },
  brandBottom: { alignSelf: 'stretch', gap: 14 },
  brandLogoGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D4A338',
    shadowColor: '#D4A338',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  brandLogoRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: { width: '100%', height: '100%', borderRadius: 29, backgroundColor: '#000' },
  brandLogoFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCardTitle: {
    marginTop: 12,
    marginBottom: 2,
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
    alignSelf: 'stretch',
  },
  pendingBadge: {
    marginTop: 3,
    marginBottom: 5,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pendingBadgeText: { color: '#92400e', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  brandIndustry: {
    marginBottom: 6,
    color: '#9fb2cf',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  brandDescription: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    color: '#5f7295',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    minHeight: 32,
    alignSelf: 'stretch',
    flexShrink: 1,
  },
  brandCity: {
    marginTop: 6,
    minHeight: 13,
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  brandStatsGrid: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  brandStatCol: {
    flex: 1,
    minWidth: 0,
    padding: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  brandStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  brandStatLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 3 },
  brandStatLabel: { color: '#9fb2cf', fontSize: 7, fontWeight: '900', letterSpacing: 0.4, flexShrink: 1 },
  brandHiringValue: { color: '#ffffff', fontSize: 13, fontWeight: '900', lineHeight: 16 },
  brandHiringSub: { color: '#7388ab', fontSize: 9, fontWeight: '600' },
  brandBudgetUpto: { color: '#7388ab', fontSize: 8.5, fontWeight: '500' },
  brandBudgetValue: { color: '#10d98c', fontSize: 10, fontWeight: '700' },
  brandDeadlineValue: { color: '#ffffff', fontSize: 11, fontWeight: '900', lineHeight: 14 },
  brandNotSpecified: { color: '#64779a', fontSize: 11, fontWeight: '700', lineHeight: 14 },
  brandActionBtn: {
    alignSelf: 'stretch',
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a1630',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  brandActionBtnText: { color: '#ffffff', fontSize: 12.5, fontWeight: '900' },

  error: { color: colors.red, fontSize: 13, lineHeight: 18 },
});