import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute } from './PublicNavbar';
import { AnimatedTypewriter } from '../common/AnimatedTypewriter';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  ShieldCheck,
  ArrowRight,
  Tag,
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (route: PublicNavRoute) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { tr } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    subject: 'School Onboarding & Demo',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg(tr('Please fill in all required fields.', 'Fadlan buuxi dhammaan meelaha banaan ee loo baahan yahay.'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        institution: '',
        subject: 'School Onboarding & Demo',
        message: '',
      });
    }, 700);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 space-y-16 font-sans animate-fade-in">
      
      {/* ========================================================================= */}
      {/* SPLIT STUDIO LAYOUT                                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* Left: Large Statement & Institutional Information */}
        <div className="lg:col-span-5 space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1E3A63] bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#F7A914]" />
            <span>{tr('Direct Institutional Contact', 'Xiriirka Tooska ah')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            {tr("Let's build", 'Aan wada dhisno')}{' '}
            <span className="bg-gradient-to-r from-[#122E52] via-[#3B82F6] to-[#F7A914] bg-clip-text text-transparent">
              <AnimatedTypewriter
                words={[
                  tr('better schools.', 'dugsiyo hufan.'),
                  tr('modern classrooms.', 'fasallo casri ah.'),
                  tr('connected campuses.', 'xarumo mideysan.'),
                ]}
                typingSpeed={70}
                deletingSpeed={40}
                pauseDuration={2200}
              />
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {tr(
              'Whether you are setting up a single academy with our $15/mo Pro plan or digitizing a multi-campus school network, our engineering and onboarding team is ready to assist.',
              'Haddii aad tahay dugsi keliya oo bilaabaya qorshaha $15/mo Pro ama shabakad dugsiyo badan leh, kooxdayadu waxay diyaar u tahay inay kugu caawiso sidii aad u bilaabi lahayd.'
            )}
          </p>

          <div className="space-y-4 pt-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs card-hover-lift">
              <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Email Support</span>
                <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">contact@ileys.app • support@ileys.app</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs card-hover-lift">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{tr('Headquarters', 'Xarunta Guud')}</span>
                <span className="text-slate-600 dark:text-slate-300 text-xs">Ileys Technology Hub • Digfer Rd, Hodan, Mogadishu</span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xs card-hover-lift">
              <div className="w-9 h-9 rounded-xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{tr('Direct Telephone / WhatsApp', 'Telefoonka / WhatsApp')}</span>
                <span className="text-slate-600 dark:text-slate-300 font-mono text-xs">+252 61 5000000 • +252 61 5111111</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('pricing')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:underline transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{tr('Check Ileys Pro Plan Details ($15/mo)', 'Eeg Faahfaahinta Qorshaha Pro ($15/mo)')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Interactive Message & Inquiry Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {tr('Send an Institutional Inquiry', 'Soo Dir Fariin ama Codsi')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {tr('Our team typically responds within 2 hours during school operational hours.', 'Kooxdayadu waxay kuugu soo jawaabaysaa 2 saacadood gudahood.')}
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                {tr('Message Transmitted Successfully', 'Fariintaadu Si Guul Leh Ayay u Gashey')}
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                {tr(
                  'Thank you for reaching out. An institutional onboarding specialist will follow up with you via email shortly.',
                  'Waad ku mahadsan tahay la soo xiriirkaaga. Khabiir ku takhasusay nidaamka Ileys ayaa kula soo xiriiri doona sida ugu dhakhsaha badan.'
                )}
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
              >
                {tr('Send another message', 'Soo dir fariin kale')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {tr('Full Name', 'Magacaaga oo Buuxa')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Ahmed Warsame"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {tr('Official Email Address', 'Email-ka')} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="principal@yourschool.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {tr('Institution / School Name', 'Magaca Dugsiga')}
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Al-Hikma Academy"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#3B82F6] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {tr('Inquiry Category', 'Nooca Codsiga')}
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#3B82F6] focus:outline-none cursor-pointer"
                  >
                    <option value="Pro Plan Setup ($15/mo)">{tr('Pro Plan Setup ($15/mo)', 'Qorshaha Pro ($15/mo)')}</option>
                    <option value="School Onboarding & Demo">{tr('School Onboarding & Demo', 'Diiwaangelinta Dugsiga')}</option>
                    <option value="Multi-Campus Network">{tr('Multi-Campus Network', 'Laamo Badan oo Dugsiyo ah')}</option>
                    <option value="Data Migration Assistance">{tr('Data Migration Assistance', 'Soo Wareejinta Xogta')}</option>
                    <option value="Technical Support">{tr('Technical Support', 'Taageero Farsamo')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {tr('Your Message / Requirements', 'Fariintaada')} *
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={tr('Tell us about your school size, current challenges, or specific needs...', 'Noo sheeg tirada ardayda, caqabadaha aad doonayso in xal loo helo...')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#3B82F6] focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold w-full"
              >
                {isSubmitting ? (
                  <span>{tr('Transmitting Message...', 'Fariinta ayaa socota...')}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{tr('Send Institutional Inquiry', 'Dir Fariinta')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
