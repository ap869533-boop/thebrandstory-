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
import { Navbar } from './components/common/Navbar';

const lazyWithChunkRecovery = <T extends React.ComponentType<any>>(
  load: () => Promise<{ default: T }>
) =>
  lazy(() => {
    const retryKey = `chunk-load-retry:${window.location.pathname}`;
    return load()
      .then((module) => {
        sessionStorage.removeItem(retryKey);
        return module;
      })
      .catch((error: unknown) => {
        const isChunkLoadError =
          error instanceof TypeError &&
          /dynamically imported module|module script/i.test(error.message);
        if (isChunkLoadError && !sessionStorage.getItem(retryKey)) {
          sessionStorage.setItem(retryKey, '1');
          window.location.reload();
        }
        throw error;
      });
  });

// Route views are code-split so visitors load only the page they open.
const HomeView = lazyWithChunkRecovery(() => import('./views/HomeView').then(({ HomeView }) => ({ default: HomeView })));
const AllBrandsView = lazyWithChunkRecovery(() => import('./views/AllBrandsView').then(({ AllBrandsView }) => ({ default: AllBrandsView })));
const ExploreView = lazyWithChunkRecovery(() => import('./views/ExploreView').then(({ ExploreView }) => ({ default: ExploreView })));
const CreatorDetailView = lazyWithChunkRecovery(() => import('./views/CreatorDetailView').then(({ CreatorDetailView }) => ({ default: CreatorDetailView })));
const CityPageView = lazyWithChunkRecovery(() => import('./views/CityPageView').then(({ CityPageView }) => ({ default: CityPageView })));
const CategoryPageView = lazyWithChunkRecovery(() => import('./views/CategoryPageView').then(({ CategoryPageView }) => ({ default: CategoryPageView })));
const PostRequirementView = lazyWithChunkRecovery(() => import('./views/PostRequirementView').then(({ PostRequirementView }) => ({ default: PostRequirementView })));
const OpportunitiesView = lazyWithChunkRecovery(() => import('./views/OpportunitiesView').then(({ OpportunitiesView }) => ({ default: OpportunitiesView })));
const BrandCampaignsView = lazyWithChunkRecovery(() => import('./views/BrandCampaignsView').then(({ BrandCampaignsView }) => ({ default: BrandCampaignsView })));

const WalletView = lazyWithChunkRecovery(() => import('./views/WalletView').then(({ WalletView }) => ({ default: WalletView })));
const AdminDashboardView = lazyWithChunkRecovery(() => import('./views/AdminDashboardView').then(({ AdminDashboardView }) => ({ default: AdminDashboardView })));
const BlogView = lazyWithChunkRecovery(() => import('./views/BlogView').then(({ BlogView }) => ({ default: BlogView })));
const BlogPostView = lazyWithChunkRecovery(() => import('./views/BlogPostView').then(({ BlogPostView }) => ({ default: BlogPostView })));
const BrandDetailView = lazyWithChunkRecovery(() => import('./views/BrandDetailView').then(({ BrandDetailView }) => ({ default: BrandDetailView })));
const LoginView = lazyWithChunkRecovery(() => import('./views/LoginView').then(({ LoginView }) => ({ default: LoginView })));
const ChatView = lazyWithChunkRecovery(() => import('./views/ChatView').then(({ ChatView }) => ({ default: ChatView })));
const HelpSupportView = lazyWithChunkRecovery(() => import('./views/HelpSupportView').then(({ HelpSupportView }) => ({ default: HelpSupportView })));

const MainAppContent: React.FC = () => {
  return (
    <div className="dark-theme min-h-screen flex flex-col bg-[#051126] text-slate-100 font-sans antialiased selection:bg-[#D4A338]/30 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Global Navbar — shown on every page */}
      <Navbar />

      {/* Main Dynamic View */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Suspense fallback={<div className="min-h-[40vh]" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/brands" element={<AllBrandsView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/pitches" element={<ChatView />} />
            <Route path="/:username/pitches" element={<ChatView />} />
            <Route path="/explore" element={<ExploreView />} />
            <Route path="/creator/:username" element={<CreatorDetailView />} />
            <Route path="/brand/:brandId" element={<BrandDetailView />} />
            <Route path="/city/:citySlug" element={<CityPageView />} />
            <Route path="/category/:categorySlug" element={<CategoryPageView />} />
            <Route path="/post-requirement" element={<PostRequirementView />} />
            <Route path="/opportunities" element={<OpportunitiesView />} />
            <Route path="/brand/:brandSlug/campaigns" element={<BrandCampaignsView />} />

            <Route path="/wallet" element={<WalletView />} />
            <Route path="/admin" element={<AdminDashboardView />} />
            <Route path="/blog" element={<BlogView />} />
            <Route path="/blog/:blogSlug" element={<BlogPostView />} />
            <Route path="/help-support" element={<HelpSupportView />} />
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
