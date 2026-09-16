import React from 'react';
import { Users, Star, ShieldCheck, IndianRupee, Award } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const TrustProofStrip: React.FC = () => {
  const { platformStats, creators } = usePlatform();

  const totalCreatorsFormatted = platformStats?.creatorsDisplay || (creators?.length ? `${creators.length.toLocaleString('en-IN')}+` : '50,000+');
  const brandsFormatted = platformStats?.brandConnectionsDisplay || '10,000+';

  const stats = [
    {
      value: totalCreatorsFormatted,
      label: 'Verified Creators',
      desc: 'Pan-India Database',
      icon: Users,
    },
    {
      value: '4.9 ★',
      label: 'Average Rating',
      desc: 'Brand Collaboration Score',
      icon: Star,
    },
    {
      value: '100% Real',
      label: 'Audience Verified',
      desc: 'Zero Fake Bots / Pods',
      icon: ShieldCheck,
    },
    {
      value: '₹0 Cut',
      label: 'Zero Commission',
      desc: 'Direct Creator Rates',
      icon: IndianRupee,
    },
    {
      value: brandsFormatted,
      label: 'Campaign Connections',
      desc: 'Active Brand Briefs',
      icon: Award,
    },
  ];

  return (
    <div className="bg-black text-white border-b border-zinc-900 py-3.5 sm:py-4 relative overflow-hidden font-sans shrink-0">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 overflow-hidden">
        {/* 5 Core Credibility Metrics */}
        <div className="grid grid-cols-5 gap-0 divide-x divide-white/10 text-center overflow-hidden">
          {stats.map((stat, idx) => {
            return (
              <div key={idx} className="space-y-0.5 px-0.5 sm:px-4 py-1 overflow-hidden">
                <div className="text-[10px] sm:text-2xl md:text-3xl font-black text-[#D4A338] tracking-tight leading-tight truncate">
                  {stat.value}
                </div>
                <div className="text-[6px] sm:text-[11px] uppercase font-bold text-white tracking-wide leading-tight truncate">
                  {stat.label}
                </div>
                <div className="hidden sm:block text-[11px] font-medium text-zinc-400">
                  {stat.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
