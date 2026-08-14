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
  KeyRound,
  Check,
  Mail,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithSchoolId } = useAuth();
  const [tab, setTab] = useState<'signin' | 'forgot' | 'reset'>('signin');
  const [role, setRole] = useState<UserRole>('Admin');
  const [schoolId, setSchoolId] = useState('ADM-2026-0001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Password Reset Specific State
  const [resetIdentifier, setResetIdentifier] = useState('ADM-2026-0001');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live Password Strength Checker
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;
  const getStrengthLabel = () => {
    if (strengthScore === 0) return { text: 'None', color: 'bg-slate-200 dark:bg-slate-700 text-slate-500' };
    if (strengthScore <= 2) return { text: 'Weak', color: 'bg-rose-500 text-rose-500' };
    if (strengthScore === 3) return { text: 'Moderate', color: 'bg-amber-500 text-amber-500' };
    return { text: 'Strong', color: 'bg-emerald-500 text-emerald-500' };
  };

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
        setResetIdentifier('ADM-2026-0001');
        break;
      case 'Teacher':
        setSchoolId('TCH-2026-0007');
        setResetIdentifier('TCH-2026-0007');
        break;
      case 'Parent':
        setSchoolId('PAR-2026-0042');
        setResetIdentifier('PAR-2026-0042');
        break;
      case 'Student':
        setSchoolId('STU-2026-0125');
        setResetIdentifier('STU-2026-0125');
        break;
    }
    setPassword('password123');
  };

  const handleQuickDemoFill = (selectedRole: UserRole, demoId: string) => {
    setRole(selectedRole);
    setSchoolId(demoId);
    setResetIdentifier(demoId);
    setPassword('password123');
    setErrorMessage(null);
    setSuccessMessage(`Loaded ${selectedRole} credentials (${demoId})`);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
      }, 700);
    } else {
      setErrorMessage(res.error || 'Invalid credentials. Please check your School ID and password.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!resetIdentifier.trim()) {
      setErrorMessage('Please enter your registered School ID Number or Email Address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resetIdentifier, userType: role }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        // Advance to reset password tab
        setTimeout(() => {
          setTab('reset');
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Unable to process reset request. Please try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Failed to connect to authentication server. Please retry.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!resetToken.trim()) {
      setErrorMessage('Please provide the security reset token sent to your email.');
      return;
    }

    if (strengthScore < 3) {
      setErrorMessage('Please choose a stronger password matching all security criteria.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and password confirmation do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,
          identifier: resetIdentifier,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        setPassword(newPassword);
        setSchoolId(resetIdentifier);
        setTimeout(() => {
          setTab('signin');
          setNewPassword('');
          setConfirmPassword('');
          setResetToken('');
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Password reset failed. Token may be invalid or expired.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Failed to reset password. Please retry.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="School ID Authentication Portal" maxWidth="md">
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-500/20 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {tab === 'signin' && 'EduSpike ID Login'}
          {tab === 'forgot' && 'Account Password Recovery'}
          {tab === 'reset' && 'Create New Password'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {tab === 'signin' && 'Authenticate securely using your official School ID Number and password'}
          {tab === 'forgot' && 'Request a secure single-use recovery token for your registered account'}
          {tab === 'reset' && 'Set a new cryptographic password compliant with institution security policies'}
        </p>
      </div>

      {/* User Type Selector (Only on signin and forgot) */}
      {tab !== 'reset' && (
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Select User Account Type
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['Admin', 'Teacher', 'Parent', 'Student'] as UserRole[]).map((r) => {
              const isActive = role === r;
              return (
                <button
                  type="button"
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-purple-200 dark:ring-purple-800'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{r}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Demo Credentials Bar (Sign In Only) */}
      {tab === 'signin' && (
        <div className="mb-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 p-2.5 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Quick Auto-Fill Demo Accounts:
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Default: password123</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('Admin', 'ADM-2026-0001')}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left border transition-all ${
                role === 'Admin' && schoolId === 'ADM-2026-0001'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-purple-100 dark:border-slate-700 hover:border-purple-300'
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
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-purple-100 dark:border-slate-700 hover:border-purple-300'
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
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-purple-100 dark:border-slate-700 hover:border-purple-300'
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
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-purple-100 dark:border-slate-700 hover:border-purple-300'
              }`}
            >
              <div className="font-bold">Student</div>
              <div className="text-[10px] opacity-80 font-mono">STU-2026-0125</div>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. SIGN IN FORM */}
      {tab === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {role} School ID Number <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
                {role} ID
              </span>
            </div>
            <div className="relative">
              <IdCard className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value.toUpperCase())}
                placeholder={getRolePlaceholder(role)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 uppercase focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setTab('forgot');
                  setResetIdentifier(schoolId);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500"
              />
              <span>Remember me on this device</span>
            </label>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              <span>TLS / RLS Protected</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to {role} Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* 2. FORGOT PASSWORD REQUEST FORM */}
      {tab === 'forgot' && (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="p-3 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Password Recovery Link
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Enter your registered School ID or email address below. We will send a secure single-use recovery code.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registered School ID or Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                placeholder="e.g. ADM-2026-0001 or admin@eduspike.edu"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Security Token...</span>
              </>
            ) : (
              <>
                <span>Send Password Reset Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              ← Back to Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('reset');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Have a reset token? Enter here →
            </button>
          </div>
        </form>
      )}

      {/* 3. RESET PASSWORD FORM WITH STRENGTH VALIDATION */}
      {tab === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Security Reset Token <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                placeholder="e.g. RST-482910"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 uppercase focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 dark:focus:border-purple-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Real-time Password Strength Criteria */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 dark:text-slate-300">Password Strength:</span>
              <span className={`font-bold ${getStrengthLabel().color}`}>{getStrengthLabel().text}</span>
            </div>
            {/* Progress Bars */}
            <div className="grid grid-cols-4 gap-1 h-1.5">
              <div className={`rounded-full transition-all ${strengthScore >= 1 ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              <div className={`rounded-full transition-all ${strengthScore >= 2 ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              <div className={`rounded-full transition-all ${strengthScore >= 3 ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              <div className={`rounded-full transition-all ${strengthScore >= 4 ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
            </div>
            {/* Checklist */}
            <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
              <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                <Check className={`w-3 h-3 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} /> At least 8 characters
              </span>
              <span className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                <Check className={`w-3 h-3 ${hasUppercase ? 'opacity-100' : 'opacity-30'}`} /> 1+ Uppercase (A-Z)
              </span>
              <span className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                <Check className={`w-3 h-3 ${hasLowercase ? 'opacity-100' : 'opacity-30'}`} /> 1+ Lowercase (a-z)
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                <Check className={`w-3 h-3 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} /> 1+ Number (0-9)
              </span>
            </div>
            {confirmPassword && (
              <div className="pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px]">
                <span className={`flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500'}`}>
                  <Check className={`w-3 h-3 ${passwordsMatch ? 'opacity-100' : 'opacity-30'}`} /> Passwords Match
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || strengthScore < 3 || !passwordsMatch}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating Credentials...</span>
              </>
            ) : (
              <>
                <span>Set New Password & Invalidate Old</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="w-full text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1"
          >
            ← Back to Sign In
          </button>
        </form>
      )}
    </Modal>
  );
};

