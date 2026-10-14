import React, { useState } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet, Keyboard } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { AppScreen, BrandCampaignCard, ErrorText, Field, Header, Muted } from '@/components/ui';
import { colors, spacing } from '@/theme';
import { useFeaturedBrands } from '@/hooks/queries';

export default function BrandsScreen() {
  const [query, setQuery] = useState('');
  const brandQuery = useFeaturedBrands(query);
  const brands = brandQuery.data?.brands || [];

  return (
    <AppScreen scroll={false}>
      <FlashList
        data={brands}
        keyExtractor={(brand) => String(brand.id || brand.brandName)}
        renderItem={({ item: brand }) => (
          <BrandCampaignCard brand={brand} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Header
              title="Partner Brands"
              subtitle="Registered brand profiles actively collaborating with creators."
              back
            />
            <Field
              value={query}
              onChangeText={setQuery}
              placeholder="Search by brand name, industry, or city…"
              returnKeyType="search"
            />
            {brandQuery.error ? <ErrorText>{brandQuery.error.message}</ErrorText> : null}
          </View>
        }
        ListEmptyComponent={
          !brandQuery.error ? (
            <Muted style={{ textAlign: 'center', marginTop: 24 }}>
              {brandQuery.isLoading ? 'Loading partner brands…' : 'No partner brands found.'}
            </Muted>
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
    gap: 14,
    paddingBottom: 16,
  },
});
