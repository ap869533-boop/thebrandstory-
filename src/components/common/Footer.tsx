import React from 'react';
import { ShieldCheck, Sparkles, MapPin, Layers, Heart, ArrowUpRight, Mail, Phone } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CITIES_LIST, CATEGORIES_LIST } from '../../data/initialData';

export const Footer: React.FC = () => {
  const { navigateTo, openOnboardingModal, openAIMatcherModal, openTrustScoreModal } = usePlatform();

  return (
    <footer className="bg-black text-slate-400 border-t border-zinc-900 text-xs">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div
              onClick={() => navigateTo('home')}
              className="cursor-pointer inline-flex items-center"
            >
              <div className="text-2xl sm:text-3xl tracking-tighter">
                <span className="font-normal text-white">the</span>
                <span className="font-bold text-[#D4A338]">brands</span>
                <span className="font-normal text-white">story</span>
                <span className="font-bold text-[#D4A338]">.</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pr-6">
              The high-intent marketplace connecting verified Indian influencers with brands, agencies, restaurants, and businesses. Find. Compare. Connect. Collaborate.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md bg-[#D4A338]/10 border border-[#D4A338]/30 text-[#D4A338] font-semibold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4A338]" />
                Verified Creator Network
              </span>
            </div>
          </div>

          {/* For Brands */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              For Brands & Agencies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('explore')} className="hover:text-white transition">
                  Search Creator Directory
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('post-requirement')} className="hover:text-white transition">
                  Post Campaign Brief
                </button>
              </li>
              <li>
                <button onClick={openAIMatcherModal} className="hover:text-white transition flex items-center gap-1">
                  AI Matchmaker <span className="text-[9px] bg-[#D4A338]/20 text-[#D4A338] px-1 rounded font-bold">AI</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('opportunities')} className="hover:text-white transition">
                  Open Brand Briefs
                </button>
              </li>
              <li>
                <button onClick={openTrustScoreModal} className="hover:text-white transition">
                  Trust Score Metrics
                </button>
              </li>
            </ul>
          </div>

          {/* For Creators */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              For Creators & Talent
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={openOnboardingModal} className="hover:text-white transition text-[#D4A338] font-semibold">
                  List Yourself — FREE
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('opportunities')} className="hover:text-white transition">
                  Browse Paid Brand Deals
                </button>
              </li>
              <li>
                <button onClick={openTrustScoreModal} className="hover:text-white transition">
                  How Trust Score Works
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('blog')} className="hover:text-white transition">
                  Creator Growth Playbook
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('creator-dashboard')} className="hover:text-white transition">
                  Creator Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Top City Hubs */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Popular City Hubs
            </h4>
            <ul className="space-y-2 text-xs">
              {CITIES_LIST.slice(0, 6).map((city, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigateTo('city-page', { citySlug: city.slug })}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] text-slate-600">({city.count || city.influencersCount}+)</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#D4A338] rounded-full animate-pulse" />
            <span className="font-semibold text-slate-300">2,412 Brands Online</span>
            <span className="text-slate-600">|</span>
            <span>© {new Date().getFullYear()} thebrandsstory. India’s Biggest Influencer Platform.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => navigateTo('blog')} className="hover:text-white transition cursor-pointer">Insights & Reports</button>
            <span>•</span>
            <button onClick={openTrustScoreModal} className="hover:text-white transition cursor-pointer">Trust & Verification Policy</button>
            <span>•</span>
            <button onClick={() => navigateTo('post-requirement')} className="hover:text-white transition cursor-pointer">Enterprise Solutions</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
