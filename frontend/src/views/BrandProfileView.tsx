import React, { useEffect, useState } from 'react';
import { Edit3, Save } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { apiUrl, authHeaders } from '../config/api';
import { EditBrandProfileForm } from '../components/common/EditBrandProfileForm';
import { BrandProfile } from '../types';

export const BrandProfileView: React.FC = () => {
  const { authUser, navigateTo, setAuthUser } = usePlatform();
  const [form, setForm] = useState<Partial<BrandProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authUser?.role !== 'BRAND') { navigateTo('login', { mode: 'login' }); return; }
    fetch(apiUrl('/api/brands/profile'), { headers: authHeaders() })
      .then((response) => response.json())
      .then((data) => {
        const profile = data.profile || {};
        setForm({
          ...profile,
          brandName: profile.brandName || authUser.companyName || '',
          contactPerson: profile.contactPerson || authUser.name || '',
          phone: profile.phone || authUser.phone || '',
          email: profile.email || authUser.email || '',
        });
      })
      .catch(() => undefined);
  }, [authUser?.id]);

  const fields: Array<[keyof BrandProfile, string]> = [
    ['brandName', 'Brand name'], 
    ['contactPerson', 'Contact person'], 
    ['industry', 'Industry'], 
    ['city', 'City'], 
    ['website', 'Website'], 
    ['email', 'Email'],
    ['phone', 'Phone'],
    ['gstNumber', 'GST Number']
  ];

  return <div className="min-h-screen bg-[#051126] px-4 py-8 text-white sm:px-8 lg:px-[8vw]">
    {isEditing ? (
      <EditBrandProfileForm 
        profile={form as any}
        onSave={async (updates) => {
          setSaving(true); setMessage('');
          try {
            const response = await fetch(apiUrl('/api/brands/profile'), { 
              method: 'PUT', 
              headers: { ...authHeaders(), 'Content-Type': 'application/json' }, 
              body: JSON.stringify(updates) 
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'Could not save profile');
            setAuthUser({ ...authUser!, name: updates.contactPerson || authUser!.name, companyName: updates.brandName || authUser!.companyName, phone: updates.phone });
            setIsEditing(false);
            window.location.reload();
          } catch (error: any) { 
            console.error(error);
          } finally { 
            setSaving(false); 
          }
        }}
        onCancel={() => setIsEditing(false)}
      />
    ) : (
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#0d1d38] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">My Brand Profile</h1>
            <p className="mt-1 text-sm text-slate-400">Your brand's public information.</p>
          </div>
          <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-full border border-[#D4A338]/50 px-4 py-2 text-sm font-bold text-[#D4A338] hover:bg-[#D4A338]/10 cursor-pointer">
            <Edit3 className="h-4 w-4" />Edit Profile
          </button>
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {fields.map(([key, label]) => (
            <div key={key} className="border-b border-white/10 pb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
              <p className="mt-1 text-base font-medium text-slate-200">{form[key] || '-'}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 border-b border-white/10 pb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">About your brand</span>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{form.description || 'No description provided.'}</p>
        </div>
      </div>
    )}
  </div>;
};
