import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute } from './PublicNavbar';
import { AnimatedTypewriter } from '../common/AnimatedTypewriter';
import {
  Building2,
  Lock,
  Layers,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Users,
  Check,
  X,
  Zap,
  Tag,
} from 'lucide-react';

interface WhyIleysPageProps {
  onNavigate: (route: PublicNavRoute) => void;
}

export const WhyIleysPage: React.FC<WhyIleysPageProps> = ({ onNavigate }) => {
  const { tr } = useLanguage();

  const comparisonData = [
    {
      feature: tr('System Architecture', 'Hab-dhismeedka Nidaamka'),
      legacy: tr('Fragmented spreadsheets, paper binders, scattered chats', 'Waraaqo kala daadsan, Excel kala go’an, wada-hadallo aan nidaamsanayn'),
      ileys: tr('One unified, real-time relational platform', 'Hal goob oo mideysan oo xogta wada xidhiidhsan'),
    },
    {
      feature: tr('User Access & Roles', 'Doorka & Helitaanka'),
      legacy: tr('Generic logins with risk of accidental data modification', 'Gelitaan guud oo sababi kara khaladaad iyo xog lumis'),
      ileys: tr('Strict RBAC with 4-digit Ileys ID verification', 'Ogolaansho adag oo leh aqoonsiga 4-god ee Ileys ID'),
    },
    {
      feature: tr('Attendance & Roll Call', 'Xaadiriska & Joogitaanka'),
      legacy: tr('Manual paper registers with delayed monthly reporting', 'Waraaqo gacanta lagu qoro oo warbixintu daahdo'),
      ileys: tr('1-click classroom roll call with instant live reporting', 'Hal guji oo xaadris ah iyo warbixin toos ah'),
    },
    {
      feature: tr('Fee Invoicing & Ledgers', 'Xisaabaadka & Kharashaadka'),
      legacy: tr('Discrepancies between physical receipts and spreadsheets', 'Kala duwanaansho rasiidhada iyo xisaabaadka'),
      ileys: tr('Single 3-card ledger (Invoiced, Paid, Outstanding)', 'Hal diiwaan oo cad (Wadarta, La Bixiyay, Haraaga)'),
    },
    {
      feature: tr('Pricing & Affordability', 'Qiimaha & Fudeydka'),
      legacy: tr('Hidden setup fees, expensive per-student charges', 'Kharashyo qarsoon iyo lacag qaali ah arday kasta'),
      ileys: tr('Simple $25/mo Pro plan with 10% annual discount', 'Qorshe fudud oo $25/mo ah oo leh 10% dhimis sannadle ah'),
    },
    {
      feature: tr('Language Accessibility', 'Helitaanka Luqadda'),
      legacy: tr('English only or broken partial translations', 'Ingiriis keliya oo dadka qaar ku adag'),
      ileys: tr('Native bilingual English & Somali instant engine', 'Ingiriis iyo Soomaali toos ah oo dhammaystiran'),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 space-y-20 sm:space-y-28 font-sans animate-fade-in">
      
      {/* ========================================================================= */}
      {/* 1. HERO STATEMENT                                                         */}
      {/* ========================================================================= */}
      <section className="text-center max-w-3xl mx-auto space-y-6 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1E3A63] bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#F7A914]" />
          <span>{tr('Why Ileys Exists', 'Sababta Ileys u Jirto')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
          {tr('Built for', 'Loo dhisay')}{' '}
          <span className="bg-gradient-to-r from-[#122E52] via-[#3B82F6] to-[#F7A914] bg-clip-text text-transparent">
            <AnimatedTypewriter
              words={[
                tr('educational excellence.', 'horumar waxbarasho.'),
                tr('institutional trust.', 'kalsooni buuxda.'),
                tr('modern classrooms.', 'fasallada casriga ah.'),
              ]}
              typingSpeed={70}
              deletingSpeed={40}
              pauseDuration={2200}
            />
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          {tr(
            'We replaced slow, outdated manual processes with an intelligent operating system designed specifically for the unique operational demands of modern schools.',
            'Waxaan shaqooyinkii gacanta ee daalka lahaa ku beddelnay nidaam caqliyeed oo si gaar ah loogu habeeyay baahida dhabta ah ee dugsiyada casriga ah.'
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('pricing')}
            className="btn-gold"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{tr('See Pro Plan ($25/mo)', 'Eeg Qorshaha Pro ($25/mo)')}</span>
          </button>
          <button
            onClick={() => onNavigate('features')}
            className="px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {tr('Explore All Features', 'Eeg Astaamaha')}
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE 5 STRATEGIC PILLARS                                                */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#122E52] dark:text-[#F7A914] font-bold block">
            {tr('Core Strengths', 'Awoodaha Muhiimka ah')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {tr('The 5 Pillars of the Ileys Platform', '5-ta Tiir ee Nidaamka Ileys')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 card-hover-lift shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center font-mono font-bold text-xs border border-[#3B82F6]/30">
              01
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {tr('One Connected System', 'Hal Nidaam oo Mideysan')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {tr(
                'Eliminate isolated software tools. Admissions, roll calls, fees, exam marks, and calendars communicate seamlessly.',
                'Meesha ka saar nidaamyada kala qaybsan. Diiwaangelinta, xaadiriska, lacagta, buundooyinka iyo jadwalku si toos ah ayay isugu xidhan yihiin.'
              )}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 card-hover-lift shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center font-mono font-bold text-xs border border-[#1E3A63]">
              02
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {tr('Speed & Simplicity', 'Degdeg & Fudeyd')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {tr(
                'Engineered for maximum velocity. Take classroom attendance in under 10 seconds and generate term report cards in 1 click.',
                'Loo qaabeeyay degdeg. Qaado xaadiriska fasalka wax ka yar 10 ilbiriqsi, soo saarna kaararka natiijada hal guji kaliya.'
              )}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 card-hover-lift shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800">
              03
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {tr('Institutional Trust & Security', 'Kalsooni & Amni Buuxa')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {tr(
                'Complete tenant database segregation ensures student privacy, authenticated access keys, and immutable audit ledgers.',
                'Kala soocidda xogta dugsiyada waxay dammaanad qaadaysaa sirta ardayda, furayaasha aqoonsiga, iyo diiwaanka maaliyadda.'
              )}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 card-hover-lift shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-mono font-bold text-xs border border-amber-200 dark:border-amber-800">
              04
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {tr('Single Fees Ledger', 'Diiwaanka Maaliyadda ee Cad')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {tr(
                'Clear financial reporting: Total Invoiced, Paid Collected, and Outstanding Balance with instant PDF receipt printing.',
                'Warbixin maaliyadeed oo hufan: Wadarta Guud, La Bixiyay, iyo Haraaga oo lagu daabaco rasiidhada PDF-ka ah.'
              )}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 space-y-3 card-hover-lift shadow-sm md:col-span-2">
            <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center font-mono font-bold text-xs border border-[#3B82F6]/30">
              05
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {tr('Native Bilingual Experience (English & Somali)', 'Labada Luqadood oo Toos ah (Ingiriis & Soomaali)')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {tr(
                '1-click instant language switching across every module, button, and report so staff, students, and leaders feel completely at home.',
                'Beddelka luqadda ee hal guji ah dhammaan qaybaha nidaamka, badhannada, iyo warbixinnada si qof kasta si fudud ugu isticmaalo.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DIRECT ARCHITECTURAL COMPARISON MATRIX                                 */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#122E52] dark:text-[#F7A914] font-bold block">
            {tr('Side-by-Side Comparison', 'Isbarbardhig Toos ah')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {tr('The Old Way vs. The Ileys Way', 'Habkii Hore vs. Habka Casriga ah ee Ileys')}
          </h2>
        </div>

        <div className="rounded-3xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
          <div className="grid grid-cols-12 bg-slate-100 dark:bg-slate-800/90 p-4 sm:p-5 text-xs font-extrabold border-b border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
            <div className="col-span-4 sm:col-span-3">{tr('Capability', 'Astaanta')}</div>
            <div className="col-span-4 sm:col-span-4 text-slate-600 dark:text-slate-400">{tr('Traditional Spreadsheets / Binders', 'Waraaqo / Excel')}</div>
            <div className="col-span-4 sm:col-span-5 text-[#122E52] dark:text-[#F7A914] font-black">{tr('Ileys Platform', 'Madasha Ileys')}</div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {comparisonData.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="col-span-4 sm:col-span-3 font-extrabold text-slate-900 dark:text-white">
                  {row.feature}
                </div>
                <div className="col-span-4 sm:col-span-4 text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pr-2">
                  <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="leading-tight">{row.legacy}</span>
                </div>
                <div className="col-span-4 sm:col-span-5 text-[#12233F] dark:text-white font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[3]" />
                  <span className="leading-tight">{row.ileys}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CALL TO ACTION                                                         */}
      {/* ========================================================================= */}
      <section className="text-center max-w-2xl mx-auto space-y-6 pt-4">
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {tr('Ready to transform your school operations?', 'Diyaar ma u tahay inaad casriyeyso maamulka dugsigaaga?')}
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {tr(
            'Explore the full platform features or start with Ileys Pro at $25/mo with flexible monthly, 3-month, 6-month, or yearly billing.',
            'Baadh astaamaha oo dhan ama ku bilow Ileys Pro oo ah $25 bishii oo leh xilliyo bille, 3 bilood, 6 bilood, ama sannadle ah.'
          )}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('signup')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md cursor-pointer hover:scale-102"
          >
            {tr('Get Started Free', 'Bilow Hadda')}
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className="btn-gold w-full sm:w-auto"
          >
            {tr('View Pro Pricing ($25/mo)', 'Eeg Qiimaha Pro ($25/mo)')}
          </button>
        </div>
      </section>

    </div>
  );
};
