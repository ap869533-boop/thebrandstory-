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
  AtSign,
  ShieldCheck,
  Check,
  Eye,
  EyeOff,
  FileText,
  Clock
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { UserRole } from '../types';
import { apiUrl, readApiResponse } from '../config/api';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN +91' }, { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' }, { code: '+971', label: 'UAE +971' },
  { code: '+61', label: 'AU +61' }, { code: '+65', label: 'SG +65' },
];

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
  const [category, setCategory] = useState('Fashion');
  const [city, setCity] = useState('Delhi NCR');

  // OTP Fields
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Sync role and mode if passed in viewParams
  useEffect(() => {
    if (viewParams.role) {
      setRole(viewParams.role as UserRole);
    }
    if (viewParams.mode) {
      setMode(viewParams.mode as 'login' | 'signup');
    }
  }, [viewParams.role, viewParams.mode]);

  // Destination after login
  const redirectAfter = viewParams.redirectAfter;
  const contextualNotice = viewParams.message;

  const validate = () => {
    const errors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6 && mode === 'signup') {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup' && !otpSent) {
      if (!name.trim()) {
        errors.name = 'Full name is required';
      }
      const cleanPhone = phone.replace(/\D/g, '');
      if (!phone.trim()) {
        errors.phone = 'Mobile number is required';
      } else if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(cleanPhone)) {
        errors.phone = 'Please enter a valid 10-digit Indian mobile number';
      } else if (countryCode !== '+91' && (cleanPhone.length < 6 || cleanPhone.length > 15)) {
        errors.phone = 'Please enter a valid mobile number';
      }
      if (role === 'BRAND' && !companyName.trim()) {
        errors.companyName = 'Company / Brand name is required';
      }
    }

    if (mode === 'signup' && otpSent) {
      if (!otp.trim() || otp.trim().length !== 6) {
        errors.otp = 'Please enter a valid 6-digit OTP';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handlePostAuthRedirect = (userRole: UserRole) => {
    if (redirectAfter) {
      navigateTo(redirectAfter);
    } else if (userRole === 'CREATOR') {
      navigateTo('creator-dashboard');
    } else if (userRole === 'BRAND') {
      navigateTo('brand-dashboard');
    } else if (userRole === 'ADMIN' || userRole === 'SALES') {
      navigateTo('admin-dashboard');
    } else {
      navigateTo('home');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, name: true, companyName: true, otp: true });

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
          throw new Error(data.error || 'Invalid email or password');
        }

        if (data.token) localStorage.setItem('sc_auth_token', data.token);
        if (data.user) {
          localStorage.setItem('sc_auth_user', JSON.stringify(data.user));
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

          setSuccessMsg('Login successful! Redirecting...');
          setTimeout(() => {
            handlePostAuthRedirect(data.user.role);
          }, 600);
        }
      } else {
        // Sign up flow
        if (!otpSent) {
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
          // Verify OTP & Complete Signup
          const payload = {
            email: email.trim(),
            password,
            name: name.trim(),
            role,
            phone: phone.trim() || undefined,
            countryCode,
            companyName: role === 'BRAND' ? companyName.trim() : undefined,
            gstNumber: role === 'BRAND' ? gstNumber.trim() : undefined,
            username: role === 'CREATOR' ? username.trim() : undefined,
            category,
            city,
            otp: otp.trim(),
          };

          const res = await fetch(apiUrl('/api/auth/verify-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await readApiResponse(res);
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to verify OTP & create account');
          }

          // Use the role the user SELECTED on signup form as authoritative source
          // (backend may return stale role if DB insert was delayed)
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
            setSuccessMsg('Account created successfully! Redirecting...');
            setTimeout(() => {
              handlePostAuthRedirect(effectiveRole);
            }, 800);
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
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div
            onClick={() => navigateTo('home')}
            className="cursor-pointer inline-flex items-center group"
          >
            <div className="text-3xl sm:text-4xl tracking-tighter">
              <span className="font-normal text-black">the</span>
              <span className="font-bold text-[#D4A338]">brands</span>
              <span className="font-normal text-black">story</span>
              <span className="font-bold text-[#D4A338]">.</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isForgotPassword ? 'Reset Password' : mode === 'login' ? 'Sign In to Your Workspace' : 'Create Your Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {mode === 'login'
              ? 'Connect directly with verified creators and top brands across India.'
              : 'Join the premier zero-commission influencer collaboration marketplace.'}
          </p>
        </div>

        {/* Contextual Notice Banner (if user was redirected) */}
        {contextualNotice && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-fadeIn">
            <ShieldCheck className="w-5 h-5 text-[#b88628] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-900 mb-0.5">Authentication Required</strong>
              <span>{contextualNotice}</span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5">
          {/* Mode Switcher: Login / Signup */}
          {!isForgotPassword && (
          <div className="flex p-1 bg-slate-100 rounded-xl">
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
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
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
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
          )}

          {/* Role Selector Buttons */}
          {!isForgotPassword && mode === 'signup' && (
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 text-xs">
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
                    ? 'border-[#D4A338] bg-amber-50/60 text-[#8e6819] shadow-xs ring-2 ring-[#D4A338]/30'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${role === 'CREATOR' ? 'text-[#D4A338]' : 'text-slate-400'}`} />
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
                    ? 'border-[#D4A338] bg-amber-50/60 text-[#8e6819] shadow-xs ring-2 ring-[#D4A338]/30'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className={`w-4 h-4 ${role === 'BRAND' ? 'text-[#D4A338]' : 'text-slate-400'}`} />
                <span>Brand / Agency</span>
              </button>
            </div>
          </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-xs">
            {/* Signup Only: Name and Brand/Creator Specific Fields */}
            {mode === 'signup' && !otpSent && (
              <>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] transition"
                    />
                  </div>
                  {touched.name && fieldErrors.name && (
                    <span className="text-[11px] text-rose-600 font-semibold mt-1 block">{fieldErrors.name}</span>
                  )}
                </div>

                {role === 'BRAND' ? (
                  <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Company / Brand Name *</label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="e.g. Nykaa Beauty"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        onBlur={() => handleBlur('companyName')}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] transition"
                      />
                    </div>
                    {touched.companyName && fieldErrors.companyName && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">{fieldErrors.companyName}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">GST Number <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                        maxLength={15}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] transition font-mono text-xs tracking-wider"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Your GST number for verified brand badge</p>
                  </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Instagram Profile URL</label>
                    <div className="relative">
                      <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="https://instagram.com/yourhandle"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1">WhatsApp / Contact Number *</label>
                  <div className="flex gap-2">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} aria-label="Country code" className="w-24 shrink-0 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium cursor-pointer">
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
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] transition"
                      />
                    </div>
                  </div>
                  {touched.phone && fieldErrors.phone && (
                    <span className="text-[11px] text-rose-600 font-semibold mt-1 block">{fieldErrors.phone}</span>
                  )}
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  placeholder={role === 'BRAND' ? 'brand@company.com' : 'creator@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] transition"
                />
              </div>
              {touched.email && fieldErrors.email && (
                <span className="text-[11px] text-rose-600 font-semibold mt-1 block">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            {(!isForgotPassword && (!otpSent || mode === 'login')) && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <span className="text-[11px] text-rose-600 font-semibold mt-1 block">{fieldErrors.password}</span>
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
            
            {isForgotPassword && !resetOtpSent && (
              <div className="flex justify-center mt-2">
                <button type="button" onClick={() => { setIsForgotPassword(false); setFieldErrors({}); }} className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
                  Back to Sign In
                </button>
              </div>
            )}

            {/* OTP Field (Signup Step 2) */}
            {( (mode === 'signup' && otpSent) || (isForgotPassword && resetOtpSent) ) && (
              <>
              <button 
                type="button"
                onClick={() => {
                  if (isForgotPassword) setResetOtpSent(false);
                  else setOtpSent(false);
                  setSuccessMsg(null);
                  setErrorMsg(null);
                  setOtp('');
                }}
                className="flex items-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer mb-2"
              >
                 ← Back to Edit Email
              </button>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Enter 6-Digit OTP *</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2.5 text-center text-base tracking-widest font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338]"
                />
                {fieldErrors.otp && (
                  <span className="text-[11px] text-rose-600 font-semibold mt-1 block">{fieldErrors.otp}</span>
                )}
              </div>

              {isForgotPassword && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1 mt-3">New Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#D4A338] hover:bg-[#b88628] text-black font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : isForgotPassword ? (
                <span>{resetOtpSent ? 'Verify & Reset Password' : 'Send Reset Link'}</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : otpSent ? (
                <>
                  <span>Verify OTP & Create Account</span>
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Request Verification OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer switch */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-[#b88628] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-[#b88628] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition cursor-pointer"
          >
            ← Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
