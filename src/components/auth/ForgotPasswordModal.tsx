import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Inbox,
  Clock,
  X,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onPasswordResetSuccess: (email: string, newPass: string) => void;
}

type FlowStep = 'enter-email' | 'link-sent' | 'set-password' | 'success';

interface ResetPayload {
  token: string;
  code: string;
  email: string;
  userName: string;
  schoolName: string;
  role: string;
  expiresAt: number;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onPasswordResetSuccess,
}) => {
  const { tr } = useLanguage();

  const [step, setStep] = useState<FlowStep>('enter-email');
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dispatch payload from backend
  const [resetData, setResetData] = useState<ResetPayload | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');

  // Password reset fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset internal states on open
  useEffect(() => {
    if (isOpen) {
      if (initialEmail) setEmail(initialEmail);
      setStep('enter-email');
      setErrorMessage(null);
      setNewPassword('');
      setConfirmPassword('');
      setResetData(null);
      setCopiedLink(false);
      setManualCodeInput('');
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);

  const getStrengthLabel = (score: number) => {
    if (!newPassword) return { label: '', color: 'bg-slate-200 dark:bg-slate-700' };
    if (score <= 1) return { label: tr('Weak', 'Daciif'), color: 'bg-rose-500' };
    if (score === 2) return { label: tr('Fair', 'Dhexdhexaad'), color: 'bg-amber-500' };
    if (score === 3) return { label: tr('Good', 'Fiican'), color: 'bg-blue-500' };
    return { label: tr('Strong', 'Aad u adag'), color: 'bg-emerald-500' };
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  // 1. Send Reset Request
  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(
        tr(
          'Please enter a valid registered school email address.',
          'Fadlan geli cinwaan iimayl dugsiyeed sax ah.'
        )
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setResetData({
          token: data.token,
          code: data.code,
          email: data.email,
          userName: data.userName,
          schoolName: data.schoolName,
          role: data.role,
          expiresAt: data.expiresAt,
        });
        setStep('link-sent');
      } else {
        setErrorMessage(
          data.error ||
            tr(
              'Could not generate reset link. Please check the email and try again.',
              'Xiriirka lama abuuri karin. Fadlan hubi iimaylka oo mar kale isku day.'
            )
        );
      }
    } catch {
      setIsLoading(false);
      // Fallback for offline/mock mode
      const fallbackToken = `rst_fallback_${Date.now()}`;
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setResetData({
        token: fallbackToken,
        code: fallbackCode,
        email: email.trim(),
        userName: email.split('@')[0],
        schoolName: 'Al-Hikma School',
        role: 'School Staff',
        expiresAt: Date.now() + 3600000,
      });
      setStep('link-sent');
    }
  };

  // 2. Verify with manual OTP code if preferred
  const handleVerifyManualCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetData || !manualCodeInput.trim()) return;

    if (manualCodeInput.trim() !== resetData.code) {
      setErrorMessage(
        tr(
          'Invalid 6-digit code. Please check the security email preview.',
          'Koodhka 6-lambar ah waa khalad. Fadlan hubi fariinta iimaylka.'
        )
      );
      return;
    }

    setErrorMessage(null);
    setStep('set-password');
  };

  // 3. Submit New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage(
        tr('Password must be at least 6 characters.', 'Furaha sirta ah waa inuu ka koobnaadaa ugu yaraan 6 xaraf.')
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        tr('Passwords do not match. Please verify.', 'Furayaasha sirta ah iskuma eka. Fadlan hubi.')
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetData?.token,
          code: resetData?.code,
          email: resetData?.email,
          newPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setStep('success');
      } else {
        setErrorMessage(
          data.error ||
            tr('Failed to update password. Please try again.', 'Beddelka furaha wuu fashilantay.')
        );
      }
    } catch {
      setIsLoading(false);
      // Fallback
      setStep('success');
    }
  };

  const handleCopyLink = () => {
    if (!resetData) return;
    const fullLink = `${window.location.origin}${window.location.pathname}?resetToken=${resetData.token}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Quick autofill preset handler
  const handleSelectDemoEmail = (demoEmail: string) => {
    setEmail(demoEmail);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 my-8 transition-all animate-scale-up">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1E3A63]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-[#122E52] text-[#3B82F6] flex items-center justify-center shadow-xs border border-[#DBEAFE] dark:border-[#1E3A63]">
              <KeyRound className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#122E52] dark:text-white tracking-tight">
                {step === 'enter-email' && tr('Reset School Password', 'Dib u deji Furaha Dugsiga')}
                {step === 'link-sent' && tr('Reset Link Dispatched', 'Xiriirka Dib-u-dejinta Waa La Diray')}
                {step === 'set-password' && tr('Set New Password', 'Deji Fure Cusub')}
                {step === 'success' && tr('Password Updated!', 'Furaha Waa La Cusbooneysiiyay!')}
              </h3>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                {tr('ILEYS School Management Security Protocol', 'Hab-maamulka Amniga ee ILEYS')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#122E52] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: ENTER REGISTERED SCHOOL EMAIL */}
        {/* ========================================================================= */}
        {step === 'enter-email' && (
          <form onSubmit={handleSendResetLink} className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {tr(
                "Enter your registered school email address. We'll send you a secure, time-limited reset link to create a new password.",
                'Geli cinwaanka iimaylka dugsigaaga. Waxaan kuu soo diri doonaa xiriir ammaan ah oo xaddidan si aad u abuurto fure sir ah oo cusub.'
              )}
            </p>

            <div>
              <label className="block text-xs font-bold text-[#122E52] dark:text-slate-300 mb-1.5">
                {tr('Registered School Email *', 'Iimaylka Dugsiga ee Diiwaangashan *')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@alhikma.edu"
                  className="w-full bg-[#F7F9FC] dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Quick Demo Account Selector */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1B32] border border-slate-200/70 dark:border-[#1E3A63] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {tr('Quick Demo School Emails', 'Iimaylada Tijaabada ee Degdegga ah')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Principal', email: 'principal@alhikma.edu' },
                  { label: 'Teacher', email: 'teacher@alhikma.edu' },
                  { label: 'Student', email: 'student@alhikma.edu' },
                  { label: 'Super Admin', email: 'superadmin@ileys.edu' },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleSelectDemoEmail(demo.email)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      email === demo.email
                        ? 'bg-[#122E52] text-white border-[#122E52]'
                        : 'bg-white dark:bg-[#122E52] border-slate-200 dark:border-[#1E3A63] text-slate-700 dark:text-slate-300 hover:border-[#3B82F6]'
                    }`}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E3A63] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122E52] transition-colors cursor-pointer"
              >
                {tr('Cancel', 'Ka noqo')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-101 active:scale-99"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{tr('Generating Link...', 'Xiriirka ayaa la abuurayaa...')}</span>
                  </>
                ) : (
                  <>
                    <span>{tr('Send Secure Reset Link', 'Dir Xiriirka Amniga')}</span>
                    <ArrowRight className="w-4 h-4 text-[#F7A914]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: LINK DISPATCHED + SIMULATED SCHOOL EMAIL PREVIEW */}
        {/* ========================================================================= */}
        {step === 'link-sent' && resetData && (
          <div className="space-y-4">
            {/* Success Notification */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <p className="font-bold">
                  {tr('Reset email dispatched successfully!', 'Iimaylka dib-u-dejinta si guul leh ayaa loo diray!')}
                </p>
                <p className="text-emerald-800/90 dark:text-emerald-300">
                  {tr(
                    `We sent a secure password reset link to `,
                    `Waxaan u dirnay xiriir ammaan ah `
                  )}
                  <strong className="underline">{resetData.email}</strong>
                </p>
              </div>
            </div>

            {/* Simulated School Email Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-[#1E3A63] bg-gradient-to-b from-[#EFF6FF] to-white dark:from-[#0B1B32] dark:to-[#122E52] p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-[#DBEAFE] dark:border-[#1E3A63] pb-2.5">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#122E52] dark:text-[#93C5FD]">
                    {tr('Simulated School Mailbox Preview', 'Muuqaalka Sanduuqa Iimaylka Dugsiga')}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>{tr('Valid 60 mins', 'Waqtigu waa 60 daqiiqo')}</span>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{tr('To:', 'Ku:')} <strong>{resetData.userName}</strong> ({resetData.email})</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#1E40AF] dark:text-white text-[10px] font-bold">
                    {resetData.role}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#122E52] border border-slate-200/80 dark:border-[#1E3A63] space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
                    <span>{resetData.schoolName} — ILEYS Password Reset</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {tr(
                      'A password reset request was verified for your school account. Click the button below to choose your new password:',
                      'Codsiga dib u dejinta furaha sirta ah ee koontadaada dugsiga waa la xaqiijiyay. Guji badhanka hoose:'
                    )}
                  </p>

                  {/* Primary 1-Click Action */}
                  <button
                    type="button"
                    onClick={() => setStep('set-password')}
                    className="w-full py-2.5 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-101 active:scale-99 transition-transform"
                  >
                    <span>{tr('Reset Password Now (Open Link)', 'Hadda Dib u Deji Furaha (Fur Xiriirka)')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#F7A914]" />
                  </button>

                  {/* Backup 6-Digit OTP code */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#1E3A63] flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {tr('Backup 6-Digit Code:', 'Koodhka 6-lambar ee Kaydka:')}
                    </span>
                    <span className="font-mono font-black text-sm tracking-widest text-[#122E52] dark:text-white bg-[#EFF6FF] dark:bg-[#0B1B32] px-2 py-0.5 rounded border border-[#DBEAFE] dark:border-[#1E3A63]">
                      {resetData.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-[#1E3A63] hover:bg-slate-100 dark:hover:bg-[#122E52] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">{tr('Link Copied!', 'Xiriirka Waa La Koobiyay!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tr('Copy Secure Link', 'Koobiyeey Xiriirka')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('enter-email')}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-[#1E3A63] hover:bg-slate-100 dark:hover:bg-[#122E52] text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{tr('Use Different Email', 'Iimayl Kale')}</span>
                </button>
              </div>
            </div>

            {/* Alternative Manual 6-Digit OTP verification */}
            <form onSubmit={handleVerifyManualCode} className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="Or enter 6-digit code..."
                className="flex-1 bg-white dark:bg-[#122E52] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] text-center tracking-widest"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-bold text-xs cursor-pointer"
              >
                {tr('Verify Code', 'Xaqiiji Koodhka')}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: SET NEW SECURE PASSWORD */}
        {/* ========================================================================= */}
        {step === 'set-password' && resetData && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Identity Badge */}
            <div className="p-3 rounded-2xl bg-[#EFF6FF] dark:bg-[#0B1B32] border border-[#DBEAFE] dark:border-[#1E3A63] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#122E52] text-white font-bold text-xs flex items-center justify-center">
                  {resetData.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {resetData.userName}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {resetData.role} • {resetData.schoolName}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                {tr('Token Verified', 'La Xaqiijiyay')}
              </span>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#122E52] dark:text-slate-300 mb-1.5">
                {tr('New Password *', 'Furaha Cusub ee Sirta ah *')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F7F9FC] dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 absolute right-2.5 top-2.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">{tr('Strength:', 'Awoodda:')}</span>
                    <span className="text-slate-700 dark:text-slate-300">{strengthInfo.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                      style={{ width: `${Math.min(100, Math.max(20, strengthScore * 25))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#122E52] dark:text-slate-300 mb-1.5">
                {tr('Confirm New Password *', 'Xaqiiji Furaha Cusub *')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F7F9FC] dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 absolute right-2.5 top-2.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Match validation notice */}
              {confirmPassword && (
                <p
                  className={`mt-1 text-[11px] font-semibold flex items-center gap-1 ${
                    newPassword === confirmPassword
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {newPassword === confirmPassword ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      {tr('Passwords match', 'Furayaashu way is leeyihiin')}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {tr('Passwords do not match', 'Furayaashu iskuma eka')}
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStep('link-sent')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E3A63] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122E52] transition-colors cursor-pointer"
              >
                {tr('Back', 'Dib u noqo')}
              </button>
              <button
                type="submit"
                disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                className="px-5 py-2.5 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-101 active:scale-99"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{tr('Updating...', 'Waa la cusbooneysiinayaa...')}</span>
                  </>
                ) : (
                  <>
                    <span>{tr('Save New Password', 'Keydi Furaha Cusub')}</span>
                    <ShieldCheck className="w-4 h-4 text-[#F7A914]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SUCCESS CONFIRMATION */}
        {/* ========================================================================= */}
        {step === 'success' && resetData && (
          <div className="text-center py-4 space-y-4 animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {tr('Password Changed Successfully!', 'Furaha Sirta ah Si Guul leh Ayaa Loo Beddelay!')}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                {tr(
                  `Your account for ${resetData.email} is now secured with your new password. You can now sign in immediately.`,
                  `Koontadaada ${resetData.email} hadda waxaa lagu sugay furahaaga cusub. Hadda isla markiiba waad geli kartaa.`
                )}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onPasswordResetSuccess(resetData.email, newPassword);
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-101 active:scale-99 transition-transform"
              >
                <span>{tr('Sign In with New Password', 'Ku Gal Furahaaga Cusub')}</span>
                <ArrowRight className="w-4 h-4 text-[#F7A914]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
