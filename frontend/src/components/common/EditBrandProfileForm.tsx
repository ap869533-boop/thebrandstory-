import React, { useState } from 'react';
import { Save, X, UploadCloud, Camera } from 'lucide-react';
import { BrandProfile } from '../../types';
import { ImageCropperModal } from './ImageCropperModal';
import { apiUrl, authHeaders } from '../../config/api';

interface Props {
  profile: Partial<BrandProfile>;
  onSave: (updates: Partial<BrandProfile>) => Promise<void>;
  onCancel: () => void;
}

export const EditBrandProfileForm: React.FC<Props> = ({ profile, onSave, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    brandName: profile.brandName || '',
    gstNumber: profile.gstNumber || '',
    description: profile.description || '',
    website: profile.website || '',
    facebookUrl: profile.facebookUrl || '',
    instagramUrl: profile.instagramUrl || '',
    youtubeUrl: profile.youtubeUrl || '',
    linkedinUrl: profile.linkedinUrl || '',
    twitterUrl: profile.twitterUrl || '',
    industry: profile.industry || '',
    city: profile.city || '',
    contactPerson: profile.contactPerson || '',
    phone: profile.phone || '',
    email: profile.email || '',
    logoUrl: profile.logoUrl || '',
    coverUrl: profile.coverUrl || '',
  });

  const [cropModalData, setCropModalData] = useState<{ src: string, type: 'logo' | 'cover' } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState<'logo' | 'cover' | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm(curr => ({ ...curr, [key]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropModalData({ src: reader.result as string, type });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const uploadCroppedImage = async (file: File, type: 'logo' | 'cover') => {
    setUploadingMedia(type);
    setMessage('');
    
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch(apiUrl('/api/upload'), {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result, type: type === 'logo' ? 'avatar' : 'cover' })
        });
        const data = await response.json();
        if (!response.ok || !data.success || !data.url) throw new Error(data.error || 'Upload failed');
        
        const fullUrl = apiUrl(data.url);
        if (type === 'logo') update('logoUrl', fullUrl);
        else update('coverUrl', fullUrl);
      } catch (err: any) {
        setMessage(err.message || 'Image upload failed');
      } finally {
        setUploadingMedia(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await onSave(form);
    } catch (err: any) {
      setMessage(err.message || 'Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#0c1a32] rounded-3xl border border-white/10 p-6 sm:p-8 mt-8 w-full animate-in fade-in zoom-in-95 relative text-left">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">Edit Brand Profile</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2 cursor-pointer transition">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {message && <p className="mb-4 text-[#D4A338] text-sm font-semibold">{message}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Images Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-300">Brand Logo</span>
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-[#051126] border border-white/10 flex items-center justify-center mx-auto sm:mx-0 group">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-slate-500" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer z-10 backdrop-blur-sm text-center px-2">
                <span className="text-xs font-black text-white">{uploadingMedia === 'logo' ? 'Uploading...' : 'Change Logo'}</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                disabled={!!uploadingMedia}
                onChange={e => handleImageSelect(e, 'logo')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-300">Cover Image Preview</span>
            <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden bg-[#051126] border border-white/10 flex items-center justify-center mx-auto sm:mx-0 group">
              {form.coverUrl ? (
                <img src={form.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <UploadCloud className="w-8 h-8 text-slate-500" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer z-10 backdrop-blur-sm text-center px-2">
                <span className="text-xs font-black text-white">{uploadingMedia === 'cover' ? 'Uploading...' : 'Change Cover'}</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                disabled={!!uploadingMedia}
                onChange={e => handleImageSelect(e, 'cover')}
              />
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <div>
          <h3 className="text-sm uppercase font-black text-[#D4A338] mb-4 tracking-wider">Basic Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Brand Name</span>
              <input 
                required
                value={form.brandName} 
                onChange={e => update('brandName', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Industry</span>
              <input 
                required
                value={form.industry} 
                onChange={e => update('industry', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">City</span>
              <input 
                value={form.city} 
                onChange={e => update('city', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">GST Number</span>
              <input 
                value={form.gstNumber} 
                onChange={e => update('gstNumber', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm uppercase font-black text-[#D4A338] mb-4 tracking-wider">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Contact Person</span>
              <input 
                required
                value={form.contactPerson} 
                onChange={e => update('contactPerson', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Email</span>
              <input 
                type="email"
                required
                value={form.email} 
                onChange={e => update('email', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Phone</span>
              <input 
                value={form.phone} 
                onChange={e => update('phone', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Website</span>
              <input 
                type="url"
                value={form.website} 
                onChange={e => update('website', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-sm uppercase font-black text-[#D4A338] mb-4 tracking-wider">Social Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Instagram URL</span>
              <input 
                type="url"
                value={form.instagramUrl} 
                onChange={e => update('instagramUrl', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Facebook URL</span>
              <input 
                type="url"
                value={form.facebookUrl} 
                onChange={e => update('facebookUrl', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">YouTube URL</span>
              <input 
                type="url"
                value={form.youtubeUrl} 
                onChange={e => update('youtubeUrl', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">LinkedIn URL</span>
              <input 
                type="url"
                value={form.linkedinUrl} 
                onChange={e => update('linkedinUrl', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Twitter URL</span>
              <input 
                type="url"
                value={form.twitterUrl} 
                onChange={e => update('twitterUrl', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block">
            <span className="text-sm font-bold text-slate-300">About Brand (Description)</span>
            <textarea 
              value={form.description} 
              onChange={e => update('description', e.target.value)}
              rows={4}
              className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50 resize-none"
            />
          </label>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition cursor-pointer">Cancel</button>
          <button type="submit" disabled={saving || !!uploadingMedia} className="flex items-center gap-2 bg-[#D4A338] hover:bg-[#c2912a] text-slate-950 px-6 py-2.5 rounded-full font-black text-sm transition disabled:opacity-50 cursor-pointer">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Cropper Modal */}
      {cropModalData && (
        <ImageCropperModal
          imageSrc={cropModalData.src}
          aspect={cropModalData.type === 'logo' ? 1 : 16 / 9}
          shape={cropModalData.type === 'logo' ? 'round' : 'rect'}
          onCropDone={(file) => {
            uploadCroppedImage(file, cropModalData.type);
            setCropModalData(null);
          }}
          onCancel={() => setCropModalData(null)}
        />
      )}
    </div>
  );
};
