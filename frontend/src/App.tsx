import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PlatformProvider } from './context/PlatformContext';
import { Footer } from './components/common/Footer';
import { EnquiryModal } from './components/common/EnquiryModal';
import { CompareDrawer } from './components/common/CompareDrawer';
import { SavedShortlistDrawer } from './components/common/SavedShortlistDrawer';
import { CreatorOnboardingModal } from './components/common/CreatorOnboardingModal';
import { AuthModal } from './components/common/AuthModal';
import { SubPageHeader } from './components/common/SubPageHeader';

// Route views are code-split so visitors load only the page they open.
const HomeView = lazy(() => import('./views/HomeView').then(({ HomeView }) => ({ default: HomeView })));
const ExploreView = lazy(() => import('./views/ExploreView').then(({ ExploreView }) => ({ default: ExploreView })));
const CreatorDetailView = lazy(() => import('./views/CreatorDetailView').then(({ CreatorDetailView }) => ({ default: CreatorDetailView })));
const CityPageView = lazy(() => import('./views/CityPageView').then(({ CityPageView }) => ({ default: CityPageView })));
const CategoryPageView = lazy(() => import('./views/CategoryPageView').then(({ CategoryPageView }) => ({ default: CategoryPageView })));
const PostRequirementView = lazy(() => import('./views/PostRequirementView').then(({ PostRequirementView }) => ({ default: PostRequirementView })));
const OpportunitiesView = lazy(() => import('./views/OpportunitiesView').then(({ OpportunitiesView }) => ({ default: OpportunitiesView })));
const CreatorDashboardView = lazy(() => import('./views/CreatorDashboardView').then(({ CreatorDashboardView }) => ({ default: CreatorDashboardView })));
const BrandDashboardView = lazy(() => import('./views/BrandDashboardView').then(({ BrandDashboardView }) => ({ default: BrandDashboardView })));
const AdminDashboardView = lazy(() => import('./views/AdminDashboardView').then(({ AdminDashboardView }) => ({ default: AdminDashboardView })));
const BlogView = lazy(() => import('./views/BlogView').then(({ BlogView }) => ({ default: BlogView })));
const BlogPostView = lazy(() => import('./views/BlogPostView').then(({ BlogPostView }) => ({ default: BlogPostView })));
const BrandDetailView = lazy(() => import('./views/BrandDetailView').then(({ BrandDetailView }) => ({ default: BrandDetailView })));
const LoginView = lazy(() => import('./views/LoginView').then(({ LoginView }) => ({ default: LoginView })));
const ChatView = lazy(() => import('./views/ChatView').then(({ ChatView }) => ({ default: ChatView })));

const MainAppContent: React.FC = () => {
  return (
    <div className="dark-theme min-h-screen flex flex-col bg-[#051126] text-slate-100 font-sans antialiased selection:bg-[#D4A338]/30 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Global Navbar — shown on every page */}
      <SubPageHeader />

      {/* Main Dynamic View */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Suspense fallback={<div className="min-h-[40vh]" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/chat" element={<ChatView />} />
            <Route path="/:username/chat" element={<ChatView />} />
            <Route path="/explore" element={<ExploreView />} />
            <Route path="/creator/:username" element={<CreatorDetailView />} />
            <Route path="/brand/:brandId" element={<BrandDetailView />} />
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
        </Suspense>
      </main>

      {/* SEO & Directory Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <EnquiryModal />
      <CompareDrawer />
      <SavedShortlistDrawer />
      <CreatorOnboardingModal />
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
