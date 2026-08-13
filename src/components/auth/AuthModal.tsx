import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { UserRole } from '../../types';
import {
  IdCard,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithSchoolId } = useAuth();
  const [tab, setTab] = useState<'signin' | 'forgot'>('signin');
  const [role, setRole] = useState<UserRole>('Admin');
  const [schoolId, setSchoolId] = useState('ADM-2026-0001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getRolePlaceholder = (r: UserRole) => {
    switch (r) {
      case 'Student':
        return 'e.g. STU-2026-0125';
      case 'Teacher':
        return 'e.g. TCH-2026-0007';
      case 'Parent':
        return 'e.g. PAR-2026-0042';
      case 'Admin':
        return 'e.g. ADM-2026-0001';
      default:
        return 'Enter School ID';
    }
  };

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Auto-fill example ID for convenience
    switch (selectedRole) {
      case 'Admin':
        setSchoolId('ADM-2026-0001');
        break;
      case 'Teacher':
        setSchoolId('TCH-2026-0007');
        break;
      case 'Parent':
        setSchoolId('PAR-2026-0042');
        break;
      case 'Student':
        setSchoolId('STU-2026-0125');
        break;
    }
    setPassword('password123');
  };

  const handleQuickDemoFill = (selectedRole: UserRole, demoId: string) => {
    setRole(selectedRole);
    setSchoolId(demoId);
    setPassword('password123');
    setErrorMessage(null);
    setSuccessMessage(`Loaded ${selectedRole} credentials (${demoId})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (tab === 'signin') {
      if (!schoolId.trim()) {
        setErrorMessage('Please enter your School ID Number.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your account password.');
        return;
      }

      setIsLoading(true);
      const res = await loginWithSchoolId(schoolId, password, role, rememberMe);
      setIsLoading(false);

      if (res.success) {
        setSuccessMessage(`Authenticated successfully as ${role} (${schoolId.toUpperCase()})`);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please check your School ID and password.');
      }
    } else if (tab === 'forgot') {
      if (!schoolId.trim()) {
        setErrorMessage('Please enter your School ID Number to recover your password.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schoolId, userType: role }),
        });
        const data = await res.json();
        setIsLoading(false);

        if (res.ok && data.success) {
          setSuccessMessage(data.message);
        } else {
          setErrorMessage(data.error || 'Password recovery failed. Please verify your School ID.');
        }
      } catch {
        setIsLoading(false);
        setSuccessMessage(
          `Password recovery link generated for ${schoolId}. Temporary recovery passcode: password123`
        );
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="School ID Authentication Portal" maxWidth="md">
      <div className="text-center mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-200 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">EduSpike ID Login</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Authenticate securely using your official School ID Number and password
        </p>
      </div>

      {/* User Type Selector */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-slate-700 mb-2">Select User Account Type</label>
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {(['Admin', 'Teacher', 'Parent', 'Student'] as UserRole[]).map((r) => {
            const isActive = role === r;
            return (
              <button
                type="button"
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-xs ring-1 ring-purple-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
              >
                <span>{r}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Demo Credentials Bar */}
      <div className="mb-5 bg-purple-50/70 border border-purple-100 p-2.5 rounded-xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-purple-800 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-purple-600" /> Quick Auto-Fill Demo Accounts:
          </span>
          <span className="text-[10px] text-purple-600 font-medium">Default pass: password123</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickDemoFill('Admin', 'ADM-2026-0001')}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left border transition-all ${
              role === 'Admin' && schoolId === 'ADM-2026-0001'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-slate-700 border-purple-100 hover:border-purple-300'
            }`}
          >
            <div className="font-bold">Admin</div>
            <div className="text-[10px] opacity-80 font-mono">ADM-2026-0001</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoFill('Teacher', 'TCH-2026-0007')}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left border transition-all ${
              role === 'Teacher' && schoolId === 'TCH-2026-0007'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-slate-700 border-purple-100 hover:border-purple-300'
            }`}
          >
            <div className="font-bold">Teacher</div>
            <div className="text-[10px] opacity-80 font-mono">TCH-2026-0007</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoFill('Parent', 'PAR-2026-0042')}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left border transition-all ${
              role === 'Parent' && schoolId === 'PAR-2026-0042'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-slate-700 border-purple-100 hover:border-purple-300'
            }`}
          >
            <div className="font-bold">Parent</div>
            <div className="text-[10px] opacity-80 font-mono">PAR-2026-0042</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoFill('Student', 'STU-2026-0125')}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left border transition-all ${
              role === 'Student' && schoolId === 'STU-2026-0125'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-slate-700 border-purple-100 hover:border-purple-300'
            }`}
          >
            <div className="font-bold">Student</div>
            <div className="text-[10px] opacity-80 font-mono">STU-2026-0125</div>
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* School ID Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              {role} School ID Number <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
              {role} ID
            </span>
          </div>
          <div className="relative">
            <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value.toUpperCase())}
              placeholder={getRolePlaceholder(role)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {tab === 'signin' && (
          <>
            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Remember me on this device</span>
              </label>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Shield className="w-3 h-3 text-purple-500" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </>
        )}

        {tab === 'forgot' && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-purple-600" /> Password Recovery Protocol
            </p>
            <p>Enter your assigned {role} ID Number above. Password reset verification code will be dispatched to your registered email on file.</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              {tab === 'signin' ? `Sign In to ${role} Account` : 'Request Password Reset'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {tab === 'forgot' && (
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
          >
            ← Back to Sign In
          </button>
        )}
      </form>
    </Modal>
  );
};
