import React, { useEffect, useState } from 'react';
import { Plus, Users, X, ChevronRight } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { apiUrl, authHeaders } from '../config/api';

export const BrandCampaignsView: React.FC = () => {
  const { authUser, navigateTo } = usePlatform();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  useEffect(() => {
    if (authUser?.role !== 'BRAND') { navigateTo('login', { mode: 'login' }); return; }
    fetch(apiUrl('/api/campaigns?scope=mine'), { headers: authHeaders() })
      .then((response) => response.json())
      .then((data) => setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [authUser?.id]);

  return <div className="min-h-screen bg-[#051126] px-4 py-8 text-white sm:px-8 lg:px-[8vw]">
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-black">My Campaigns</h1><p className="mt-1 text-sm text-slate-400">Create campaigns and review creator pitches in one place.</p></div>
        <button type="button" onClick={() => navigateTo('post-requirement')} className="flex items-center gap-2 rounded-full bg-[#D4A338] px-5 py-3 text-sm font-black text-slate-950 hover:bg-[#be8f2b] cursor-pointer"><Plus className="h-4 w-4" />New Campaign</button>
      </div>
      
      {loading ? <p className="py-12 text-center text-slate-400">Loading campaigns…</p> : campaigns.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center"><h2 className="text-xl font-bold">No campaigns yet</h2><p className="mt-2 text-sm text-slate-400">Create your first brief to start receiving pitches.</p></div> : <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <article 
            key={campaign.id} 
            onClick={() => setSelectedCampaign(campaign)}
            className="rounded-2xl border border-white/10 bg-[#0d1d38] p-5 cursor-pointer hover:border-[#D4A338]/50 transition group"
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold uppercase tracking-wider text-[#D4A338]">{campaign.status || 'Active'}</p>
              <button className="text-slate-400 group-hover:text-white transition"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <h2 className="mt-2 text-lg font-black">{campaign.campaignTitle}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">{campaign.campaignDescription || campaign.requirements}</p>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
              <span className="text-slate-400">Budget: {campaign.budget || 'On request'}</span>
              <span className="flex items-center gap-1 font-bold text-[#D4A338] bg-[#D4A338]/10 px-3 py-1 rounded-full"><Users className="h-4 w-4" />{campaign.applicants?.length || 0} pitches</span>
            </div>
          </article>
        ))}
      </div>}
    </div>

    {/* Pitches Modal */}
    {selectedCampaign && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-[#0b1b3b] rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
            <div>
              <h2 className="text-xl font-black text-white">Pitches Received</h2>
              <p className="text-sm text-slate-400 mt-1">{selectedCampaign.campaignTitle}</p>
            </div>
            <button onClick={() => setSelectedCampaign(null)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-full cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {(!selectedCampaign.applicants || selectedCampaign.applicants.length === 0) ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-bold text-white">No pitches yet</h3>
                <p className="text-sm text-slate-400 mt-1">Creators haven't pitched for this campaign yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCampaign.applicants.map((applicant: any, i: number) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
                    <img 
                      src={applicant.creatorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.creatorName || 'Creator')}&background=random`} 
                      alt={applicant.creatorName} 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-white truncate">{applicant.creatorName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${applicant.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' : applicant.status === 'Declined' ? 'bg-rose-500/20 text-rose-400' : 'bg-[#D4A338]/20 text-[#D4A338]'}`}>
                          {applicant.status || 'Pending'}
                        </span>
                      </div>
                      <div className="bg-[#051126] p-3 rounded-xl border border-white/5 text-sm text-slate-300 italic">
                        "{applicant.pitch || 'No additional pitch provided.'}"
                      </div>
                      <div className="mt-3 flex gap-2">
                         <button 
                           onClick={(e) => { e.stopPropagation(); navigateTo('creator-detail', { id: applicant.creatorId, username: applicant.creatorName?.toLowerCase().replace(/\s+/g, '-') }); }}
                           className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition cursor-pointer"
                         >
                           View Profile
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); navigateTo('chat', { username: applicant.creatorName?.toLowerCase().replace(/\s+/g, '-') }); }}
                           className="text-xs font-bold bg-[#D4A338] hover:bg-[#be8f2b] text-slate-950 px-4 py-2 rounded-full transition cursor-pointer"
                         >
                           Message
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>;
};
