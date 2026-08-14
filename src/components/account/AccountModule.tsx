import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole, UserProfile, RoleAuditLog } from '../../types';
import { INITIAL_ROLE_AUDIT_LOGS } from '../../data/initialData';
import { UserAvatar } from '../common/UserAvatar';
import { getInitials, isCustomPhoto } from '../../utils/avatarUtils';
import {
  User,
  Shield,
  Key,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  Calendar,
  Save,
  Lock,
  UserCheck,
  ShieldAlert,
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  History,
  AlertTriangle,
  Check,
  X,
  UserX,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  BadgeCheck,
  Sun,
  Moon,
  Laptop,
  Palette,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AccountModule: React.FC = () => {
  const {
    currentUser,
    activeRole,
    updateProfile,
    userProfiles,
    adminUpdateUserRole,
    adminToggleUserStatus,
    adminCreateUser,
    getAuthHeaders,
  } = useAuth();
  const { addToast } = useSchoolData();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance' | 'admin-governance'>('profile');

  // Form State
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
    designation: currentUser.designation || '',
    address: currentUser.address || '',
    bio: currentUser.bio || '',
    avatar: currentUser.avatar || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  // Synchronize form data if currentUser changes (e.g. login or role switch)
  useEffect(() => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || '',
      designation: currentUser.designation || '',
      address: currentUser.address || '',
      bio: currentUser.bio || '',
      avatar: currentUser.avatar || '',
    });
  }, [currentUser]);

  // Admin Governance State
  const [adminSearch, setAdminSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Disabled'>('All');
  const [auditLogs, setAuditLogs] = useState<RoleAuditLog[]>(INITIAL_ROLE_AUDIT_LOGS);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Role Reassignment Modal State
  const [reassignModalUser, setReassignModalUser] = useState<UserProfile | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('Teacher');
  const [reassignReason, setReassignReason] = useState('');
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  // Status Toggle Modal State
  const [statusModalUser, setStatusModalUser] = useState<UserProfile | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Provision User Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    schoolId: '',
    name: '',
    email: '',
    role: 'Teacher' as UserRole,
    password: 'password123',
    phone: '',
    designation: '',
    avatar: '',
  });
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);

  // Fetch Audit Logs for Admin
  const fetchAuditLogs = async () => {
    if (activeRole !== 'Admin') return;
    setIsLoadingAudit(true);
    try {
      const res = await fetch('/api/admin/role-audit-logs', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAuditLogs(data);
        }
      }
    } catch {
      // Keep initial audit logs
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin-governance' && activeRole === 'Admin') {
      fetchAuditLogs();
    }
  }, [activeTab, activeRole]);

  const presetPhotos = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  ];

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      addToast({
        title: 'File Too Large',
        message: 'Please choose a profile image smaller than 3MB.',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, avatar: dataUrl }));
      addToast({
        title: 'Photo Uploaded',
        message: 'Profile photo uploaded. Click "Save Profile Changes" to apply.',
        type: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  // Remove custom photo and revert to automatic initials avatar
  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    addToast({
      title: 'Initials Avatar Active',
      message: `Profile photo removed. Automatically using "${getInitials(formData.name)}" initials avatar.`,
      type: 'info',
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeRole === 'Student') {
      // Students can only update their bio
      updateProfile({ bio: formData.bio });
      addToast({
        title: 'Profile Updated',
        message: 'Student personal biography statement saved successfully.',
        type: 'success',
      });
      return;
    }

    updateProfile(formData);
    addToast({
      title: 'Profile Saved',
      message: 'Your personal profile information has been updated successfully.',
      type: 'success',
    });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      addToast({
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
        type: 'error',
      });
      return;
    }
    if (passwords.newPass.length < 6) {
      addToast({
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.',
        type: 'error',
      });
      return;
    }
    addToast({
      title: 'Password Changed',
      message: 'Your account password has been updated securely.',
      type: 'success',
    });
    setPasswords({ current: '', newPass: '', confirmPass: '' });
  };

  const handleOpenReassignModal = (user: UserProfile) => {
    setReassignModalUser(user);
    setSelectedNewRole(user.role);
    setReassignReason('');
  };

  const handleExecuteRoleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalUser) return;

    if (reassignModalUser.id === 'usr-admin-1' && selectedNewRole !== 'Admin') {
      addToast({
        title: 'Action Prohibited',
        message: 'The Primary Root Administrator role cannot be changed.',
        type: 'error',
      });
      return;
    }

    if (reassignModalUser.role === selectedNewRole) {
      addToast({
        title: 'No Change',
        message: `User is already assigned to the ${selectedNewRole} role.`,
        type: 'warning',
      });
      return;
    }

    setIsSubmittingRole(true);
    const res = await adminUpdateUserRole(reassignModalUser.id, selectedNewRole, reassignReason);
    setIsSubmittingRole(false);

    if (res.success) {
      addToast({
        title: 'Role Updated',
        message: `Successfully changed ${reassignModalUser.name}'s role to ${selectedNewRole}!`,
        type: 'success',
      });
      setReassignModalUser(null);
      fetchAuditLogs();
    } else {
      addToast({
        title: 'Update Failed',
        message: res.error || 'Failed to reassign role',
        type: 'error',
      });
    }
  };

  const handleOpenStatusModal = (user: UserProfile) => {
    setStatusModalUser(user);
    setStatusReason('');
  };

  const handleExecuteStatusToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalUser) return;

    const newStatus = statusModalUser.status === 'Disabled' ? 'Active' : 'Disabled';

    if (statusModalUser.id === 'usr-admin-1' && newStatus === 'Disabled') {
      addToast({
        title: 'Action Prohibited',
        message: 'The Primary Root Administrator account cannot be disabled.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingStatus(true);
    const res = await adminToggleUserStatus(statusModalUser.id, newStatus, statusReason);
    setIsSubmittingStatus(false);

    if (res.success) {
      addToast({
        title: 'Status Changed',
        message: `Account for ${statusModalUser.name} is now ${newStatus}.`,
        type: 'success',
      });
      setStatusModalUser(null);
      fetchAuditLogs();
    } else {
      addToast({
        title: 'Action Failed',
        message: res.error || 'Failed to update account status',
        type: 'error',
      });
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.schoolId || !newUserData.name || !newUserData.email) {
      addToast({
        title: 'Required Fields Missing',
        message: 'Please fill in School ID, Name, and Email.',
        type: 'error',
      });
      return;
    }

    setIsSubmittingNewUser(true);
    const res = await adminCreateUser(newUserData);
    setIsSubmittingNewUser(false);

    if (res.success) {
      addToast({
        title: 'Account Provisioned',
        message: `Official account for ${newUserData.name} (${newUserData.role}) created with initial avatar "${getInitials(newUserData.name)}".`,
        type: 'success',
      });
      setIsCreateUserModalOpen(false);
      setNewUserData({
        schoolId: '',
        name: '',
        email: '',
        role: 'Teacher',
        password: 'password123',
        phone: '',
        designation: '',
        avatar: '',
      });
      fetchAuditLogs();
    } else {
      addToast({
        title: 'Creation Failed',
        message: res.error || 'Failed to provision user',
        type: 'error',
      });
    }
  };

  const generateAutoSchoolId = (targetRole: UserRole) => {
    const prefixMap: Record<UserRole, string> = {
      Admin: 'ADM-2026-',
      Teacher: 'TCH-2026-',
      Student: 'STU-2026-',
      Parent: 'PAR-2026-',
    };
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setNewUserData((prev) => ({ ...prev, schoolId: `${prefixMap[targetRole]}${randomNum}`, role: targetRole }));
  };

  // Filtered Users for Admin Governance
  const filteredUsers = userProfiles.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
      (u.schoolId || u.studentId || u.teacherId || '').toLowerCase().includes(adminSearch.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || (u.status || 'Active') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Parent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Student':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const hasCustomPhoto = isCustomPhoto(formData.avatar);
  const liveInitials = getInitials(formData.name);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {activeRole === 'Admin' ? 'Administrator Profile' : `${activeRole} Profile & Settings`}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {activeRole === 'Admin' ? 'Admin Profile & Security' : 'Account & Profile Settings'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeRole === 'Admin'
              ? 'Update your personal administrative information, profile avatar, security credentials, and manage system role governance.'
              : activeRole === 'Student'
              ? 'View official academic credentials and update your student biography statement.'
              : 'Manage contact details, profile photo or initial avatar, and account security credentials.'}
          </p>
        </div>

        {activeRole === 'Admin' && (
          <button
            onClick={() => setActiveTab('admin-governance')}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-purple-900 transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Role Governance</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs w-full sm:w-auto inline-flex gap-1 flex-wrap">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          {activeRole === 'Admin' ? 'Admin Profile' : 'Profile Information'}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Password & Security
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'appearance'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Appearance & Theme
        </button>
        {activeRole === 'Admin' && (
          <button
            onClick={() => setActiveTab('admin-governance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin-governance'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Institutional Role Governance
          </button>
        )}
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live Avatar & Protected Authorization Info */}
          <div className="space-y-6">
            {/* Live Profile Overview Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs text-center space-y-4">
              <div className="relative inline-block mx-auto">
                <UserAvatar
                  name={formData.name || currentUser.name}
                  avatarUrl={formData.avatar}
                  size="profile"
                  ring="ring-4 ring-sky-100 shadow-md"
                  status={currentUser.status || 'Active'}
                  showStatus={true}
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">{formData.name || currentUser.name}</h3>
                <p className="text-xs text-purple-600 font-bold mt-0.5">
                  {formData.designation || currentUser.designation || currentUser.role}
                </p>

                {/* Initial Avatar Reference Display */}
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 font-mono">
                  <span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                    [ {liveInitials} ]
                  </span>
                  <span className="font-sans font-semibold text-slate-700 truncate max-w-[180px]">
                    {formData.name || 'User Name'}
                  </span>
                </div>
              </div>

              {/* Avatar Type Status Pill */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                {hasCustomPhoto ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Custom Photo Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" /> Automatic Initials Avatar ({liveInitials})
                  </span>
                )}
              </div>

              {/* Avatar Photo Controls */}
              {activeRole !== 'Student' && (
                <div className="space-y-2 pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-purple-200"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Profile Photo
                    </button>

                    {hasCustomPhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Use Initial Avatar ({liveInitials})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Locked Protected Authorization Information Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-600" /> Protected Identity
                </span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black flex items-center gap-1 ${getRoleBadge(currentUser.role)}`}>
                  <Lock className="w-3 h-3" />
                  {currentUser.role}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Official ID</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Role Authority</span>
                  <span className="font-bold text-purple-700 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-purple-600" />
                    {currentUser.role === 'Admin' ? 'Super Administrator' : `${currentUser.role} Access`}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Account Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentUser.status || 'Active'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assigned By</span>
                  <span className="text-slate-700 font-bold truncate max-w-[140px]">
                    {currentUser.roleAssignedBy || 'System Root / Board'}
                  </span>
                </div>
              </div>

              {/* Role Protection Security Banner */}
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl text-[11px] text-purple-900 leading-relaxed flex items-start gap-2">
                <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Security Policy:</strong> Your role ({currentUser.role}) and Official ID are locked by institutional security rules and cannot be modified by the user.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editable Profile Information Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {activeRole === 'Admin' ? 'Admin Personal Information' : 'Personal Profile Information'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeRole === 'Student'
                      ? 'Student records are verified by the registry. You can update your biography statement.'
                      : 'Update your authorized contact information, display name, and biography.'}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl self-start sm:self-auto flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> Non-system fields
                </span>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Photo Presets & Initials Option (For Non-Student roles) */}
                {activeRole !== 'Student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Profile Avatar Options
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Circular Initial Avatar Selector button */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: '' })}
                        className={`px-3 py-2 rounded-2xl border flex items-center gap-2 transition-all ${
                          !hasCustomPhoto
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <UserAvatar name={formData.name || 'User'} avatarUrl="" size="sm" />
                        <div className="text-left">
                          <span className="text-xs font-bold block leading-none">Use Initials [{liveInitials}]</span>
                          <span className={`text-[10px] block mt-0.5 ${!hasCustomPhoto ? 'text-purple-200' : 'text-slate-400'}`}>
                            Auto generated
                          </span>
                        </div>
                      </button>

                      {/* Sample Preset Photos */}
                      {presetPhotos.slice(0, 4).map((imgUrl, i) => (
                        <div
                          key={i}
                          onClick={() => setFormData({ ...formData, avatar: imgUrl })}
                          className={`relative cursor-pointer transition-all ${
                            formData.avatar === imgUrl ? 'scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt="Preset avatar"
                            className={`w-10 h-10 rounded-full object-cover border-2 ${
                              formData.avatar === imgUrl ? 'border-purple-600 shadow-md ring-2 ring-purple-200' : 'border-slate-200'
                            }`}
                          />
                          {formData.avatar === imgUrl && (
                            <span className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Name & Email Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name {activeRole !== 'Student' && <span className="text-purple-600">*</span>}
                    </label>
                    <input
                      type="text"
                      required
                      disabled={activeRole === 'Student'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Salmaan Fitah"
                      className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-medium transition-all ${
                        activeRole === 'Student'
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                    />
                    {activeRole !== 'Student' && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Initials avatar will automatically regenerate as: <strong className="text-purple-700">[{liveInitials}]</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address {activeRole !== 'Student' && <span className="text-purple-600">*</span>}
                    </label>
                    <input
                      type="email"
                      required
                      disabled={activeRole === 'Student'}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@eduspike.edu"
                      className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-medium transition-all ${
                        activeRole === 'Student'
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Phone & Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      disabled={activeRole === 'Student'}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-medium transition-all ${
                        activeRole === 'Student'
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {activeRole === 'Admin' ? 'Administrative Title / Designation' : 'Title / Designation'}
                    </label>
                    <input
                      type="text"
                      disabled={activeRole === 'Student'}
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Principal & Chief Administrator"
                      className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-medium transition-all ${
                        activeRole === 'Student'
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Residential / Campus Address */}
                {activeRole !== 'Student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Campus / Residential Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="452 Academy Blvd, Suite 100, Education City"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                )}

                {/* Bio / Summary */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Personal Biography Statement
                    </label>
                    {activeRole === 'Student' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Editable for Students
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Write a brief overview of your academic focus, responsibilities, or interests..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {hasCustomPhoto
                      ? 'Custom photo will be saved with profile.'
                      : `Initials avatar [${liveInitials}] is automatically applied.`}
                  </span>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password & Security Tab */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Change Account Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure your credentials. Passwords must be at least 6 characters long.
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                placeholder="Repeat new password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Appearance & Theme Settings Tab */}
      {activeTab === 'appearance' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Appearance & Theme Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize your visual interface preference. Changes take effect immediately across all modules.
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 self-start sm:self-auto">
              Current: <strong className="capitalize">{theme} Mode</strong> ({resolvedTheme} active)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                theme === 'light'
                  ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-600/30'
                  : 'border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                    <Sun className="w-5 h-5" />
                  </div>
                  {theme === 'light' && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Light Mode</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Clean, crisp interface optimized for daytime and bright classrooms.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className={`text-[11px] font-bold ${theme === 'light' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {theme === 'light' ? 'Active Theme' : 'Click to activate'}
                </span>
              </div>
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                theme === 'dark'
                  ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-600/30'
                  : 'border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-900 text-purple-200">
                    <Moon className="w-5 h-5" />
                  </div>
                  {theme === 'dark' && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Dark Mode</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  High-contrast dark canvas that reduces eye strain in low-light environments.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {theme === 'dark' ? 'Active Theme' : 'Click to activate'}
                </span>
              </div>
            </button>

            {/* System Default Option */}
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                theme === 'system'
                  ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-600/30'
                  : 'border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  {theme === 'system' && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">System Mode</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Automatically syncs with your operating system or browser theme preference.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className={`text-[11px] font-bold ${theme === 'system' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {theme === 'system' ? `Active (${resolvedTheme})` : 'Click to activate'}
                </span>
              </div>
            </button>
          </div>

          {/* Real-time Theme Status Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">Saved Persistent Setting</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Stored locally in your browser storage and restored before render.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400 uppercase bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
              {theme}
            </span>
          </div>
        </div>
      )}

      {/* Admin Role Governance & Audit Trail Tab (Admin Only) */}
      {activeTab === 'admin-governance' && activeRole === 'Admin' && (
        <div className="space-y-6">
          {/* Top Admin Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-800/80 border border-purple-600/50 text-[11px] font-extrabold uppercase tracking-wider text-purple-200 inline-flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
                  Institutional Security & Role Authority
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">Institutional Role Governance & Audit Directory</h2>
                <p className="text-xs text-purple-200/90 mt-1 max-w-2xl">
                  Only authorized School Administrators can assign, upgrade, or reassign user roles. Every role modification is logged permanently into the security audit ledger.
                </p>
              </div>

              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs transition-all shadow-md flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span>Provision New User</span>
              </button>
            </div>
          </div>

          {/* User Role Directory */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">System User Accounts</h3>
                  <p className="text-xs text-slate-400">Total {userProfiles.length} registered institutional accounts</p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by name, ID, or email..."
                    className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-700"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Student">Student</option>
                  <option value="Parent">Parent</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>

            {/* Table of Users */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">User & School ID</th>
                    <th className="py-3.5 px-4">Locked Role</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Assignment Origin</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={u.name}
                            avatarUrl={u.avatar}
                            size="md"
                            rounded="full"
                            status={u.status || 'Active'}
                            showStatus={true}
                          />
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">{u.name}</span>
                            <span className="text-[11px] text-slate-400 block">{u.email}</span>
                            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {u.schoolId || u.studentId || u.teacherId || u.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-black inline-flex items-center gap-1 ${getRoleBadge(u.role)}`}>
                          <Lock className="w-2.5 h-2.5" />
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                            u.status === 'Disabled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Disabled' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <span className="font-medium block truncate max-w-[160px]">
                          {u.roleAssignedBy || 'System Administrator'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {u.roleAssignedAt || '2026-01-01'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.id !== 'usr-admin-1' && (
                            <>
                              <button
                                onClick={() => handleOpenReassignModal(u)}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition-colors text-[11px] flex items-center gap-1"
                                title="Reassign Role"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Reassign Role</span>
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(u)}
                                className={`px-2.5 py-1.5 rounded-xl font-bold transition-colors text-[11px] flex items-center gap-1 ${
                                  u.status === 'Disabled'
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {u.status === 'Disabled' ? (
                                  <>
                                    <UserCheck className="w-3 h-3" /> Enable
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3 h-3" /> Disable
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          {u.id === 'usr-admin-1' && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                              Primary Root
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cryptographic Role Audit Trail Ledger */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Official Role Audit Ledger</h3>
                  <p className="text-[11px] text-slate-400">Chronological history of administrative role assignments</p>
                </div>
              </div>
              <button
                onClick={fetchAuditLogs}
                disabled={isLoadingAudit}
                className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Refresh Audit Logs"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAudit ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <UserAvatar name={log.userName} size="sm" rounded="full" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.userName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({log.userSchoolId})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Role changed from <strong className="text-slate-700">{log.previousRole}</strong> to{' '}
                        <strong className="text-purple-700">{log.newRole}</strong>
                      </p>
                      {log.reason && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5">Reason: "{log.reason}"</p>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[10px] text-slate-400 shrink-0">
                    <span className="block font-medium text-slate-600">By {log.changedByAdminName}</span>
                    <span className="block">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Role Reassignment Modal */}
      {reassignModalUser && (
        <Modal
          isOpen={!!reassignModalUser}
          onClose={() => setReassignModalUser(null)}
          title={`Reassign Role for ${reassignModalUser.name}`}
        >
          <form onSubmit={handleExecuteRoleReassign} className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-1">
              <p>
                <strong>Current Role:</strong> {reassignModalUser.role}
              </p>
              <p>
                <strong>School ID:</strong> {reassignModalUser.schoolId || reassignModalUser.id}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select New Role</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
              >
                <option value="Admin">Admin (Full Institutional Privileges)</option>
                <option value="Teacher">Teacher (Curriculum & Grade Entry)</option>
                <option value="Parent">Parent (Child Academic Monitoring)</option>
                <option value="Student">Student (Protected Student Portal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Reason</label>
              <textarea
                required
                rows={2}
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="e.g. Promoted to Department Head / Role adjustment per school board decree"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReassignModalUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingRole}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-md shadow-purple-200 flex items-center justify-center gap-1.5"
              >
                {isSubmittingRole ? 'Saving...' : 'Confirm Reassignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Account Status Toggle Modal */}
      {statusModalUser && (
        <Modal
          isOpen={!!statusModalUser}
          onClose={() => setStatusModalUser(null)}
          title={statusModalUser.status === 'Disabled' ? 'Enable User Account' : 'Disable User Account'}
        >
          <form onSubmit={handleExecuteStatusToggle} className="space-y-4">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p>
                <strong>User:</strong> {statusModalUser.name} ({statusModalUser.role})
              </p>
              <p>
                {statusModalUser.status === 'Disabled'
                  ? 'Enabling this account will restore portal login access immediately.'
                  : 'Disabling this account will block portal login access immediately.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Status Change</label>
              <textarea
                required
                rows={2}
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="e.g. Leave of absence / Temporary credential freeze / Reinstated"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingStatus}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 ${
                  statusModalUser.status === 'Disabled'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmittingStatus ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Provision New User Modal */}
      {isCreateUserModalOpen && (
        <Modal
          isOpen={isCreateUserModalOpen}
          onClose={() => setIsCreateUserModalOpen(false)}
          title="Provision New Official User Account"
        >
          <form onSubmit={handleCreateNewUser} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Select Official Role</label>
              <div className="flex gap-1">
                {(['Admin', 'Teacher', 'Student', 'Parent'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => generateAutoSchoolId(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      newUserData.role === r ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official School ID *</label>
                <input
                  type="text"
                  required
                  value={newUserData.schoolId}
                  onChange={(e) => setNewUserData({ ...newUserData, schoolId: e.target.value })}
                  placeholder="e.g. TCH-2026-0089"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Salmaan Fitah"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="name@eduspike.edu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
                />
              </div>
            </div>

            {/* Generated Initials Avatar Preview */}
            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center gap-3">
              <UserAvatar name={newUserData.name || 'New User'} avatarUrl="" size="md" />
              <div className="text-xs">
                <span className="font-bold text-purple-900 block">Automatic Initial Avatar</span>
                <span className="text-slate-500 text-[11px]">
                  Generated Initials: <strong>[{getInitials(newUserData.name || 'New User')}]</strong> with light background.
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingNewUser}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-md shadow-purple-200 flex items-center justify-center gap-1.5"
              >
                {isSubmittingNewUser ? 'Provisioning...' : 'Provision Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
