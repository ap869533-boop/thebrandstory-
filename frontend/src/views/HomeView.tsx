import React, { useEffect } from 'react';
import { PredictiveArcCanvas } from '@designcodeio/threeui';
import { HomeHero } from '../components/home/HomeHero';
import { usePlatform } from '../context/PlatformContext';
import { TrustProofStrip } from '../components/home/TrustProofStrip';
import { BrandPartnersSlider } from '../components/home/BrandPartnersSlider';
import { TopCreatorsSection } from '../components/home/TopCreatorsSection';
import { RegionalShowcases } from '../components/home/RegionalShowcases';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { LiveOpportunitiesBoard } from '../components/home/LiveOpportunitiesBoard';
import { CTABanners } from '../components/home/CTABanners';
import { TestimonialsAndFAQ } from '../components/home/TestimonialsAndFAQ';
import { FeaturedBrandsSection } from '../components/home/FeaturedBrandsSection';

export const HomeView: React.FC = () => {
  const { setFilters } = usePlatform();

  useEffect(() => {
    setFilters((prev) => ({ ...prev, city: 'all' }));
  }, [setFilters]);

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-x-hidden">
      {/* 1 & 2. Hero Section + Trust Proof Strip: Exactly fills mobile screen height with TrustProofStrip as the last element */}
    <div className="min-h-[calc(100dvh-4rem)] h-[calc(100dvh-4rem)] flex flex-col justify-between bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-70" aria-hidden="true">
        <PredictiveArcCanvas
          variant="signal-particles"
          mode="dark"
          speed={1}
          hue={0}
          saturation={1}
          brightness={1}
          className="h-full w-full"
        />
      </div>
      <div className="relative z-10 flex min-h-0 h-full flex-col justify-between">
        <HomeHero />
        <TrustProofStrip />
      </div>
    </div>

    {/* 3. Brand Partners Slider (Placed right above Top Influencers in India) */}
    <div className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-45" aria-hidden="true">
        <PredictiveArcCanvas
          variant="signal-particles"
          mode="light"
          speed={1}
          hue={0}
          saturation={1}
          brightness={1}
          className="h-full w-full"
        />
      </div>
      <div className="relative z-10">
        <BrandPartnersSlider />

        {/* 4. Top Influencers in India */}
        <TopCreatorsSection />

        {/* 4.5 Featured Brands Showcase */}
        <FeaturedBrandsSection />

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
    </div>
    </div>
  );
};
