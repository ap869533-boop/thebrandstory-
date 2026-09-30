import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ConversationsPanel } from '../components/common/ConversationsPanel';
import { usePlatform } from '../context/PlatformContext';

export const ChatView: React.FC = () => {
  const { authUser, navigateTo } = usePlatform();
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const canUseChat = authUser?.role === 'CREATOR' || authUser?.role === 'BRAND';
  const openCreatorId = location.state?.creatorId;
  const campaignId = location.state?.campaignId;

  useEffect(() => {
    if (!authUser) navigateTo('login', { mode: 'login' });
    else if (!canUseChat) navigateTo('home');
  }, [authUser, canUseChat, navigateTo]);

  if (!canUseChat) return null;

  return (
    <div className="min-h-screen bg-[#051126] text-white">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-black">Live Chat</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your conversations with {authUser?.role === 'BRAND' ? 'influencers' : 'brands'}.</p>
        </div>
        <ConversationsPanel fullPage openUsername={username} openCreatorId={openCreatorId} campaignId={campaignId} />
      </main>
    </div>
  );
};
