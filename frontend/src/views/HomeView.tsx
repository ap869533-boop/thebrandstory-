import React from 'react';
import { HomeHero } from '../components/home/HomeHero';
import { BrandPartnersSlider } from '../components/home/BrandPartnersSlider';
import { TopCreatorsSection } from '../components/home/TopCreatorsSection';
import { RegionalShowcases } from '../components/home/RegionalShowcases';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { LiveOpportunitiesBoard } from '../components/home/LiveOpportunitiesBoard';
import { CTABanners } from '../components/home/CTABanners';
import { TestimonialsAndFAQ } from '../components/home/TestimonialsAndFAQ';
import { FeaturedBrandsSection } from '../components/home/FeaturedBrandsSection';
import { NearbyInfluencersSection } from '../components/home/NearbyInfluencersSection';

export const HomeView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#051126] text-white w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="min-h-[calc(100dvh-4rem)] flex flex-col justify-between bg-[#051126] relative overflow-hidden">
        <div className="relative z-10 flex min-h-0 h-full flex-col justify-between flex-1">
          <HomeHero />
        </div>
      </div>

      {/* 3. Brand Partners Slider & Body Sections */}
      <div className="relative overflow-hidden bg-[#071328]">
        <div className="relative z-10">
          <BrandPartnersSlider />

          {/* 4. Nearby Influencers (Dynamic based on location) */}
          <NearbyInfluencersSection />

          {/* 4.5 Top Influencers in India */}
          <TopCreatorsSection />

          {/* 4.7 Featured Brands Showcase */}
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
