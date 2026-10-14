import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { apiRequest } from '@/config/api';
import { AppScreen, Card, ErrorText, Field, Header, Muted, PrimaryButton, Title } from '@/components/ui';
import { colors } from '@/theme';
import { useAuth } from '@/context/auth';

export default function SupportScreen() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [messages, setMessages] = useState<{ sender: 'user' | 'support'; text: string }[]>([
    { sender: 'support', text: 'Hi! How can we help you today?' },
  ]);
  const [message, setMessage] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ faqs?: any[] }>('/api/support/faqs')
      .then((data) => setFaqs(data.faqs || []))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load support FAQs.'));
  }, []);

  const sendMessage = async (text = message) => {
    const body = text.trim();
    if (!body || busy) return;
    setMessages((current) => [...current, { sender: 'user', text: body }]);
    setMessage('');
    setBusy(true);
    setError('');
    try {
      const response = await apiRequest<{ ticket_id?: string; access_token?: string; reply?: string }>('/api/support/chat', {
        method: 'POST',
        data: {
          message: body,
          ticket_id: ticketId,
          access_token: accessToken,
          guest_name: user?.name || 'Guest User',
          guest_email: user?.email || 'guest@thebrandsstory.com',
        },
      });
      if (response.ticket_id) setTicketId(response.ticket_id);
      if (response.access_token) setAccessToken(response.access_token);
      setMessages((current) => [...current, { sender: 'support', text: response.reply || 'Your message has been sent to support.' }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send your message.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <Header title="Help & support" subtitle="Find answers or chat with our support assistant." back />
      <Card>
        <Title>Ask us anything</Title>
        {messages.map((item, index) => (
          <View key={`${item.sender}-${index}`} style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.supportBubble]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        ))}
        {ticketId ? <Muted>Support ticket: {ticketId}</Muted> : null}
        <Field value={message} onChangeText={setMessage} placeholder="Type your question…" multiline returnKeyType="send" onSubmitEditing={() => void sendMessage()} />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <PrimaryButton title={busy ? 'Sending…' : 'Send message'} onPress={() => void sendMessage()} disabled={!message.trim()} busy={busy} />
      </Card>
      <Title>Frequently asked questions</Title>
      {faqs.map((faq, index) => (
        <Pressable key={faq.id || index} onPress={() => void sendMessage(faq.question)} style={styles.faq}>
          <Text style={styles.question}>{faq.question}</Text>
          <Muted numberOfLines={3}>{faq.answer}</Muted>
        </Pressable>
      ))}
      {!faqs.length && !error ? <Muted>Loading FAQs…</Muted> : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '90%', padding: 12, borderRadius: 16, alignSelf: 'flex-start', backgroundColor: colors.surfaceRaised },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#344b6a' },
  supportBubble: { alignSelf: 'flex-start' },
  bubbleText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  faq: { padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface },
  question: { color: colors.text, fontWeight: '800', fontSize: 14 },
});
