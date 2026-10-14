import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { AppScreen, Card, Header, Muted, Title } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { colors } from '@/theme';

export default function WalletScreen() {
  const { user } = useAuth();
  return (
    <AppScreen>
      <Header title="Wallet & billing" subtitle="Account billing information." back />
      {user ? (
        <Card>
          <Title>Account details</Title>
          <Muted>{user.name}</Muted>
          <Muted>{user.email}</Muted>
          <Text style={styles.role}>{user.role}</Text>
          <Muted style={{ marginTop: 6 }}>Payments and creator collaboration fees are coordinated directly between brands and creators. There is no wallet balance or transaction history available from the current platform API.</Muted>
        </Card>
      ) : (
        <Card><Title>Sign in to view your account</Title><Pressable onPress={() => router.push('/login')}><Text style={styles.link}>Sign in ›</Text></Pressable></Card>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  role: { color: colors.gold, fontWeight: '900', fontSize: 12 },
  link: { color: colors.gold, fontWeight: '900' },
});
