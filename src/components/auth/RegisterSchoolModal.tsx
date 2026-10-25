import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  Building2,
  X,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface RegisterSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterSchoolModal: React.FC<RegisterSchoolModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { registerSchoolTenant } = useAuth();
  const { addToast } = useSchoolData();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: School Information
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [motto, setMotto] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  // Step 2: Principal Administrator Credentials
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('password123');
  const [ownerDesignation, setOwnerDesignation] = useState('Principal Administrator');

  if (!isOpen) return null;

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!schoolName.trim() || !schoolCode.trim()) {
        setError('Please provide both the School Name and unique School Code.');
        return;
      }
      if (schoolCode.trim().length < 2) {
        setError('School Code should be at least 2 alphanumeric characters (e.g. OAK, WCA, BKP).');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!ownerName.trim() || !ownerEmail.trim() || !ownerPassword.trim()) {
        setError('Please complete all Principal Administrator account fields.');
        return;
      }
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    const res = await registerSchoolTenant(
      {
        name: schoolName.trim(),
        code: schoolCode.trim().toUpperCase(),
        motto: motto.trim() || 'Inspiring Knowledge and Character',
        address: address.trim() || 'Main Campus, Educational District',
        phone: phone.trim() || '+1 (555) 234-5678',
        email: email.trim() || ownerEmail.trim(),
        academicYear,
      },
      {
        name: ownerName.trim(),
        email: ownerEmail.trim(),
        password: ownerPassword,
        designation: ownerDesignation || 'Principal Administrator',
      }
    );

    setLoading(false);

    if (res.success && res.school) {
      addToast(`Successfully registered "${res.school.name}"! Logged in as Principal.`, 'success');
      setStep(3);
    } else {
      setError(res.error || 'Failed to register school. Please check your information.');
    }
  };

  const handleComplete = () => {
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#122E52] text-[#F7A914] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Register New School Tenant</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step {step} of 3 • {step === 1 ? 'School Information' : step === 2 ? 'Principal Administrator' : 'Provisioning Complete'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official School Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. St. Jude International Preparatory"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Code (Prefix) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SJI, WCA"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-[#3B82F6] dark:text-[#60A5FA] focus:ring-2 focus:ring-[#3B82F6]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    placeholder="2025-2026"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School Motto / Slogan
                </label>
                <input
                  type="text"
                  placeholder="e.g. Truth, Wisdom & Leadership"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 987-6543"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 Knowledge Way, San Francisco, CA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#122E52]/30 border border-slate-200 dark:border-[#1E3A63] flex items-center gap-3 text-xs text-[#12233F] dark:text-slate-200">
                <ShieldCheck className="w-5 h-5 text-[#3B82F6] dark:text-[#60A5FA] shrink-0" />
                <span>
                  This account will be provisioned as the school's <strong>Principal Administrator</strong> with leadership authority over{' '}
                  <strong>{schoolName}</strong>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Principal Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Arthur Pendelton"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Principal Email Address *
                </label>
                <input
                  type="email"
                  placeholder="principal@school.edu"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Principal Password *
                  </label>
                  <input
                    type="password"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={ownerDesignation}
                    onChange={(e) => setOwnerDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  School Tenant Registered Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  <strong>{schoolName}</strong> ({schoolCode}) has been isolated and activated. You are now logged in as{' '}
                  <strong>{ownerName}</strong> (Principal).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">School Code:</span>
                  <span className="font-mono font-bold text-[#3B82F6]">{schoolCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal Email:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{ownerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Isolation:</span>
                  <span className="font-bold text-emerald-600">Active Tenant Scope</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          {step === 1 && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="btn-gold ml-auto"
            >
              {loading ? (
                <span>Provisioning Tenant...</span>
              ) : step === 1 ? (
                <>
                  <span>Next: Principal Details</span> <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Complete Registration</span> <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer shadow-md"
            >
              Launch School Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
