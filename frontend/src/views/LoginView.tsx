import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Building2,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  FileText,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { ImageCropperModal } from '../components/common/ImageCropperModal';
import { usePlatform } from '../context/PlatformContext';
import { UserRole } from '../types';
import { apiUrl, readApiResponse } from '../config/api';
import { CATEGORIES_LIST, CITIES_LIST } from '../data/initialData';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN +91' }, { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' }, { code: '+971', label: 'UAE +971' },
  { code: '+61', label: 'AU +61' }, { code: '+65', label: 'SG +65' },
];

/** Accept a single price or a range such as "2000-10000" and use its minimum. */
function parseStartingPrice(value: string): number | null {
  const matches = value.replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
  if (!matches?.length) return null;
  const amount = Number(matches[0]);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export const LoginView: React.FC = () => {
  const {
    viewParams,
    navigateTo,
    setAuthUser,
    setCurrentRole,
    setCreators,
    setActiveCreatorId,
    siteLogo
  } = usePlatform();

  // Mode and Role state
  const [mode, setMode] = useState<'login' | 'signup'>((viewParams.mode as 'login' | 'signup') || 'login');
  const [role, setRole] = useState<UserRole>((viewParams.role as UserRole) || 'CREATOR');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');

  // OTP Fields
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [contextualNotice, setContextualNotice] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Creator Profile Setup
  const [creatorProfileSetup, setCreatorProfileSetup] = useState(false);
  const [creatorSetupStep, setCreatorSetupStep] = useState(1);
  const [signupCreator, setSignupCreator] = useState<any>(null);
  const [pendingSignupToken, setPendingSignupToken] = useState<string | null>(null);

  // Creator Setup Step 1 Fields
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [creatorState, setCreatorState] = useState('');
  const [languages, setLanguages] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropTarget, setCropTarget] = useState<'avatar' | 'cover'>('avatar');
  const [cropSrc, setCropSrc] = useState('');

  // Creator Setup Step 2 Fields
  const [followers, setFollowers] = useState('');
  const [totalPosts, setTotalPosts] = useState('');
  const [avgViews, setAvgViews] = useState('');
  const [avgLikes, setAvgLikes] = useState('');
  const [avgComments, setAvgComments] = useState('');
  const [startingPrice, setStartingPrice] = useState('');

  const fieldClass = (field: string, extra = '') =>
    `w-full px-4 py-3 bg-white/5 border ${touched[field] && !eval(field) ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A338]/60 focus:bg-white/8 text-xs font-medium transition ${extra}`;

  const creatorFieldClass = (field: string, value: string, extra = '') =>
    `w-full px-4 py-3 bg-white/5 border ${touched[field] && !value ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/10'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A338]/60 focus:bg-white/8 text-xs font-medium transition ${extra}`;

  useEffect(() => {
    if (viewParams.message) {
      setContextualNotice(viewParams.message as string);
    }
  }, [viewParams.message]);

  const handlePostAuthRedirect = (effectiveRole: UserRole) => {
    const redirectTarget = viewParams.redirectAfter as string;
    if (redirectTarget) {
      navigateTo(redirectTarget as any);
    } else if (effectiveRole === 'BRAND') {
      navigateTo('brand-campaigns', { slug: 'account' });
    } else if (effectiveRole === 'CREATOR') {
      navigateTo('opportunities');
    } else if (effectiveRole === 'ADMIN' || effectiveRole === 'SALES') {
      navigateTo('admin-dashboard');
    } else {
      navigateTo('home');
    }
  };

  const validate = () => {
    if (isForgotPassword) return email.trim().length > 0;
    if (!email.trim() || !password.trim()) return false;
    if (mode === 'signup') {
      if (role === 'CREATOR' && (!name.trim() || !phone.trim())) return false;
      if (role === 'BRAND' && (!companyName.trim() || !phone.trim())) return false;
    }
    return true;
  };

  const validateCreatorSetup = () => {
    if (creatorSetupStep === 1) {
      return gender && ageGroup && creatorState && category;
    }
    if (creatorSetupStep === 2) {
      return username.trim() && followers && startingPrice;
    }
    return true;
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const completeCreatorSetup = async () => {
    const creatorUser = signupCreator;
    if (!creatorUser) throw new Error('No creator session found');

    if (creatorSetupStep === 1) {
      setCreatorSetupStep(2);
      setSuccessMsg(null);
      return;
    }

    // Step 2: Save Instagram profile data
    const token = pendingSignupToken || localStorage.getItem('sc_auth_token');
    const creatorId = creatorUser.creatorProfile?.id || creatorUser.id;
    if (!token || !creatorId) throw new Error('Authentication session expired. Please sign up again.');

    const parsedStartingPrice = parseStartingPrice(startingPrice);

    const persistImage = async (dataUrl: string, type: 'avatar' | 'cover'): Promise<string | null> => {
      if (!dataUrl || !dataUrl.startsWith('data:')) return null;
      const image = dataUrl;
      const imageResponse = await fetch(apiUrl('/api/upload'), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image, creatorId, type }),
      });
      const imageData = await readApiResponse(imageResponse);
      if (!imageResponse.ok || !imageData.success || !imageData.url) throw new Error(imageData.error || 'Image upload failed');
      return apiUrl(imageData.url);
    };
    const avatarUrl = await persistImage(profilePhotoUrl, 'avatar');
    const coverUrl = await persistImage(bannerUrl, 'cover');
    const instagramHandle = username.match(/instagram\.com\/([^/?#]+)/i)?.[1] || username.trim();
    const updates = {
      username: instagramHandle, gender, ageGroup, currentCity: creatorState.trim(), state: '', primaryCategory: category,
      languages: languages.split(',').map(item => item.trim()).filter(Boolean),
      avatar: avatarUrl || undefined, coverImage: coverUrl || undefined,
      startingPrice: parsedStartingPrice,
      pricing: { startingPrice: parsedStartingPrice },
      followers: Number(followers) || 0, totalPosts: Number(totalPosts) || 0,
      avgViews: Number(avgViews) || 0, avgLikes: Number(avgLikes) || 0, avgComments: Number(avgComments) || 0,
      socialPlatforms: [{ platform: 'instagram', username: instagramHandle, url: username.trim(), followers: Number(followers) || 0, avgViews: Number(avgViews) || 0, verified: false }],
    };
    const res = await fetch(apiUrl(`/api/creators/${creatorId}`), {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(updates),
    });
    const data = await readApiResponse(res);
    if (!res.ok || !data.success || !data.creator) throw new Error(data.error || 'Could not save creator profile');
    const user = { ...creatorUser, creatorProfile: data.creator };
    localStorage.setItem('sc_auth_user', JSON.stringify(user));
    setAuthUser(user); setCreators(prev => [data.creator, ...prev.filter(c => c.id !== data.creator.id)]);
    setActiveCreatorId(data.creator.id);
    navigateTo('opportunities');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatorProfileSetup) {
      if (!validateCreatorSetup()) {
        setErrorMsg('Please correct the highlighted fields before continuing.');
        return;
      }
      setIsLoading(true); setErrorMsg(null);
      try { await completeCreatorSetup(); } catch (err: any) { setErrorMsg(err.message || 'Could not save profile details.'); }
      finally { setIsLoading(false); }
      return;
    }
    setTouched({ email: true, password: true, name: true, companyName: true, phone: true, otp: true });

    if (!validate()) {
      setErrorMsg('Please correct the highlighted fields before submitting.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isForgotPassword) {
        if (!resetOtpSent) {
          const res = await fetch(apiUrl('/api/auth/forgot-password-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
          const data = await readApiResponse(res);
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to send OTP for reset');
          }
          setResetOtpSent(true);
          setSuccessMsg(`OTP sent to ${email.trim()} for password reset.`);
        } else {
          const res = await fetch(apiUrl('/api/auth/reset-password'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
          });
          const data = await readApiResponse(res);
          if (!res.ok || !data.success) throw new Error(data.error || 'Password reset failed');
          setSuccessMsg('Password reset successfully! You can now sign in.');
          setIsForgotPassword(false);
          setResetOtpSent(false);
          setMode('login');
        }
      } else if (mode === 'login') {
        const res = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await readApiResponse(res);
        if (!res.ok || !data.success) throw new Error(data.error || 'Login failed. Check your credentials.');

        const effectiveRole: UserRole = data.user?.role || role;
        const userWithCorrectRole = data.user ? { ...data.user, role: effectiveRole } : null;

        if (data.token) localStorage.setItem('sc_auth_token', data.token);
        if (userWithCorrectRole) {
          localStorage.setItem('sc_auth_user', JSON.stringify(userWithCorrectRole));
          setAuthUser(userWithCorrectRole);
          setCurrentRole(effectiveRole);
          if (userWithCorrectRole.creatorProfile && effectiveRole === 'CREATOR') {
            setCreators((prev) => [userWithCorrectRole.creatorProfile, ...prev]);
            setActiveCreatorId(userWithCorrectRole.creatorProfile.id);
          }
        }

        setSuccessMsg('Welcome back! Redirecting...');
        setTimeout(() => handlePostAuthRedirect(effectiveRole), 700);
      } else {
        // Signup flow
        if (!otpSent) {
          const signupPayload: any = {
            email: email.trim(), password, name: role === 'CREATOR' ? name.trim() : companyName.trim(),
            role, phone: `${countryCode}${phone.trim()}`,
          };
          if (role === 'BRAND') {
            signupPayload.companyName = companyName.trim();
            signupPayload.gstNumber = gstNumber.trim();
          }
          if (role === 'CREATOR') signupPayload.category = category;

          const res = await fetch(apiUrl('/api/auth/send-otp'), {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(signupPayload),
          });
          const data = await readApiResponse(res);
          if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send OTP');
          setOtpSent(true);
          setSuccessMsg(`OTP sent to ${email.trim()}. Please check your inbox.`);
        } else {
          const verifyPayload: any = {
            email: email.trim(), otp: otp.trim(), password, name: role === 'CREATOR' ? name.trim() : companyName.trim(),
            role, phone: `${countryCode}${phone.trim()}`,
          };
          if (role === 'BRAND') {
            verifyPayload.companyName = companyName.trim();
            verifyPayload.gstNumber = gstNumber.trim();
          }
          if (role === 'CREATOR') verifyPayload.category = category;

          const res = await fetch(apiUrl('/api/auth/verify-otp'), {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(verifyPayload),
          });

          const data = await readApiResponse(res);
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to verify OTP & create account');
          }

          if (role === 'CREATOR' && data.signupToken) {
            setPendingSignupToken(data.signupToken);
            setCreatorProfileSetup(true);
            setCreatorSetupStep(1);
            setOtpSent(false);
            setSuccessMsg('Email verified. Complete all profile steps before confirming your account.');
            return;
          }

          const effectiveRole: UserRole = role;
          const userWithCorrectRole = data.user ? { ...data.user, role: effectiveRole } : null;

          if (data.token) localStorage.setItem('sc_auth_token', data.token);
          if (userWithCorrectRole) {
            localStorage.setItem('sc_auth_user', JSON.stringify(userWithCorrectRole));
            setAuthUser(userWithCorrectRole);
            setCurrentRole(effectiveRole);
            if (userWithCorrectRole.creatorProfile && effectiveRole === 'CREATOR') {
              setCreators((prev) => [userWithCorrectRole.creatorProfile, ...prev]);
              setActiveCreatorId(userWithCorrectRole.creatorProfile.id);
            }
          }

          if (effectiveRole === 'BRAND') {
            setSuccessMsg('Brand account created! Your account is pending admin approval. You will be notified once approved.');
            setTimeout(() => {
              handlePostAuthRedirect('BRAND');
            }, 2500);
          } else {
            setSignupCreator(userWithCorrectRole);
            setCreatorProfileSetup(true);
            setCreatorSetupStep(1);
            setOtpSent(false);
            setSuccessMsg('Email verified. Complete your creator profile.');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051126] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center font-sans">

      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {creatorProfileSetup
              ? creatorSetupStep === 1 ? 'Complete your basic profile' : 'Add your Instagram details'
              : isForgotPassword ? 'Reset Password' : mode === 'login' ? 'Log In to Your Account' : 'Create Your Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {creatorProfileSetup
              ? 'This information can be changed any time from Edit Profile.'
              : mode === 'login'
              ? 'Connect directly with verified creators and top brands across India.'
              : 'Join the premier zero-commission influencer collaboration marketplace.'}
          </p>
        </div>

        {/* Contextual Notice Banner */}
        {contextualNotice && (
          <div className="p-4 rounded-2xl bg-[#D4A338]/10 border border-[#D4A338]/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
            <ShieldCheck className="w-5 h-5 text-[#D4A338] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-[#D4A338] mb-0.5">Authentication Required</strong>
              <span>{contextualNotice}</span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-5 backdrop-blur-sm">
          {/* Mode Switcher: Login / Signup */}
          {!isForgotPassword && !creatorProfileSetup && (
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#D4A338] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
                setOtpSent(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#D4A338] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
          )}

          {/* Role Selector Buttons */}
          {!isForgotPassword && mode === 'signup' && !creatorProfileSetup && (
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 text-xs">
                I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setRole('CREATOR');
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  role === 'CREATOR'
                    ? 'border-[#D4A338] bg-[#D4A338]/10 text-[#D4A338] ring-2 ring-[#D4A338]/30'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${role === 'CREATOR' ? 'text-[#D4A338]' : 'text-slate-500'}`} />
                <span>Influencer / Creator</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('BRAND');
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  role === 'BRAND'
                    ? 'border-[#D4A338] bg-[#D4A338]/10 text-[#D4A338] ring-2 ring-[#D4A338]/30'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Building2 className={`w-4 h-4 ${role === 'BRAND' ? 'text-[#D4A338]' : 'text-slate-500'}`} />
                <span>Brand / Agency</span>
              </button>
            </div>
          </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-xs">
            {mode === 'signup' && role === 'CREATOR' && !isForgotPassword && (
              <div className="rounded-xl border border-[#D4A338]/30 bg-[#D4A338]/5 px-3 py-2.5">
                <div className="flex justify-between font-bold text-[#D4A338]">
                  <span>Influencer signup</span>
                  <span>Step {creatorProfileSetup ? creatorSetupStep + 2 : otpSent ? 2 : 1} of 4</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#D4A338] transition-all" style={{ width: `${creatorProfileSetup ? creatorSetupStep === 1 ? 75 : 100 : otpSent ? 50 : 25}%` }} />
                </div>
              </div>
            )}
            {creatorProfileSetup && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    if (creatorSetupStep === 2) setCreatorSetupStep(1);
                    else { setCreatorProfileSetup(false); setOtpSent(true); }
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                {creatorSetupStep === 1 ? (
                  <>
                    {/* Profile Photo */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1.5">Profile Photo</label>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {profilePhotoUrl
                            ? <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                            : <User className="w-6 h-6 text-slate-500" />}
                        </div>
                        <label className="cursor-pointer px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition text-xs font-bold">
                          Upload Photo
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setProfilePhotoFile(file);
                            const url = URL.createObjectURL(file);
                            setCropSrc(url); setCropTarget('avatar'); setShowCropper(true);
                          }} />
                        </label>
                      </div>
                    </div>

                    {/* Basic Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Gender *</label>
                        <select value={gender} onChange={e => setGender(e.target.value)}
                          className={creatorFieldClass('gender', gender, 'bg-white/5 text-white border-white/10')}>
                          <option value="" className="bg-[#051126]">Select</option>
                          {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => <option key={g} value={g} className="bg-[#051126]">{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Age Group *</label>
                        <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}
                          className={creatorFieldClass('ageGroup', ageGroup, 'bg-white/5 text-white border-white/10')}>
                          <option value="" className="bg-[#051126]">Select</option>
                          {['18-21', '22-25', '26-30', '31-35', '36-40', '41+'].map(a => <option key={a} value={a} className="bg-[#051126]">{a}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Primary Category *</label>
                      <select value={category} onChange={e => setCategory(e.target.value)}
                        className={creatorFieldClass('category', category, 'bg-white/5 text-white border-white/10')}>
                        <option value="" className="bg-[#051126]">Select category</option>
                        {CATEGORIES_LIST.map(c => <option key={c.slug} value={c.name} className="bg-[#051126]">{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">City / Location *</label>
                      <select value={creatorState} onChange={e => setCreatorState(e.target.value)}
                        className={creatorFieldClass('creatorState', creatorState, 'bg-white/5 text-white border-white/10')}>
                        <option value="" className="bg-[#051126]">Select city</option>
                        {CITIES_LIST.map(c => <option key={c.slug} value={c.name} className="bg-[#051126]">{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Languages (comma-separated)</label>
                      <input
                        type="text"
                        value={languages}
                        onChange={e => setLanguages(e.target.value)}
                        placeholder="e.g. Hindi, English, Punjabi"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A338]/60 text-xs font-medium transition"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Step 2: Instagram Stats */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Instagram Profile URL or Handle *</label>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="@yourhandle or instagram.com/yourhandle"
                        className={creatorFieldClass('username', username)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Followers *</label>
                        <input type="number" value={followers} onChange={e => setFollowers(e.target.value)}
                          placeholder="e.g. 50000"
                          className={creatorFieldClass('followers', followers)} />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Total Posts</label>
                        <input type="number" value={totalPosts} onChange={e => setTotalPosts(e.target.value)}
                          placeholder="e.g. 120"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A338]/60 text-xs font-medium transition" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Avg Views</label>
                        <input type="number" value={avgViews} onChange={e => setAvgViews(e.target.value)}
                          placeholder="e.g. 10000"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A338]/60 text-xs font-medium transition" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Avg Likes</label>
                        <input type="number" value={avgLikes} onChange={e => setAvgLikes(e.target.value)}
                          placeholder="e.g. 2000"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A338]/60 text-xs font-medium transition" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Starting Price (₹) *</label>
                      <input
                        type="text"
                        value={startingPrice}
                        onChange={e => setStartingPrice(e.target.value)}
                        placeholder="e.g. 5000 or 5000-15000"
                        className={creatorFieldClass('startingPrice', startingPrice)}
                      />
                      <p className="text-slate-500 mt-1 text-[10px]">Minimum fee per brand collaboration</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {!creatorProfileSetup && (
              <>
                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setTouched(t => ({ ...t, email: true })); }}
                    className={`${fieldClass('email')} pl-10`}
                  />
                </div>

                {/* Password */}
                {!isForgotPassword && (
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setTouched(t => ({ ...t, password: true })); }}
                      className={`${fieldClass('password')} pl-10 pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition cursor-pointer">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Signup only fields */}
                {mode === 'signup' && !otpSent && !isForgotPassword && (
                  <>
                    {role === 'CREATOR' ? (
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Your Full Name *"
                          value={name}
                          onChange={e => { setName(e.target.value); setTouched(t => ({ ...t, name: true })); }}
                          className={`${fieldClass('name')} pl-10`}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Company / Brand Name *"
                            value={companyName}
                            onChange={e => { setCompanyName(e.target.value); setTouched(t => ({ ...t, companyName: true })); }}
                            className={`${fieldClass('companyName')} pl-10`}
                          />
                        </div>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="GST Number (optional)"
                            value={gstNumber}
                            onChange={e => setGstNumber(e.target.value)}
                            className="w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#D4A338]/60 text-xs font-medium transition"
                          />
                        </div>
                      </>
                    )}

                    {/* Phone */}
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-[#D4A338]/60 transition cursor-pointer w-28"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code} className="bg-[#051126]">{c.label}</option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="Phone number *"
                          value={phone}
                          onChange={e => { setPhone(e.target.value); setTouched(t => ({ ...t, phone: true })); }}
                          className={`${fieldClass('phone')} pl-10`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* OTP Input */}
                {(otpSent || resetOtpSent) && !isForgotPassword || (isForgotPassword && resetOtpSent) ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={e => { setOtp(e.target.value); setTouched(t => ({ ...t, otp: true })); }}
                        className={`${fieldClass('otp')} pl-10 tracking-[0.3em] font-mono`}
                      />
                    </div>
                    {isForgotPassword && resetOtpSent && (
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className={`${fieldClass('newPassword')} pl-10`}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Forgot Password link */}
                {mode === 'login' && !isForgotPassword && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setErrorMsg(null); setSuccessMsg(null); }}
                      className="text-[10px] text-[#D4A338] hover:text-amber-300 font-bold cursor-pointer transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4A338] hover:bg-[#b88628] text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-lg shadow-[#D4A338]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {creatorProfileSetup
                      ? creatorSetupStep === 1 ? 'Next Step →' : 'Complete Profile'
                      : isForgotPassword
                        ? resetOtpSent ? 'Reset Password' : 'Send OTP'
                        : mode === 'login' ? 'Sign In' : otpSent ? 'Verify & Create Account' : 'Send OTP'}
                  </span>
                  {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
                </>
              )}
            </button>

            {isForgotPassword && (
              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setResetOtpSent(false); setErrorMsg(null); setSuccessMsg(null); }}
                className="w-full text-center text-[10px] text-slate-500 hover:text-slate-300 font-bold cursor-pointer transition py-1"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {/* Divider and Terms */}
          {!creatorProfileSetup && (
            <div className="pt-2 border-t border-white/10 text-center space-y-2">
              <p className="text-[10px] text-slate-500">
                By continuing, you agree to our{' '}
                <span className="text-[#D4A338] cursor-pointer hover:underline font-bold">Terms of Service</span>{' '}
                and{' '}
                <span className="text-[#D4A338] cursor-pointer hover:underline font-bold">Privacy Policy</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropperModal
          imageSrc={cropSrc}
          aspect={cropTarget === 'avatar' ? 1 : 3}
          onCropDone={(croppedFile) => {
            const croppedImageUrl = URL.createObjectURL(croppedFile);
            if (cropTarget === 'avatar') setProfilePhotoUrl(croppedImageUrl);
            else setBannerUrl(croppedImageUrl);
            setShowCropper(false);
          }}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
};
