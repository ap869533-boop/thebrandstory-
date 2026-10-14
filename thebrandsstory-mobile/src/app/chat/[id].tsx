import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { apiRequest } from '@/config/api';
import { AppScreen, ErrorText, Field, Header, Muted } from '@/components/ui';
import { colors } from '@/theme';
import { useAuth } from '@/context/auth';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadMessages = useCallback(() => {
    if (!id || !user) return;
    apiRequest<any>(`/api/conversations/${encodeURIComponent(id)}/messages`)
      .then((data) => setMessages(data.messages || []))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load this conversation.'));
  }, [id, user]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const send = async () => {
    if (!draft.trim() || !id || busy) return;
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/api/conversations/${encodeURIComponent(id)}/messages`, {
        method: 'POST',
        data: { body: draft.trim() },
      });
      setDraft('');
      loadMessages();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send this message.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <Header title="Conversation" subtitle="Messages refresh when you send a reply." back />
      {error ? <ErrorText>{error}</ErrorText> : null}
      {!messages.length && !error ? <Muted>No messages in this conversation yet.</Muted> : null}
      {messages.map((message) => {
        const ownMessage = message.senderId === user?.id;
        return <View key={message.id} style={[styles.bubble, ownMessage ? styles.own : styles.peer]}><Text style={styles.message}>{message.body}</Text></View>;
      })}
      <View style={styles.composer}><Field value={draft} onChangeText={setDraft} placeholder="Write a message…" multiline style={styles.input} /><Pressable accessibilityRole="button" onPress={() => void send()} disabled={busy || !draft.trim()} style={styles.send}><Text style={styles.sendText}>{busy ? '…' : 'Send'}</Text></Pressable></View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '88%', borderRadius: 18, padding: 13, marginVertical: 4 },
  own: { alignSelf: 'flex-end', backgroundColor: '#2d4566' },
  peer: { alignSelf: 'flex-start', backgroundColor: colors.surface },
  message: { color: colors.text, fontSize: 14, lineHeight: 20 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 'auto', paddingTop: 16 },
  input: { flex: 1, minHeight: 48, maxHeight: 120 },
  send: { height: 48, paddingHorizontal: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  sendText: { color: '#fff', fontWeight: '900' },
});
