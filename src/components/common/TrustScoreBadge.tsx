import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Info, Sparkles, CheckCircle2, ChevronRight, Activity, Users, Star, Clock } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showDetailsButton?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  score,
  size = 'md',
  showTooltip = true,
}) => {
  const { openTrustScoreModal } = usePlatform();
  const [isOpen, setIsOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getTierInfo = (val: number) => {
    if (val >= 94) {
      return {
        label: 'Elite Verified',
        sublabel: 'Top 1% Creator Quality',
        colorClass: 'text-[#b88628] bg-blue-50 border-blue-200',
        glassBg: 'backdrop-blur-md bg-black/50 text-blue-300 border-blue-400/40 shadow-md',
        badgeColor: 'bg-black text-white',
        desc: 'Zero bot anomalies detected. Highest brand repeat rate.',
      };
    }
    if (val >= 88) {
      return {
        label: 'High Trust',
        sublabel: 'Verified Real Audience',
        colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        glassBg: 'backdrop-blur-md bg-black/50 text-indigo-300 border-indigo-400/40 shadow-md',
        badgeColor: 'bg-indigo-600 text-white',
        desc: 'High organic engagement & verified identity credentials.',
      };
    }
    return {
      label: 'Verified',
      sublabel: 'Emerging Authentic Creator',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      glassBg: 'backdrop-blur-md bg-black/50 text-emerald-300 border-emerald-400/40 shadow-md',
      badgeColor: 'bg-emerald-600 text-white',
      desc: 'Authenticated phone & social profiles with organic reach.',
    };
  };

  const tier = getTierInfo(score);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    openTrustScoreModal();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const metricsBreakdown = [
    {
      icon: Users,
      label: 'Audience Authenticity',
      weight: '30%',
      rating: score >= 90 ? '99% Real' : '95% Real',
      desc: 'Algorithmic scan for ghost bots & engagement pods',
    },
    {
      icon: Activity,
      label: 'Engagement Velocity',
      weight: '25%',
      rating: 'High Quality',
      desc: 'Organic comments, shares & video retention',
    },
    {
      icon: Star,
      label: 'Brand Delivery Record',
      weight: '20%',
      rating: '100% On-Time',
      desc: 'Completed deliverables & verified brand ratings',
    },
    {
      icon: Clock,
      label: 'Response Turnaround',
      weight: '15%',
      rating: '< 4 hrs avg',
      desc: 'Prompt brand enquiry communication',
    },
    {
      icon: ShieldCheck,
      label: 'OTP & ID Verification',
      weight: '10%',
      rating: '100% Verified',
      desc: 'Phone, email & social handle authenticated',
    },
  ];

  return (
    <div
      ref={badgeRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge Trigger Button */}
      {size === 'sm' ? (
        <button
          type="button"
          id={`trust-score-badge-sm-${score}`}
          onClick={toggleTooltip}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black border ${tier.glassBg} hover:border-white transition cursor-pointer select-none`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-white">Trust <strong className="text-blue-300">{score}</strong></span>
          {showTooltip && <Info className="w-2.5 h-2.5 text-slate-300 opacity-80" />}
        </button>
      ) : size === 'lg' ? (
        <div
          id={`trust-score-badge-lg-${score}`}
          onClick={toggleTooltip}
          className="flex items-center gap-3 p-3.5 bg-slate-900 border border-white/20 text-white rounded-2xl cursor-pointer hover:border-blue-400 transition shadow-xl"
        >
          <div className="relative w-12 h-12 flex items-center justify-center bg-black rounded-2xl shadow-md border border-blue-400/40 shrink-0">
            <span className="text-lg font-black text-white">{score}</span>
            <span className="text-[9px] text-blue-200 absolute -bottom-0.5 font-bold">/100</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">thebrandsstory. TrustScore™</span>
              <Info className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-xs text-slate-300 truncate">{tier.sublabel}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          id={`trust-score-badge-md-${score}`}
          onClick={toggleTooltip}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${tier.colorClass} cursor-pointer transition hover:shadow-md group select-none`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4A338] shrink-0" />
          <span>Trust {score}/100</span>
          {showTooltip && (
            <Info className="w-3 h-3 text-slate-400 group-hover:text-[#D4A338] transition" />
          )}
        </button>
      )}

      {/* Interactive Tooltip Card */}
      {showTooltip && isOpen && (
        <div
          className="absolute z-50 left-0 sm:left-auto sm:-translate-x-1/4 top-full mt-2 w-72 sm:w-80 bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/20 p-4 text-xs animate-fadeIn backdrop-blur-xl cursor-default text-left pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Tooltip Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm text-white">TrustScore™ {score}/100</span>
              </div>
              <p className="text-[11px] text-blue-300 font-semibold">{tier.label} • {tier.sublabel}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${tier.badgeColor}`}>
              {score >= 90 ? 'Grade A+' : score >= 80 ? 'Grade A' : 'Grade B'}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 py-2 border-b border-white/10">
            {tier.desc}
          </p>

          {/* 5-Pillar Breakdown */}
          <div className="py-2.5 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Credibility Scoring Matrix
            </span>
            {metricsBreakdown.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <IconComp className="w-3 h-3 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-bold text-emerald-400">{item.rating}</span>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <button
            type="button"
            onClick={handleModalClick}
            className="w-full mt-2 py-2 rounded-xl bg-black hover:bg-blue-500 text-white font-bold text-xs text-center flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>Learn How Score is Calculated</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
