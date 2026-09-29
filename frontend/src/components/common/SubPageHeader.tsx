import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

interface SubPageHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
}

export const SubPageHeader: React.FC<SubPageHeaderProps> = ({ title, subtitle }) => {
  const { authUser, filters, navigateTo, setFilters } = usePlatform();
  const [keyword, setKeyword] = useState('');
  const isCreator = authUser?.role === 'CREATOR';

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const searchQuery = keyword.trim();

    if (isCreator) {
      navigateTo('opportunities', { searchQuery });
      return;
    }

    setFilters({ ...filters, searchQuery });
    navigateTo('explore');
  };

  const openMenuDestination = () => {
    if (authUser?.role === 'CREATOR') navigateTo('creator-dashboard');
    else if (authUser?.role === 'BRAND') navigateTo('brand-dashboard');
    else if (authUser?.role === 'ADMIN' || authUser?.role === 'SALES') navigateTo('admin-dashboard');
    else navigateTo('login', { mode: 'login' });
  };

  return (
    <header className="relative z-40 bg-[#051126] text-white border-b border-white/10">
      <div className="w-full px-4 sm:px-6 md:px-[6vw] h-20 sm:h-24 flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="shrink-0 text-left cursor-pointer select-none"
          aria-label="Go to home"
        >
          <span className="text-2xl sm:text-3xl md:text-[2.6rem] tracking-tight leading-none">
            <span className="font-medium text-white">the</span>
            <span className="font-black text-[#D4A338]">brands</span>
            <span className="font-medium text-white">story</span>
            <span className="text-[#D4A338]">.</span>
          </span>
        </button>

        <form
          onSubmit={submitSearch}
          className="subpage-search-form hidden md:flex md:ml-auto w-[min(580px,42vw)] h-[54px] items-center rounded-full bg-white border border-white px-6 shadow-lg shadow-black/10"
        >
          <Search className="w-5 h-5 shrink-0 mr-3 text-[#3977c9]" />
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={isCreator ? 'Search brands here...' : 'Search creators here...'}
            className="subpage-search-input w-full bg-transparent text-base text-slate-900 placeholder:text-slate-500 outline-none"
          />
        </form>

        <button
          type="button"
          onClick={openMenuDestination}
          title="Open menu"
          className="ml-auto md:ml-0 w-[46px] h-[46px] sm:w-[52px] sm:h-[52px] md:w-[54px] md:h-[54px] rounded-2xl md:rounded-[20px] border-2 border-[#8eb6ff] text-[#8eb6ff] flex items-center justify-center transition hover:bg-white/10 cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </button>
      </div>

      {(title || subtitle) && (
        <div className="md:hidden px-4 pb-3 text-xs text-slate-400">
          <span className="font-bold text-slate-200">{title}</span>
          {subtitle && <span> · {subtitle}</span>}
        </div>
      )}
    </header>
  );
};
