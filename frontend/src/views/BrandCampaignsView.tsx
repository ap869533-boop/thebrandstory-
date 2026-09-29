import React, { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { apiUrl, authHeaders } from '../config/api';

export const BrandCampaignsView: React.FC = () => {
  const { authUser, navigateTo } = usePlatform();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-black">My Campaigns</h1><p className="mt-1 text-sm text-slate-400">Create campaigns and review creator pitches in one place.</p></div><button type="button" onClick={() => navigateTo('post-requirement')} className="flex items-center gap-2 rounded-full bg-[#D4A338] px-5 py-3 text-sm font-black text-slate-950 hover:bg-[#be8f2b] cursor-pointer"><Plus className="h-4 w-4" />New Campaign</button></div>
      {loading ? <p className="py-12 text-center text-slate-400">Loading campaigns…</p> : campaigns.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center"><h2 className="text-xl font-bold">No campaigns yet</h2><p className="mt-2 text-sm text-slate-400">Create your first brief to start receiving pitches.</p></div> : <div className="grid gap-4 md:grid-cols-2">{campaigns.map((campaign) => <article key={campaign.id} className="rounded-2xl border border-white/10 bg-[#0d1d38] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#D4A338]">{campaign.status || 'Active'}</p><h2 className="mt-2 text-lg font-black">{campaign.campaignTitle}</h2><p className="mt-2 line-clamp-2 text-sm text-slate-400">{campaign.campaignDescription || campaign.requirements}</p><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm"><span className="text-slate-400">Budget: {campaign.budget || 'On request'}</span><span className="flex items-center gap-1 font-bold"><Users className="h-4 w-4 text-[#D4A338]" />{campaign.applicants?.length || 0} pitches</span></div></article>)}</div>}
    </div>
  </div>;
};
