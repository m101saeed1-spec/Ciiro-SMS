import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute, IleysLogo } from '../public/PublicNavbar';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Check,
} from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (route: PublicNavRoute) => void;
  onSuccess: (isSuperAdminUser: boolean) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate, onSuccess }) => {
  const { registerAuthAccount, loginWithGoogle } = useAuth();
  const { tr } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage(tr('Please fill in all required fields.', 'Fadlan buuxi dhammaan meelaha banaan ee loo baahan yahay.'));
      return;
    }

    if (password.length < 6) {
      setErrorMessage(tr('Password must be at least 6 characters.', 'Furaha sirta ah waa inuu ugu yaraan ka koobnaadaa 6 xaraf.'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(tr('Passwords do not match.', 'Furayaashu isma leha.'));
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(tr('You must agree to the Terms and Privacy Policy.', 'Waa inaad aqbashaa Shuruudaha iyo Siyaasadda Qarsoodiga.'));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await registerAuthAccount(name.trim(), email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      onSuccess(false);
    } else {
      setErrorMessage(res.error || tr('Registration failed. Please try again.', 'Diiwaangelintu way fashilantay. Fadlan isku day markale.'));
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await loginWithGoogle(email || 'newuser@ileys.edu');
    setIsLoading(false);

    if (res.success) {
      onSuccess(res.isPlatformOwner || false);
    } else {
      setErrorMessage(res.error || tr('Google sign-up failed.', 'Diiwaangelinta Google way fashilantay.'));
    }
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
                {tr('Join Modern School Management', 'Ku Soo Biir Nidaamka Casriga ah')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {tr('Create your verified Ileys personal account.', 'Sameyso koontadaada shakhsiga ah ee Ileys.')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {tr(
                  'After creating your account, you will enter your authorized school workspace using your school role and 4-digit Ileys ID.',
                  'Kadib markaad sameysato koontada, waxaad geli doontaa dugsigaaga adigoo adeegsanaya doorkaaga iyo 4-ta god ee Ileys ID.'
                )}
              </p>
            </div>

            {/* Verification Guarantee */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#F7A914] shrink-0" />
                <span>Zero administrative clutter or generic templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#F7A914] shrink-0" />
                <span>Instant access to assigned school roles</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#F7A914] shrink-0" />
                <span>Strict multi-tenant security architecture</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E3A63] flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Segregated</span>
            </span>
            <span className="font-mono text-[#F7A914]">Secure Protocol</span>
          </div>
        </div>

        {/* Right Side: Registration Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-[#122E52] py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 dark:border-[#1E3A63] shadow-xl space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#122E52] dark:text-white tracking-tight">
              {tr('Create Account', 'Abuur Koonto')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1 font-normal">
              {tr('Register your identity to access institutional workspaces.', 'Diiwaangeli aqoonsigaaga si aad u gasho dugsiga.')}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Google Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
              {tr('or register with email', 'ama ku qoro iimayl')}
            </span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#122E52] dark:text-slate-200 mb-1">
                {tr('Full Name *', 'Magacaaga oo Buuxa *')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jama Hassan"
                  className="w-full bg-[#F7F9FC] dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-[#12233F] dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#122E52] dark:text-slate-200 mb-1">
                {tr('Email Address *', 'Cinwaanka Iimaylka *')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@school.edu"
                  className="w-full bg-[#F7F9FC] dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-[#12233F] dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#122E52] dark:text-slate-200 mb-1">
                  {tr('Password *', 'Furaha Sirta ah *')}
                </label>
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

              <div>
                <label className="block text-xs font-bold text-[#122E52] dark:text-slate-200 mb-1">
                  {tr('Confirm Password *', 'Xaqiiji Furaha *')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F7F9FC] dark:bg-[#0B1B32] border border-slate-200 dark:border-[#1E3A63] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-[#12233F] dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-start pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#122E52] focus:ring-[#3B82F6] cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="ml-2 text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                {tr('I agree to the Ileys Terms of Service and Institutional Privacy Policy.', 'Waxaan aqbalay Shuruudaha Adeegga iyo Siyaasadda Amniga ee Ileys.')}
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
                  <span>{tr('Creating account...', 'Koontada ayaa la abuurayaa...')}</span>
                </>
              ) : (
                <>
                  <span>{tr('Create Account', 'Abuur Koonto')}</span>
                  <ArrowRight className="w-4 h-4 text-[#F7A914]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {tr('Already have an account?', 'Hore ma u lahayd koonto?')}{' '}
              <button
                type="button"
                onClick={() => onNavigate('signin')}
                className="font-bold text-[#3B82F6] hover:underline cursor-pointer"
              >
                {tr('Sign In', 'Soo Gal')}
              </button>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
