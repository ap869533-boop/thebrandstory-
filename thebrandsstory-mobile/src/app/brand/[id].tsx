import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  Pressable,
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
  Header,
  Muted,
  PrimaryButton,
  Title,
  uiStyles,
} from '@/components/ui';
import { colors, spacing } from '@/theme';
import { useAuth } from '@/context/auth';
import { useBrandProfileById, useOpenCampaigns } from '@/hooks/queries';
import { MapPin, Globe } from 'lucide-react-native';

export default function BrandScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const brandQuery = useBrandProfileById(id);
  const brand = brandQuery.data;

  const campaignsQuery = useOpenCampaigns();
  const allCampaigns = campaignsQuery.data?.campaigns || [];
  const brandCampaigns = allCampaigns.filter(
    (c: any) =>
      c.brandId === id ||
      c.companyName?.toLowerCase() === brand?.brandName?.toLowerCase()
  );

  const formatCurrency = (amount?: number) =>
    amount ? `₹${Number(amount).toLocaleString('en-IN')}` : 'Flexible';

  const openWebsite = () => {
    if (brand?.website) {
      const url = brand.website.startsWith('http') ? brand.website : `https://${brand.website}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <AppScreen>
      <Header title="Brand Collab Details" back />

      {brandQuery.error ? <ErrorText>{brandQuery.error.message}</ErrorText> : null}

      {brandQuery.isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Muted>Loading brand details…</Muted>
        </View>
      ) : brand ? (
        <View style={styles.container}>
          {/* Top Brand Banner Card */}
          <Card style={styles.brandHeroCard}>
            {/* Glowing Logo */}
            <View style={styles.logoCircle}>
              {brand.logoUrl ? (
                <Image
                  source={{ uri: mediaUrl(brand.logoUrl) }}
                  style={styles.logoImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.logoLetter}>
                  {String(brand.brandName || 'B').slice(0, 1)}
                </Text>
              )}
            </View>

            <Title style={styles.brandTitle}>{brand.brandName}</Title>

            <View style={styles.pillRow}>
              <View style={styles.industryPill}>
                <Text style={styles.industryPillText}>
                  {brand.industry || 'Direct-to-Consumer'}
                </Text>
              </View>
              {brand.city ? (
                <View style={[styles.cityPill, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                  <MapPin size={11} color={colors.gold} />
                  <Text style={styles.cityPillText}>{brand.city}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.brandDescription}>
              {brand.description?.trim() ||
                `${brand.brandName} is a partner brand actively collaborating with creators on The Brand Story platform.`}
            </Text>

            {brand.website ? (
              <Pressable onPress={openWebsite} style={[styles.websiteBtn, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <Globe size={13} color={colors.gold} />
                <Text style={styles.websiteText}>{brand.website.replace(/^https?:\/\//, '')}</Text>
              </Pressable>
            ) : null}
          </Card>

          {/* Hiring & Budget Highlights */}
          <View style={styles.statsStrip}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>CREATORS HIRING</Text>
              <Text style={styles.statVal}>
                {Number(brand.totalHiringCount || 5).toLocaleString('en-IN')}+
              </Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>BUDGET RANGE</Text>
              <Text style={[styles.statVal, { color: colors.green }]}>
                {formatCurrency(brand.campaignBudgetMax || brand.campaignBudgetMin)}
              </Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>STATUS</Text>
              <Text style={[styles.statVal, { color: colors.gold }]}>Actively Hiring</Text>
            </View>
          </View>

          {/* Active Campaigns from this brand */}
          <View style={styles.campaignsWrap}>
            <Title style={{ fontSize: 18 }}>Open Brand Collabs ({brandCampaigns.length})</Title>

            {brandCampaigns.length > 0 ? (
              brandCampaigns.map((camp: any) => (
                <Card key={camp.id} style={styles.campaignItem}>
                  <View style={uiStyles.rowBetween}>
                    <Text style={styles.campTitle}>{camp.campaignTitle}</Text>
                    <View style={styles.budgetPill}>
                      <Text style={styles.budgetPillText}>
                        {camp.budget ? `₹${camp.budget}` : 'Flexible'}
                      </Text>
                    </View>
                  </View>

                  <Muted numberOfLines={2}>
                    {camp.campaignDescription || camp.requirements}
                  </Muted>

                  <PrimaryButton
                    title="Apply to this campaign  ›"
                    variant="gold"
                    onPress={() => router.push('/(tabs)/campaigns')}
                    style={{ marginTop: 6 }}
                  />
                </Card>
              ))
            ) : (
              <Card style={{ padding: 18 }}>
                <Muted style={{ textAlign: 'center' }}>
                  No open public campaigns right now. Check back soon or browse other active campaigns!
                </Muted>
              </Card>
            )}
          </View>

          {/* Bottom Action */}
          <PrimaryButton
            title={user ? 'Browse All Brand Campaigns' : 'Sign In To Pitch'}
            variant="blue"
            onPress={() => (user ? router.push('/(tabs)/campaigns') : router.push('/login'))}
          />
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
  container: {
    gap: 16,
    paddingBottom: 30,
  },
  brandHeroCard: {
    alignItems: 'center',
    padding: 22,
    gap: 10,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: '#071838',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.gold,
    padding: 2,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  logoLetter: {
    color: colors.gold,
    fontSize: 32,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  industryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  industryPillText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
  },
  cityPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  brandDescription: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 2,
  },
  websiteBtn: {
    marginTop: 4,
  },
  websiteText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },

  statsStrip: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDiv: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statVal: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },

  campaignsWrap: {
    gap: 12,
  },
  campaignItem: {
    padding: 16,
    gap: 8,
  },
  campTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  budgetPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(79, 201, 154, 0.15)',
  },
  budgetPillText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '800',
  },
});
