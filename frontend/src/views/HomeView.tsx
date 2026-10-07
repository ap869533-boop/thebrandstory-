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
import { HomeReveal } from '../components/home/HomeReveal';

export const HomeView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#051126] text-white w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="home-hero-enter min-h-[calc(100dvh-4rem)] flex flex-col justify-between bg-[#051126] relative overflow-hidden">
        <div className="relative z-10 flex min-h-0 h-full flex-col justify-between flex-1">
          <HomeHero />
        </div>
      </div>

      {/* 3. Brand Partners Slider & Body Sections */}
      <div className="relative overflow-hidden bg-[#071328]">
        <div className="relative z-10">
          <HomeReveal><BrandPartnersSlider /></HomeReveal>

          {/* 4. Nearby Influencers (Dynamic based on location) */}
          <HomeReveal><NearbyInfluencersSection /></HomeReveal>

          {/* 4.5 Top Influencers in India */}
          <HomeReveal><TopCreatorsSection /></HomeReveal>

          {/* 4.7 Featured Brands Showcase */}
          <HomeReveal><FeaturedBrandsSection /></HomeReveal>

          {/* 5. Regional & Tier Highlights */}
          <HomeReveal><RegionalShowcases /></HomeReveal>

          {/* 6. How It Works (For Brands & For Creators) */}
          <HomeReveal><HowItWorksSection /></HomeReveal>

          {/* 7. Live Opportunities Board */}
          <HomeReveal><LiveOpportunitiesBoard /></HomeReveal>

          {/* 8. Quick CTA Banners */}
          <HomeReveal><CTABanners /></HomeReveal>

          {/* 9. Testimonials & FAQ */}
          <HomeReveal><TestimonialsAndFAQ /></HomeReveal>
        </div>
      </div>
    </div>
  );
};
