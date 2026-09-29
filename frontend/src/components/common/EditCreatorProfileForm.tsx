import React, { useState, useRef } from 'react';
import { Save, X, UploadCloud, Camera } from 'lucide-react';
import { Creator } from '../../types';
import { CATEGORIES_LIST, CITIES_LIST } from '../../data/initialData';
import { ImageCropperModal } from './ImageCropperModal';
import { CreatorCard } from './CreatorCard';
import { apiUrl } from '../../config/api';
import { authHeaders } from '../../config/api';

interface Props {
  creator: Creator;
  onSave: (updates: Partial<Creator>) => Promise<void>;
  onCancel: () => void;
}

export const EditCreatorProfileForm: React.FC<Props> = ({ creator, onSave, onCancel }) => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    name: creator.name || '',
    username: creator.username || '',
    phone: creator.phone || '',
    bio: creator.bio || '',
    currentCity: creator.currentCity || '',
    primaryCategory: creator.primaryCategory || '',
    languages: creator.languages ? creator.languages.join(', ') : '',
    gender: creator.gender || '',
    ageGroup: creator.ageGroup || '',
    followers: creator.followers || 0,
    totalPosts: creator.totalPosts || 0,
    avgViews: creator.avgViews || 0,
    avgLikes: creator.avgLikes || 0,
    avgComments: creator.avgComments || 0,
    avatar: creator.avatar || '',
    coverImage: creator.coverImage || '',
  });

  const [cropModalData, setCropModalData] = useState<{ src: string, type: 'avatar' | 'cover' } | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState<'avatar' | 'cover' | null>(null);

  const update = (key: keyof typeof form, value: string | number) => {
    setForm(curr => ({ ...curr, [key]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
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

  const uploadCroppedImage = async (file: File, type: 'avatar' | 'cover') => {
    setUploadingMedia(type);
    setMessage('');
    
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch(apiUrl('/api/upload'), {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result, creatorId: creator.id, type })
        });
        const data = await response.json();
        if (!response.ok || !data.success || !data.url) throw new Error(data.error || 'Upload failed');
        
        const fullUrl = apiUrl(data.url);
        if (type === 'avatar') update('avatar', fullUrl);
        else update('coverImage', fullUrl);
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
      await onSave({
        phone: form.phone,
        bio: form.bio,
        currentCity: form.currentCity,
        primaryCategory: form.primaryCategory,
        languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
        gender: form.gender as any,
        ageGroup: form.ageGroup,
        followers: Number(form.followers),
        totalPosts: Number(form.totalPosts),
        avgViews: Number(form.avgViews),
        avgLikes: Number(form.avgLikes),
        avgComments: Number(form.avgComments),

        avatar: form.avatar,
        coverImage: form.coverImage,
      });
    } catch (err: any) {
      setMessage(err.message || 'Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#0c1a32] rounded-3xl border border-white/10 p-6 sm:p-8 mt-8 w-full animate-in fade-in zoom-in-95 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white">Edit Profile</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {message && <p className="mb-4 text-[#D4A338] text-sm font-semibold">{message}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Images Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-300">Profile Photo</span>
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-[#051126] border border-white/10 flex items-center justify-center mx-auto sm:mx-0 group">
              {form.avatar ? (
                <img src={form.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-slate-500" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer">
                <span className="text-xs font-bold">{uploadingMedia === 'avatar' ? 'Uploading...' : 'Change'}</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={!!uploadingMedia}
                onChange={e => handleImageSelect(e, 'avatar')}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-300">Card Photo Preview</span>
            <div className="relative w-36 h-48 sm:w-40 sm:h-56 rounded-2xl overflow-hidden bg-[#051126] border border-white/10 flex items-center justify-center mx-auto sm:mx-0 group">
              {form.coverImage ? (
                <img src={form.coverImage} alt="Card Cover" className="w-full h-full object-cover" />
              ) : (
                <UploadCloud className="w-8 h-8 text-slate-500" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer z-10 backdrop-blur-sm text-center px-2">
                <span className="text-xs font-black text-white">{uploadingMedia === 'cover' ? 'Uploading...' : 'Change Photo'}</span>
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

        {/* Basic Details Section */}
        <div>
          <h3 className="text-sm uppercase font-black text-[#D4A338] mb-3 tracking-wider">Basic Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block opacity-60">
              <span className="text-sm font-bold text-slate-300">Full Name</span>
              <input 
                readOnly
                value={form.name} 
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-not-allowed"
              />
            </label>
            <label className="block opacity-60">
              <span className="text-sm font-bold text-slate-300">Insta Username</span>
              <input 
                readOnly
                value={form.username} 
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-not-allowed"
              />
            </label>
            
            <label className="block">
              <span className="text-sm font-bold text-slate-300">WhatsApp Number</span>
              <input 
                value={form.phone} 
                onChange={e => update('phone', e.target.value)}
                placeholder="+91..."
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Category</span>
              <select
                value={form.primaryCategory}
                onChange={e => update('primaryCategory', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              >
                <option value="">Select Category</option>
                {CATEGORIES_LIST.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-300">Current City</span>
              <select
                value={form.currentCity}
                onChange={e => update('currentCity', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              >
                <option value="">Select City</option>
                {CITIES_LIST.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-300">Languages (comma separated)</span>
              <input 
                value={form.languages} 
                onChange={e => update('languages', e.target.value)}
                placeholder="Hindi, English..."
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-300">Gender</span>
              <select
                value={form.gender}
                onChange={e => update('gender', e.target.value)}
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              >
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-300">Age Group</span>
              <input 
                value={form.ageGroup} 
                onChange={e => update('ageGroup', e.target.value)}
                placeholder="e.g. 18-24"
                className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
          </div>
          
          <label className="block mt-4">
            <span className="text-sm font-bold text-slate-300">Bio</span>
            <textarea 
              value={form.bio} 
              onChange={e => update('bio', e.target.value)}
              rows={4}
              className="mt-1.5 w-full bg-[#051126] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4A338]/50 resize-none"
            />
          </label>
        </div>

        {/* Performance Matrix */}
        <div>
          <h3 className="text-sm uppercase font-black text-[#D4A338] mb-3 tracking-wider">Performance Matrix</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-slate-400">Followers</span>
              <input 
                type="number"
                value={form.followers} 
                onChange={e => update('followers', e.target.value)}
                className="mt-1 w-full bg-[#051126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-400">Total Posts</span>
              <input 
                type="number"
                value={form.totalPosts} 
                onChange={e => update('totalPosts', e.target.value)}
                className="mt-1 w-full bg-[#051126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-400">Avg Views</span>
              <input 
                type="number"
                value={form.avgViews} 
                onChange={e => update('avgViews', e.target.value)}
                className="mt-1 w-full bg-[#051126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-400">Avg Likes</span>
              <input 
                type="number"
                value={form.avgLikes} 
                onChange={e => update('avgLikes', e.target.value)}
                className="mt-1 w-full bg-[#051126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-400">Avg Comments</span>
              <input 
                type="number"
                value={form.avgComments} 
                onChange={e => update('avgComments', e.target.value)}
                className="mt-1 w-full bg-[#051126] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4A338]/50"
              />
            </label>
          </div>
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
          aspect={cropModalData.type === 'avatar' ? 1 : 9 / 16}
          shape={cropModalData.type === 'avatar' ? 'round' : 'rect'}
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
