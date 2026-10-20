import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PublicNavRoute } from './PublicNavbar';
import { IleysBrandLogo } from '../common/IleysBrandLogo';
import {
  ShieldCheck,
  Globe,
  Mail,
  Building2,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface PublicFooterProps {
  onNavigate: (route: PublicNavRoute) => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate }) => {
  const { tr, language, toggleLanguage } = useLanguage();

  return (
    <footer className="bg-[#0B1B32] text-slate-400 border-t border-[#1E3A63] font-sans transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Mission Statement (Span 4) */}
          <div className="md:col-span-4 space-y-4">
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left cursor-pointer focus:outline-none"
            >
              <IleysBrandLogo size="md" variant="light" />
            </button>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
              {tr(
                'The unified operating system engineered for modern educational academies, faculty coordination, and single-ledger financial clarity.',
                'Nidaamka mideysan ee loogu talagalay dugsiyada casriga ah, macallimiinta, iyo xisaabaadka hufan.'
              )}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{tr('Multi-Tenant Data Segregation Protocol', 'Amniga Gooninimada Xogta Dugsiyada')}</span>
            </div>
          </div>

          {/* Column 2: Product & Modules (Span 3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {tr('Product & Modules', 'Nidaamka')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Student Admissions & Dossiers', 'Diiwaangelinta Ardayda')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Classroom Roll Call Engine', 'Xaadiriska Fasalka')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Single Unified Fees Ledger', 'Diiwaanka Kharashaadka')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Examinations & GPA Rankings', 'Imtixaannada & Buundooyinka')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Official PDF Notice Bulletins', 'Ogeysiisyada & Warbixinnada')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Roles (Span 2) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {tr('5 Core Roles', '5-ta Door')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-300">Teacher (#2001)</li>
              <li className="text-slate-300">Headteacher (#4001)</li>
              <li className="text-slate-300">Accountant (#3001)</li>
              <li className="text-slate-300">School Owner (#5001)</li>
              <li className="text-slate-300">Student (#1001)</li>
            </ul>
          </div>

          {/* Column 4: Company & Resources (Span 3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {tr('Company & Links', 'Shirkadda')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('About Us & Story', 'Nagu Saabsan')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('why-ileys')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Why Choose Ileys', 'Maxaa Ileys?')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('FAQ & 4-Digit ID Guide', 'Su’aalaha & Tilmaamaha ID-ga')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Contact Engineering Team', 'Xiriirka')}
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#F7A914]" />
                <span>{language === 'en' ? 'Ku beddel Soomaali' : 'Switch to English'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Ileys Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Enterprise School Cloud</span>
            <span>•</span>
            <span>Strict Role Isolation</span>
            <span>•</span>
            <span>99.9% Uptime SLA</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
