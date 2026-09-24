import { apiUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  Building2,
  Sparkles,
  ArrowRight,
  Loader2,
  Phone,
  MapPin,
  Tag,
  AtSign,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  Camera,
  ImagePlus
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { UserRole } from '../../types';
import { CATEGORIES_LIST, CITIES_LIST } from '../../data/initialData';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN +91' }, { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' }, { code: '+971', label: 'UAE +971' },
  { code: '+61', label: 'AU +61' }, { code: '+65', label: 'SG +65' },
];

async function readApiResponse(response: Response): Promise<any> {
  const body = await response.text();
  if (!body) {
    return { success: false, error: `Server returned ${response.status} without a response body.` };
  }

  try {
    return JSON.parse(body);
  } catch {
    return { success: false, error: `Server returned ${response.status}: ${body.slice(0, 160)}` };
  }
}

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalInitialMode,
    authModalPreferredRole,
    authModalNotice,
    authModalRedirectAfter,
    closeAuthModal,
    setAuthUser,
    setCurrentRole,
    navigateTo,
    setCreators,
    setActiveCreatorId,
    categories,
    cities,
    siteLogo
  } = usePlatform();
  const [mode, setMode] = useState<'login' | 'signup'>(authModalInitialMode);
  const [role, setRole] = useState<UserRole>(authModalPreferredRole || 'CREATOR');
  const [logoError, setLogoError] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');

  // OTP Fields
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);

  // Reset fields cleanly when modal opens to prevent stale browser autofills
  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalInitialMode);
      setRole(authModalPreferredRole || 'CREATOR');
      setEmail('');
      setPassword('');
      setName('');
      setUsername('');
      setPhone('');
      setCountryCode('+91');
      setCompanyName('');
      setCategory('');
      setCity('');
      setOtp('');
      setOtpSent(false);
      setIsForgotPassword(false);
      setResetOtpSent(false);
      setCreatorProfileSetup(false);
      setCreatorSetupStep(1);
      setSignupCreator(null);
      setPendingSignupToken('');
      setGender('');
      setCreatorState('');
      setLanguages('');
      setAgeGroup('');
      setStartingPrice('');
      setFollowers('');
      setTotalPosts('');
      setAvgViews('');
      setAvgLikes('');
      setAvgComments('');
      setProfilePhotoUrl('');
      setBannerUrl('');
      setUploadingMedia(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      setFieldErrors({});
      setTouched({});
    }
  }, [authModalOpen, authModalInitialMode, authModalPreferredRole]);

  // Validation State
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [emailAvailability, setEmailAvailability] = useState<'idle' | 'checking' | 'available' | 'registered'>('idle');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [creatorProfileSetup, setCreatorProfileSetup] = useState(false);
  const [creatorSetupStep, setCreatorSetupStep] = useState<1 | 2>(1);
  const [signupCreator, setSignupCreator] = useState<any>(null);
  const [pendingSignupToken, setPendingSignupToken] = useState('');
  const [gender, setGender] = useState('');
  const [creatorState, setCreatorState] = useState('');
  const [languages, setLanguages] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [followers, setFollowers] = useState('');
  const [totalPosts, setTotalPosts] = useState('');
  const [avgViews, setAvgViews] = useState('');
  const [avgLikes, setAvgLikes] = useState('');
  const [avgComments, setAvgComments] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState<'avatar' | 'cover' | null>(null);

  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();
    const isCreatorSignup = mode === 'signup' && role === 'CREATOR' && !creatorProfileSetup;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isCreatorSignup || !isValidEmail) {
      setEmailAvailability('idle');
      return;
    }

    let isCurrentRequest = true;
    setEmailAvailability('checking');
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(apiUrl('/api/auth/check-email'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail }),
        });
        const data = await readApiResponse(response);
        if (!isCurrentRequest) return;
        setEmailAvailability(response.ok && data.success && !data.exists ? 'available' : 'registered');
      } catch {
        if (isCurrentRequest) setEmailAvailability('idle');
      }
    }, 450);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timer);
    };
  }, [email, mode, role, creatorProfileSetup]);

  if (!authModalOpen) return null;

  // Validation Logic
  const validate = () => {
    const errors: { [key: string]: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@company.com)';
    } else if (mode === 'signup' && role === 'CREATOR' && emailAvailability === 'registered') {
      errors.email = 'This email is already registered. Please sign in instead.';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6 && mode === 'signup') {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup' && otpSent) {
      if (!otp.trim()) {
        errors.otp = 'OTP is required';
      } else if (otp.trim().length !== 6) {
        errors.otp = 'OTP must be 6 digits';
      }
    }

    if (!otpSent && mode === 'signup') {
      // Name validation
      if (!name.trim()) {
        errors.name = 'Full name is required';
      } else if (name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }

      // Role specific validation
      if (role === 'CREATOR') {
        if (username.trim()) {
          const handleRegex = /(https?:\/\/)?(www\.)?instagram\.com\/[^\/]+/i;
          if (!handleRegex.test(username.trim())) {
            errors.username = 'Please enter a valid Instagram profile URL (e.g., https://instagram.com/username)';
          }
        }
        // Phone validation
        const cleanPhone = phone.replace(/\D/g, '');
        if (!phone.trim()) {
          errors.phone = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(cleanPhone)) {
          errors.phone = 'Please enter exactly 10 digits';
        }
      } else if (role === 'BRAND') {
        if (!companyName.trim()) {
          errors.companyName = 'Company or brand name is required';
        }
        const cleanPhone = phone.replace(/\D/g, '');
        if (!phone.trim()) {
          errors.phone = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(cleanPhone)) {
          errors.phone = 'Please enter exactly 10 digits';
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const completeCreatorSetup = async () => {
    if (creatorSetupStep === 1) {
      if (!profilePhotoUrl || !bannerUrl || !gender || !creatorState.trim() || !category || !languages.trim() || !ageGroup) {
        throw new Error('Please complete every basic information field, including profile photo and display card photo.');
      }
      setCreatorSetupStep(2);
      return;
    }
    if (!username.trim() || !/^https?:\/\/(www\.)?instagram\.com\/[^/]+/i.test(username.trim())) throw new Error('Please enter a valid Instagram profile URL.');
    if (![followers, totalPosts, avgViews, avgLikes, avgComments].every(value => value.trim() !== '') || Number(startingPrice) <= 0) {
      throw new Error('Please enter every Instagram metric and a starting price. Use 0 where a metric is zero.');
    }
    let creatorUser = signupCreator;
    let token = localStorage.getItem('sc_auth_token') || '';
    if (!creatorUser) {
      const createResponse = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim(), role: 'CREATOR', phone: phone.trim(), countryCode, signupToken: pendingSignupToken }),
      });
      const createData = await readApiResponse(createResponse);
      if (!createResponse.ok || !createData.success || !createData.token || !createData.user?.creatorProfile) throw new Error(createData.error || 'Could not create creator profile');
      token = createData.token;
      localStorage.setItem('sc_auth_token', token);
      creatorUser = createData.user;
      setSignupCreator(creatorUser);
    }
    const creatorId = creatorUser.creatorProfile.id;
    const persistImage = async (image: string, type: 'avatar' | 'cover') => {
      if (!image.startsWith('data:')) return image;
      const imageResponse = await fetch(apiUrl('/api/upload'), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image, creatorId, type }),
      });
      const imageData = await readApiResponse(imageResponse);
      if (!imageResponse.ok || !imageData.success || !imageData.url) throw new Error(imageData.error || 'Image upload failed');
      return apiUrl(imageData.url);
    };
    const avatarUrl = await persistImage(profilePhotoUrl, 'avatar');
    const cardPhotoUrl = await persistImage(bannerUrl, 'cover');
    const instagramHandle = username.match(/instagram\.com\/([^/?#]+)/i)?.[1] || username;
    const updates = {
      username: instagramHandle, gender, state: creatorState.trim(), primaryCategory: category,
      avatar: avatarUrl || undefined,
      coverImage: cardPhotoUrl || undefined,
      languages: languages.split(',').map((item) => item.trim()).filter(Boolean), ageGroup,
      startingPrice: Number(startingPrice),
      pricing: { startingPrice: Number(startingPrice) },
      followers: Number(followers) || 0, totalPosts: Number(totalPosts) || 0,
      avgViews: Number(avgViews) || 0, avgLikes: Number(avgLikes) || 0, avgComments: Number(avgComments) || 0,
      socialPlatforms: [{ platform: 'instagram', username: instagramHandle, url: username.trim(), followers: Number(followers) || 0, avgViews: Number(avgViews) || 0, verified: false }],
    };
    const response = await fetch(apiUrl(`/api/creators/${creatorId}`), {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(updates),
    });
    const data = await readApiResponse(response);
    if (!response.ok || !data.success || !data.creator) throw new Error(data.error || 'Could not save creator profile');
    const user = { ...creatorUser, creatorProfile: data.creator };
    localStorage.setItem('sc_auth_user', JSON.stringify(user));
    setAuthUser(user); setCreators((prev) => [data.creator, ...prev.filter((c) => c.id !== data.creator.id)]);
    setActiveCreatorId(data.creator.id); closeAuthModal(); navigateTo('creator-dashboard');
  };

  const uploadCreatorMedia = (file: File, type: 'avatar' | 'cover') => {
    const creatorId = signupCreator?.creatorProfile?.id;
    const token = localStorage.getItem('sc_auth_token');
    if (!file.type.startsWith('image/')) { setErrorMsg('Please choose an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setErrorMsg('Please choose an image smaller than 10 MB.'); return; }
    if (!creatorId || !token) {
      const reader = new FileReader();
      reader.onload = () => { if (type === 'avatar') setProfilePhotoUrl(String(reader.result)); else setBannerUrl(String(reader.result)); };
      reader.readAsDataURL(file);
      return;
    }
    setUploadingMedia(type); setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch(apiUrl('/api/upload'), {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ image: reader.result, creatorId, type }),
        });
        const data = await readApiResponse(response);
        if (!response.ok || !data.success || !data.url) throw new Error(data.error || 'Image upload failed');
        const url = apiUrl(data.url);
        if (type === 'avatar') setProfilePhotoUrl(url); else setBannerUrl(url);
        setSignupCreator((prev: any) => prev ? { ...prev, creatorProfile: { ...prev.creatorProfile, [type === 'avatar' ? 'avatar' : 'coverImage']: url } } : prev);
      } catch (err: any) { setErrorMsg(err.message || 'Image upload failed.'); }
      finally { setUploadingMedia(null); }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatorProfileSetup) {
      setIsLoading(true); setErrorMsg(null);
      try { await completeCreatorSetup(); } catch (err: any) { setErrorMsg(err.message || 'Could not save profile details.'); }
      finally { setIsLoading(false); }
      return;
    }
    setTouched({
      name: true,
      username: true,
      email: true,
      phone: true,
      companyName: true,
      otp: true,
    });

    if (!validate()) {
      setErrorMsg('Please correct the highlighted fields before submitting.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setRegistrationSuccess(false);

    try {
      if (isForgotPassword) {
        if (!resetOtpSent) {
          // Request OTP for password reset
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
          // Verify OTP and reset password
          const res = await fetch(apiUrl('/api/auth/reset-password'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword: password }),
          });
          const data = await readApiResponse(res);
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Password reset failed');
          }
          setSuccessMsg('Password successfully reset! You can now login.');
          setTimeout(() => {
            setIsForgotPassword(false);
            setResetOtpSent(false);
            setMode('login');
            setPassword('');
            setOtp('');
            setSuccessMsg(null);
          }, 2000);
        }
      } else if (mode === 'login') {
        const res = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await readApiResponse(res);

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Authentication failed');
        }

        if (data.token) localStorage.setItem('sc_auth_token', data.token);
        if (data.user) {
          setAuthUser(data.user);
          setCurrentRole(data.user.role);
          if (data.user.creatorProfile) {
            setCreators((prev) => {
              const exists = prev.some(
                (c) => c.id === data.user.creatorProfile.id || c.email?.toLowerCase() === data.user.creatorProfile.email?.toLowerCase()
              );
              if (exists) {
                return prev.map((c) =>
                  c.id === data.user.creatorProfile.id || c.email?.toLowerCase() === data.user.creatorProfile.email?.toLowerCase()
                    ? data.user.creatorProfile
                    : c
                );
              }
              return [data.user.creatorProfile, ...prev];
            });
            setActiveCreatorId(data.user.creatorProfile.id);
          }
          setSuccessMsg('Login successful! Redirecting to workspace...');
          setTimeout(() => {
            closeAuthModal();
            if (authModalRedirectAfter) {
              navigateTo(authModalRedirectAfter);
            } else if (data.user.role === 'CREATOR') {
              navigateTo('creator-dashboard');
            } else if (data.user.role === 'BRAND') {
              navigateTo('brand-dashboard');
            } else if (data.user.role === 'ADMIN') {
              navigateTo('admin-dashboard');
            } else {
              navigateTo('home');
            }
          }, 2000);
        }
      } else {
        // SIGNUP MODE
        if (!otpSent) {
          // Request OTP
          const res = await fetch(apiUrl('/api/auth/request-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
          
          const data = await readApiResponse(res);
          
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to send OTP');
          }
          
          setOtpSent(true);
          setSuccessMsg(`OTP sent to ${email.trim()}`);
        } else {
          // Verify OTP
          // Extract username from URL for creators
          let parsedUsername = (username || name).toLowerCase();
          if (role === 'CREATOR' && username) {
            const match = username.match(/instagram\.com\/([^\/?#]+)/i);
            if (match && match[1]) {
              parsedUsername = match[1];
            }
          } else {
            parsedUsername = parsedUsername.replace(/[^a-z0-9_]/g, '');
          }

          const body = {
            email: email.trim(),
            otp: otp.trim(),
            password,
            name: name.trim(),
            role,
            phone: phone.trim(),
            countryCode,
            companyName: companyName.trim(),
            username: parsedUsername,
            instagramUrl: role === 'CREATOR' ? username.trim() : '',
            category,
            city,
            deferCreatorSignup: role === 'CREATOR',
          };

          const res = await fetch(apiUrl('/api/auth/verify-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          const data = await readApiResponse(res);

          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Authentication failed');
          }

          if (role === 'CREATOR' && data.signupToken) {
            setPendingSignupToken(data.signupToken);
            setCreatorProfileSetup(true);
            setCreatorSetupStep(1);
            setOtpSent(false);
            setSuccessMsg('Email verified. Complete all profile steps before confirming your account.');
            return;
          }

          if (data.token) localStorage.setItem('sc_auth_token', data.token);
          if (data.user) {
            setAuthUser(data.user);
            setCurrentRole(data.user.role);
            if (data.user.creatorProfile) {
              setCreators((prev) => {
                const exists = prev.some(
                  (c) => c.id === data.user.creatorProfile.id || c.email?.toLowerCase() === data.user.creatorProfile.email?.toLowerCase()
                );
                if (exists) {
                  return prev.map((c) =>
                    c.id === data.user.creatorProfile.id || c.email?.toLowerCase() === data.user.creatorProfile.email?.toLowerCase()
                      ? data.user.creatorProfile
                      : c
                  );
                }
                return [data.user.creatorProfile, ...prev];
              });
              setActiveCreatorId(data.user.creatorProfile.id);
            }

            if (data.user.role === 'CREATOR') {
              setSignupCreator(data.user);
              setCreatorProfileSetup(true);
              setCreatorSetupStep(1);
              setOtpSent(false);
              setSuccessMsg('Email verified. Complete your creator profile.');
              return;
            }

            setSuccessMsg(null);
            setRegistrationSuccess(true);

            setTimeout(() => {
              setRegistrationSuccess(false);
              closeAuthModal();
              if (data.user.role === 'CREATOR') navigateTo('creator-dashboard');
              else if (data.user.role === 'BRAND') navigateTo('brand-dashboard');
              else if (data.user.role === 'ADMIN') navigateTo('admin-dashboard');
              else navigateTo('search');
            }, 800);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn font-sans"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
            <img
              src="/thebrandsstory-logo.svg"
              alt="thebrandsstory."
              onError={() => setLogoError(true)}
              className="h-12 sm:h-14 w-auto object-contain"
              style={{ maxWidth: '260px', minWidth: '180px' }}
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {creatorProfileSetup
              ? creatorSetupStep === 1 ? 'Complete your basic profile' : 'Add your Instagram details'
              : isForgotPassword ? 'Reset Password' : mode === 'login' ? 'Sign In to thebrandsstory.' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {creatorProfileSetup
              ? 'Your information can be updated anytime from Edit Profile.'
              : mode === 'login'
              ? 'Access verified creators, brand campaigns, and live enquiries'
              : 'Join India’s premier influencer marketing platform'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {!otpSent && !isForgotPassword && !creatorProfileSetup && (
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setOtpSent(false);
                setOtp('');
                setErrorMsg(null);
                setSuccessMsg(null);
                setFieldErrors({});
                setTouched({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'login' ? 'bg-white text-[#b88628] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setOtpSent(false);
                setOtp('');
                setErrorMsg(null);
                setSuccessMsg(null);
                setFieldErrors({});
                setTouched({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'signup' ? 'bg-white text-[#b88628] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Contextual Notice */}
        {authModalNotice && (
          <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 text-xs rounded-xl font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#b88628] shrink-0" />
            <span>{authModalNotice}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-xs">
          {mode === 'signup' && role === 'CREATOR' && !isForgotPassword && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span>Influencer signup</span>
                <span>Step {creatorProfileSetup ? creatorSetupStep + 2 : otpSent ? 2 : 1} of 4</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${creatorProfileSetup ? creatorSetupStep === 1 ? 75 : 100 : otpSent ? 50 : 25}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-blue-700">
                {creatorProfileSetup
                  ? creatorSetupStep === 1 ? 'Basic information' : 'Instagram information'
                  : otpSent ? 'Verify your email OTP' : 'Account details'}
              </p>
            </div>
          )}
          {creatorProfileSetup && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  if (creatorSetupStep === 2) setCreatorSetupStep(1);
                  else { setCreatorProfileSetup(false); setOtpSent(true); }
                  setErrorMsg(null);
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                ← Back
              </button>
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-blue-900 font-semibold">
                Step {creatorSetupStep} of 2 — {creatorSetupStep === 1 ? 'Basic information' : 'Instagram information'}
              </div>
              {creatorSetupStep === 1 ? <>
                <div className="flex items-start justify-center gap-7 sm:gap-10 py-1">
                  <label className="group flex w-28 shrink-0 cursor-pointer flex-col items-center gap-2 text-center">
                    <span className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#D4A338] bg-amber-50 shadow-sm transition group-hover:border-solid group-hover:shadow-md">
                      {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="Profile photo preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex flex-col items-center gap-1 px-2 text-[#916a1f]">
                          <Camera className="h-6 w-6" />
                          <span className="text-[10px] font-bold">{uploadingMedia === 'avatar' ? 'Uploading…' : 'Add photo'}</span>
                        </span>
                      )}
                      {profilePhotoUrl && <span className="absolute inset-0 flex items-center justify-center bg-slate-950/45 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">Change</span>}
                      <input aria-label="Upload profile photo" type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" disabled={uploadingMedia !== null} onChange={e => { const file = e.target.files?.[0]; if (file) uploadCreatorMedia(file, 'avatar'); }} />
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">Profile photo</span>
                  </label>

                  <label className="group flex w-24 shrink-0 cursor-pointer flex-col items-center gap-2 text-center">
                    <span className="relative flex h-36 w-24 items-center justify-center overflow-hidden rounded-[1.35rem] border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-blue-100 shadow-sm transition group-hover:border-solid group-hover:shadow-md">
                      {bannerUrl ? (
                        <img src={bannerUrl} alt="Creator card photo preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex flex-col items-center gap-1 px-2 text-indigo-600">
                          <ImagePlus className="h-6 w-6" />
                          <span className="text-[10px] font-bold">{uploadingMedia === 'cover' ? 'Uploading…' : 'Add card photo'}</span>
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-2 pb-2 pt-5 text-[9px] font-bold text-white opacity-0 transition group-hover:opacity-100">Change photo</span>
                      <input aria-label="Upload creator card photo" type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" disabled={uploadingMedia !== null} onChange={e => { const file = e.target.files?.[0]; if (file) uploadCreatorMedia(file, 'cover'); }} />
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">Creator card photo</span>
                  </label>
                </div>
                <p className="text-center text-[10px] text-slate-500">Use a clear face photo for your round profile image and a vertical photo for your creator card. Both are required.</p>
                <div className="grid grid-cols-2 gap-3">
                  <select value={gender} onChange={e => setGender(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl"><option value="">Gender *</option><option>Female</option><option>Male</option><option>Non-binary</option></select>
                  <input type="number" min="13" max="100" value={ageGroup} onChange={e => setAgeGroup(e.target.value)} placeholder="Age *" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <input value={creatorState} onChange={e => setCreatorState(e.target.value)} placeholder="City * (e.g. Mumbai, Delhi)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"><option value="">Category *</option>{(categories?.length ? categories : CATEGORIES_LIST).map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select>
                <input value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Languages * (e.g. Hindi, English)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
              </> : <>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Instagram URL * (https://instagram.com/yourhandle)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <input type="number" min="1" value={startingPrice} onChange={e => setStartingPrice(e.target.value)} placeholder="Starting price (₹) *" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">{[
                  ['Followers count', followers, setFollowers], ['Total posts', totalPosts, setTotalPosts], ['Average views', avgViews, setAvgViews], ['Average likes', avgLikes, setAvgLikes], ['Average comments', avgComments, setAvgComments],
                ].map(([label, value, setter]: any) => <input key={label} type="number" min="0" value={value} onChange={e => setter(e.target.value)} placeholder={label} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />)}</div>
              </>}
            </div>
          )}
          {!creatorProfileSetup && ((!otpSent && !resetOtpSent) ? (
            <>
              {mode === 'signup' && !isForgotPassword && (
                <>
                  {/* Role Selection */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">I am registering as:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRole('CREATOR');
                          setFieldErrors({});
                        }}
                        className={`p-3 rounded-xl border text-center font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                          role === 'CREATOR'
                            ? 'border-blue-600 bg-blue-50/70 text-[#b88628] shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-[#D4A338]" />
                        <span>Creator / Influencer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRole('BRAND');
                          setFieldErrors({});
                        }}
                        className={`p-3 rounded-xl border text-center font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                          role === 'BRAND'
                            ? 'border-blue-600 bg-blue-50/70 text-[#b88628] shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span>Brand / Agency</span>
                      </button>
                    </div>
                  </div>

                  {/* Name & Handle in 2-columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-slate-800 text-xs font-bold">Full Name *</label>
                      </div>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                        <input
                          type="text"
                          placeholder="e.g. Tanvi Joshi"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (fieldErrors.name) validate();
                          }}
                          onBlur={() => handleBlur('name')}
                          className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium ${
                            touched.name && fieldErrors.name
                              ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                              : touched.name && !fieldErrors.name && name
                              ? 'border-emerald-400'
                              : 'border-slate-200 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      {touched.name && fieldErrors.name && (
                        <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                          {fieldErrors.name}
                        </span>
                      )}
                    </div>

                    {role === 'CREATOR' ? (
                      <div className={role === 'CREATOR' ? 'hidden' : ''}>
                        <label className="block text-slate-800 text-xs font-bold mb-1.5">Instagram Profile URL</label>
                        <div className="relative">
                          <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                          <input
                            type="text"
                            placeholder="https://instagram.com/username"
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value);
                              if (fieldErrors.username) validate();
                            }}
                            onBlur={() => handleBlur('username')}
                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium ${
                              touched.username && fieldErrors.username
                                ? 'border-rose-400 focus:border-rose-500'
                                : 'border-slate-200 focus:border-blue-500'
                            }`}
                          />
                        </div>
                        {touched.username && fieldErrors.username && (
                          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                            {fieldErrors.username}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-slate-800 text-xs font-bold mb-1.5">Company / Brand Name *</label>
                        <div className="relative">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                          <input
                            type="text"
                            placeholder="e.g. Mamaearth"
                            value={companyName}
                            onChange={(e) => {
                              setCompanyName(e.target.value);
                              if (fieldErrors.companyName) validate();
                            }}
                            onBlur={() => handleBlur('companyName')}
                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium ${
                              touched.companyName && fieldErrors.companyName
                                ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                                : 'border-slate-200 focus:border-blue-500'
                            }`}
                          />
                        </div>
                        {touched.companyName && fieldErrors.companyName && (
                          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                            {fieldErrors.companyName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Category & City for Creator */}
                  {false && role === 'CREATOR' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-800 text-xs font-bold mb-1.5">Primary Niche</label>
                        <div className="relative">
                          <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer font-medium"
                          >
                            <option value="" disabled>Select a niche</option>
                              {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-800 text-xs font-bold mb-1.5">Base City</label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition cursor-pointer font-medium"
                          >
                            <option value="" disabled>Select a city</option>
                            {(cities && cities.length > 0 ? cities : CITIES_LIST).map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  <div>
                    <label className="block text-slate-800 text-xs font-bold mb-1.5">WhatsApp / Contact Number *</label>
                    <div className="flex gap-2">
                      <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} aria-label="Country code" className="w-24 shrink-0 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer">
                        {COUNTRY_CODES.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                        <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          if (fieldErrors.phone) validate();
                        }}
                        onBlur={() => handleBlur('phone')}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium ${
                          touched.phone && fieldErrors.phone
                            ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                            : 'border-slate-200 focus:border-blue-500'
                        }`}
                        />
                      </div>
                    </div>
                    {touched.phone && fieldErrors.phone && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        {fieldErrors.phone}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    name="sc_auth_login_user_email"
                    id="sc-email-input"
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="name@brand.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setTouched((prev) => ({ ...prev, email: true }));
                      if (fieldErrors.email) validate();
                    }}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium ${
                      (touched.email && fieldErrors.email) || emailAvailability === 'registered'
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                        : touched.email && !fieldErrors.email && email
                        ? 'border-emerald-400'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {touched.email && fieldErrors.email && (
                  <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                    {fieldErrors.email}
                  </span>
                )}
                {mode === 'signup' && role === 'CREATOR' && emailAvailability === 'checking' && (
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Checking email availability…</span>
                )}
                {mode === 'signup' && role === 'CREATOR' && emailAvailability === 'registered' && !fieldErrors.email && (
                  <span className="text-[11px] text-rose-600 font-semibold mt-1 block">This email is already registered. Please sign in instead.</span>
                )}
                {mode === 'signup' && role === 'CREATOR' && emailAvailability === 'available' && (
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Email is available.</span>
                )}
              </div>

              {/* Password */}
              {!isForgotPassword && (
                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">Password *</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="sc_auth_login_user_password"
                    placeholder={mode === 'login' ? 'Your password' : 'Create a strong password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) validate();
                    }}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-10 pr-11 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium ${
                      touched.password && fieldErrors.password
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                        : touched.password && !fieldErrors.password && password
                        ? 'border-emerald-400'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                    {fieldErrors.password}
                  </span>
                )}
              </div>
              )}

              {mode === 'login' && !isForgotPassword && (
                <div className="flex justify-end mt-1">
                  <button type="button" onClick={() => { setIsForgotPassword(true); setFieldErrors({}); }} className="text-[11px] font-bold text-[#b88628] hover:text-[#916a1f] cursor-pointer">
                    Forgot Password?
                  </button>
                </div>
              )}

              {isForgotPassword && (
                <div className="flex justify-center mt-2">
                  <button type="button" onClick={() => { setIsForgotPassword(false); setFieldErrors({}); }} className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
                    Back to Sign In
                  </button>
                </div>
              )}
            </>
          ) : (
            // OTP Phase
            <div className="space-y-4">
              <button 
                type="button"
                onClick={() => {
                  if (isForgotPassword) {
                    setResetOtpSent(false);
                  } else {
                    setOtpSent(false);
                  }
                  setSuccessMsg(null);
                  setErrorMsg(null);
                  setOtp('');
                }}
                className="flex items-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Edit Email
              </button>
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Enter 6-Digit OTP *</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/[^0-9]/g, ''));
                      if (fieldErrors.otp) validate();
                    }}
                    onBlur={() => handleBlur('otp')}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium text-center tracking-widest text-lg ${
                      touched.otp && fieldErrors.otp
                        ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                        : touched.otp && !fieldErrors.otp && otp.length === 6
                        ? 'border-emerald-400'
                        : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>
                {touched.otp && fieldErrors.otp && (
                  <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                    {fieldErrors.otp}
                  </span>
                )}
              </div>
              <p className="text-center text-slate-500 text-[11px]">
                Please check your email. We sent a code to <span className="font-bold text-slate-800">{email}</span>. 
              </p>

              {isForgotPassword && (
                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">New Password *</label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) validate();
                      }}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-10 pr-11 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium ${
                        touched.password && fieldErrors.password
                          ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                          : touched.password && !fieldErrors.password && password
                          ? 'border-emerald-400'
                          : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.password && fieldErrors.password && (
                    <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (mode === 'signup' && role === 'CREATOR' && !creatorProfileSetup && (emailAvailability === 'checking' || emailAvailability === 'registered'))}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {isForgotPassword
                    ? resetOtpSent ? 'Reset Password' : 'Get OTP'
                    : mode === 'login'
                    ? 'Login'
                    : creatorProfileSetup
                    ? creatorSetupStep === 1 ? 'Continue to Instagram Details' : 'Sign Up & Open Dashboard'
                    : !otpSent
                    ? role === 'CREATOR' ? 'Continue to OTP Verification' : 'Get OTP'
                    : 'Verify & Complete Registration'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        {registrationSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl border border-emerald-100 animate-scaleUp">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 animate-pulse">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Registration Successful</h2>
              <p className="mt-2 text-sm text-slate-500">Your profile has been created and sent for admin approval.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
