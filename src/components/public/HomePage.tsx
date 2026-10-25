import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute } from './PublicNavbar';
import { SectionDivider } from './SectionDivider';
import { AnimatedTypewriter } from '../common/AnimatedTypewriter';
import {
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle2,
  Users,
  CalendarCheck,
  DollarSign,
  Award,
  Bell,
  BookOpen,
  GraduationCap,
  Building2,
  Layers,
  HeartHandshake,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Star,
  Zap,
  Tag,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: PublicNavRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { tr } = useLanguage();

  const handleExploreScroll = () => {
    const el = document.getElementById('story-learning');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 sm:space-y-32 pb-24 overflow-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Educational Environment + Subtle Ileys Interface         */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-10 lg:pt-14">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-[#122E52]/20 via-[#3B82F6]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Main Statement */}
          <div className="text-center max-w-3xl mx-auto space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FDE68A] bg-[#FEF3C7] text-[#92400E] text-xs font-extrabold tracking-wide shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#F7A914] animate-ping" />
              <span>{tr('A Serious Technology Platform for Modern Schools', 'Nidaam Casri ah oo loo Dhisay Dugsiyada')}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#122E52] dark:text-white tracking-tight leading-[1.08]">
              {tr('The modern operating system for', 'Nidaamka casriga ah ee')} <br className="hidden sm:inline" />
              <span className="text-[#F7A914]">
                <AnimatedTypewriter
                  words={[
                    tr('your school.', 'dugsigaaga.'),
                    tr('modern classrooms.', 'fasallada casriga ah.'),
                    tr('every student & teacher.', 'arday & macallin kasta.'),
                  ]}
                  typingSpeed={75}
                  deletingSpeed={45}
                  pauseDuration={2400}
                />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              {tr(
                'Ileys brings the essential activities of a school into one connected, organized, and modern platform.',
                'Ileys waxay hawlaha aasaasiga ah ee dugsiga isugu keentaa hal madal oo mideysan, habaysan, oo casri ah.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={handleExploreScroll}
                className="btn-navy w-full sm:w-auto"
              >
                <span>{tr('Explore Ileys', 'Dheeh Ileys')}</span>
                <ArrowRight className="w-4 h-4 text-[#F7A914]" />
              </button>

              <button
                onClick={() => onNavigate('pricing')}
                className="btn-gold w-full sm:w-auto"
              >
                <Tag className="w-4 h-4" />
                <span>{tr('Pro Plan ($15/mo)', 'Qorshaha Pro ($15/mo)')}</span>
              </button>
            </div>
          </div>

          {/* Cinematic Hero Image Composition: Classroom Reality + Floating Ileys Platform UI */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-300 dark:border-[#1E3A63] bg-[#0B1B32] shadow-2xl card-hover-lift">
            {/* Background Educational Atmosphere Photography */}
            <div className="relative h-[320px] sm:h-[460px] w-full">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=1600"
                alt="Modern interactive school classroom with students and educator"
                className="w-full h-full object-cover object-center opacity-85 hover:scale-101 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B32] via-[#0B1B32]/40 to-transparent" />
            </div>

            {/* Floating Layered Ileys Product Presence Card */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 dark:bg-[#122E52]/95 backdrop-blur-xl rounded-2xl border border-slate-300 dark:border-[#1E3A63] p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-float-gentle">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#122E52] via-[#0B1B32] to-[#1E3A63] text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 border border-[#1E3A63]">
                  <Building2 className="w-5 h-5 text-[#F7A914]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Al-Hikma Academy
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Term 2 Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    842 Students • 34 Faculty Members • Unified Single Ledger
                  </p>
                </div>
              </div>

              {/* Live Metric Pills */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs w-full md:w-auto justify-between md:justify-end">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B1B32] border border-slate-300 dark:border-[#1E3A63] font-semibold text-slate-800 dark:text-slate-200">
                  98.4% {tr('Attendance Today', 'Xaadiriska')}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#FEF3C7] dark:bg-[#1E3A63] border border-[#FDE68A] dark:border-[#F7A914]/40 font-bold text-[#92400E] dark:text-[#F7A914]">
                  100% {tr('Isolated Security', 'Amni Buuxa')}
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      <SectionDivider />

      {/* ========================================================================= */}
      {/* SECTION 1 — LEARNING: Emotional Connection to Education                   */}
      {/* ========================================================================= */}
      <section id="story-learning" className="relative scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Image Composition */}
            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200"
                alt="Students collaborating and studying in a bright modern classroom"
                className="w-full h-80 sm:h-[400px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold">
                {tr('Focused on student mastery, curiosity, and academic achievement.', 'Diiradda lagu saarayo koboca ardayga iyo waxbarashada dhabta ah.')}
              </div>
            </div>

            {/* Right Editorial Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{tr('Education First', 'Waxbarashada Ka Horreysa')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {tr(
                  'Better organization creates more room for learning.',
                  'Maamul habaysan wuxuu abuuraa fursad ballaadhan oo waxbarasho.'
                )}
              </h2>

              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {tr(
                  'When daily school administration runs quietly and reliably in the background, classrooms become calmer, lessons stay uninterrupted, and students receive the focused attention they deserve.',
                  'Marka maamulka dugsigu u socdo si habsami leh oo daacad ah, fasalladu waxay noqdaan kuwo deggan, casharradu ma kala go’aan, ardayduna waxay helaan daryeelka ay u baahan yihiin.'
                )}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('why-ileys')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#122E52] dark:text-[#F7A914] hover:underline transition-colors group cursor-pointer"
                >
                  <span>{tr('See how Ileys organizes student academic records', 'Eeg sida Ileys u maareyso xogta ardayda')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ========================================================================= */}
      {/* SECTION 2 — TEACHERS: Empowering Educators                                */}
      {/* ========================================================================= */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Editorial Copy */}
            <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>{tr('Empowering Educators', 'Awood Siinta Macallimiinta')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {tr(
                  'Give teachers the tools to stay organized and focused on teaching.',
                  'Sii macallimiinta agabka ay ku nidaamsanaadaan una go’aan wax-dhigista.'
                )}
              </h2>

              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {tr(
                  'Teachers should spend their valuable energy mentoring students, not wrestling with messy paperwork. From taking attendance in seconds to logging exam marks, Ileys simplifies everyday tasks.',
                  'Macallimiintu waa inay waqtigooda qaaliga ah ku bixiyaan waxbarista ardayda, halkii ay ku mashquuli lahaayeen waraaqo daal badan. Laga bilaabo xaadiriska degdegga ah ilaa dhibcaha imtixaanka, Ileys waxay fududaysaa shaqo kasta.'
                )}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('why-ileys')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors group cursor-pointer"
                >
                  <span>{tr('Explore the 1-Click Roll Call and grading tools', 'Eeg nidaamka xaadiriska iyo buundooyinka')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Image Composition */}
            <div className="lg:col-span-6 order-1 lg:order-2 relative rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200"
                alt="Teacher engaging and guiding students in modern school"
                className="w-full h-80 sm:h-[400px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold">
                {tr('Dedicated workspaces for designated class teachers and subject faculty.', 'Goobo shaqo oo gaar u ah macallimiinta fasallada iyo maadooyinka.')}
              </div>
            </div>

          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ========================================================================= */}
      {/* SECTION 3 — FEATURED PRICING SPOTLIGHT ($25/mo Pro & 4 Billing Cycles)   */}
      {/* ========================================================================= */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#122E52] via-[#0B1B32] to-[#12233F] border border-[#1E3A63] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden card-hover-lift">
            <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3A63] border border-[#1E3A63] text-[#F7A914] text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{tr('One Unified Institutional Plan: Ileys Pro', 'Hal Qorshe oo Mideysan: Ileys Pro')}</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  {tr('Ileys Pro — Just $25 / month', 'Ileys Pro — Kaliya $25 / bishii')}
                </h2>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                  {tr(
                    'One all-inclusive school operating system. Pay monthly ($25), 3 months ($70), 6 months ($135 with 10% off), or yearly ($270 with 10% off). Unlimited students, grade books, 1-click roll call, and single-ledger fee billing.',
                    'Hal nidaam oo buuxa. Bixi bille ($25), 3 bilood ($70), 6 bilood ($135 oo leh 10% dhimis), ama sannadle ($270 oo leh 10% dhimis). Arday aan xad lahayn, buundooyinka, xaadiriska, iyo xisaabaadka hufan.'
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-200 pt-1">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {tr('Monthly: $25', 'Bille: $25')}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {tr('3 Months: $70', '3 Bilood: $70')}
                  </span>
                  <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {tr('6 Months: $135 (10% OFF)', '6 Bilood: $135 (10% Dhimis)')}
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#1E3A63] text-[#F7A914] px-3 py-1 rounded-full border border-[#1E3A63]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {tr('Yearly: $270 (10% OFF)', 'Sannadle: $270 (10% Dhimis)')}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4 text-center">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-[#F7A914] font-bold">
                    {tr('Pro Platform Access', 'Helitaanka Buuxa ee Pro')}
                  </span>
                  <div className="text-5xl font-black text-white">
                    $25
                    <span className="text-base font-normal text-slate-300"> /mo</span>
                  </div>
                  <span className="text-xs text-emerald-300 font-bold block">
                    {tr('Save 10% on 6-Month & Annual Plans', 'Hel 10% dhimis 6-bilood & Sannadle')}
                  </span>
                </div>

                <div className="w-full space-y-2">
                  <button
                    onClick={() => onNavigate('pricing')}
                    className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-black text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
                  >
                    <span>{tr('Explore Billing Schedules', 'Eeg Jadwalka Qiimaha')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('signup')}
                    className="btn-gold w-full"
                  >
                    {tr('Create School Account', 'Sameyso Koonto')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ========================================================================= */}
      {/* SECTION 4 — SCHOOL MANAGEMENT: Unified Operations                         */}
      {/* ========================================================================= */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Image & UI Composite */}
            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-900 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200"
                alt="School administration leaders collaborating"
                className="w-full h-80 sm:h-[400px] object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              {/* Conceptual Bridge Overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-800 shadow-xl space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#122E52] dark:text-[#F7A914] block">
                  {tr('Conceptual Harmony', 'Isku Xidhka Guud')}
                </span>
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>School</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>People</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Information</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span className="text-[#F7A914] font-extrabold">Ileys</span>
                </div>
              </div>
            </div>

            {/* Right Editorial Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122E52]/10 dark:bg-[#1E3A63] border border-[#1E3A63] text-[#122E52] dark:text-[#F7A914] text-xs font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>{tr('Institutional Harmony', 'Maamul Mideysan')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {tr(
                  'Bring the moving parts of your school together.',
                  'Isku xidh dhammaan qaybaha kala duwan ee dugsigaaga.'
                )}
              </h2>

              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {tr(
                  'A school is a bustling community of students, teachers, parents, headteachers, and financial administrators. Ileys harmonizes communication and record-keeping so everyone operates from the same source of truth.',
                  'Dugsiguna waa bulsho ballaadhan oo ka kooban arday, macallimiin, waalidiin, maamulayaal iyo xisaabiyeyaal. Ileys waxay isku xidhaa xogta iyo xiriirka si qof kasta uga wada shaqeeyo hal nidaam oo cad.'
                )}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('why-ileys')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#122E52] dark:text-[#F7A914] hover:underline transition-colors group cursor-pointer"
                >
                  <span>{tr('See the single unified fees ledger and reports', 'Eeg xisaabaadka mideysan iyo warbixinnada')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ========================================================================= */}
      {/* SECTION 5 — CONNECTED SCHOOL: Conceptual Convergence                      */}
      {/* ========================================================================= */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl space-y-8">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#F7A914] font-bold block">
                {tr('Unified Educational Core', 'Xudunta Waxbarashada ee Mideysan')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {tr('Every school activity converges into Ileys.', 'Hawl kasta oo dugsigu leeyahay waxay ku kulantaa Ileys.')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {tr(
                  'Connecting students, teachers, academics, attendance, finances, announcements, and reporting into one clear platform.',
                  'Isku xirka ardayda, macallimiinta, waxbarashada, xaadiriska, maaliyadda, ogeysiisyada iyo warbixinnada hal goob oo hufan.'
                )}
              </p>
            </div>

            {/* Conceptual Convergence Stream */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              {[
                { name: tr('Students', 'Ardayda'), icon: GraduationCap },
                { name: tr('Teachers', 'Macallimiinta'), icon: Users },
                { name: tr('Academics', 'Waxbarashada'), icon: BookOpen },
                { name: tr('Attendance', 'Xaadiriska'), icon: CalendarCheck },
                { name: tr('Fees Ledger', 'Xisaabaadka'), icon: DollarSign },
                { name: tr('Announcements', 'Ogeysiisyada'), icon: Bell },
                { name: tr('Reports', 'Warbixinnada'), icon: TrendingUp },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 hover:border-[#F7A914] transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-[#122E52] text-[#F7A914] mx-auto flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white block">{item.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('signup')}
                className="btn-gold"
              >
                <span>{tr('Get Started Free', 'Ku Bilow Bilaash')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className="btn-outline-navy text-white border-white/30 hover:border-white hover:text-white"
              >
                <span>{tr('Check Pricing Plans ($15/mo)', 'Eeg Qiimaha ($15/mo)')}</span>
                <Tag className="w-3.5 h-3.5 text-[#F7A914]" />
              </button>
            </div>

          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ========================================================================= */}
      {/* SECTION 6 — HUMAN + TECHNOLOGY: People-First Platform                     */}
      {/* ========================================================================= */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122E52]/10 dark:bg-[#1E3A63] border border-[#1E3A63] text-[#122E52] dark:text-[#F7A914] text-xs font-bold">
                <HeartHandshake className="w-3.5 h-3.5 text-[#F7A914]" />
                <span>{tr('People-First Philosophy', 'U Dhisay Dadka')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {tr(
                  'Technology built to support people, not replace them.',
                  'Tiknoolajiyad loo dhisay inay taageerto dadka, ee maaha inay beddesho.'
                )}
              </h2>

              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {tr(
                  'At Ileys, we believe the human element of education is irreplaceable. Our software exists to eliminate clerical chaos so that educators, school leaders, and administrators can focus on what matters most: shaping young minds.',
                  'Ileys waxay aaminsan tahay in qiimaha aadanaha ee waxbarashadu yahay mid aan la beddeli karin. Nidaamkayagu wuxuu u jiraa inuu meesha ka saaro dhibka maamulka si macallimiinta iyo madaxdu diiradda u saaraan waxa ugu muhiimsan: dhisidda jiilka cusub.'
                )}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{tr('Native Bilingual Somali & English', 'Soomaali & Ingiriis Toos ah')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                  <span>{tr('Zero Complex Training Required', 'Uma Baahna Tababar Adag')}</span>
                </div>
              </div>
            </div>

            {/* Right Image Composition */}
            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-slate-300 dark:border-[#1E3A63] bg-slate-100 dark:bg-[#0B1B32] shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1200"
                alt="Happy students collaborating in modern academy"
                className="w-full h-80 sm:h-[400px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold">
                {tr('Designed with dignity, simplicity, and institutional clarity for all educational communities.', 'Loo qaabeeyay hufnaan iyo fudeyd dhammaan bulshada waxbarashada.')}
              </div>
            </div>

          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ========================================================================= */}
      {/* 7. CALL TO ACTION BANNER: Visionary Conclusion                            */}
      {/* ========================================================================= */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#122E52] via-[#0B1B32] to-[#12233F] text-white p-8 sm:p-14 border border-[#1E3A63] shadow-2xl relative overflow-hidden text-center space-y-6">
            
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#F7A914]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <span className="text-[11px] uppercase tracking-widest text-[#F7A914] font-black block">
                {tr('Start with Ileys', 'Ku Bilow Ileys')}
              </span>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {tr('A better way to run your school starts here.', 'Hab ka wanaagsan oo dugsigaaga loo maamulo halkan ayuu ka bilaabmaa.')}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {tr(
                  'Join modern schools bringing their people, academics, and finances into one organized platform with Pro starting at $15/month.',
                  'Kusoo biir dugsiyada casriga ah ee xogtooda, macallimiintooda, iyo xisaabaadkooda isugu keenay hal madal oo nidaamsan iyadoo Pro uu ka bilaabmayo $15 bishii.'
                )}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('signup')}
                  className="btn-gold w-full sm:w-auto"
                >
                  {tr('Get Started Free', 'Bilow Hadda Bilaash')}
                </button>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="btn-navy w-full sm:w-auto"
                >
                  {tr('View Pro Plan ($15/mo)', 'Eeg Qorshaha Pro ($15/mo)')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
