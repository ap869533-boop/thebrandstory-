import React from 'react';
import { HomeHero } from '../components/home/HomeHero';
import { TrustProofStrip } from '../components/home/TrustProofStrip';
import { BrandPartnersSlider } from '../components/home/BrandPartnersSlider';
import { TopCreatorsSection } from '../components/home/TopCreatorsSection';
import { RegionalShowcases } from '../components/home/RegionalShowcases';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { LiveOpportunitiesBoard } from '../components/home/LiveOpportunitiesBoard';
import { CTABanners } from '../components/home/CTABanners';
import { TestimonialsAndFAQ } from '../components/home/TestimonialsAndFAQ';

export const HomeView: React.FC = () => {
  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
      {/* 1. Clean Minimal Hero Section */}
      <HomeHero />

      {/* 2. Trust Proof Strip */}
      <TrustProofStrip />

      {/* 3. Brand Partners Slider (Placed right above Top Influencers in India) */}
      <BrandPartnersSlider />

      {/* 4. Top Influencers in India */}
      <TopCreatorsSection />

      {/* 5. Regional & Tier Highlights */}
      <RegionalShowcases />

      {/* 6. How It Works (For Brands & For Creators) */}
      <HowItWorksSection />

      {/* 7. Live Opportunities Board */}
      <LiveOpportunitiesBoard />

      {/* 8. Quick CTA Banners */}
      <CTABanners />

      {/* 9. Testimonials & FAQ */}
      <TestimonialsAndFAQ />
    </div>
  );
};
