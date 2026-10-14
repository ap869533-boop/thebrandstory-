import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { AppScreen, Card, ErrorText, Header, Muted, Title } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { colors } from '@/theme';
import { useMyCampaigns } from '@/hooks/queries';

export default function MyCampaignsScreen() {
  const { user } = useAuth();
  const campaignQuery = useMyCampaigns(Boolean(user));
  const campaigns = campaignQuery.data?.campaigns || [];

  return (
    <AppScreen>
      <Header title="My campaigns" subtitle="Campaigns linked to your brand account." back />
      {!user ? <Card><Title>Sign in to manage campaigns</Title><Pressable onPress={() => router.push('/login')}><Text style={styles.link}>Sign in ›</Text></Pressable></Card> : null}
      {campaignQuery.error ? <ErrorText>{campaignQuery.error.message}</ErrorText> : null}
      {user && !campaignQuery.error && !campaigns.length ? <Muted>{campaignQuery.isLoading ? 'Loading your campaigns…' : 'You have not posted any campaigns yet.'}</Muted> : null}
      {campaigns.map((campaign) => <Card key={campaign.id}><Muted>{campaign.status} · {campaign.approvalStatus || 'Review'}</Muted><Title style={styles.title}>{campaign.campaignTitle}</Title><Muted>{campaign.city || 'Pan India'} · {campaign.category || 'All categories'}</Muted><Muted>{campaign.applicantsCount || 0} applicants</Muted></Card>)}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 17 },
  link: { color: colors.gold, fontWeight: '900' },
});
