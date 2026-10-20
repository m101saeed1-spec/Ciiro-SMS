import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute, IleysLogo } from '../public/PublicNavbar';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Building2,
  CheckCircle2,
  User,
  KeyRound,
  Layers,
  Check,
} from 'lucide-react';

interface SignInPageProps {
  onNavigate: (route: PublicNavRoute) => void;
  onSuccess: (isSuperAdminUser: boolean) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate, onSuccess }) => {
  const { loginWithAuthCredentials, loginWithGoogle } = useAuth();
  const { tr } = useLanguage();

  const [email, setEmail] = useState('teacher@alhikma.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Check URL query param ?resetToken=... to auto-launch recovery if direct link opened
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resetToken')) {
      setIsForgotModalOpen(true);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage(tr('Please enter both email and password.', 'Fadlan geli iimaylkaaga iyo furaha sirta ah.'));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await loginWithAuthCredentials(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      onSuccess(res.isPlatformOwner || false);
    } else {
      setErrorMessage(res.error || tr('Invalid sign-in credentials. Please try again.', 'Macluumaadka gelitaanka waa khalad. Fadlan isku day markale.'));
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await loginWithGoogle(email || 'teacher@alhikma.edu');
    setIsLoading(false);

    if (res.success) {
      onSuccess(res.isPlatformOwner || false);
    } else {
      setErrorMessage(res.error || tr('Google sign-in failed.', 'Gelitaanka Google wuu fashilantay.'));
    }
  };

  // Demo autofill helper for fast testing
  const handleSelectDemoUser = (demoEmail: string, demoPass: string = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handlePasswordResetComplete = (resetEmail: string, newPass: string) => {
    setEmail(resetEmail);
    setPassword(newPass);
    setErrorMessage(null);
    setSuccessMessage(
      tr(
        'Your password has been successfully reset! You can now sign in with your new password.',
        'Furahaaga sirta ah si guul leh ayaa dib loogu dejiyay! Hadda waad geli kartaa adoo adeegsanaya furahaaga cusub.'
      )
    );
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Brand Statement & Product Visual (Editorial Split) */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#122E52] via-[#0B1B32] to-[#12233F] text-white p-8 sm:p-10 border border-[#1E3A63] shadow-2xl flex flex-col justify-between space-y-8 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <button
              onClick={() => onNavigate('home')}
              className="inline-block cursor-pointer focus:outline-none"
            >
              <IleysLogo size="md" variant="light" />
            </button>

            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F7A914] font-bold block">
                {tr('Unified Educational Infrastructure', 'Kaabayaasha Waxbarashada ee Mideysan')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {tr('A serious technology platform built for modern schools.', 'Nidaam tiknoolajiyadeed oo dhab ah oo loogu talagalay dugsiyada.')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {tr(
                  'Access your verified school workspace with dedicated toolsets tailored to your exact responsibilities.',
                  'Gal goobtaada shaqo ee dugsiga adoo helaya qalab ku habboon doorkaaga.'
                )}
              </p>
            </div>

            {/* Quick 4-Digit Role Key Indicator */}
            <div className="p-4 rounded-2xl bg-[#0B1B32]/80 border border-[#1E3A63] space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {tr('4-Digit Ileys ID Roles', 'Doorka 4-God ee Ileys ID')}
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  <span>Teacher (#2001)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Headteacher (#4001)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7A914]" />
                  <span>Accountant (#3001)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Student (#1001)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E3A63] flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Segregated</span>
            </span>
            <span className="font-mono text-[#F7A914]">v2.4 LTS</span>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-[#122E52] py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 dark:border-[#1E3A63] shadow-xl space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#122E52] dark:text-white tracking-tight">
              {tr('Welcome Back', 'Kusoo Dhawoow Markale')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1 font-normal">
              {tr('Sign in with your personal credentials to continue.', 'Geli xogtaada si aad ugu sii gudubto nidaamka.')}
            </p>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#1E3A63] bg-[#F7F9FC] dark:bg-[#0B1B32] hover:bg-slate-100 dark:hover:bg-[#183B68] text-[#122E52] dark:text-slate-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs hover:scale-101 active:scale-99"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{tr('Continue with Google', 'Ku sii wad Google')}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-[#1E3A63] w-full" />
            <span className="bg-white dark:bg-[#122E52] px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {tr('or sign in with email', 'ama geli iimayl')}
            </span>
          </div>

          {/* 2. Email + Password Form */}
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#122E52] dark:text-slate-200 mb-1">
                {tr('School / Personal Email *', 'Iimaylkaaga *')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@alhikma.edu"
                  className="w-full bg-[#F7F9FC] dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-[#12233F] dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#122E52] dark:text-slate-200">
                  {tr('Password *', 'Furaha Sirta ah *')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-bold text-[#3B82F6] hover:underline cursor-pointer"
                >
                  {tr('Forgot password?', 'Ma ilowday furaha?')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F7F9FC] dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-[#12233F] dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 absolute right-2.5 top-2 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#122E52] focus:ring-[#3B82F6] cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                {tr('Remember me', 'I xusuuso')}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-101 active:scale-99"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{tr('Signing in...', 'Waa la gelayaa...')}</span>
                </>
              ) : (
                <>
                  <span>{tr('Sign In', 'Soo Gal')}</span>
                  <ArrowRight className="w-4 h-4 text-[#F7A914]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fast Sign-In Presets for Testers */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#1E3A63] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              {tr('Quick Demo Accounts', 'Koontooyinka Tijaabada')}
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectDemoUser('m101saeed1@gmail.com')}
                className="col-span-2 p-1.5 rounded-lg border border-[#FDE68A] bg-[#FEF3C7] text-[#92400E] font-black hover:bg-[#FDE68A] text-center truncate cursor-pointer shadow-2xs"
              >
                ★ Platform Admin (m101saeed1@gmail.com)
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoUser('teacher@alhikma.edu')}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E3A63] bg-[#F7F9FC] dark:bg-[#0B1B32] text-slate-700 dark:text-slate-200 font-bold hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A63] text-left truncate cursor-pointer"
              >
                Teacher (#2001)
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoUser('principal@alhikma.edu')}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E3A63] bg-[#F7F9FC] dark:bg-[#0B1B32] text-slate-700 dark:text-slate-200 font-bold hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A63] text-left truncate cursor-pointer"
              >
                Headteacher (#4001)
              </button>
            </div>
          </div>

          <div className="text-center pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {tr("Don't have an account?", 'Ma lihid koonto?')}{' '}
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="font-bold text-[#3B82F6] hover:underline cursor-pointer"
              >
                {tr('Sign Up', 'Is Diiwaangeli')}
              </button>
            </span>
          </div>
        </div>

      </div>

      {/* Rich Interactive Forgot Password Flow Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={email}
        onPasswordResetSuccess={handlePasswordResetComplete}
      />
    </div>
  );
};
