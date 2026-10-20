import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Layers,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Globe,
  Award,
  BarChart3,
  RefreshCw,
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  Archive,
  Eye,
  SlidersHorizontal,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { School } from '../../types';
import { SchoolOwnerOverview } from './SchoolOwnerOverview';

export const SchoolsModule: React.FC = () => {
  const {
    currentUser,
    isSuperAdmin,
    activeRole,
    schools,
    activeSchoolId,
    setActiveSchoolId,
    addSchool,
    updateSchool,
    deleteSchool,
    toggleSchoolStatus,
  } = useAuth();

  // If the active user is not the Platform Super Admin, show their specific School Overview
  if (!isSuperAdmin) {
    return <SchoolOwnerOverview />;
  }

  const {
    students,
    teachers,
    classes,
    books,
    addToast,
  } = useSchoolData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [selectedSchoolDetail, setSelectedSchoolDetail] = useState<School | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<School, 'id' | 'createdAt'>>({
    name: '',
    code: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    academicYear: '2025-2026',
    status: 'Active',
    principalName: '',
    ownerAdminEmail: '',
    description: '',
    motto: '',
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalBooks: 0,
      averageAttendanceRate: 98.0,
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      logo: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      academicYear: '2025-2026',
      status: 'Active',
      principalName: '',
      ownerAdminEmail: '',
      description: '',
      motto: '',
      stats: {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalBooks: 0,
        averageAttendanceRate: 98.0,
      },
    });
    setEditingSchool(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      logo: school.logo || '',
      address: school.address,
      phone: school.phone,
      email: school.email,
      website: school.website || '',
      academicYear: school.academicYear,
      status: school.status,
      principalName: school.principalName,
      ownerAdminEmail: school.ownerAdminEmail,
      description: school.description || '',
      motto: school.motto || '',
      stats: school.stats,
    });
    setIsCreateModalOpen(true);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB limit. Please choose a smaller file.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      setFormData((prev) => ({ ...prev, logo: base64Url }));
      addToast('School emblem logo uploaded successfully!', 'success');
    };
    reader.onerror = () => {
      addToast('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      addToast('School Name and Code are required', 'warning');
      return;
    }

    if (editingSchool) {
      const res = await updateSchool(editingSchool.id, formData);
      if (res.success) {
        addToast(`School "${formData.name}" updated successfully!`, 'success');
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        addToast(res.error || 'Failed to update school', 'error');
      }
    } else {
      const res = await addSchool(formData);
      if (res.success) {
        addToast(`New School "${formData.name}" provisioned successfully!`, 'success');
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        addToast(res.error || 'Failed to create school', 'error');
      }
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteSchool(id);
    if (res.success) {
      addToast('School tenant removed successfully.', 'success');
      setDeleteConfirmationId(null);
      if (selectedSchoolDetail?.id === id) {
        setSelectedSchoolDetail(null);
      }
    } else {
      addToast(res.error || 'Failed to delete school', 'error');
    }
  };

  // Platform Aggregate Stats
  const totalSchoolsCount = (schools || []).length;
  const activeSchoolsCount = (schools || []).filter((s) => s.status === 'Active').length;
  const totalStudentsAcrossPlatform = (schools || []).reduce((acc, s) => acc + (s.stats?.totalStudents || 0), 0) + (students || []).length;
  const totalTeachersAcrossPlatform = (schools || []).reduce((acc, s) => acc + (s.stats?.totalTeachers || 0), 0) + (teachers || []).length;

  // Filtered Schools
  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.principalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="schools-module" className="space-y-6">
      {/* Top Banner: Super Admin Authority & Active Tenant Context */}
      <div className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#122E52] text-white rounded-2xl p-6 shadow-sm border border-[#1E3A63] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#EFF6FF]0/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#F7A914] shadow-inner">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-white">
                    School Tenancy & Infrastructure Management
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Super Admin Console
                  </span>
                </div>
                <p className="text-xs text-[#F7A914]/80 mt-0.5">
                  Multi-tenant isolation engine: Every student, teacher, attendance record, and chat group is cryptographically bound to its <code className="bg-white/10 px-1 py-0.5 rounded text-[#F7A914]">school_id</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <button
                id="btn-add-new-school"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 btn-gold"
              >
                <Plus className="w-4 h-4" />
                <span>Add New School</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-School Tenant Switcher Bar for Super Admin */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#F7A914]" />
            <span className="text-xs font-semibold text-[#F7A914]">Active Tenant Scope:</span>
            <div className="flex flex-wrap items-center gap-2">
              {schools.map((school) => {
                const isActive = activeSchoolId === school.id;
                return (
                  <button
                    key={school.id}
                    id={`tenant-switch-btn-${school.id}`}
                    onClick={() => {
                      setActiveSchoolId(school.id);
                      addToast(`Switched active context to "${school.name}"`, 'info');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#EFF6FF]0 text-white shadow-sm ring-2 ring-white/40'
                        : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{school.code}</span>
                    {isActive && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-[#F7A914]/70 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Tenant RLS Enforced</span>
          </div>
        </div>
      </div>

      {/* Platform High-Level Statistics Bento */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Institutions</span>
            <div className="w-8 h-8 rounded-xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalSchoolsCount}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{activeSchoolsCount} Active Operational</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Global Student Base</span>
            <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalStudentsAcrossPlatform}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Layers className="w-3 h-3 text-[#3B82F6]" />
            <span>Isolated per school domain</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Registered Faculty</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalTeachersAcrossPlatform}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3 h-3 text-cyan-500" />
            <span>Staff & Department roles</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Academic Year</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">2025-2026</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Active Term Cycle</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Status Filters, View Mode */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-schools-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, principal, city..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#3B82F6] focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Active', 'Inactive', 'Archived'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] border border-[#1E3A63]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title="Grid View"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] border border-[#1E3A63]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title="Table View"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schools Display Grid */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => {
            const isCurrentlyActive = activeSchoolId === school.id;
            return (
              <div
                key={school.id}
                id={`school-card-${school.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md ${
                  isCurrentlyActive
                    ? 'border-[#1E3A63] dark:border-[#1E3A63] ring-2 ring-[#F7A914]/30'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Card Header & Banner */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        school.logo ||
                        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={school.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] border border-[#1E3A63]">
                          {school.code}
                        </span>
                        {isCurrentlyActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-2.5 h-2.5" /> Selected Context
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 line-clamp-1">
                        {school.name}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      school.status === 'Active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : school.status === 'Inactive'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {school.status}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 space-y-4 text-xs">
                  {school.motto && (
                    <p className="text-[11px] italic text-[#3B82F6] dark:text-[#60A5FA] font-medium">
                      "{school.motto}"
                    </p>
                  )}

                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Principal: <strong>{school.principalName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{school.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{school.address}</span>
                    </div>
                  </div>

                  {/* Resource Breakdown Pills */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Students</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {school.stats?.totalStudents || 0}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Teachers</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {school.stats?.totalTeachers || 0}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Attendance</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {school.stats?.averageAttendanceRate || 97}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveSchoolId(school.id);
                      addToast(`Switched active tenant to "${school.name}"`, 'success');
                    }}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      isCurrentlyActive
                        ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#122E52]/10 dark:hover:bg-[#0B1B32] border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{isCurrentlyActive ? 'Current Context' : 'Select Context'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedSchoolDetail(school)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#3B82F6] dark:hover:text-[#F7A914] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {isSuperAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(school)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Edit School"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {school.id !== 'school-1' && (
                          <button
                            onClick={() => setDeleteConfirmationId(school.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete School"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">School & Code</th>
                  <th className="py-3.5 px-4">Principal</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Academic Year</th>
                  <th className="py-3.5 px-4">Students / Teachers</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSchools.map((school) => {
                  const isCurrentlyActive = activeSchoolId === school.id;
                  return (
                    <tr
                      key={school.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isCurrentlyActive ? 'bg-[#EFF6FF] dark:bg-[#1E3A63]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={school.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200'}
                            alt={school.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{school.name}</span>
                              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA]">
                                {school.code}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block">{school.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                        {school.principalName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        <div>{school.email}</div>
                        <div className="text-[10px]">{school.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {school.academicYear}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                        <span>{school.stats?.totalStudents || 0} Students</span>
                        <span className="text-[10px] text-slate-400 block">{school.stats?.totalTeachers || 0} Teachers</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            school.status === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {school.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveSchoolId(school.id);
                              addToast(`Context set to "${school.name}"`, 'success');
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCurrentlyActive
                                ? 'bg-[#122E52] text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#122E52]/20'
                            }`}
                          >
                            {isCurrentlyActive ? 'Active' : 'Select'}
                          </button>
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(school)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {school.id !== 'school-1' && (
                                <button
                                  onClick={() => setDeleteConfirmationId(school.id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SCHOOL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#122E52] text-white flex items-center justify-center shadow-md shadow-md">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingSchool ? `Edit School: ${editingSchool.name}` : 'Provision New School Tenant'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Establishes an isolated multi-tenant institution environment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Oakridge Science & Tech Academy"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Code (Identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. OAKRIDGE"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase font-bold outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Principal / Headmaster Name
                  </label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="e.g. Dr. Julian Hayes"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Admin Email
                  </label>
                  <input
                    type="email"
                    value={formData.ownerAdminEmail}
                    onChange={(e) => setFormData({ ...formData, ownerAdminEmail: e.target.value })}
                    placeholder="admin@oakridge.edu"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@oakridge.edu"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 832-1049"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Physical Campus Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="88 Innovation Parkway, Silicon Valley, CA 94025"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="2025-2026"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
                      School Logo & Official Crest
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">PNG, JPG, SVG, WebP (Max 5MB)</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700">
                    {/* Live Crest / Logo Preview */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-[#1E3A63] shadow-sm flex items-center justify-center">
                        {formData.logo ? (
                          <img
                            src={formData.logo}
                            alt="Uploaded School Crest"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200';
                            }}
                          />
                        ) : (
                          <div className="text-center p-2">
                            <Building2 className="w-7 h-7 text-slate-400 mx-auto" />
                            <span className="text-[9px] font-bold text-slate-400 block mt-0.5">No Logo</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3.5 py-2 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm shadow-md transition-all hover:scale-105 active:scale-95">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Logo File</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/svg+xml"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>

                        {formData.logo && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, logo: '' })}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                            title="Remove uploaded logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Optional URL input fallback */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Or URL:</span>
                        <input
                          type="url"
                          value={formData.logo.startsWith('data:') ? '' : formData.logo}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          placeholder={formData.logo.startsWith('data:') ? 'Custom file uploaded (data URI)' : 'https://example.com/logo.png'}
                          className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#3B82F6]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Motto
                  </label>
                  <input
                    type="text"
                    value={formData.motto}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    placeholder="e.g. Innovate, Discover, Excel"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description & Mission
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Overview of the institution's programs, focus areas, and history..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#EFF6FF] dark:bg-[#1E3A63] rounded-xl border border-[#1E3A63] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#122E52] dark:text-[#F7A914]">
                  Creating this school will automatically initialize isolated databases, student & teacher registries, gradebooks, and encrypted faculty channels bound exclusively to this tenant.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="btn-outline-navy text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs py-2 px-5"
                >
                  {editingSchool ? 'Save Changes' : 'Provision School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHOOL DETAIL MODAL */}
      {selectedSchoolDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-[#122E52] to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedSchoolDetail.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200'}
                  alt={selectedSchoolDetail.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-white/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                      {selectedSchoolDetail.code}
                    </span>
                    <span className="text-[10px] font-bold text-[#F7A914]">
                      ID: {selectedSchoolDetail.id}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-0.5">
                    {selectedSchoolDetail.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchoolDetail(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {selectedSchoolDetail.description && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedSchoolDetail.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Principal</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSchoolDetail.principalName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Owner Admin</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedSchoolDetail.ownerAdminEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Campus Address</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedSchoolDetail.address}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Academic Cycle</span>
                  <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA]">{selectedSchoolDetail.academicYear}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setActiveSchoolId(selectedSchoolDetail.id);
                    setSelectedSchoolDetail(null);
                    addToast(`Active tenant switched to ${selectedSchoolDetail.name}`, 'success');
                  }}
                  className="px-4 py-2 bg-[#122E52] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set as Active Context</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Delete School Tenant?</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  This action is irreversible and purges isolated school metadata.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-200">
              All linked classrooms, timetables, and teacher group associations under this tenant ID will be detached.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="btn-outline-navy text-xs py-2 px-3.5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmationId)}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
