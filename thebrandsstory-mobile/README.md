# The Brand Story mobile app

Expo Router app for discovering creators and brands, browsing campaigns, signing in,
messaging, and contacting support. It uses the existing production API by default;
the backend is not part of this mobile project.

## Run the app

```bash
npm install
npm run start
```

Set `EXPO_PUBLIC_API_BASE_URL` only when using a different API host (for example,
your own reachable development server). Native devices cannot use the computer's
`localhost`; use a LAN IP for local backend testing. Do not put backend secrets in
Expo public environment variables.

Commands:

```bash
npm run android
npm run ios
npm run web
npm run typecheck
npm run lint
```

## Connected app features

- Home feed, platform stats, creator search, public campaigns and partner brands.
- Creator and brand profile pages.
- SecureStore-backed sign-in/session restore.
- Brand campaign listing, authenticated conversations, and support chat.
- AsyncStorage-persisted recent searches, saved creators and app preferences.
- React Query API caching, FlashList long lists, Expo Image media, and NativeWind styles.

Creator onboarding, brand signup, campaign creation/application, full admin tools,
payments, and server-driven push delivery need flows/endpoints that are not yet
implemented in this native client. The Wallet screen is informational because the
existing backend does not expose wallet transactions. Notification permission
currently demonstrates local notifications only; no backend behavior was changed.
