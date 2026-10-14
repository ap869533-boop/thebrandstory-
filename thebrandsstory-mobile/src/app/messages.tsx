import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { apiRequest } from '@/config/api';
import { AppScreen, Card, ErrorText, Header, Muted, Title } from '@/components/ui';
import { colors } from '@/theme';
import { useAuth } from '@/context/auth';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    apiRequest<{ conversations?: any[] }>('/api/conversations')
      .then((data) => setConversations(data.conversations || []))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load messages.'));
  }, [user]);

  return (
    <AppScreen>
      <Header title="Messages" subtitle="Your collaboration conversations." back />
      {!user ? <Card><Title>Sign in to view your messages</Title><Pressable onPress={() => router.push('/login')}><Text style={styles.link}>Sign in ›</Text></Pressable></Card> : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
      {user && !error && !conversations.length ? <Muted>Your conversations will appear here.</Muted> : null}
      {conversations.map((item) => (
        <Pressable key={item.id} onPress={() => router.push(`/chat/${encodeURIComponent(item.id)}`)} style={styles.conversation}>
          {item.peerAvatar ? <Text style={styles.avatar}>{String(item.peerName || 'U').slice(0, 1).toUpperCase()}</Text> : <Text style={styles.avatar}>{String(item.peerName || 'U').slice(0, 1).toUpperCase()}</Text>}
          <Text style={styles.copy}><Text style={styles.name}>{item.peerName || 'Conversation'}{'\n'}</Text><Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage || 'Start a conversation'}</Text></Text>
          {item.unreadCount > 0 ? <Text style={styles.unread}>{item.unreadCount}</Text> : null}
        </Pressable>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  conversation: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 46, height: 46, lineHeight: 46, overflow: 'hidden', textAlign: 'center', borderRadius: 23, backgroundColor: colors.surfaceRaised, color: colors.gold, fontSize: 19, fontWeight: '900' },
  copy: { flex: 1 },
  name: { color: colors.text, fontWeight: '900', fontSize: 14 },
  lastMessage: { color: colors.muted, fontSize: 12 },
  unread: { paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.gold, color: '#fff', fontSize: 11, fontWeight: '900' },
  link: { color: colors.gold, fontWeight: '900', marginTop: 6 },
});
