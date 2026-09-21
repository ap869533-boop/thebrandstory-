import React, { useState, useEffect, useRef } from 'react';
import { Building2, Sparkles, Send, CheckCircle2, ArrowRight, IndianRupee, MapPin, Users, Calendar, ShieldCheck, ChevronDown, Plus, X, Search, Check } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CATEGORIES_LIST, CITIES_LIST, INDUSTRIES_LIST, CAMPAIGN_TYPES } from '../data/initialData';
import confetti from 'canvas-confetti';

export const PostRequirementView: React.FC = () => {
  const { postCampaignRequirement, navigateTo, activeBrandName, categories, cities, industries, authUser, requireRole } = usePlatform();

  useEffect(() => {
    if (!authUser || authUser.role !== 'BRAND') {
      requireRole('BRAND', 'create and post a campaign brief', 'post-requirement');
    }
  }, [authUser]);

  const COUNTRY_CODES = [
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1',  flag: '🇺🇸', name: 'USA' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
    { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
    { code: '+61',  flag: '🇦🇺', name: 'Australia' },
    { code: '+49',  flag: '🇩🇪', name: 'Germany' },
    { code: '+33',  flag: '🇫🇷', name: 'France' },
    { code: '+81',  flag: '🇯🇵', name: 'Japan' },
    { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
    { code: '+86',  flag: '🇨🇳', name: 'China' },
    { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
    { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
    { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
    { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
    { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  ];

  const [formData, setFormData] = useState({
    companyName: authUser?.companyName || activeBrandName || '',
    contactPerson: authUser?.name || '',
    email: authUser?.email || '',
    phone: '',
    campaignTitle: '',
    industry: 'Fashion & Lifestyle',
    categories: ['Fashion'] as string[],
    city: 'Delhi NCR',
    deliverablesNeeded: '1x Instagram Reel (30s) with brand product tagging + 2x Stories with link',
    budget: '₹25,000 - ₹50,000',
    genderPreference: 'Any / Both',
    maleCount: 0 as number | string,
    femaleCount: 0 as number | string,
    ageRange: '',
    languages: ['Hindi'] as string[],
    followerRange: '10k-100k',
    isBarter: false,
    campaignStartDate: '',
    customInstructions: '',
  });

  // Custom multi-select dropdown state
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [newCatInput, setNewCatInput] = useState('');
  const [customCats, setCustomCats] = useState<string[]>([]);
  const catDropdownRef = useRef<HTMLDivElement>(null);
const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['Fashion & Lifestyle']);
  const industryDropdownRef = useRef<HTMLDivElement>(null);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>(['Delhi NCR']);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
      if (industryDropdownRef.current && !industryDropdownRef.current.contains(e.target as Node)) {
        setIndustryDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleCategory = (cat: string) => {
    setFormData(prev => {
      const already = prev.categories.includes(cat);
      return {
        ...prev,
        categories: already
          ? prev.categories.filter(c => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry) ? prev.filter(item => item !== industry) : [...prev, industry]
    );
  };

  const toggleCity = (city: string) => {
    setSelectedCities(prev => {
      if (city === 'Pan India') return ['Pan India'];
      const withoutPanIndia = prev.filter(item => item !== 'Pan India');
      return withoutPanIndia.includes(city)
        ? withoutPanIndia.filter(item => item !== city)
        : [...withoutPanIndia, city];
    });
  };

  const addCustomCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (!customCats.includes(trimmed)) {
      setCustomCats(prev => [...prev, trimmed]);
    }
    if (!formData.categories.includes(trimmed)) {
      setFormData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    }
    setNewCatInput('');
  };

  const allCategories = [
    ...(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map(c => c.name),
    ...customCats,
  ];
  const filteredCategories = allCategories.filter(c =>
    c.toLowerCase().includes(catSearch.toLowerCase().trim())
  );

  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrandName = authUser?.companyName || activeBrandName || 'Verified Brand';
    const finalIndustry = authUser?.industry || 'Fashion & Lifestyle';

    if (!formData.campaignTitle || !formData.email || !formData.phone) {
      alert('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);
    setTimeout(async () => {
      const campId = await postCampaignRequirement({
        companyName: finalBrandName,
        contactPerson: formData.contactPerson || finalBrandName,
        email: formData.email,
        phone: formData.phone,
        campaignTitle: formData.campaignTitle,
        industry: finalIndustry,
        category: formData.categories.join(', '),
        city: selectedCities.join(', '),
        deliverablesNeeded: formData.deliverablesNeeded,
        budget: formData.isBarter ? 'Barter / Product Exchange' : formData.budget,
        genderPreference: formData.genderPreference,
        maleCount: Number(formData.maleCount) || 0,
        femaleCount: Number(formData.femaleCount) || 0,
        ageRange: formData.ageRange || 'Any',
        language: formData.languages.length ? formData.languages.join(', ') : 'Any',
        followerRange: formData.followerRange,
        isBarter: formData.isBarter,
        campaignStartDate: formData.campaignStartDate || 'Immediate',
        customInstructions: formData.customInstructions,
      });

      setIsSubmitting(false);
      setSubmittedId(campId);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // silent
      }
    }, 500);
  };

  if (!authUser || authUser.role !== 'BRAND') {
    return (
      <div className="min-h-screen bg-slate-50/70 py-20 flex flex-col items-center justify-center text-center px-4 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#8e6819] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Brand Authentication Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please sign in as a verified Brand or Agency to post campaign briefs and receive custom creator pitches.
          </p>
          <button
            onClick={() =>
              navigateTo('login', {
                role: 'BRAND',
                redirectAfter: 'post-requirement',
                message: 'Brand Login Required: Please sign in as a Brand to post a campaign brief.'
              })
            }
            className="w-full py-2.5 bg-[#D4A338] hover:bg-[#b88628] text-black font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
          >
            Go to Brand Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#b88628] text-xs font-bold uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Post Requirement & Get Contacted (IndiaMART Style)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tell Us Your Influencer Requirement
          </h1>

        </div>

        {submittedId ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Campaign Brief Published!</h2>
              <p className="text-xs text-slate-500">
                Your requirement has been listed on the Live Brand Briefs board and dispatched to matching verified creators.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Campaign Reference:</span>
                <span className="font-mono font-bold text-[#b88628]">{submittedId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Title:</span>
                <span className="font-bold text-slate-800">{formData.campaignTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Target Region:</span>
                <span className="font-semibold text-slate-800">{formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Allocated Budget:</span>
                <span className="font-bold text-emerald-600">{formData.budget}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-center gap-3">
              <button
                onClick={() => navigateTo('opportunities')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                View Live Board
              </button>
              <button
                onClick={() => navigateTo('explore')}
                className="px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Browse Creators
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
            {/* Step 1: Basic Campaign Brief */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                1. Campaign Details
              </h3>


              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1.5">Campaign Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Indo-Western Collection Launch"
                  value={formData.campaignTitle}
                  onChange={(e) => setFormData({ ...formData, campaignTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Creator Category *</label>

                  {/* Custom Multi-Select Dropdown */}
                  <div ref={catDropdownRef} className="relative">
                    {/* Trigger button */}
                    <button
                      type="button"
                      onClick={() => setCatDropdownOpen(o => !o)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] text-xs font-medium text-slate-800 text-left flex items-center justify-between gap-2 transition cursor-pointer"
                      style={{ borderColor: catDropdownOpen ? '#D4A338' : undefined }}
                    >
                      <span className="truncate text-slate-800">
                        {formData.categories.length === 0 ? (
                          <span className="text-slate-400 font-normal">Select categories…</span>
                        ) : formData.categories.length === 1 ? (
                          formData.categories[0]
                        ) : (
                          <span>
                            {formData.categories[0]}{' '}
                            <span className="text-[11px] font-normal text-slate-500">
                              (+{formData.categories.length - 1} more)
                            </span>
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {formData.categories.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-[#8e6819] text-[10px] font-bold rounded-md">
                            {formData.categories.length}
                          </span>
                        )}
                        <ChevronDown
                          className="w-4 h-4 text-slate-400 transition-transform pointer-events-none"
                          style={{ transform: catDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </div>
                    </button>

                    {/* Dropdown panel */}
                    {catDropdownOpen && (
                      <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden text-xs">
                        {/* Search box for quick filtering */}
                        <div className="px-2.5 py-1.5 border-b border-slate-100 bg-slate-50/80 flex items-center gap-1.5">
                          <Search className="w-3 h-3 text-slate-400 shrink-0" />
                          <input
                            type="text"
                            value={catSearch}
                            onChange={e => setCatSearch(e.target.value)}
                            placeholder="Search or filter..."
                            className="w-full bg-transparent text-[11px] outline-none placeholder:text-slate-400"
                          />
                          {catSearch && (
                            <button
                              type="button"
                              onClick={() => setCatSearch('')}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Option list */}
                        <ul className="max-h-40 overflow-y-auto py-1 divide-y divide-slate-50/50">
                          {filteredCategories.map((cat, idx) => {
                            const selected = formData.categories.includes(cat);
                            return (
                              <li
                                key={idx}
                                onClick={() => toggleCategory(cat)}
                                className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition select-none ${
                                  selected
                                    ? 'bg-amber-50/70 font-semibold text-slate-900'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition ${
                                      selected
                                        ? 'bg-[#D4A338] border-[#D4A338]'
                                        : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {selected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                  </span>
                                  <span className="text-xs truncate">{cat}</span>
                                </div>
                              </li>
                            );
                          })}
                          {filteredCategories.length === 0 && (
                            <li className="px-3 py-2 text-center text-slate-400 text-xs">
                              No category found
                            </li>
                          )}
                        </ul>

                        {/* Add new category */}
                        <div className="border-t border-slate-100 p-2 bg-slate-50/60 flex gap-1.5">
                          <input
                            type="text"
                            value={newCatInput}
                            onChange={e => setNewCatInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomCategory();
                              }
                            }}
                            placeholder="Add new category…"
                            className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#D4A338] bg-white"
                          />
                          <button
                            type="button"
                            onClick={addCustomCategory}
                            className="px-2.5 py-1 bg-[#D4A338] hover:bg-[#b88628] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected tags */}
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {formData.categories.map(cat => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-[10px] font-semibold"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className="hover:text-red-500 transition ml-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Target City / Geography *</label>
                  <div ref={cityDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setCityDropdownOpen(open => !open)}
                      className="w-full min-h-[46px] px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-left flex items-center justify-between gap-2 transition cursor-pointer"
                      style={{ borderColor: cityDropdownOpen ? '#D4A338' : undefined }}
                    >
                      <span className="truncate text-slate-800 font-medium">
                        {selectedCities.length === 0 ? 'Select cities…' : selectedCities.join(', ')}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {cityDropdownOpen && (
                      <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 text-[10px] text-slate-500">
                          Select one or more cities
                        </div>
                        <ul className="max-h-48 overflow-y-auto py-1">
                          {[{ name: 'Pan India', id: 'pan-india' }, ...(cities && cities.length > 0 ? cities : CITIES_LIST)].map(city => {
                            const selected = selectedCities.includes(city.name);
                            return (
                              <li
                                key={city.id}
                                onClick={() => toggleCity(city.name)}
                                className={`flex items-center gap-2 px-3 py-2 cursor-pointer select-none ${selected ? 'bg-amber-50 font-semibold' : 'hover:bg-slate-50'}`}
                              >
                                <span className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? 'bg-[#D4A338] border-[#D4A338]' : 'border-slate-300'}`}>
                                  {selected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                </span>
                                <span>{city.name}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  {selectedCities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {selectedCities.map(city => (
                        <span key={city} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-[10px] font-semibold">
                          {city}
                          <button type="button" onClick={() => toggleCity(city)} className="hover:text-red-500">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Deliverables & Specs */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                2. Deliverables & Creator Specifications
              </h3>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1.5">Deliverables Needed *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 1x Reel, 2x Stories..."
                  value={formData.deliverablesNeeded}
                  onChange={(e) => setFormData({ ...formData, deliverablesNeeded: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Desired Follower Tier</label>
                  <div className="relative">
                    <select
                      value={formData.followerRange}
                      onChange={(e) => setFormData({ ...formData, followerRange: e.target.value })}
                      className="w-full appearance-none px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] text-xs font-medium text-slate-800 transition cursor-pointer"
                    >
                      <option value="Any Tier">Any Follower Tier</option>
                      <option value="1k-10k">Nano (1k - 10k)</option>
                      <option value="10k-100k">Micro (10k - 100k)</option>
                      <option value="100k-500k">Macro (100k - 500k)</option>
                      <option value="500k+">Mega / Celeb (500k+)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Total Budget (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹30,000 or Barter"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>
              </div>

              {/* Gender and Age Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                <div className="sm:col-span-1 lg:col-span-1">
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Gender Preference</label>
                  <div className="relative">
                    <select
                      value={formData.genderPreference}
                      onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                      className="w-full appearance-none px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] text-xs font-medium text-slate-800 transition cursor-pointer"
                    >
                      <option value="Any / Both">Any / Both</option>
                      <option value="Only Male">Only Male</option>
                      <option value="Only Female">Only Female</option>
                      <option value="Custom Mix">Custom Mix</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {(formData.genderPreference === 'Custom Mix' || formData.genderPreference === 'Any / Both') && (
                  <>
                    <div className="sm:col-span-1 lg:col-span-1">
                      <label className="block font-bold text-slate-800 text-xs mb-1.5">Male Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maleCount === 0 ? '' : formData.maleCount}
                        onChange={(e) => setFormData({ ...formData, maleCount: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="sm:col-span-1 lg:col-span-1">
                      <label className="block font-bold text-slate-800 text-xs mb-1.5">Female Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.femaleCount === 0 ? '' : formData.femaleCount}
                        onChange={(e) => setFormData({ ...formData, femaleCount: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-1 lg:col-span-1">
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Age Criteria</label>
                  <input
                    type="text"
                    value={formData.ageRange}
                    onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium text-xs"
                    placeholder="e.g. 18-25 (Optional)"
                  />
                </div>
              </div>

              {/* Language Details */}
              <div className="mt-4">
                <label className="block font-bold text-slate-800 text-xs mb-1.5">Language Preference</label>
                <p className="text-[11px] text-slate-500 mb-1.5">Use Ctrl (Windows) or Cmd (Mac) to select multiple languages.</p>
                <div className="relative">
                  <select
                    multiple
                    size={6}
                    value={formData.languages}
                    onChange={(e) => setFormData({
                      ...formData,
                      languages: Array.from(e.currentTarget.selectedOptions, option => option.value).filter(language => language !== 'Any'),
                    })}
                    className="w-full appearance-none px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] text-xs font-medium text-slate-800 transition cursor-pointer"
                  >
                    <option value="Any">Any Language</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Hinglish (Hindi + English)">Hinglish (Hindi + English)</option>
                    <option value="Assamese">Assamese (অসমীয়া)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Bhojpuri">Bhojpuri (भोजपुरी)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Kashmiri">Kashmiri (कॉशुर / كأشُر)</option>
                    <option value="Konkani">Konkani (कोंकणी)</option>
                    <option value="Maithili">Maithili (मैथिली)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Manipuri">Manipuri (Meitei / মৈতৈ)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Nepali">Nepali (नेपाली)</option>
                    <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="Sanskrit">Sanskrit (संस्कृतम्)</option>
                    <option value="Sindhi">Sindhi (सिंधी / سنڌي)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="Other">Other (Please specify in instructions)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Step 3: Contact Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                3. Brand Representative Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Alok Roy"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="alok@brand.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">WhatsApp / Phone *</label>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#D4A338] focus-within:bg-white transition">
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      title="Enter a valid 10-digit Indian mobile number"
                      placeholder="9811200000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full px-3 py-3 bg-transparent focus:outline-none text-xs font-medium text-slate-800 placeholder:text-slate-400 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero commission • Real direct creator pitches
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Publishing Campaign...' : 'Publish Brief & Get Quotes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
