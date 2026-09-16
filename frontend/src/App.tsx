import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { EnquiryModal } from './components/common/EnquiryModal';
import { CompareDrawer } from './components/common/CompareDrawer';
import { SavedShortlistDrawer } from './components/common/SavedShortlistDrawer';
import { CreatorOnboardingModal } from './components/common/CreatorOnboardingModal';
import { TrustScoreInfoModal } from './components/common/TrustScoreInfoModal';
import { AuthModal } from './components/common/AuthModal';

// Views
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { CreatorDetailView } from './views/CreatorDetailView';
import { CityPageView } from './views/CityPageView';
import { CategoryPageView } from './views/CategoryPageView';
import { PostRequirementView } from './views/PostRequirementView';
import { OpportunitiesView } from './views/OpportunitiesView';
import { CreatorDashboardView } from './views/CreatorDashboardView';
import { BrandDashboardView } from './views/BrandDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { BlogView } from './views/BlogView';
import { BlogPostView } from './views/BlogPostView';
import { LoginView } from './views/LoginView';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

const MainAppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 w-full max-w-full overflow-x-hidden">
      {/* Sticky Header Navigation */}
      <Header />

      {/* Main Dynamic View */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/explore" element={<ExploreView />} />
          <Route path="/creator/:username" element={<CreatorDetailView />} />
          <Route path="/city/:citySlug" element={<CityPageView />} />
          <Route path="/category/:categorySlug" element={<CategoryPageView />} />
          <Route path="/post-requirement" element={<PostRequirementView />} />
          <Route path="/opportunities" element={<OpportunitiesView />} />
          <Route path="/dashboard/creator" element={<CreatorDashboardView />} />
          <Route path="/dashboard/brand" element={<BrandDashboardView />} />
          <Route path="/admin" element={<AdminDashboardView />} />
          <Route path="/blog" element={<BlogView />} />
          <Route path="/blog/:blogSlug" element={<BlogPostView />} />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* SEO & Directory Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <EnquiryModal />
      <CompareDrawer />
      <SavedShortlistDrawer />
      <CreatorOnboardingModal />
      <TrustScoreInfoModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <PlatformProvider>
          <MainAppContent />
        </PlatformProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
