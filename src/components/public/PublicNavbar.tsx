import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { IleysBrandLogo } from '../common/IleysBrandLogo';
export const IleysLogo = IleysBrandLogo;
import {
  Globe,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

export type PublicNavRoute =
  | 'home'
  | 'about'
  | 'why-ileys'
  | 'features'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'signin'
  | 'signup';

interface PublicNavbarProps {
  currentRoute: PublicNavRoute;
  onNavigate: (route: PublicNavRoute) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentRoute, onNavigate }) => {
  const { language, toggleLanguage, tr } = useLanguage();
  const { isAuthenticated, hasEnteredWorkspace } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { route: PublicNavRoute; labelEn: string; labelSo: string }[] = [
    { route: 'home', labelEn: 'Home', labelSo: 'Hoyga' },
    { route: 'features', labelEn: 'Features', labelSo: 'Astaamaha' },
    { route: 'pricing', labelEn: 'Pricing', labelSo: 'Qiimaha' },
    { route: 'about', labelEn: 'About', labelSo: 'Nagu Saabsan' },
    { route: 'why-ileys', labelEn: 'Why Ileys', labelSo: 'Maxaa Ileys?' },
    { route: 'faq', labelEn: 'FAQ', labelSo: 'Su’aalaha' },
    { route: 'contact', labelEn: 'Contact', labelSo: 'Xiriirka' },
  ];

  const handleNavClick = (route: PublicNavRoute) => {
    onNavigate(route);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 py-3 sm:py-4 px-3 sm:px-6 lg:px-8">
      {/* Premium Floating Header Capsule */}
      <div
        className={`max-w-6xl mx-auto rounded-2xl sm:rounded-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#122E52]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#1E3A63] shadow-md py-2.5 px-4 sm:px-8'
            : 'bg-white/90 dark:bg-[#122E52]/90 backdrop-blur-md border border-[#E2E8F0] dark:border-[#1E3A63] shadow-xs py-3 px-4 sm:px-8'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo matching reference emblem */}
          <button
            onClick={() => handleNavClick('home')}
            className="cursor-pointer transition-transform hover:scale-102 active:scale-98 text-left focus:outline-none"
            aria-label="Ileys Home"
          >
            <IleysBrandLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleNavClick(link.route)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#122E52] dark:text-[#F7A914] font-black border-b-2 border-[#F7A914]'
                      : 'text-[#64748B] dark:text-slate-300 hover:text-[#122E52] dark:hover:text-white'
                  }`}
                >
                  <span>{tr(link.labelEn, link.labelSo)}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full border border-[#E2E8F0] dark:border-[#1E3A63] bg-[#F7F9FC] dark:bg-[#0B1B32] text-xs font-bold text-[#12233F] dark:text-slate-200 hover:bg-white dark:hover:bg-[#122E52] transition-colors flex items-center gap-1.5 cursor-pointer"
              title={tr('Switch Language (English / Somali)', 'Beddel Luqadda (Ingiriis / Soomaali)')}
            >
              <Globe className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="uppercase text-[11px] tracking-wider">{language === 'en' ? 'SO' : 'EN'}</span>
            </button>

            {/* Authentication Buttons */}
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('signin')}
                className="px-4 py-2 rounded-full bg-[#122E52] text-white hover:bg-[#0B1B32] font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#F7A914]" />
                <span>{hasEnteredWorkspace ? tr('Workspace', 'Nidaamka') : tr('Continue', 'Sii wad')}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('signin')}
                  className="px-4 py-1.5 text-xs font-bold text-[#122E52] dark:text-slate-200 hover:text-[#0B1B32] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {tr('Sign In', 'Soo Gal')}
                </button>

                <button
                  onClick={() => handleNavClick('signup')}
                  className="px-5 py-2 rounded-full bg-[#122E52] hover:bg-[#0B1B32] text-white font-black text-xs transition-all shadow-md shadow-[#122E52]/20 flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
                >
                  <span>{tr('Get Started', 'Bilow Hadda')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F7A914]" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 rounded-full border border-[#E2E8F0] dark:border-[#1E3A63] text-[10px] font-bold text-[#12233F] dark:text-slate-200"
            >
              {language === 'en' ? 'SO' : 'EN'}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#122E52] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1E3A63] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-[#E2E8F0] dark:border-[#1E3A63] mt-3 space-y-2 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.route;
                return (
                  <button
                    key={link.route}
                    onClick={() => handleNavClick(link.route)}
                    className={`px-4 py-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#F7F9FC] dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914]'
                        : 'text-[#64748B] dark:text-slate-300 hover:text-[#122E52]'
                    }`}
                  >
                    {tr(link.labelEn, link.labelSo)}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E3A63] flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('signin')}
                className="w-full py-2.5 rounded-xl border border-[#CBD5E1] text-[#122E52] dark:text-white text-xs font-bold text-center"
              >
                {tr('Sign In', 'Soo Gal')}
              </button>
              <button
                onClick={() => handleNavClick('signup')}
                className="w-full py-2.5 rounded-xl bg-[#F7A914] text-[#12233F] text-xs font-black text-center shadow-xs"
              >
                {tr('Get Started', 'Bilow Hadda')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
