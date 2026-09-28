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
      desc: 'Collab Score',
      icon: Star,
    },
    {
      value: '100% Real',
      label: 'Audience Verified',
      desc: 'Zero Fake Bots',
      icon: ShieldCheck,
    },
    {
      value: '₹0 Cut',
      label: '0% Commission',
      desc: 'Direct Rates',
      icon: IndianRupee,
    },
    {
      value: brandsFormatted,
      label: 'Brand Briefs',
      desc: 'Active Campaigns',
      icon: Award,
    },
  ];

  return (
    <div className="bg-[#050f21] border-t border-b border-slate-800/80 text-white py-3 sm:py-3.5 relative overflow-hidden font-sans shrink-0">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 overflow-hidden">
        {/* 5 Core Credibility Metrics */}
        <div className="grid grid-cols-5 gap-0 divide-x divide-slate-800/80 text-center overflow-hidden">
          {stats.map((stat, idx) => {
            return (
              <div key={idx} className="space-y-0.5 px-0.5 sm:px-3 py-1 overflow-hidden">
                <div className="text-[11px] sm:text-2xl md:text-3xl font-black text-[#D4A338] tracking-tight leading-tight truncate">
                  {stat.value}
                </div>
                <div className="text-[7px] sm:text-[11px] uppercase font-bold text-slate-300 tracking-wide leading-tight truncate">
                  {stat.label}
                </div>
                <div className="hidden sm:block text-[10px] font-medium text-slate-400">
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
