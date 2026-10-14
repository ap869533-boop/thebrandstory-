import React, { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  AppScreen,
  CreatorCard,
  ErrorText,
  Field,
  FilterPill,
  Header,
  Muted,
} from '@/components/ui';
import { colors, spacing } from '@/theme';
import { useCreators } from '@/hooks/queries';
import { useAppStore } from '@/state/app-store';
import { CATEGORIES, CITIES, FOLLOWER_RANGES, SORT_OPTIONS } from '@/constants/data';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, LayoutGrid, List } from 'lucide-react-native';

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ category?: string; city?: string; query?: string }>();
  return <ExploreContent key={JSON.stringify(params)} params={params} />;
}

function ExploreContent({
  params,
}: {
  params: { category?: string; city?: string; query?: string };
}) {
  const [search, setSearch] = useState(params.query || '');
  const [debouncedSearch, setDebouncedSearch] = useState(params.query || '');
  const [category, setCategory] = useState(params.category || 'all');
  const [city, setCity] = useState(params.city || 'all');
  const [followerRange, setFollowerRange] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('trust_score');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'compact'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input for fast typing without lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 280);
    return () => clearTimeout(timer);
  }, [search]);

  const recentSearches = useAppStore((state) => state.recentSearches);
  const addRecentSearch = useAppStore((state) => state.addRecentSearch);

  const filterParams = useMemo(
    () => ({
      searchQuery: debouncedSearch,
      category,
      city,
      followerRange,
      verifiedOnly,
      sortBy,
      limit: 30,
    }),
    [debouncedSearch, category, city, followerRange, verifiedOnly, sortBy]
  );

  const creatorsQuery = useCreators(filterParams);
  const creators = creatorsQuery.data?.creators || [];
  const total = creatorsQuery.data?.total ?? creators.length;

  const handleResetFilters = () => {
    setCategory('all');
    setCity('all');
    setFollowerRange('all');
    setVerifiedOnly(false);
    setSortBy('trust_score');
    setSearch('');
  };

  const hasActiveFilters =
    category !== 'all' ||
    city !== 'all' ||
    followerRange !== 'all' ||
    verifiedOnly ||
    sortBy !== 'trust_score' ||
    Boolean(search.trim());

  return (
    <AppScreen scroll={false}>
      <FlashList
        data={creators}
        keyExtractor={(creator) => String(creator.id)}
        renderItem={({ item }) => (
          <CreatorCard creator={item} variant={layoutMode} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: layoutMode === 'grid' ? 14 : 12 }} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        refreshControl={
          <RefreshControl
            refreshing={creatorsQuery.isRefetching}
            onRefresh={() => creatorsQuery.refetch()}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Header
              title="Explore Influencers"
              subtitle="Discover, filter, and collaborate directly with creators."
            />

            {/* Search Input Bar */}
            <View style={styles.searchBarWrap}>
              <Field
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => search.trim() && addRecentSearch(search.trim())}
                placeholder="Search by name, category, or city…"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {search ? (
                <Pressable onPress={() => setSearch('')} style={styles.clearBtn} hitSlop={10}>
                  <X size={14} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !search ? (
              <View style={styles.recentRow}>
                <Muted>Recent:</Muted>
                {recentSearches.slice(0, 3).map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => setSearch(term)}
                    style={styles.recentPill}
                  >
                    <Text style={styles.recentText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {/* Filter Toggle & Layout Controls */}
            <View style={styles.filterControlBar}>
              <Pressable
                onPress={() => setShowFilters(!showFilters)}
                style={[styles.filterToggleBtn, showFilters && styles.filterToggleBtnActive]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <SlidersHorizontal size={13} color={showFilters ? colors.gold : colors.text} />
                  <Text style={[styles.filterToggleText, showFilters && styles.filterToggleTextActive]}>
                    {showFilters ? 'Hide Filters' : 'Show All Filters'}
                  </Text>
                  {showFilters ? (
                    <ChevronUp size={13} color={colors.gold} />
                  ) : (
                    <ChevronDown size={13} color={colors.text} />
                  )}
                </View>
              </Pressable>

              <View style={styles.rightControls}>
                {hasActiveFilters ? (
                  <Pressable onPress={handleResetFilters} style={styles.resetBtn}>
                    <Text style={styles.resetBtnText}>Reset</Text>
                  </Pressable>
                ) : null}

                {/* View Switcher: Grid vs Compact */}
                <View style={styles.viewToggleGroup}>
                  <Pressable
                    onPress={() => setLayoutMode('grid')}
                    style={[styles.viewToggleBtn, layoutMode === 'grid' && styles.viewToggleBtnActive]}
                  >
                    <LayoutGrid size={15} color={layoutMode === 'grid' ? colors.gold : colors.muted} />
                  </Pressable>
                  <Pressable
                    onPress={() => setLayoutMode('compact')}
                    style={[styles.viewToggleBtn, layoutMode === 'compact' && styles.viewToggleBtnActive]}
                  >
                    <List size={16} color={layoutMode === 'compact' ? colors.gold : colors.muted} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* 1. Category Pills Carousel */}
            <View style={styles.filterSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {CATEGORIES.map((cat) => (
                  <FilterPill
                    key={cat.id}
                    label={cat.name}
                    active={category === cat.id}
                    onPress={() => setCategory(cat.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Extended Filters (Expandable) */}
            {showFilters ? (
              <View style={styles.expandedFilters}>
                {/* 2. Follower Tier Pills */}
                <View style={styles.filterSubGroup}>
                  <Text style={styles.filterSubLabel}>FOLLOWER TIER</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                  >
                    {FOLLOWER_RANGES.map((tier) => (
                      <FilterPill
                        key={tier.id}
                        label={tier.label}
                        active={followerRange === tier.id}
                        onPress={() => setFollowerRange(tier.id)}
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* 3. Cities Pills */}
                <View style={styles.filterSubGroup}>
                  <Text style={styles.filterSubLabel}>LOCATION</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                  >
                    {CITIES.map((c) => (
                      <FilterPill
                        key={c.id}
                        label={c.name}
                        active={city === c.id}
                        onPress={() => setCity(c.id)}
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* 4. Verified Only & Sort Bar */}
                <View style={styles.filterSubGroup}>
                  <Text style={styles.filterSubLabel}>SORT & VERIFICATION</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                  >
                    <FilterPill
                      label={verifiedOnly ? '✓ Verified Only' : 'Verified Only'}
                      active={verifiedOnly}
                      onPress={() => setVerifiedOnly(!verifiedOnly)}
                    />
                    {SORT_OPTIONS.map((opt) => (
                      <FilterPill
                        key={opt.id}
                        label={opt.label}
                        active={sortBy === opt.id}
                        onPress={() => setSortBy(opt.id)}
                      />
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : null}

            {/* Results Count & Status Summary */}
            <View style={styles.resultsBar}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={styles.resultsCount}>{total}</Text>
                <Muted>{total === 1 ? 'creator found' : 'creators found'}</Muted>
              </View>

              {creatorsQuery.isFetching ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color={colors.gold} />
                  <Text style={styles.updatingText}>Updating…</Text>
                </View>
              ) : null}
            </View>

            {creatorsQuery.error ? (
              <ErrorText>{creatorsQuery.error.message}</ErrorText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !creatorsQuery.isLoading && !creatorsQuery.error ? (
            <View style={styles.emptyBox}>
              <View style={{ marginBottom: 12 }}>
                <Search size={36} color={colors.muted} />
              </View>
              <Text style={styles.emptyTitle}>No creators match your search</Text>
              <Muted style={styles.emptySub}>
                Try adjusting your filters, category, or search keywords.
              </Muted>
              <Pressable onPress={handleResetFilters} style={styles.emptyResetBtn}>
                <Text style={styles.emptyResetText}>Reset All Filters</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
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
  searchBarWrap: {
    position: 'relative',
  },
  searchInput: {
    paddingRight: 40,
  },
  clearBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  recentPill: {
    backgroundColor: '#172841',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  recentText: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '700',
  },

  filterControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  filterToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterToggleBtnActive: {
    backgroundColor: 'rgba(212, 163, 56, 0.15)',
    borderColor: colors.gold,
  },
  filterToggleText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  filterToggleTextActive: {
    color: colors.gold,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resetBtnText: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '800',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewToggleBtnActive: {
    backgroundColor: colors.surfaceRaised,
  },
  viewToggleIcon: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '900',
  },
  viewToggleIconActive: {
    color: colors.gold,
  },

  filterSection: {
    marginTop: 2,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 10,
  },
  expandedFilters: {
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterSubGroup: {
    gap: 6,
  },
  filterSubLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  resultsCount: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  updatingText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },

  emptyBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySub: {
    textAlign: 'center',
    fontSize: 12,
    maxWidth: 240,
  },
  emptyResetBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.gold,
  },
  emptyResetText: {
    color: '#071326',
    fontWeight: '900',
    fontSize: 12,
  },
});
