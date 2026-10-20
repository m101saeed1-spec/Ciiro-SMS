import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute } from './PublicNavbar';
import {
  Check,
  ArrowRight,
  Rocket,
  ShieldCheck,
  Laptop,
  Users,
  TrendingUp,
  Headphones,
  Sparkles,
  Building2,
  GraduationCap,
  Award,
  Crown,
} from 'lucide-react';

interface PricingPageProps {
  onNavigate: (route: PublicNavRoute) => void;
}

export type BillingCycle = 'monthly' | 'yearly';

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { tr } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');

  // Exact pricing model as per specification and reference image:
  // Monthly: $19.99 / month
  // Yearly: $199.99 / year (Save 17% -> approx $16.67 / month)
  const isYearly = billingCycle === 'yearly';

  const proFeaturesLeft = [
    { en: 'Student management', so: 'Maamulka xogta ardayda' },
    { en: 'Teachers & staff management', so: 'Maamulka macallimiinta & shaqaalaha' },
    { en: 'Attendance tracking', so: 'Diiwaanka xaadiriska maalinlaha ah' },
    { en: 'Exam & results management', so: 'Imtixaanaadka & kaararka natiijooyinka' },
    { en: 'Class & timetable management', so: 'Fasalada & jadwalka xilliyada' },
    { en: 'Announcements', so: 'Farriimaha & ogeysiisyada dugsiga' },
  ];

  const proFeaturesRight = [
    { en: 'Fees & payment management', so: 'Maamulka lacag-bixinta & kharashaadka' },
    { en: 'Financial summaries & reports', so: 'Warbixinnada maaliyadda & xisaabaadka' },
    { en: 'School analytics', so: 'Falanqaynta & kobaca waxbarashada' },
    { en: 'Student profiles & documents', so: 'Dossier-ka & faylasha ardayda' },
    { en: 'Role-based access control', so: 'Xakamaynta doorka & amniga xogta' },
    { en: 'Secure cloud database', so: 'Keydka xogta ee daruuraha (Cloud)' },
    { en: 'Data storage', so: 'Kaydinta faylasha & sawirrada' },
    { en: 'Automatic updates', so: 'Cusbooneysiinta tooska ah' },
    { en: 'Priority support', so: 'Adeeg taageero oo mudnaan leh' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B1B32] text-[#12233F] dark:text-slate-100 font-sans transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* 1. HERO SECTION */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        {/* Top Centered Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-xs font-bold tracking-wide shadow-2xs">
          <span>Simple. Powerful. Complete.</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#122E52] dark:text-white leading-tight">
          Choose the plan that fits{' '}
          <span className="text-[#F7A914]">your school's needs</span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#64748B] dark:text-slate-300 leading-relaxed">
          {tr(
            'One powerful plan. Everything you need to manage your school, students, staff, finances and more — all in one place.',
            'Hal qorshe oo awood badan. Wax kasta oo aad ugu baahan tahay maamulka dugsigaaga, ardayda, shaqaalaha, maaliyadda iyo wax ka badan — hal meel.'
          )}
        </p>

        {/* Segmented Billing Switch (Monthly vs Yearly) */}
        <div className="pt-6 flex justify-center">
          <div className="relative inline-flex p-1.5 rounded-full bg-white dark:bg-[#122E52] border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs">
            {/* Monthly Option */}
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                !isYearly
                  ? 'bg-[#122E52] text-white shadow-sm'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#122E52] dark:hover:text-white'
              }`}
            >
              <div className="flex flex-col items-center">
                <span>{tr('Monthly', 'Bille')}</span>
                <span className="text-[11px] font-medium opacity-80">$19.99 / month</span>
              </div>
            </button>

            {/* Yearly Option with Gold Badge */}
            <div className="relative">
              {/* Gold "BEST VALUE · SAVE 17%" Badge */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#F7A914] text-[#12233F] text-[9px] font-black uppercase tracking-wider shadow-xs animate-bounce">
                BEST VALUE · SAVE 17%
              </span>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isYearly
                    ? 'bg-[#122E52] text-white shadow-sm'
                    : 'text-[#64748B] dark:text-slate-300 hover:text-[#122E52] dark:hover:text-white'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{tr('Yearly', 'Sannadle')}</span>
                  <span className="text-[11px] font-medium opacity-80">$199.99 / year</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN PRICING GRID WITH 6 SURROUNDING BENEFIT CARDS */}
      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3 Benefit Cards */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          {/* Benefit 1: Save Time */}
          <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mb-3">
              <Rocket className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#122E52] dark:text-white mb-1">
              {tr('Save Time', 'Waqtiga Badbaadi')}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
              {tr(
                'Automate daily tasks and focus on what matters most — your students.',
                'Toosi hawlaha maalinlaha ah oo diiradda saar waxa ugu muhiimsan — ardaydaada.'
              )}
            </p>
          </div>

          {/* Benefit 2: Secure & Reliable */}
          <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#122E52] dark:text-white mb-1">
              {tr('Secure & Reliable', 'Aamin & La Hubo')}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
              {tr(
                'Your data is protected with enterprise-grade security and cloud infrastructure.',
                'Xogtaada waxaa lagu ilaaliyaa amni heer sare ah iyo nidaamka daruuraha.'
              )}
            </p>
          </div>

          {/* Benefit 3: Access Anywhere */}
          <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mb-3">
              <Laptop className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#122E52] dark:text-white mb-1">
              {tr('Access Anywhere', 'Gal Meel Kasta')}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
              {tr(
                'Use it on any device, anytime, from anywhere.',
                'U isticmaal qalab kasta (Kombuyuutar, Tablet, ama Mobile) meel kasta.'
              )}
            </p>
          </div>
        </div>

        {/* Center Column: The Primary PRO Pricing Card */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="bg-white dark:bg-[#122E52] rounded-3xl border-2 border-[#3B82F6]/30 dark:border-[#3B82F6]/40 shadow-xl overflow-hidden relative">
            {/* Card Header Banner (Navy gradient with School Illustration) */}
            <div className="relative bg-gradient-to-br from-[#122E52] via-[#0B1B32] to-[#12233F] text-white p-6 sm:p-8 overflow-hidden">
              {/* Gold "Most Popular" Banner in Top Right */}
              <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7A914] text-[#12233F] text-xs font-black uppercase tracking-wider shadow-md">
                <Crown className="w-3.5 h-3.5 fill-[#12233F]" />
                <span>Most Popular</span>
              </div>

              {/* Title & Subtitle */}
              <div className="relative z-10 max-w-sm">
                <span className="text-xs font-black uppercase tracking-widest text-[#F7A914]">
                  SINGLE ALL-INCLUSIVE TIER
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
                  PRO
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Everything your school needs to run smarter.
                </p>
              </div>

              {/* Stylized School Illustration Background Vector */}
              <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none">
                <Building2 className="w-32 h-32 text-white" />
              </div>

              {/* Price Display Strip */}
              <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {isYearly ? '$199.99' : '$19.99'}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  {isYearly ? '/ year' : '/ month'}
                </span>

                <div className="ml-auto text-right">
                  <div className="text-xs font-bold text-[#F7A914]">
                    {isYearly ? '≈ $16.67 / month' : '$19.99 billed monthly'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isYearly ? '(effective monthly rate)' : '(maximum flexibility)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Features Body (2 Columns with Bright Blue Checkmarks) */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-xs sm:text-sm">
                {/* Column 1 */}
                <div className="space-y-3.5">
                  {proFeaturesLeft.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-[#12233F] dark:text-slate-200 font-medium">
                        {tr(feat.en, feat.so)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-3.5">
                  {proFeaturesRight.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-[#12233F] dark:text-slate-200 font-medium">
                        {tr(feat.en, feat.so)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prominent Gold CTA Button */}
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E3A63]">
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#F7A914] hover:bg-[#E59807] text-[#12233F] font-black text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>{tr('Start Free Trial', 'Bilow Tijaabada Bilaashka ah')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-[11px] text-[#64748B] dark:text-slate-400 mt-2.5 font-medium">
                  {tr('Cancel anytime. No hidden fees.', 'Waad joojin kartaa wakhti kasta. Wax kharash ah oo qarsoon ma jiraan.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3 Benefit Cards */}
        <div className="lg:col-span-3 space-y-6 order-3">
          {/* Benefit 4: Better Communication */}
          <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#122E52] dark:text-white mb-1">
              {tr('Better Communication', 'Xiriir Fiican')}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
              {tr(
                'Keep everyone connected — students, parents, teachers and staff.',
                'Isku xidh qof kasta — ardayda, waalidiinta, macallimiinta iyo maamulka.'
              )}
            </p>
          </div>

          {/* Benefit 5: Data-Driven Decisions */}
          <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#122E52] dark:text-white mb-1">
              {tr('Data-Driven Decisions', 'Go’aanno Xog Ku Dhisan')}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
              {tr(
                'Get real-time insights and powerful reports to improve performance.',
                'Hel xog toos ah iyo warbixinno dhammaystiran si aad u kobciso natiijooyinka dugsiga.'
              )}
            </p>
          </div>

          {/* Benefit 6: Dedicated Support */}
          <div className="bg-white dark:bg-[#122E52] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#122E52] dark:text-white mb-1">
              {tr('Dedicated Support', 'Adeeg Taageero')}
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
              {tr(
                'Our team is here to help you every step of the way.',
                'Kooxdayadu waxay diyaar u tahay inay ku caawiso tallaabo kasta.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SOCIAL PROOF BANNER */}
      <div className="max-w-5xl mx-auto mt-16 pt-8 border-t border-[#E2E8F0] dark:border-[#1E3A63] text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#3B82F6]">
          {tr('Trusted by schools across the world', 'Waxaa aaminsan dugsiyada adduunka')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 items-center justify-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#64748B] dark:text-slate-300">
            <GraduationCap className="w-4 h-4 text-[#122E52] dark:text-[#F7A914]" />
            <span>Students</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#64748B] dark:text-slate-300">
            <Users className="w-4 h-4 text-[#122E52] dark:text-[#F7A914]" />
            <span>Teachers</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#64748B] dark:text-slate-300">
            <Award className="w-4 h-4 text-[#122E52] dark:text-[#F7A914]" />
            <span>Principals</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#64748B] dark:text-slate-300">
            <Building2 className="w-4 h-4 text-[#122E52] dark:text-[#F7A914]" />
            <span>School Administrators</span>
          </div>
        </div>
      </div>
    </div>
  );
};
