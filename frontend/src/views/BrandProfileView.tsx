import React, { useEffect, useState } from 'react';
import { Edit3, Save } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { apiUrl, authHeaders } from '../config/api';

type BrandProfileForm = {
  brandName: string; description: string; website: string; industry: string;
  city: string; contactPerson: string; phone: string;
};

export const BrandProfileView: React.FC = () => {
  const { authUser, navigateTo, setAuthUser } = usePlatform();
  const [form, setForm] = useState<BrandProfileForm>({ brandName: '', description: '', website: '', industry: '', city: '', contactPerson: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authUser?.role !== 'BRAND') { navigateTo('login', { mode: 'login' }); return; }
    fetch(apiUrl('/api/brands/profile'), { headers: authHeaders() })
      .then((response) => response.json())
      .then((data) => {
        const profile = data.profile || {};
        setForm({ brandName: profile.brandName || authUser.companyName || '', description: profile.description || '', website: profile.website || '', industry: profile.industry || '', city: profile.city || '', contactPerson: profile.contactPerson || authUser.name || '', phone: profile.phone || authUser.phone || '' });
      })
      .catch(() => undefined);
  }, [authUser?.id]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isEditing) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch(apiUrl('/api/brands/profile'), { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not save profile');
      setAuthUser({ ...authUser!, name: form.contactPerson || authUser!.name, companyName: form.brandName || authUser!.companyName, phone: form.phone });
      setMessage('Profile saved successfully.');
      setIsEditing(false);
    } catch (error: any) { setMessage(error.message || 'Could not save profile'); }
    finally { setSaving(false); }
  };

  const update = (key: keyof BrandProfileForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const fields: Array<[keyof BrandProfileForm, string]> = [['brandName', 'Brand name'], ['contactPerson', 'Contact person'], ['industry', 'Industry'], ['city', 'City'], ['website', 'Website'], ['phone', 'Phone']];

  return <div className="min-h-screen bg-[#051126] px-4 py-8 text-white sm:px-8 lg:px-[8vw]">
    <form onSubmit={save} className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#0d1d38] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-black">My Brand Profile</h1><p className="mt-1 text-sm text-slate-400">Your brand&apos;s public information.</p></div><button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-full border border-[#D4A338]/50 px-4 py-2 text-sm font-bold text-[#D4A338] hover:bg-[#D4A338]/10 cursor-pointer"><Edit3 className="h-4 w-4" />Edit Profile</button></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">{fields.map(([key, label]) => <label key={key} className="text-sm font-bold">{label}<input readOnly={!isEditing} value={form[key]} onChange={(event) => update(key, event.target.value)} className={`mt-2 w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white outline-none ${isEditing ? 'bg-[#071226] focus:border-[#D4A338]' : 'bg-white/5 text-slate-300 cursor-default'}`} /></label>)}</div>
      <label className="mt-4 block text-sm font-bold">About your brand<textarea readOnly={!isEditing} value={form.description} onChange={(event) => update('description', event.target.value)} rows={5} className={`mt-2 w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white outline-none ${isEditing ? 'bg-[#071226] focus:border-[#D4A338]' : 'bg-white/5 text-slate-300 cursor-default'}`} /></label>
      {message && <p className="mt-4 text-sm text-[#D4A338]">{message}</p>}
      {isEditing && <button disabled={saving} className="mt-6 flex items-center gap-2 rounded-full bg-[#D4A338] px-5 py-3 font-black text-slate-950 disabled:opacity-60 cursor-pointer"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save profile'}</button>}
    </form>
  </div>;
};
