import React, { useState, useEffect } from 'react';
import { PublicNavbar, PublicNavRoute } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { HomePage } from './HomePage';
import { AboutPage } from './AboutPage';
import { WhyIleysPage } from './WhyIleysPage';
import { FeaturesPage } from './FeaturesPage';
import { PricingPage } from './PricingPage';
import { FaqPage } from './FaqPage';
import { ContactPage } from './ContactPage';
import { SignInPage } from '../auth/SignInPage';
import { SignUpPage } from '../auth/SignUpPage';

interface PublicLayoutProps {
  currentRoute: PublicNavRoute;
  onNavigate: (route: PublicNavRoute) => void;
  onAuthSuccess: (isPlatformOwner: boolean) => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentRoute,
  onNavigate,
  onAuthSuccess,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll depth percentage
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initial calculation
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentRoute]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative selection:bg-[#F7A914] selection:text-[#122E52]">
      
      {/* ========================================================================= */}
      {/* 1. TOP SCROLL PROGRESS BAR (Thin, Animated, Primary Accent)               */}
      {/* ========================================================================= */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#122E52] via-[#3B82F6] to-[#F7A914] transition-all duration-150 ease-out shadow-sm shadow-[#F7A914]/30 relative"
          style={{ width: `${scrollProgress}%` }}
        >
          {/* Subtle animated glow bead at the leading edge */}
          {scrollProgress > 1 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#F7A914] rounded-full blur-[2px] opacity-80" />
          )}
        </div>
      </div>

      {/* 2. Global Public Top Navigation */}
      <PublicNavbar currentRoute={currentRoute} onNavigate={onNavigate} />

      {/* 3. Dynamic Public Page Canvas */}
      <main className="flex-1">
        {currentRoute === 'home' && <HomePage onNavigate={onNavigate} />}
        {currentRoute === 'about' && <AboutPage onNavigate={onNavigate} />}
        {currentRoute === 'why-ileys' && <WhyIleysPage onNavigate={onNavigate} />}
        {currentRoute === 'features' && <FeaturesPage onNavigate={onNavigate} />}
        {currentRoute === 'pricing' && <PricingPage onNavigate={onNavigate} />}
        {currentRoute === 'faq' && <FaqPage onNavigate={onNavigate} />}
        {currentRoute === 'contact' && <ContactPage onNavigate={onNavigate} />}
        {currentRoute === 'signin' && (
          <SignInPage onNavigate={onNavigate} onSuccess={onAuthSuccess} />
        )}
        {currentRoute === 'signup' && (
          <SignUpPage onNavigate={onNavigate} onSuccess={onAuthSuccess} />
        )}
      </main>

      {/* 4. Global Public Footer */}
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
};
