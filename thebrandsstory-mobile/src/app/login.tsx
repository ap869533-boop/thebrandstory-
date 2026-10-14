import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AppScreen,
  Card,
  ErrorText,
  Field,
  Header,
  Muted,
  PrimaryButton,
  Title,
} from '@/components/ui';
import { useAuth } from '@/context/auth';
import { colors, spacing } from '@/theme';
import { Sparkles, Building2 } from 'lucide-react-native';

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const params = useLocalSearchParams<{ mode?: string }>();

  // Mode: Sign In vs Sign Up
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(
    params.mode === 'signup' ? 'signup' : 'signin'
  );
  // Role: Creator vs Brand
  const [role, setRole] = useState<'CREATOR' | 'BRAND'>('CREATOR');

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (authMode === 'signin') {
      if (!email.trim() || !password) {
        setError('Please enter your email and password.');
        return;
      }
      setBusy(true);
      try {
        await login(email, password);
        router.back();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
      } finally {
        setBusy(false);
      }
    } else {
      // Sign Up
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim()) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (role === 'BRAND' && !companyName.trim()) {
        setError('Please enter your Brand / Company name.');
        return;
      }

      setBusy(true);
      try {
        await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          phone: phone.trim() || '9876543210',
          companyName: companyName.trim(),
          username: username.trim(),
          category: category.trim() || 'Lifestyle',
          city: city.trim() || 'Pan India',
        });
        router.back();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed. Please check details.');
      } finally {
        setBusy(false);
      }
    }
  };

  const fillDemoAccount = (type: 'creator' | 'brand') => {
    setAuthMode('signin');
    if (type === 'creator') {
      setEmail('creator@example.com');
      setPassword('password123');
      setRole('CREATOR');
    } else {
      setEmail('brand@example.com');
      setPassword('password123');
      setRole('BRAND');
    }
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Header
          title={authMode === 'signin' ? 'Sign in' : 'Create an account'}
          subtitle={
            authMode === 'signin'
              ? 'Access your Brand Story account.'
              : 'Join India’s biggest influencer & brand network.'
          }
          back
        />

        {/* 1. Main Mode Selector: Sign In vs Sign Up */}
        <View style={styles.modeTabBar}>
          <Pressable
            onPress={() => {
              setAuthMode('signin');
              setError('');
            }}
            style={[styles.modeTab, authMode === 'signin' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, authMode === 'signin' && styles.modeTabTextActive]}>
              Sign in
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setAuthMode('signup');
              setError('');
            }}
            style={[styles.modeTab, authMode === 'signup' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, authMode === 'signup' && styles.modeTabTextActive]}>
              Sign up
            </Text>
          </Pressable>
        </View>

        {/* 2. Role Selector: Creator vs Brand */}
        <View style={styles.roleRow}>
          <Pressable
            onPress={() => setRole('CREATOR')}
            style={[styles.rolePill, role === 'CREATOR' && styles.rolePillActive]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color={role === 'CREATOR' ? colors.gold : colors.muted} />
              <Text style={[styles.rolePillText, role === 'CREATOR' && styles.rolePillTextActive]}>
                As a Creator
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setRole('BRAND')}
            style={[styles.rolePill, role === 'BRAND' && styles.rolePillActive]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} color={role === 'BRAND' ? colors.gold : colors.muted} />
              <Text style={[styles.rolePillText, role === 'BRAND' && styles.rolePillTextActive]}>
                As a Brand
              </Text>
            </View>
          </Pressable>
        </View>

        {/* 3. Form Card */}
        <Card style={styles.formCard}>
          <Title style={{ fontSize: 18 }}>
            {authMode === 'signin'
              ? `${role === 'CREATOR' ? 'Creator' : 'Brand'} Sign in`
              : `Create ${role === 'CREATOR' ? 'Creator' : 'Brand'} Account`}
          </Title>

          <Muted>
            {role === 'CREATOR'
              ? 'Get discovered by brands and pitch for live deals with 0% commission.'
              : 'Discover vetted creators, publish briefs, and hire directly.'}
          </Muted>

          <View style={styles.fieldsStack}>
            {authMode === 'signup' && (
              <>
                <Field
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  autoCapitalize="words"
                  returnKeyType="next"
                />

                {role === 'BRAND' ? (
                  <Field
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Brand / Company Name"
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                ) : (
                  <>
                    <Field
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Instagram Username (e.g. rohit_vlogs)"
                      autoCapitalize="none"
                      returnKeyType="next"
                    />
                    <Field
                      value={category}
                      onChangeText={setCategory}
                      placeholder="Primary Category (e.g. Fashion, Tech)"
                      returnKeyType="next"
                    />
                    <Field
                      value={city}
                      onChangeText={setCity}
                      placeholder="City (e.g. Mumbai, Delhi)"
                      returnKeyType="next"
                    />
                  </>
                )}

                <Field
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Mobile Number (10 digits)"
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </>
            )}

            <Field
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
            />

            <Field
              value={password}
              onChangeText={setPassword}
              placeholder={authMode === 'signup' ? 'Create Password (min 6 chars)' : 'Password'}
              secureTextEntry
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit()}
            />
          </View>

          {error ? <ErrorText>{error}</ErrorText> : null}

          <PrimaryButton
            title={
              busy
                ? 'Processing…'
                : authMode === 'signin'
                ? `Sign in as ${role === 'CREATOR' ? 'Creator' : 'Brand'}`
                : `Create ${role === 'CREATOR' ? 'Creator' : 'Brand'} Account`
            }
            variant="gold"
            onPress={() => void handleSubmit()}
            busy={busy}
            style={{ marginTop: 8 }}
          />
        </Card>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingVertical: 10,
  },
  modeTabBar: {
    flexDirection: 'row',
    backgroundColor: '#071736',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e3357',
    padding: 4,
    gap: 6,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    backgroundColor: '#ffffff',
  },
  modeTabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  modeTabTextActive: {
    color: '#071326',
  },

  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rolePillActive: {
    backgroundColor: 'rgba(212, 163, 56, 0.15)',
    borderColor: colors.gold,
  },
  rolePillText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  rolePillTextActive: {
    color: colors.gold,
  },

  formCard: {
    padding: 20,
    gap: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  fieldsStack: {
    gap: 10,
    marginTop: 4,
  },

  demoSection: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  demoLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  demoBtnText: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '700',
  },

  guestLinkWrap: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestLink: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
  },
});
