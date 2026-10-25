import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { ProBillingCycle } from '../../types';
import {
  CreditCard,
  Sparkles,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  Download,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  FileText,
  BadgeCheck,
  Check,
  Receipt,
  PhoneCall,
  Save,
  AlertCircle,
  Radio,
  Sliders,
  Layers,
} from 'lucide-react';

interface BillingSettingsProps {
  onPlanChanged?: (cycle: ProBillingCycle) => void;
}

interface BillingOption {
  id: ProBillingCycle;
  nameEn: string;
  nameSo: string;
  badgeEn?: string;
  badgeSo?: string;
  totalAmount: number;
  monthlyEquivalent: number;
  billingPeriodEn: string;
  billingPeriodSo: string;
  savingsEn?: string;
  savingsSo?: string;
  descriptionEn: string;
  descriptionSo: string;
  highlight?: boolean;
}

export const BillingSettings: React.FC<BillingSettingsProps> = ({ onPlanChanged }) => {
  const { activeSchool, updateSchool } = useAuth();
  const { addToast } = useSchoolData();
  const { tr } = useLanguage();

  // Active or saved cycle from school metadata, default to 'yearly'
  const savedCycle = ((activeSchool as any)?.billingCycle as ProBillingCycle) || 'yearly';
  const [selectedCycle, setSelectedCycle] = useState<ProBillingCycle>(savedCycle);
  const [selectionLayout, setSelectionLayout] = useState<'cards' | 'segmented'>('cards');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'bank_transfer' | 'card'>('mobile_money');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('252 61 584 9201');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const billingOptions: BillingOption[] = [
    {
      id: 'monthly',
      nameEn: 'Monthly Subscription',
      nameSo: 'Bille (Bil Kasta)',
      totalAmount: 25,
      monthlyEquivalent: 25,
      billingPeriodEn: 'Billed every month',
      billingPeriodSo: 'La bixiyo bil kasta',
      descriptionEn: 'Pay month-to-month with maximum operational flexibility. Cancel anytime without penalty.',
      descriptionSo: 'Bixi bil-bil adoo haysta dabacsanaan buuxda. Waad joojin kartaa waqti kasta.',
    },
    {
      id: '3month',
      nameEn: '3-Month (Quarterly)',
      nameSo: '3 Bilood (Xilli Dugsiyeed)',
      badgeEn: 'Term Schedule',
      badgeSo: 'Qorshaha Xilliga',
      totalAmount: 70,
      monthlyEquivalent: 23.33,
      billingPeriodEn: 'Billed every 3 months ($70 total)',
      billingPeriodSo: 'La bixiyo 3-dii biloodba ($70)',
      savingsEn: 'Save $5 per quarter',
      savingsSo: 'Keydi $5 rubuc kasta',
      descriptionEn: 'Aligned directly with standard school academic terms with quarterly savings.',
      descriptionSo: 'U habaysan xilliyada dugsiga ee 3-da bilood ah oo leh dhimis.',
    },
    {
      id: '6month',
      nameEn: '6-Month (Semi-Annual)',
      nameSo: '6 Bilood (Simistar)',
      badgeEn: '10% OFF',
      badgeSo: '10% Dhimis',
      totalAmount: 135,
      monthlyEquivalent: 22.5,
      billingPeriodEn: 'Billed every 6 months ($135 total)',
      billingPeriodSo: 'La bixiyo 6-dii biloodba ($135)',
      savingsEn: 'Save $15 every 6 months (10% OFF)',
      savingsSo: 'Keydi $15 nus-sano kasta (10% Dhimis)',
      descriptionEn: 'Designed for semester-based calendars with an upfront 10% institutional discount.',
      descriptionSo: 'Loo qorsheeyay nidaamka labada simistar oo leh 10% dhimis toos ah.',
    },
    {
      id: 'yearly',
      nameEn: 'Annual (Yearly)',
      nameSo: 'Sannadle',
      badgeEn: '10% OFF · Best Value',
      badgeSo: '10% Dhimis · Ugu Wanaagsan',
      totalAmount: 270,
      monthlyEquivalent: 22.5,
      billingPeriodEn: 'Billed annually ($270 total / yr)',
      billingPeriodSo: 'La bixiyo hal mar sannadkii ($270)',
      savingsEn: 'Save $30 every year (10% OFF)',
      savingsSo: 'Keydi $30 sannad kasta (10% Dhimis)',
      descriptionEn: 'Preferred institutional tier with uninterrupted cloud operations for the entire school year.',
      descriptionSo: 'Qorshaha rasmiga ah ee dugsiyada. Hal sano oo buuxa oo shaqo joogto ah.',
      highlight: true,
    },
  ];

  const activeOption = billingOptions.find((opt) => opt.id === selectedCycle) || billingOptions[3];

  const handleSaveSubscription = async () => {
    if (!activeSchool) return;
    setIsSaving(true);
    setIsSuccess(false);

    try {
      const res = await updateSchool(activeSchool.id, {
        ...(activeSchool as any),
        billingCycle: selectedCycle,
        subscriptionPlan: 'Premium',
      });

      if (res.success) {
        setIsSuccess(true);
        addToast(
          tr(
            `School subscription updated to Ileys Pro (${activeOption.nameEn})!`,
            `Diiwaanka bixinta Ileys Pro waxaa loo beddelay (${activeOption.nameSo})!`
          ),
          'success'
        );
        if (onPlanChanged) onPlanChanged(selectedCycle);
        setTimeout(() => setIsSuccess(false), 4000);
      } else {
        addToast(res.error || 'Failed to update subscription', 'error');
      }
    } catch {
      addToast('An error occurred while saving billing settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadInvoice = (invNum: string, amount: number) => {
    addToast(
      tr(
        `Official Receipt #${invNum} ($${amount}) downloaded successfully!`,
        `Rasiidka rasmiga ah #${invNum} ($${amount}) si guul leh ayaa loo soo dejiyay!`
      ),
      'info'
    );
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 border shadow-xs space-y-8 font-sans animate-fade-in card-theme">
      
      {/* ========================================================================= */}
      {/* 1. HEADER: Subscription Status & Title                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {tr('Ileys Pro Subscription & Billing', 'Diiwaanka Lacag-bixinta & Ileys Pro')}
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tr('Active Pro Plan', 'Qorshaha Pro')}</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm subtext-theme">
            {tr(
              'Select your preferred payment schedule between Monthly ($25), 3-Month, 6-Month, and Annual options.',
              'Dooro xilliga lacag-bixinta ee ku habboon: Bille ($25), 3 Bilood, 6 Bilood, ama Sannadle.'
            )}
          </p>
        </div>

        {isSuccess && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{tr('Billing schedule updated!', 'Jadwalka lacagta waa la cusboonaysiiyay!')}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. INSTITUTIONAL TIER OVERVIEW CARD                                       */}
      {/* ========================================================================= */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#122E52] text-white border border-[#1E3A63] shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-[#F7A914]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#F7A914] font-bold">
              <span>{tr('Active Institution', 'Dugsiga')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-white font-black">{activeSchool?.name || 'Amiir nuur Secondary School'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#F7A914]">{activeSchool?.code || 'GH-001'}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Ileys Pro Operating System</span>
            </h3>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {tr(
                'Full multi-role cloud suite: Principal School Oversight, Teacher Gradebook & Attendance, and Student Portal with automated rankings.',
                'Nidaamka maamulka dugsiyada oo dhammaystiran: Maamulaha dugsiga, Macallinka, iyo Ardayda.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0 min-w-[170px]">
            <span className="text-[10px] uppercase font-bold text-[#F7A914] block">
              {tr('Selected Rate', 'Qiimaha')}
            </span>
            <div className="text-3xl font-black text-white mt-0.5">
              ${activeOption.totalAmount}
            </div>
            <span className="text-xs text-slate-300 block font-medium">
              {tr(activeOption.billingPeriodEn, activeOption.billingPeriodSo)}
            </span>
            {activeOption.savingsEn && (
              <span className="text-[10px] font-bold text-emerald-300 block mt-1">
                {tr(activeOption.savingsEn, activeOption.savingsSo || '')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BILLING CYCLE SELECTOR: RADIO GROUP & BUTTON GROUP OPTIONS             */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#122E52] dark:text-[#F7A914] block">
              {tr('Billing Cycle Options', 'Xilliyada Lacag-bixinta')}
            </span>
            <h3 className="text-base sm:text-lg font-black">
              {tr('Select Pro Plan Billing Cycle', 'Dooro Jadwalka Lacag-bixinta ee Pro')}
            </h3>
          </div>

          {/* Layout presentation mode toggle: Cards vs Segmented Group */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setSelectionLayout('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectionLayout === 'cards'
                  ? 'bg-white dark:bg-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              
            >
              <Radio className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>{tr('Radio Cards', 'Kaararka')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectionLayout('segmented')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectionLayout === 'segmented'
                  ? 'bg-white dark:bg-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              
            >
              <Sliders className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>{tr('Button Group', 'Xulasho Degdeg')}</span>
            </button>
          </div>
        </div>

        {/* --- VIEW MODE A: HORIZONTAL SEGMENTED BUTTON GROUP --- */}
        {selectionLayout === 'segmented' && (
          <div
            role="radiogroup"
            aria-label={tr('Pro Billing Cycle Selection', 'Doorashada Qorshaha Pro')}
            className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
          >
            {billingOptions.map((opt) => {
              const isSelected = selectedCycle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedCycle(opt.id)}
                  className={`p-4 rounded-xl text-left transition-all relative border flex flex-col justify-between gap-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#F7A914]/30 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-[#122E52] shadow-md ring-2 ring-[#F7A914]/30'
                      : 'bg-white/60 dark:bg-slate-900/40 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black">
                      {tr(opt.nameEn, opt.nameSo)}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#122E52] bg-[#122E52] text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black">
                        ${opt.totalAmount}
                      </span>
                      <span className="text-xs font-semibold subtext-theme">
                        {opt.id === 'monthly' ? '/ mo' : `/${opt.id === 'yearly' ? 'yr' : 'cycle'}`}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] mt-0.5">
                      ${opt.monthlyEquivalent.toFixed(2)} / {tr('month', 'bishii')}
                    </div>
                  </div>

                  {opt.badgeEn && (
                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      {tr(opt.badgeEn, opt.badgeSo || '')}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* --- VIEW MODE B: DETAILED RADIO CARD GRID --- */}
        {selectionLayout === 'cards' && (
          <div
            role="radiogroup"
            aria-label={tr('Pro Billing Cycle Options', 'Qorshayaasha Lacag-bixinta ee Pro')}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {billingOptions.map((opt) => {
              const isSelected = selectedCycle === opt.id;

              return (
                <label
                  key={opt.id}
                  onClick={() => setSelectedCycle(opt.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 relative select-none ${
                    isSelected
                      ? 'bg-[#EFF6FF]/70 dark:bg-[#1E3A63] border-[#122E52] shadow-md ring-2 ring-[#F7A914]/20 scale-101'
                      : 'card-theme border-slate-200 dark:border-slate-800 hover:border-[#1E3A63] dark:hover:border-[#122E52]/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="pro-billing-cycle"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => setSelectedCycle(opt.id)}
                    className="sr-only"
                    aria-checked={isSelected}
                  />

                  {opt.badgeEn && (
                    <div className="absolute -top-3 right-4">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs ${
                          isSelected
                            ? 'bg-[#122E52] text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {tr(opt.badgeEn, opt.badgeSo || '')}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black">
                        {tr(opt.nameEn, opt.nameSo)}
                      </span>

                      {/* Custom Theme Radio Indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[#122E52] bg-[#122E52] text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">
                          ${opt.totalAmount}
                        </span>
                        <span className="text-xs font-bold subtext-theme">
                          {opt.id === 'monthly' ? '/ mo' : `/${opt.id === 'yearly' ? 'yr' : 'cycle'}`}
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                        ${opt.monthlyEquivalent.toFixed(2)} / {tr('month equivalent', 'bishii')}
                      </div>
                    </div>

                    <p className="text-xs subtext-theme leading-relaxed pt-1">
                      {tr(opt.descriptionEn, opt.descriptionSo)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div
                      className={`w-full py-2 rounded-xl font-bold text-xs text-center transition-all ${
                        isSelected
                          ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? tr('Selected Schedule', 'La Doortay') : tr('Choose Option', 'Dooro')}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. INSTITUTIONAL PAYMENT METHOD & CONFIRMATION                             */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-5">
        <div>
          <h4 className="text-sm font-black">
            {tr('Primary Institutional Payment Method', 'Habka Lacag-bixinta ee Dugsiga')}
          </h4>
          <p className="text-xs subtext-theme mt-0.5">
            {tr(
              'Select how your institution processes subscription renewals and invoices.',
              'Dooro sida dugsigu u bixinayo adeegga Ileys Pro.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('mobile_money')}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              paymentMethod === 'mobile_money'
                ? 'bg-white dark:bg-slate-900 border-[#122E52] shadow-xs ring-1 ring-[#F7A914]/30'
                : 'bg-white/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">
                Mobile Money (EVC / Zaad / Sahal)
              </span>
              <span className="text-[11px] subtext-theme">
                Instant confirmation via Somali telecom networks
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('bank_transfer')}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              paymentMethod === 'bank_transfer'
                ? 'bg-white dark:bg-slate-900 border-[#122E52] shadow-xs ring-1 ring-[#F7A914]/30'
                : 'bg-white/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">
                Bank Deposit / Wire
              </span>
              <span className="text-[11px] subtext-theme">
                Direct institutional deposit to Premier / Dahabshiil
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              paymentMethod === 'card'
                ? 'bg-white dark:bg-slate-900 border-[#122E52] shadow-xs ring-1 ring-[#F7A914]/30'
                : 'bg-white/70 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">
                Credit / Debit Card
              </span>
              <span className="text-[11px] subtext-theme">
                Visa / MasterCard automated cloud billing
              </span>
            </div>
          </button>
        </div>

        {paymentMethod === 'mobile_money' && (
          <div className="space-y-1.5 max-w-md pt-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {tr('Authorized Mobile Money Contact Number', 'Lambarka Mobaylka ee Xisaabta')}
            </label>
            <input
              type="text"
              value={mobileMoneyNumber}
              onChange={(e) => setMobileMoneyNumber(e.target.value)}
              placeholder="e.g. 252 61 584 9201"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
             
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs subtext-theme">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {tr(
                'Changes apply immediately to your active school tenant with zero service interruption.',
                'Isbeddeladu waxay si toos ah u dhaqangelayaan adigoon wax shaqo ah kala goyn.'
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveSubscription}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-98"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{tr('Saving Schedule...', 'Waa la keydinayaa...')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{tr('Save Subscription Schedule', 'Keydi Qorshaha Bixinta')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. OFFICIAL INVOICING & RECEIPTS LEDGER                                    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-black">
            {tr('Official Tax Invoices & Payment Receipts', 'Rasiidhada Rasmiga ah ee Dugsiga')}
          </h4>
          <p className="text-xs subtext-theme mt-0.5">
            {tr('Download verified PDF statements for institutional auditing and accounting.', 'Soo deji rasiidhada rasmiga ah ee xisaab-xidhka dugsiga.')}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 font-extrabold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">{tr('Invoice / Receipt #', 'Tixraaca Rasiidka')}</th>
                <th className="py-3 px-4">{tr('Date', 'Taariikhda')}</th>
                <th className="py-3 px-4">{tr('Plan & Period', 'Qorshaha')}</th>
                <th className="py-3 px-4">{tr('Amount', 'Lacagta')}</th>
                <th className="py-3 px-4">{tr('Status', 'Xaaladda')}</th>
                <th className="py-3 px-4 text-right">{tr('Download Receipt', 'Soo Dejiso')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { id: 'INV-2026-09', date: 'Oct 01, 2026', period: 'Pro Yearly ($270/yr)', amount: 270, status: 'Paid' },
                { id: 'INV-2025-09', date: 'Oct 01, 2025', period: 'Pro Yearly ($270/yr)', amount: 270, status: 'Paid' },
                { id: 'INV-2024-09', date: 'Oct 01, 2024', period: 'Pro Yearly ($270/yr)', amount: 270, status: 'Paid' },
              ].map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                    {inv.id}
                  </td>
                  <td className="py-3 px-4 font-medium subtext-theme">{inv.date}</td>
                  <td className="py-3 px-4 font-semibold">{inv.period}</td>
                  <td className="py-3 px-4 font-black">${inv.amount}.00</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv.id, inv.amount)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-[#EFF6FF] dark:hover:bg-[#0B1B32] text-[#3B82F6] dark:text-[#60A5FA] font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
