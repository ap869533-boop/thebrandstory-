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

const MainAppContent: React.FC = () => {
  const { currentView } = usePlatform();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'login':
        return <LoginView />;
      case 'explore':
        return <ExploreView />;
      case 'creator-detail':
        return <CreatorDetailView />;
      case 'city-page':
        return <CityPageView />;
      case 'category-page':
        return <CategoryPageView />;
      case 'post-requirement':
        return <PostRequirementView />;
      case 'opportunities':
        return <OpportunitiesView />;
      case 'creator-dashboard':
        return <CreatorDashboardView />;
      case 'brand-dashboard':
        return <BrandDashboardView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'blog':
        return <BlogView />;
      case 'blog-post':
        return <BlogPostView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 w-full max-w-full overflow-x-hidden">
      {/* Sticky Header Navigation */}
      <Header />

      {/* Main Dynamic View */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {renderView()}
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
    <PlatformProvider>
      <MainAppContent />
    </PlatformProvider>
  );
}
