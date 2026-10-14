import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { AppScreen, Card, Header, Muted, PrimaryButton, Title } from '@/components/ui';
import { colors } from '@/theme';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '@/state/app-store';
import type { Href } from 'expo-router';
import { useMyCampaigns } from '@/hooks/queries';
import { FlashList } from '@shopify/flash-list';
import { useFeaturedCreators } from '@/hooks/queries';
import { CreatorCard } from '@/components/ui';

import { MessageSquare, Wallet, HelpCircle, Building2, ChevronRight, Bell } from 'lucide-react-native';

const publicLinks = [
  { title: 'Messages', route: '/messages' as Href, detail: 'Your brand and creator conversations', icon: MessageSquare },
  { title: 'Wallet & billing', route: '/wallet' as Href, detail: 'Payment and account information', icon: Wallet },
  { title: 'Help & support', route: '/support' as Href, detail: 'FAQs and contact support', icon: HelpCircle },
  { title: 'Partner brands', route: '/brands' as Href, detail: 'Browse featured brands', icon: Building2 },
];

export default function AccountScreen() {
  const { user, loading, logout } = useAuth();
  const myCampaignsQuery = useMyCampaigns(user?.role === 'BRAND');
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const savedCreatorIds = useAppStore((state) => state.savedCreatorIds);
  const creatorsQuery = useFeaturedCreators();
  const savedCreators = (creatorsQuery.data?.creators || []).filter((creator) => savedCreatorIds.includes(String(creator.id)));

  const enableNotifications = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Notifications unavailable', 'Use the mobile app to enable device notifications.');
      return;
    }
    try {
      const Notifications = (await import('expo-notifications')) as typeof import('expo-notifications');
      const current = await Notifications.getPermissionsAsync();
      const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        setNotificationsEnabled(false);
        Alert.alert('Permission needed', 'Allow notifications in your device settings to enable app alerts.');
        return;
      }
      setNotificationsEnabled(true);
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Notifications are ready', body: 'The Brand Story can now show local app alerts.' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
      });
      Alert.alert('Notifications enabled', 'A local test notification will arrive shortly. Server push notifications require backend support, which has not been changed.');
    } catch (error) {
      Alert.alert('Could not enable notifications', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <AppScreen>
      <Header title="Your account" subtitle={user ? `${user.role.toLowerCase()} account` : 'Sign in to access your account.'} />
      {user ? (
        <>
          <Card>
            <Title>{user.name || user.companyName || 'Welcome'}</Title>
            <Muted>{user.email}</Muted>
            <Text style={styles.role}>{user.role}</Text>
          </Card>
          {user.role === 'BRAND' ? (
            <>
              <PrimaryButton title="Manage my campaigns" onPress={() => router.push('/my-campaigns')} />
              {myCampaignsQuery.data?.campaigns?.length ? (
                <>
                  <Title>Your recent campaigns</Title>
                  <FlashList
                    data={myCampaignsQuery.data.campaigns.slice(0, 3)}
                    keyExtractor={(campaign) => String(campaign.id)}
                    renderItem={({ item }) => <Text style={styles.linkTitle}>{item.campaignTitle}</Text>}
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                  />
                </>
              ) : null}
              {savedCreators.length ? (
                <>
                  <Title>Saved creators</Title>
                  <FlashList
                    data={savedCreators}
                    keyExtractor={(creator) => String(creator.id)}
                    renderItem={({ item }) => <CreatorCard creator={item} variant="compact" />}
                    ItemSeparatorComponent={() => <View style={styles.divider} />}
                    scrollEnabled={false}
                  />
                </>
              ) : null}
            </>
          ) : null}
          <Card>
            <Title>App notifications</Title>
            <Muted>Enable device permission and send a local test alert. Remote server notifications are not available from the existing API.</Muted>
            <PrimaryButton title={notificationsEnabled ? 'Test notification again' : 'Enable notifications'} onPress={() => void enableNotifications()} />
          </Card>
          {publicLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Pressable key={link.title} onPress={() => router.push(link.route)} style={styles.link}>
                <View style={styles.linkRow}>
                  <View style={styles.linkIconWrap}>
                    <Icon size={18} color={colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkTitle}>{link.title}</Text>
                    <Muted>{link.detail}</Muted>
                  </View>
                  <ChevronRight size={18} color={colors.gold} />
                </View>
              </Pressable>
            );
          })}
          <PrimaryButton title="Log out" onPress={() => { void logout(); }} />
        </>
      ) : (
        <Card>
          <Title>{loading ? 'Restoring your session…' : 'Welcome back'}</Title>
          <Muted>Sign in to manage your profile, conversations and collaborations.</Muted>
          {!loading ? <PrimaryButton title="Sign in" onPress={() => router.push('/login')} /> : null}
          <Pressable onPress={() => router.push('/support')}><Text style={styles.linkTitle}>Continue to help & support</Text></Pressable>
        </Card>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  role: { color: colors.gold, fontSize: 11, fontWeight: '900', marginTop: 4 },
  link: { padding: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  linkTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  divider: { height: 8 },
});
