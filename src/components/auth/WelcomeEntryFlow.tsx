import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { IleysLogo } from '../public/PublicNavbar';
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  Users,
  CreditCard,
  UserCheck,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  LogOut,
} from 'lucide-react';

interface WelcomeEntryFlowProps {
  onSuccessEnter: () => void;
  onLogout: () => void;
}

export const WelcomeEntryFlow: React.FC<WelcomeEntryFlowProps> = ({ onSuccessEnter, onLogout }) => {
  const {
    authUser,
    schools,
    userProfiles,
    enterSchoolWorkspace,
  } = useAuth();
  const { tr } = useLanguage();

  // Active step view: 'overview' (Screen 9) | 'form' (Screen 10)
  const [currentView, setCurrentView] = useState<'overview' | 'form'>('overview');

  // Form selections
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || 'school-1');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Teacher');
  const [enteredId, setEnteredId] = useState<string>('2001');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supportedRoles: { role: UserRole; labelEn: string; labelSo: string; defaultId: string }[] = [
    { role: 'Teacher', labelEn: 'Teacher', labelSo: 'Macallin', defaultId: '2001' },
    { role: 'Principal', labelEn: 'Headteacher', labelSo: 'Maamulaha Dugsiga', defaultId: '4001' },
    { role: 'AccountAdmin', labelEn: 'Accountant', labelSo: 'Xisaabiye', defaultId: '3001' },
    { role: 'Student', labelEn: 'Student', labelSo: 'Arday', defaultId: '1001' },
    { role: 'OwnerAdmin', labelEn: 'School Owner', labelSo: 'Mulkiilaha Dugsiga', defaultId: '5001' },
  ];

  const handleRoleChange = (r: UserRole) => {
    setSelectedRole(r);
    setErrorMessage(null);
    const matched = supportedRoles.find((s) => s.role === r);
    if (matched) {
      setEnteredId(matched.defaultId);
    }
  };

  const handleEnterWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredId.trim() || enteredId.trim().length !== 4) {
      setErrorMessage(tr('Please enter a valid 4-digit Ileys ID.', 'Fadlan geli aqoonsiga Ileys ID oo 4-god ah.'));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await enterSchoolWorkspace(selectedSchoolId, selectedRole, enteredId.trim());
    setIsLoading(false);

    if (res.success) {
      onSuccessEnter();
    } else {
      setErrorMessage(
        res.error ||
          tr(
            'The information you entered does not match an account associated with this sign-in.',
            'Macluumaadka aad gelisay kuma habboona koonto la xiriirta gelitaankan.'
          )
      );
    }
  };

  const handleQuickAutofill = (schoolId: string, role: UserRole, idNum: string) => {
    setSelectedSchoolId(schoolId);
    setSelectedRole(role);
    setEnteredId(idNum);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in transition-colors">
      {/* Top Brand Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        <IleysLogo size="lg" className="justify-center" />
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{tr('Signed in as', 'Waxaad ku gashay')}:</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
            {authUser?.email || 'user@school.edu'}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="text-[#3B82F6] dark:text-[#60A5FA] font-bold hover:underline ml-1 cursor-pointer"
          >
            {tr('Sign out', 'Ka bax')}
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        {/* ========================================================= */}
        {/* VIEW 1: WELCOME SCREEN (Screen 9 from Blueprint)          */}
        {/* ========================================================= */}
        {currentView === 'overview' && (
          <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {tr('Welcome to Ileys', 'Ku Soo Dhawoow Ileys')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                {tr(
                  'To access your school system, please select your school, role and enter your 4-digit ID.',
                  'Si aad u gasho nidaamka dugsigaaga, fadlan dooro dugsigaaga, doorkaaga oo geli 4-ta god ee Ileys ID-gaaga.'
                )}
              </p>
            </div>

            {/* 3 Step Visual Flow Cards (Screen 9) */}
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#122E52]/30 border border-slate-200 dark:border-[#1E3A63]">
                <div className="w-8 h-8 rounded-full bg-[#122E52] text-[#F7A914] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  1
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {tr('Select your school', 'Dooro dugsigaaga')}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tr('(e.g. Al-Hikma School, Ileys Academy)', '(tusaale: Al-Hikma School, Ileys Academy)')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                  2
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {tr('Select your role', 'Dooro doorkaaga')}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tr('(e.g. Teacher, Headteacher, Accountant, Student)', '(tusaale: Macallin, Maamule, Xisaabiye, Arday)')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                  3
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {tr('Enter your 4-digit ID', 'Geli 4-ta god ee Ileys ID-ga')}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tr('(e.g. 2001 for Teacher, 1001 for Student)', '(tusaale: 2001 Macallinka, 1001 Ardayga)')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {tr(
                  'The user starts by signing in with their personal account, then selects the exact school workspace they are authorized to access.',
                  'Isticmaaluhu wuxuu ku soo galayaa iimaylkiisa, ka dibna wuxuu xaqiijinayaa xogta dugsiga uu ka tirsan yahay.'
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('form')}
              className="btn-gold w-full"
            >
              <span>{tr('Proceed to Select School & ID', 'U Gudub Xaqiijinta Dugsiga & ID-ga')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: SELECTION & VERIFICATION FORM (Screen 10)         */}
        {/* ========================================================= */}
        {currentView === 'form' && (
          <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-bold text-slate-400">School</span>
                <span className="text-slate-300">→</span>
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-bold text-slate-400">Role</span>
                <span className="text-slate-300">→</span>
                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-bold text-slate-400">ID</span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView('overview')}
                className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:underline cursor-pointer"
              >
                {tr('How it works', 'Sida ay u shaqeyso')}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleEnterWorkspace} className="space-y-4">
              {/* Step 1: Select School */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{tr('Select School', 'Dooro Dugsiga')}</span>
                  <span className="text-[10px] font-normal text-slate-400">Step 1</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer appearance-none"
                  >
                    {schools.map((sch) => (
                      <option key={sch.id} value={sch.id} className="dark:bg-slate-800">
                        {sch.name} ({sch.code})
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Step 2: Select Role (Strictly NO Parent or Librarian) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{tr('Select Role', 'Dooro Doorka')}</span>
                  <span className="text-[10px] font-normal text-slate-400">Step 2</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors cursor-pointer appearance-none"
                  >
                    {supportedRoles.map((r) => (
                      <option key={r.role} value={r.role} className="dark:bg-slate-800">
                        {tr(r.labelEn, r.labelSo)}
                      </option>
                    ))}
                  </select>
                  <UserCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Step 3: Enter 4-Digit ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{tr('Enter 4-digit ID', 'Geli 4-ta god ee Ileys ID')}</span>
                  <span className="text-[10px] font-mono text-[#3B82F6] dark:text-[#60A5FA] font-bold">
                    {tr('e.g. 2001', 'tusaale: 2001')}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={enteredId}
                    onChange={(e) => setEnteredId(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="2001"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm sm:text-base font-mono font-extrabold text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-[#3B82F6] transition-colors"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Explanatory note from prompt */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63] text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                <span className="font-bold">{tr('Security Note:', 'Xusuusin Amni:')}</span>{' '}
                {tr(
                  'The 4-digit Ileys ID identifies your pre-created school identity. Access requires matching authentication and verified school membership.',
                  '4-ta god ee Ileys ID waxay aqoonsanaysaa koontadaada dugsiga. Gelitaanku wuxuu u baahan yahay xaqiijin rasmi ah.'
                )}
              </div>

              {/* Enter Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{tr('Verifying authorization...', 'Waa la xaqiijinayaa...')}</span>
                  </>
                ) : (
                  <>
                    <span>{tr('Enter School Workspace', 'Gal Deshkoodhka Dugsiga')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill Presets (Screen 10 blueprint helper) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                {tr('Example Role IDs (1-Click Test)', 'Tusaalooyinka Aqoonsiga (1-Gujin)')}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('school-1', 'Teacher', '2001')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-[#122E52]/10 dark:hover:bg-[#122E52]/40 hover:text-[#122E52] dark:hover:text-[#F7A914] cursor-pointer"
                >
                  2001 (Teacher)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('school-1', 'Principal', '4001')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-[#122E52]/10 dark:hover:bg-[#122E52]/40 hover:text-[#122E52] dark:hover:text-[#F7A914] cursor-pointer"
                >
                  4001 (Headteacher)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('school-1', 'AccountAdmin', '3001')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-[#122E52]/10 dark:hover:bg-[#122E52]/40 hover:text-[#122E52] dark:hover:text-[#F7A914] cursor-pointer"
                >
                  3001 (Accountant)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('school-1', 'Student', '1001')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-[#122E52]/10 dark:hover:bg-[#122E52]/40 hover:text-[#122E52] dark:hover:text-[#F7A914] cursor-pointer"
                >
                  1001 (Student)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAutofill('school-1', 'OwnerAdmin', '5001')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-[#122E52]/10 dark:hover:bg-[#122E52]/40 hover:text-[#122E52] dark:hover:text-[#F7A914] cursor-pointer"
                >
                  5001 (School Owner)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
