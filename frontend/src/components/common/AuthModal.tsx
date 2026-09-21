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
  EyeOff
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
      setErrorMsg(null);
      setSuccessMsg(null);
      setFieldErrors({});
      setTouched({});
    }
  }, [authModalOpen, authModalInitialMode, authModalPreferredRole]);

  // Validation State
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
        } else if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(cleanPhone)) {
          errors.phone = 'Please enter a valid 10-digit Indian mobile number';
        } else if (countryCode !== '+91' && (cleanPhone.length < 6 || cleanPhone.length > 15)) {
          errors.phone = 'Please enter a valid mobile number';
        }
      } else if (role === 'BRAND') {
        if (!companyName.trim()) {
          errors.companyName = 'Company or brand name is required';
        }
        const cleanPhone = phone.replace(/\D/g, '');
        if (!phone.trim()) {
          errors.phone = 'Mobile number is required';
        } else if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(cleanPhone)) {
          errors.phone = 'Please enter a valid 10-digit Indian mobile number';
        } else if (countryCode !== '+91' && (cleanPhone.length < 6 || cleanPhone.length > 15)) {
          errors.phone = 'Please enter a valid mobile number';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            {isForgotPassword ? 'Reset Password' : mode === 'login' ? 'Sign In to thebrandsstory.' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Access verified creators, brand campaigns, and live enquiries'
              : 'Join India’s premier influencer marketing platform'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {!otpSent && !isForgotPassword && (
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
          {(!otpSent && !resetOtpSent) ? (
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
                      <div>
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
                  {role === 'CREATOR' && (
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
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
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
                      if (fieldErrors.email) validate();
                    }}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition font-medium ${
                      touched.email && fieldErrors.email
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
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
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
                    : !otpSent
                    ? 'Get OTP'
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
