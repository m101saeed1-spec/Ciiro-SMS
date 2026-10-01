import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Teacher } from '../../types';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { UserAvatar } from '../common/UserAvatar';
import { exportTeachersCSV } from '../../utils/csvExport';
import { exportTeacherListPDF } from '../../utils/pdfExport';
import {
  parseCSV,
  downloadTeacherImportTemplate,
  validateTeacherRows,
  TeacherValidationResult,
} from '../../utils/csvImport';
import {
  Plus,
  Search,
  Users,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  BookMarked,
  Award,
  Layers,
  Download,
  Upload,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Calendar,
} from 'lucide-react';

export const TeachersModule: React.FC = () => {
  const { activeRole, isPrincipal, isOwnerAdmin, isAdmin } = useAuth();
  const {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addTeachersBulk,
    classes,
    nominateClassTeacher,
    globalSearch,
    addToast,
  } = useSchoolData();

  // Role permissions: Headteacher (Principal) and School Owner can recruit and manage faculty
  const canAddTeacher =
    isPrincipal ||
    isOwnerAdmin ||
    isAdmin ||
    activeRole === 'Principal' ||
    activeRole === 'OwnerAdmin' ||
    activeRole === 'Admin';

  const canNominateClassTeacher =
    isPrincipal ||
    isOwnerAdmin ||
    isAdmin ||
    activeRole === 'Principal' ||
    activeRole === 'OwnerAdmin' ||
    activeRole === 'Admin';

  const canManageTeachers =
    isPrincipal ||
    isOwnerAdmin ||
    isAdmin ||
    activeRole === 'Principal' ||
    activeRole === 'OwnerAdmin' ||
    activeRole === 'Admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCsvRawText, setBulkCsvRawText] = useState('');
  const [bulkValidationResults, setBulkValidationResults] = useState<TeacherValidationResult[]>([]);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkTab, setBulkTab] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Class Teacher Nomination State
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);
  const [selectedTeacherForNomination, setSelectedTeacherForNomination] = useState<Teacher | null>(null);
  const [selectedClassIdForNomination, setSelectedClassIdForNomination] = useState<string>('');
  const [nominationRationale, setNominationRationale] = useState<string>('Official appointment by School Principal');
  const [isSubmittingNomination, setIsSubmittingNomination] = useState(false);

  // Add Form
  const [formData, setFormData] = useState({
    teacherId: 'TCH-2026-0008',
    name: '',
    email: '',
    phone: '',
    subjects: 'Mathematics, Physics',
    classesAssigned: 'Class 01, Class 02',
    qualification: 'M.Sc in Physics',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
  });

  // Edit Form
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: '',
    classesAssigned: '',
    qualification: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    status: 'Active' as 'Active' | 'On Leave' | 'Inactive',
  });

  const [idError, setIdError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    const nextNum = 7 + teachers.length + 1;
    const autoId = `TCH-2026-${String(nextNum).padStart(4, '0')}`;
    setFormData({
      teacherId: autoId,
      name: '',
      email: '',
      phone: '',
      subjects: 'Mathematics, Physics',
      classesAssigned: 'Class 01, Class 02',
      qualification: 'M.Sc in Physics',
      gender: 'Female',
    });
    setIdError(null);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setEditFormData({
      name: t.name,
      email: t.email,
      phone: t.phone,
      subjects: t.subjects.join(', '),
      classesAssigned: t.classesAssigned.join(', '),
      qualification: t.qualification,
      gender: t.gender || 'Female',
      status: (t.status as any) || 'Active',
    });
    setFormError(null);
  };

  const handleOpenNominateModal = (teacher?: Teacher) => {
    if (teacher) {
      setSelectedTeacherForNomination(teacher);
    } else if (teachers.length > 0) {
      setSelectedTeacherForNomination(teachers[0]);
    }
    if (classes.length > 0) {
      setSelectedClassIdForNomination(classes[0].id);
    }
    setNominationRationale('Official appointment by School Principal');
    setIsNominateModalOpen(true);
  };

  const handleConfirmNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForNomination || !selectedClassIdForNomination) return;

    setIsSubmittingNomination(true);
    const targetClass = classes.find((c) => c.id === selectedClassIdForNomination);
    await nominateClassTeacher(
      targetClass?.id || selectedClassIdForNomination,
      selectedTeacherForNomination.teacherId || selectedTeacherForNomination.id,
      selectedTeacherForNomination.name,
      nominationRationale
    );
    setIsSubmittingNomination(false);
    setIsNominateModalOpen(false);
  };

  const validateTeacherId = (id: string, excludeId?: string) => {
    const clean = id.trim().toUpperCase();
    if (!clean) return 'Teacher School ID is required.';
    const duplicate = teachers.some((t) => t.teacherId.toUpperCase() === clean && t.id !== excludeId);
    if (duplicate) return `Teacher ID "${clean}" is already assigned to another faculty member.`;
    return null;
  };

  const effectiveSearch = searchQuery || globalSearch;

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      t.teacherId.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(effectiveSearch.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredTeachers.length / pageSize) || 1;
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateTeacherId(formData.teacherId);
    if (error) {
      setIdError(error);
      return;
    }

    setIsSavingTeacher(true);
    setFormError(null);

    const result = await addTeacher({
      teacherId: formData.teacherId.toUpperCase(),
      name: formData.name,
      avatar:
        formData.gender === 'Male'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu`,
      phone: formData.phone || '+1 (555) 000-9988',
      subjects: formData.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      classesAssigned: formData.classesAssigned.split(',').map((c) => c.trim()).filter(Boolean),
      qualification: formData.qualification,
      joiningDate: new Date().toISOString().split('T')[0],
      gender: formData.gender,
      status: 'Active',
    });

    setIsSavingTeacher(false);

    if (result.success) {
      setIsAddModalOpen(false);
    } else {
      setFormError(result.error || 'Failed to save faculty record. Please try again.');
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setIsSavingTeacher(true);
    setFormError(null);

    const result = await updateTeacher(editingTeacher.id, {
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      subjects: editFormData.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      classesAssigned: editFormData.classesAssigned.split(',').map((c) => c.trim()).filter(Boolean),
      qualification: editFormData.qualification,
      gender: editFormData.gender,
      status: editFormData.status,
    });

    setIsSavingTeacher(false);

    if (result.success) {
      setEditingTeacher(null);
    } else {
      setFormError(result.error || 'Failed to update teacher record.');
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deletingTeacher) return;
    await deleteTeacher(deletingTeacher.id);
    setDeletingTeacher(null);
  };

  // Bulk Import Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  const processCsvText = (text: string) => {
    setBulkCsvRawText(text);
    const parsed = parseCSV(text);
    const results = validateTeacherRows(parsed.rows, teachers);
    setBulkValidationResults(results);
  };

  const handleConfirmBulkImport = async () => {
    const validRows = bulkValidationResults
      .filter((r) => r.isValid && r.data)
      .map((r) => r.data!);

    if (validRows.length === 0) {
      addToast('No valid teacher records found to import.', 'error');
      return;
    }

    setIsSubmittingBulk(true);
    const result = await addTeachersBulk(validRows);
    setIsSubmittingBulk(false);

    if (result.success) {
      setIsBulkModalOpen(false);
      setBulkCsvRawText('');
      setBulkValidationResults([]);
    }
  };

  const validCount = bulkValidationResults.filter((r) => r.isValid).length;
  const invalidCount = bulkValidationResults.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Faculty & Teachers</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage teacher profiles, qualifications, class allocations, and bulk CSV enrollment
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="export-teachers-csv-btn"
            onClick={() => exportTeachersCSV(filteredTeachers)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            title="Export faculty directory as CSV file"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            id="export-teachers-pdf-btn"
            onClick={() => exportTeacherListPDF(filteredTeachers)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            title="Export faculty roster report as PDF"
          >
            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Export Roster PDF</span>
          </button>
          {canNominateClassTeacher && (
            <button
              id="nominate-class-teacher-btn"
              type="button"
              onClick={() => handleOpenNominateModal()}
              className="px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              title="Principal Class Teacher Nomination"
            >
              <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Nominate Class Teacher</span>
            </button>
          )}
          {canAddTeacher && (
            <>
              <button
                id="bulk-import-teachers-btn"
                type="button"
                onClick={() => {
                  setBulkCsvRawText('');
                  setBulkValidationResults([]);
                  setIsBulkModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                title="Bulk import teachers via CSV"
              >
                <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Bulk Import CSV</span>
              </button>
              <button
                id="add-new-teacher-btn"
                type="button"
                onClick={openAddModal}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Teacher</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by teacher name, subject, ID..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50/50 dark:bg-purple-950/40 border-b border-purple-100/50 dark:border-purple-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6">Teacher ID</th>
                <th className="py-3.5 px-4">Name & Qualification</th>
                <th className="py-3.5 px-4">Assigned Subjects</th>
                <th className="py-3.5 px-4">Assigned Classes</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    No faculty members found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3.5 px-4 pl-6 font-bold text-slate-800 dark:text-slate-100 font-mono text-xs">
                      {t.teacherId}
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const designatedClasses = classes.filter(
                          (c) =>
                            c.classTeacher === t.name ||
                            c.classTeacherId === t.id ||
                            c.classTeacherId === t.teacherId
                        );
                        return (
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={t.name}
                              avatarUrl={t.avatar}
                              size="md"
                              rounded="full"
                              status={t.status}
                              showStatus={true}
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{t.name}</p>
                                {designatedClasses.length > 0 && (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[9px] border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                    <Award className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                    Class Teacher ({designatedClasses.map((c) => c.name).join(', ')})
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.qualification}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-semibold border border-purple-100 dark:border-purple-900/60"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.classesAssigned.join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{t.phone}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{t.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingTeacher(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
                          title="View Faculty Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canNominateClassTeacher && (
                          <button
                            type="button"
                            onClick={() => handleOpenNominateModal(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer"
                            title={`Nominate ${t.name} as Class Teacher`}
                          >
                            <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </button>
                        )}
                        {canManageTeachers && (
                          <>
                            <button
                              onClick={() => openEditModal(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                              title="Edit Teacher"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTeacher(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Delete Teacher"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredTeachers.length}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW TEACHER MODAL */}
      {/* ========================================================================= */}
      {viewingTeacher && (
        <Modal
          isOpen={!!viewingTeacher}
          onClose={() => setViewingTeacher(null)}
          title="Faculty Profile Details"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
              <UserAvatar
                name={viewingTeacher.name}
                avatarUrl={viewingTeacher.avatar}
                size="xl"
                ring="ring-2 ring-purple-300 dark:ring-purple-700 shadow-sm"
                status={viewingTeacher.status}
                showStatus={true}
              />
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{viewingTeacher.name}</h3>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">{viewingTeacher.qualification}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewingTeacher.teacherId}</span> • Joined {viewingTeacher.joiningDate || '2026-08-01'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 font-medium block">Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 block mt-0.5">{viewingTeacher.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 font-medium block">Email</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 block mt-0.5 truncate">{viewingTeacher.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 font-medium block">Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 block mt-0.5">{viewingTeacher.gender || 'Female'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 font-medium block">Account Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">{viewingTeacher.status || 'Active'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Assigned Subjects</span>
              <div className="flex flex-wrap gap-1.5">
                {viewingTeacher.subjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Assigned Classes</span>
              <div className="flex flex-wrap gap-1.5">
                {viewingTeacher.classesAssigned.map((cls, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* ADD TEACHER MODAL */}
      {/* ========================================================================= */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Recruit Faculty Member">
        <form onSubmit={handleCreateTeacher} className="space-y-3">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {idError && (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {idError}
            </div>
          )}

          {/* Teacher School ID Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Teacher School ID Number <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/60">
                UNIQUE ID
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.teacherId}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setFormData({ ...formData, teacherId: val });
                setIdError(validateTeacherId(val));
              }}
              placeholder="e.g. TCH-2026-0008"
              className="w-full bg-purple-50/50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 uppercase focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Teacher Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Robert Vance"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@eduspike.edu"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. M.Sc in Physics"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Subjects (comma-separated)
            </label>
            <input
              type="text"
              value={formData.subjects}
              onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
              placeholder="Mathematics, Physics, Chemistry"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Classes (comma-separated)
            </label>
            <input
              type="text"
              value={formData.classesAssigned}
              onChange={(e) => setFormData({ ...formData, classesAssigned: e.target.value })}
              placeholder="Class 01, Class 02, Class 03"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingTeacher}
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20 mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSavingTeacher ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Faculty Record...</span>
              </>
            ) : (
              <span>Save Faculty Record</span>
            )}
          </button>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* EDIT TEACHER MODAL */}
      {/* ========================================================================= */}
      {editingTeacher && (
        <Modal
          isOpen={!!editingTeacher}
          onClose={() => setEditingTeacher(null)}
          title={`Edit Faculty Record — ${editingTeacher.name}`}
        >
          <form onSubmit={handleUpdateTeacher} className="space-y-3">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teacher ID</label>
              <input
                type="text"
                disabled
                value={editingTeacher.teacherId}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-500 opacity-70"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teacher Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
                <input
                  type="text"
                  value={editFormData.qualification}
                  onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Subjects (comma-separated)
              </label>
              <input
                type="text"
                value={editFormData.subjects}
                onChange={(e) => setEditFormData({ ...editFormData, subjects: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Classes (comma-separated)
              </label>
              <input
                type="text"
                value={editFormData.classesAssigned}
                onChange={(e) => setEditFormData({ ...editFormData, classesAssigned: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingTeacher}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSavingTeacher ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* BULK IMPORT TEACHERS MODAL */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          title="Bulk Import Teachers via CSV"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Top Info & Template Download Bar */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    Bulk Faculty Onboarding Template
                  </h4>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                    Download our structured CSV template, fill in teacher details, and upload below for instant batch verification.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => downloadTeacherImportTemplate()}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            {/* Tab switch between File Upload and Text Paste */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit text-xs font-bold">
              <button
                type="button"
                onClick={() => setBulkTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  bulkTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Upload CSV File
              </button>
              <button
                type="button"
                onClick={() => setBulkTab('paste')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  bulkTab === 'paste'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Paste Raw CSV Text
              </button>
            </div>

            {bulkTab === 'upload' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl p-6 text-center hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to browse or drop your CSV file here
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Supports comma-separated values (.csv) with header columns
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Paste CSV Data with Headers
                </label>
                <textarea
                  rows={5}
                  value={bulkCsvRawText}
                  onChange={(e) => processCsvText(e.target.value)}
                  placeholder={`Teacher ID,Full Name,Email,Phone,Gender,Qualification,Subjects,Classes Assigned\nTCH-2026-0091,Dr. Marcus Vance,marcus.vance@eduspike.edu,+1 555-345-6789,Male,Ph.D Math,"Mathematics, Physics","Class 01"`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            )}

            {/* Validation Breakdown & Preview Table */}
            {bulkValidationResults.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Parsed Records ({bulkValidationResults.length})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {validCount} Ready
                    </span>
                    {invalidCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        {invalidCount} Issues
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-[220px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Row</th>
                        <th className="py-2 px-3">Teacher ID</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Subjects</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {bulkValidationResults.map((r) => (
                        <tr key={r.rowNumber} className={r.isValid ? 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40' : 'bg-rose-50/30 dark:bg-rose-950/20'}>
                          <td className="py-2 px-3 font-mono text-slate-400">{r.rowNumber}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {r.data?.teacherId || r.raw['Teacher ID'] || '-'}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                            {r.data?.name || r.raw['Full Name'] || r.raw['Name'] || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                            {r.data?.subjects.join(', ') || '-'}
                          </td>
                          <td className="py-2 px-3">
                            {r.isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold" title={r.errors.join(', ')}>
                                <XCircle className="w-3.5 h-3.5" />
                                {r.errors[0]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={validCount === 0 || isSubmittingBulk}
                onClick={handleConfirmBulkImport}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmittingBulk ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Importing Faculty...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import {validCount} Verified Teachers</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* DELETE TEACHER MODAL */}
      {/* ========================================================================= */}
      {deletingTeacher && (
        <Modal
          isOpen={!!deletingTeacher}
          onClose={() => setDeletingTeacher(null)}
          title="Confirm Delete Faculty"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to remove <span className="font-bold text-slate-800 dark:text-slate-100">{deletingTeacher.name}</span>? This will revoke faculty portal credentials and unassign class teaching slots.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingTeacher(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTeacher}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* PRINCIPAL CLASS TEACHER NOMINATION MODAL */}
      {/* ========================================================================= */}
      {isNominateModalOpen && (
        <Modal
          isOpen={isNominateModalOpen}
          onClose={() => setIsNominateModalOpen(false)}
          title="Nominate Class Teacher"
          maxWidth="md"
        >
          <form onSubmit={handleConfirmNomination} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Principal Executive Authority
                </h4>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                  As School Principal, you have the sole authority to designate and nominate official Class Teachers.
                  The nominated teacher will receive operational authority for the class while all historical student,
                  attendance, and exam marks records remain permanently preserved.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Member to Nominate
              </label>
              <select
                value={selectedTeacherForNomination?.id || ''}
                onChange={(e) => {
                  const found = teachers.find((t) => t.id === e.target.value);
                  if (found) setSelectedTeacherForNomination(found);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id} className="dark:bg-slate-800">
                    {t.name} ({t.teacherId}) — {t.qualification}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Classroom / Grade
              </label>
              <select
                value={selectedClassIdForNomination}
                onChange={(e) => setSelectedClassIdForNomination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-800">
                    {c.name} ({c.code}) — Current Class Teacher: {c.classTeacher || 'Unassigned'}
                  </option>
                ))}
              </select>
              {selectedClassIdForNomination && (
                <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Current incumbent:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {classes.find((c) => c.id === selectedClassIdForNomination)?.classTeacher || 'Unassigned'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Appointment Reason / Remarks
              </label>
              <input
                type="text"
                required
                value={nominationRationale}
                onChange={(e) => setNominationRationale(e.target.value)}
                placeholder="e.g. Appointed as Class Teacher for Academic Year 2026-2027 by Principal order"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsNominateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingNomination}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isSubmittingNomination ? 'Appointing...' : 'Confirm Nomination'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
