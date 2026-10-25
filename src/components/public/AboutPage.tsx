import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute } from './PublicNavbar';
import { AnimatedTypewriter } from '../common/AnimatedTypewriter';
import {
  Target,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Users,
  Sparkles,
  ArrowRight,
  Lightbulb,
  HeartHandshake,
  Layers,
  Database,
  Lock,
  Cpu,
  Zap,
  Tag,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (route: PublicNavRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { tr } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 space-y-20 sm:space-y-28 font-sans animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. EDITORIAL OPENING STATEMENT                                            */}
      {/* ========================================================================= */}
      <section className="space-y-8 max-w-4xl animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1E3A63] bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#F7A914]" />
          <span>{tr('Our Philosophy & Story', 'Falsafaddayada & Sheekada')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
          {tr('Empowering', 'Awood siinta')}{' '}
          <span className="bg-gradient-to-r from-[#122E52] via-[#3B82F6] to-[#F7A914] bg-clip-text text-transparent">
            <AnimatedTypewriter
              words={[
                tr('modern academies.', 'dugsiyada casriga ah.'),
                tr('ambitious educators.', 'macallimiinta dadaalka badan.'),
                tr("tomorrow's leaders.", 'madaxda mustaqbalka.'),
              ]}
              typingSpeed={70}
              deletingSpeed={40}
              pauseDuration={2200}
            />
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {tr(
            'Ileys was built from the ground up to solve the chaos of fragmented software in educational institutions. Schools are complex living ecosystems comprising teachers, students, accountants, headteachers, and founders. We engineered a unified platform where everyone works together with absolute clarity.',
            'Ileys waxaa loo dhisay si ay u xalliso jahwareerka nidaamyada kala qaybsan ee dugsiyada. Dugsiyadu waa nidaam ballaadhan oo ka kooban macallimiin, arday, xisaabiyeyaal, maamulayaal iyo mulkiilayaal. Waxaan dhisnay hal goob oo mideysan oo qof kasta si hufan ugu shaqayn karo.'
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('pricing')}
            className="btn-gold"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{tr('View Pricing ($15/mo)', 'Eeg Qiimaha ($15/mo)')}</span>
          </button>
          <button
            onClick={() => onNavigate('why-ileys')}
            className="px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {tr('Why Choose Ileys', 'Maxaa Ileys?')}
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MISSION & VISION (High-Impact Editorial Split)                         */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Mission */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4 relative overflow-hidden card-hover-lift">
          <div className="w-10 h-10 rounded-2xl bg-[#122E52] border border-[#1E3A63] text-[#F7A914] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {tr('Our Mission', 'Hadafkayaga')}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {tr(
              'To empower educational institutions with enterprise-grade, role-adaptive software that eliminates administrative burden, safeguards student records, and delivers complete financial clarity.',
              'Inaan awood siinno xarumaha waxbarashada annagoo siinayna nidaam casri ah oo fududeeya maamulka, ilaaliya xogta ardayda, keenana hufnaan maaliyadeed oo buuxda.'
            )}
          </p>
        </div>

        {/* Vision */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden card-hover-lift">
          <div className="w-10 h-10 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] border border-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {tr('Our Vision', 'Aragtidayada')}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {tr(
              'To become the standard operating system for modern primary, secondary, and higher educational academies across the region, connecting educators and learners through intuitive technology.',
              'Inaan noqonno nidaamka caadiga ah ee dugsiyada hoose, dhexe iyo sare ee gobolka, annagoo isku xidhayna macallimiinta iyo ardayda iyadoo la adeegsanayo tiknoolajiyad fudud.'
            )}
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FOUR CORE ARCHITECTURAL PRINCIPLES                                     */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#122E52] dark:text-[#F7A914] font-bold block">
            {tr('Architectural Foundations', 'Tiirarka Nidaamka')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {tr('How We Build for Longevity and Scale', 'Sida aan u Dhisno Nidaam Waara')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 shadow-xs card-hover-lift">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {tr('Isolated Multi-Tenancy', 'Kala Soocidda Xogta')}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {tr('Each institution runs on isolated data perimeters for strict privacy.', 'Xogta dugsi kasta waa mid gooni ah oo ammaan ah.')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 shadow-xs card-hover-lift">
            <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {tr('4-Digit Verification', '4-God Ileys ID')}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {tr('Scoped role enforcement ensures members only see their authorized workspace.', 'Doorku wuxuu dammaanad qaadayaa xadkiisa saxda ah.')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 shadow-xs card-hover-lift">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {tr('Real-Time Sync Engine', 'Xog Wadaag Degdeg ah')}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {tr('Attendance, exam marks, and fees ledger update instantaneously.', 'Xaadiriska iyo lacaguhu toos ayay u cusboonaadaan.')}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 shadow-xs card-hover-lift">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {tr('Human-Centric UX', 'Muuqaal Fudud oo Hufan')}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {tr('No tedious manuals required. Clean typography and responsive design.', 'Uma baahna buugaag tababar, waana mid aad u sahlan.')}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CALL TO ACTION                                                         */}
      {/* ========================================================================= */}
      <section className="text-center max-w-2xl mx-auto space-y-6 pt-6">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {tr('Join the future of education management.', 'Kusoo biir mustaqbalka maamulka dugsiyada.')}
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {tr(
            'Explore Ileys Pro today at $15/month or contact our team for multi-campus deployments.',
            'Dheeh Ileys Pro maanta oo ah $15 bishii ama la xiriir kooxdayada haddii aad leedahay laamo badan.'
          )}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('pricing')}
            className="btn-gold w-full sm:w-auto"
          >
            {tr('View Pro Pricing ($15/mo)', 'Eeg Qiimaha Pro ($15/mo)')}
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {tr('Contact Our Team', 'La Xiriir Kooxda')}
          </button>
        </div>
      </section>

    </div>
  );
};
