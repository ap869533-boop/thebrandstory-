import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  AppScreen,
  Card,
  ErrorText,
  Field,
  FilterPill,
  Header,
  Muted,
  PrimaryButton,
  Title,
  uiStyles,
} from '@/components/ui';
import { colors, spacing } from '@/theme';
import { useOpenCampaigns } from '@/hooks/queries';
import { useAuth } from '@/context/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/config/api';
import { CATEGORIES } from '@/constants/data';
import { Flame, Megaphone, MapPin } from 'lucide-react-native';

export default function CampaignsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const campaignQuery = useOpenCampaigns();
  const allCampaigns = campaignQuery.data?.campaigns || [];

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pitchCampaign, setPitchCampaign] = useState<any | null>(null);
  const [pitchText, setPitchText] = useState('');

  const applyMutation = useMutation({
    mutationFn: ({ campaignId, pitch }: { campaignId: string; pitch: string }) =>
      apiRequest(`/api/campaigns/${encodeURIComponent(campaignId)}/apply`, {
        method: 'POST',
        data: { pitch },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setPitchCampaign(null);
      setPitchText('');
      Alert.alert('Pitch Sent Successfully! 🎉', 'The brand will review your proposal and respond directly.');
    },
    onError: (error) => {
      Alert.alert('Could not submit pitch', error instanceof Error ? error.message : 'Please try again.');
    },
  });

  const filteredCampaigns = allCampaigns.filter((camp: any) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      camp.category?.toLowerCase() === selectedCategory.toLowerCase();
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      camp.campaignTitle?.toLowerCase().includes(query) ||
      camp.companyName?.toLowerCase().includes(query) ||
      camp.campaignDescription?.toLowerCase().includes(query) ||
      camp.city?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleOpenPitch = (camp: any) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'CREATOR') {
      Alert.alert('Creator Account Required', 'Only registered creators can submit pitches to brand campaigns.');
      return;
    }
    setPitchCampaign(camp);
    setPitchText(
      `Hi ${camp.companyName || 'Team'}! I love this campaign. My content specializes in ${camp.category || 'this category'} and my audience aligns directly with your goals.`
    );
  };

  const handleSendPitch = () => {
    if (!pitchCampaign || !pitchText.trim()) return;
    applyMutation.mutate({
      campaignId: String(pitchCampaign.id),
      pitch: pitchText.trim(),
    });
  };

  return (
    <AppScreen scroll={false}>
      <FlashList
        data={filteredCampaigns}
        keyExtractor={(camp) => String(camp.id)}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        refreshControl={
          <RefreshControl
            refreshing={campaignQuery.isRefetching}
            onRefresh={() => campaignQuery.refetch()}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Header
              title="Brand Opportunities"
              subtitle="Pitch directly to active brand campaigns across India."
            />

            {/* Top Info Banner */}
            <View style={styles.bannerBox}>
              <View style={styles.bannerRow}>
                <View style={styles.bannerIconWrap}>
                  <Flame size={20} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>Live Opportunities Board</Text>
                  <Text style={styles.bannerSub}>
                    Brands are actively hiring. Zero commission, direct collaboration.
                  </Text>
                </View>
              </View>
            </View>

            {/* Search Input */}
            <Field
              value={search}
              onChangeText={setSearch}
              placeholder="Search campaigns, brands, or cities…"
              returnKeyType="search"
            />

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.slice(0, 10).map((cat) => (
                <FilterPill
                  key={cat.id}
                  label={cat.name}
                  active={selectedCategory === cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                />
              ))}
            </ScrollView>

            <View style={styles.summaryBar}>
              <Text style={styles.summaryCount}>{filteredCampaigns.length}</Text>
              <Muted>open opportunities</Muted>
            </View>

            {campaignQuery.error ? (
              <ErrorText>{campaignQuery.error.message}</ErrorText>
            ) : null}
          </View>
        }
        renderItem={({ item: campaign }) => (
          <Card style={styles.campaignCard}>
            {/* Header: Brand name + City + Category */}
            <View style={uiStyles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.brandTitle}>
                  {campaign.companyName || 'Verified Brand'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MapPin size={11} color={colors.muted} />
                  <Text style={styles.brandLocation}>
                    {campaign.city || 'Pan India'} · {campaign.category || 'All Categories'}
                  </Text>
                </View>
              </View>
              {campaign.collaborationType ? (
                <View style={styles.collabTypePill}>
                  <Text style={styles.collabTypeText}>{campaign.collaborationType}</Text>
                </View>
              ) : null}
            </View>

            {/* Campaign Title & Description */}
            <Title style={styles.campaignTitle}>{campaign.campaignTitle}</Title>
            <Muted numberOfLines={3} style={styles.campaignDescription}>
              {campaign.campaignDescription || campaign.requirements}
            </Muted>

            {/* Stats row: Budget & Deadline & Applicants */}
            <View style={styles.metaRow}>
              <View style={styles.budgetBadge}>
                <Text style={styles.budgetBadgeLabel}>BUDGET</Text>
                <Text style={styles.budgetBadgeValue}>
                  {campaign.budget ? `₹${campaign.budget}` : 'Negotiable'}
                </Text>
              </View>

              {campaign.lastHiringDate ? (
                <View style={styles.deadlineBadge}>
                  <Text style={styles.deadlineBadgeLabel}>DEADLINE</Text>
                  <Text style={styles.deadlineBadgeValue}>
                    {new Date(campaign.lastHiringDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                </View>
              ) : null}

              {campaign.applicantsCount !== undefined ? (
                <View style={styles.applicantsBadge}>
                  <Text style={styles.applicantsBadgeLabel}>APPLICANTS</Text>
                  <Text style={styles.applicantsBadgeValue}>
                    {campaign.applicantsCount || 0}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Action Button */}
            <PrimaryButton
              title="Apply With Pitch  ›"
              variant="gold"
              onPress={() => handleOpenPitch(campaign)}
              style={styles.applyBtn}
            />
          </Card>
        )}
        ListEmptyComponent={
          !campaignQuery.isLoading && !campaignQuery.error ? (
            <View style={styles.emptyBox}>
              <View style={{ marginBottom: 8 }}>
                <Megaphone size={36} color={colors.muted} />
              </View>
              <Text style={styles.emptyTitle}>No open campaigns found</Text>
              <Muted style={{ textAlign: 'center' }}>
                Check back soon or clear search filters to view all active opportunities.
              </Muted>
            </View>
          ) : null
        }
      />

      {/* Pitch Modal */}
      <Modal
        visible={Boolean(pitchCampaign)}
        animationType="slide"
        transparent
        onRequestClose={() => setPitchCampaign(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={uiStyles.rowBetween}>
              <Title style={{ fontSize: 18 }}>Submit Your Pitch</Title>
              <Pressable onPress={() => setPitchCampaign(null)} hitSlop={10}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {pitchCampaign ? (
              <View style={styles.modalCampaignSummary}>
                <Text style={styles.modalCampaignName}>{pitchCampaign.campaignTitle}</Text>
                <Text style={styles.modalCompanyName}>
                  For {pitchCampaign.companyName} · Budget:{' '}
                  {pitchCampaign.budget ? `₹${pitchCampaign.budget}` : 'Flexible'}
                </Text>
              </View>
            ) : null}

            <Text style={styles.pitchInputLabel}>Your Proposal / Pitch Message:</Text>
            <TextInput
              value={pitchText}
              onChangeText={setPitchText}
              placeholder="Introduce yourself, mention your audience reach, and pitch your creative ideas…"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={5}
              style={styles.pitchTextInput}
            />

            <PrimaryButton
              title={applyMutation.isPending ? 'Sending Pitch…' : 'Send Pitch Directly'}
              variant="gold"
              busy={applyMutation.isPending}
              disabled={!pitchText.trim()}
              onPress={handleSendPitch}
            />
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  listHeader: {
    gap: 12,
    paddingBottom: 14,
  },
  bannerBox: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#071838',
    borderWidth: 1,
    borderColor: '#1e3357',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 163, 56, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  bannerSub: {
    color: '#8eb6ff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 10,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingTop: 4,
  },
  summaryCount: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
  },

  /* Campaign Card */
  campaignCard: {
    padding: 16,
    gap: 10,
    borderRadius: 22,
    borderColor: '#1e3357',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  brandLocation: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  collabTypePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  collabTypeText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  campaignTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  campaignDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  budgetBadge: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 201, 154, 0.1)',
    borderWidth: 1,
    borderColor: colors.green,
    alignItems: 'center',
  },
  budgetBadgeLabel: {
    color: colors.green,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  budgetBadgeValue: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  deadlineBadge: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  deadlineBadgeLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  deadlineBadgeValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  applicantsBadge: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  applicantsBadgeLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  applicantsBadgeValue: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  applyBtn: {
    marginTop: 4,
  },

  emptyBox: {
    padding: 36,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },

  /* Pitch Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 17, 38, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    gap: 14,
    paddingBottom: 40,
  },
  closeBtnText: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: '900',
  },
  modalCampaignSummary: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceRaised,
    gap: 4,
  },
  modalCampaignName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  modalCompanyName: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  pitchInputLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  pitchTextInput: {
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    color: colors.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});
