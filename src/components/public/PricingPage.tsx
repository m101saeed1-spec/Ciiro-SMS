import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute } from './PublicNavbar';
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  Award,
  Sparkles,
  Lock,
  CalendarCheck,
  CreditCard,
  FileText,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface PricingPageProps {
  onNavigate: (route: PublicNavRoute) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { tr } = useLanguage();

  const includedFeatures = [
    {
      categoryEn: 'Student & Academic Management',
      categorySo: 'Maamulka Ardayda & Waxbarashada',
      items: [
        { en: 'Unlimited student enrollment & dossiers', so: 'Diiwaangelinta arday aan xadidnayn & faylashooda' },
        { en: 'Digital attendance & daily roll call', so: 'Xaadiriska maalinlaha ah ee fasal kasta' },
        { en: 'Exam management & automated GPA ranking', so: 'Maamulka imtixaanaadka & buundooyinka' },
        { en: 'Official printable PDF report cards', so: 'Kaadhadhka natiijooyinka oo PDF la daabacan karo' },
        { en: 'Class schedules & timetable management', so: 'Jadwalka fasalada & xilliyada casharrada' },
      ],
    },
    {
      categoryEn: 'Finance, Staff & Security',
      categorySo: 'Maaliyadda, Shaqaalaha & Amniga',
      items: [
        { en: 'Single unified tuition & fees ledger', so: 'Diiwaanka lacag-bixinta & kharashaadka dugsiga' },
        { en: 'Teachers & administrative staff management', so: 'Maamulka macallimiinta & hawlwadeennada' },
        { en: 'Dedicated school role portals (Principal, Teacher, Student)', so: 'Bogag gaar u ah dugsiga (Maamule, Macallin, Arday)' },
        { en: 'Multi-tenant database segregation protocol', so: 'Nidaamka ilaalinta xogta gaarka ah ee dugsiga' },
        { en: 'Biometric WebAuthn passkey authentication', so: 'Galitaanka casriga ah ee faraha ama wajiga' },
        { en: 'Automated daily cloud backups & updates', so: 'Kaydinta tooska ah ee xogta daruuraha & cusbooneysiinta' },
      ],
    },
  ];

  const quickFaqs = [
    {
      qEn: 'Are there any hidden fees or setup charges?',
      qSo: 'Ma jiraan lacago qarsoon ama lacag lagu bilaabo?',
      aEn: 'None at all. You pay exactly $15 per month with zero setup costs, zero per-student surcharges, and no surprise add-ons.',
      aSo: 'Ma jiraan wax lacago qarsoon ah. Waxaad bixinaysaa $15 bishii oo kaliya iyada oo aysan jirin wax kharash bilaabis ah ama lacag arday kasta lagu daro.',
    },
    {
      qEn: 'How does the 14-day free trial work?',
      qSo: 'Sidee ayay u shaqeysaa tijaabada bilaashka ah ee 14-ka maalmood?',
      aEn: 'You get unrestricted access to every feature for 14 days without entering a credit card. Your academy goes live in under two minutes.',
      aSo: 'Waxaad helaysaa dhammaan adeegyada muddo 14 maalmood ah adigoon gelin kaadhka lacag-bixinta. Dugsigaagu wuxuu shaqo bilaabayaa wax ka yar 2 daqiiqo.',
    },
    {
      qEn: 'Can multiple campuses or schools use one account?',
      qSo: 'Dugsiyo badan miyey ku wada shaqayn karaan hal akoon?',
      aEn: 'Yes. Institutional leadership can register and operate campuses with complete cryptographic isolation between each school.',
      aSo: 'Haa. Maamulayaasha dugsiyadu waxay hawlgelin karaan laamo badan iyadoo xogta dugsi kasta si adag loo kala soocay.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B1B32] text-[#12233F] dark:text-slate-100 font-sans transition-colors duration-200 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      
      {/* 1. HEADER SECTION */}
      <div className="max-w-3xl mx-auto text-center space-y-3.5 mb-10 sm:mb-14">
        {/* Anti-slop category kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] dark:bg-[#1E3A63] border border-[#FDE68A] dark:border-[#23497C] text-[#92400E] dark:text-[#F7A914] text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#F7A914]" />
          <span>{tr('Simple. Honest. All-Inclusive.', 'Fudud. Hufan. Dhammaystiran.')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#122E52] dark:text-white leading-tight">
          {tr('One transparent plan for', 'Hal qorshe oo hufan ee')} <span className="text-[#F7A914]">{tr('your entire school', 'dugsigaaga oo dhan')}</span>
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
          {tr(
            'Everything required to manage admissions, attendance, teachers, exams, and finances — packaged into one affordable institutional subscription.',
            'Wax kasta oo aad ugu baahan tahay maamulka ardayda, xaadiriska, macallimiinta, imtixaanaadka, iyo maaliyadda — oo ku jira hal qorshe oo jaban.'
          )}
        </p>
      </div>

      {/* 2. THE SINGLE REFINED $15/MONTH PRICING CARD */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#122E52] rounded-3xl border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xl overflow-hidden transition-all duration-200">
          
          {/* Card Top Banner (Deep Academic Navy with Gold Accents) */}
          <div className="relative bg-[#122E52] dark:bg-[#0B1B32] text-white p-6 sm:p-8 border-b border-[#1E3A63]">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7A914]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F7A914]/20 text-[#F7A914] border border-[#F7A914]/30 text-[11px] font-black tracking-wider uppercase">
                  {tr('All-In-One Pro Tier', 'Qorshaha Buuxa ee Pro')}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
                  Ileys School OS
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm font-normal">
                  {tr('Complete operational freedom for single or multi-campus academies.', 'Xorriyad buuxda oo maamul dugsiyada keliya ama kuwa laamaha badan leh.')}
                </p>
              </div>

              {/* Price Callout */}
              <div className="sm:text-right bg-[#0B1B32]/60 dark:bg-[#122E52]/60 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-white/10 sm:border-0">
                <div className="flex items-baseline sm:justify-end gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    $15
                  </span>
                  <span className="text-sm font-bold text-slate-300">
                    / {tr('month', 'bishii')}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#F7A914] mt-0.5">
                  {tr('Billed monthly · Cancel anytime', 'Bille loo bixiyo · Waad joojin kartaa')}
                </div>
              </div>
            </div>
          </div>

          {/* Card Body: Feature Columns */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {includedFeatures.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-3.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#122E52] dark:text-[#F7A914] pb-1 border-b border-[#E2E8F0] dark:border-[#1E3A63]">
                    {tr(group.categoryEn, group.categorySo)}
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm">
                    {group.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className="text-[#12233F] dark:text-slate-200 font-medium leading-snug">
                          {tr(item.en, item.so)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Guarantees Banner */}
            <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#0B1B32]/70 border border-[#E2E8F0] dark:border-[#1E3A63] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#122E52] dark:text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{tr('Strict Multi-Tenant Database Isolation', 'Amniga Gooninimada Xogta')}</span>
              </div>
              <div className="flex items-center gap-2 text-[#122E52] dark:text-slate-200 font-semibold">
                <Users className="w-4 h-4 text-[#F7A914] shrink-0" />
                <span>{tr('No Per-Student Surcharges', 'Kharash Dheeraad ah Ma Jiro')}</span>
              </div>
              <div className="flex items-center gap-2 text-[#122E52] dark:text-slate-200 font-semibold">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{tr('99.9% Uptime Guarantee', '99.9% Joogtayn Buuxda')}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => {
                  onNavigate('signup');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#F7A914] hover:bg-[#E59807] text-[#12233F] font-black text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>{tr('Start 14-Day Free Trial', 'Bilow 14 Maalmood oo Bilaash ah')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                <span>✓ {tr('No credit card required', 'Kaadh loo baahneyn')}</span>
                <span>•</span>
                <span>✓ {tr('Instant setup in 2 minutes', 'Ku diyaari 2 daqiiqo')}</span>
                <span>•</span>
                <span>✓ {tr('Cancel anytime with one click', 'Jooji wakhti kasta')}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. TRANSPARENCY & VALUE PILLARS */}
      <div className="max-w-4xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#122E52] dark:text-white">
            {tr('Predictable $15 Monthly Flat Fee', 'Qiimo Go’an oo $15 Bishii ah')}
          </h4>
          <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
            {tr(
              'Never worry about unexpected bills as your school expands. Whether you have 50 or 5,000 students, the rate remains $15/month.',
              'Waligaa ha ka welwelin kharashyo kor u kaca marka dugsigaagu kordho. 50 ama 5,000 ardayba, qiimuhu waa $15 bishii.'
            )}
          </p>
        </div>

        <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/50 text-[#F7A914] mx-auto flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#122E52] dark:text-white">
            {tr('Your Data Stays Strictly Yours', 'Xogtaada Adiga Keliya Ayaa Leh')}
          </h4>
          <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
            {tr(
              'Every academy receives isolated database namespaces. We never monetize, share, or blend institutional records.',
              'Dugsi kasta wuxuu leeyahay kayd xogeed u gaar ah. Marnaba lama wadaago lamana iibiyo xogta dugsigaaga.'
            )}
          </p>
        </div>

        <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#122E52] dark:text-[#F7A914] mx-auto flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#122E52] dark:text-white">
            {tr('Continuous Cloud Enhancements', 'Cusbooneysiin Joogto ah')}
          </h4>
          <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
            {tr(
              'Gain instant access to new examination templates, timetable modules, and speed optimizations without maintenance downtime.',
              'Hel nidaamyo cusub oo imtixaan, jadwal, iyo waxqabad degdeg ah adigoon u baahnayn cilad-bixin xilli shaqo ah.'
            )}
          </p>
        </div>
      </div>

      {/* 4. FREQUENTLY ASKED QUESTIONS SNIPPET */}
      <div className="max-w-2xl mx-auto mt-16 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[#122E52] dark:text-white">
            {tr('Pricing Questions Answered', 'Su’aalaha Qiimaha ee Badanaa La Isweydiiyo')}
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            {tr('Transparent details with no fine print.', 'Faahfaahin hufan oo aan lahayn qoraal yar.')}
          </p>
        </div>

        <div className="space-y-3">
          {quickFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#122E52] border border-[#E2E8F0] dark:border-[#1E3A63] space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#122E52] dark:text-white">
                <HelpCircle className="w-4 h-4 text-[#F7A914] shrink-0" />
                <span>{tr(faq.qEn, faq.qSo)}</span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed pl-6 font-normal">
                {tr(faq.aEn, faq.aSo)}
              </p>
            </div>
          ))}
        </div>

        {/* Link to full FAQ */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              onNavigate('faq');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-bold text-[#122E52] dark:text-[#F7A914] hover:underline cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{tr('Have more questions? Read our complete FAQ guide', 'Su’aalo kale ma qabtaa? Akhri dhammaan su’aalaha')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. INSTITUTIONAL ACCREDITATION FOOTER STRIP */}
      <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-[#E2E8F0] dark:border-[#1E3A63] text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#64748B] dark:text-slate-400">
          {tr('Built for educational excellence across primary, secondary & academy institutions', 'Loogu talagalay waxbarashada dugsiyada hoose, dhexe, sare & jaamacadaha')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-xs font-semibold text-[#122E52] dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#F7A914]" />
            <span>Al-Hikma Academy</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#F7A914]" />
            <span>Ileys Model School</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#F7A914]" />
            <span>Sunrise International</span>
          </div>
        </div>
      </div>

    </div>
  );
};
