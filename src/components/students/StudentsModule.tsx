import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Student, SchoolClass } from '../../types';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { UserAvatar } from '../common/UserAvatar';
import { exportStudentListPDF } from '../../utils/pdfExport';
import { exportStudentsCSV } from '../../utils/csvExport';
import {
  parseCSV,
  downloadStudentImportTemplate,
  validateStudentRows,
  StudentValidationResult,
} from '../../utils/csvImport';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  UserCheck,
  Download,
  Upload,
  FileSpreadsheet,
  Users,
  Layers,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Award,
  Clock,
  ShieldCheck,
  UserPlus,
  LayoutGrid,
  List,
  AlertCircle,
  XCircle,
} from 'lucide-react';

export const StudentsModule: React.FC = () => {
  const { activeRole, currentUser, canPerformClassOperations, isPrincipal, isOwnerAdmin, isAdmin } = useAuth();
  const { students, classes, addStudent, updateStudent, deleteStudent, addStudentsBulk, addToast, globalSearch } = useSchoolData();

  // Role permissions
  const canManageStudents =
    isPrincipal ||
    isOwnerAdmin ||
    isAdmin ||
    activeRole === 'Principal' ||
    activeRole === 'OwnerAdmin' ||
    activeRole === 'Admin' ||
    activeRole === 'Teacher';

  // Navigation State: 'classes' (Default Class Directory) | 'class-roster' (Selected Class Students)
  const [activeView, setActiveView] = useState<'classes' | 'class-roster'>('classes');
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [restrictionError, setRestrictionError] = useState<string | null>(null);

  // Search & Filtering inside Class view
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [displayMode, setDisplayMode] = useState<'table' | 'cards'>('table');

  // Search in Overview Classes View
  const [overviewSearch, setOverviewSearch] = useState('');

  // Pagination for class students
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCsvRawText, setBulkCsvRawText] = useState('');
  const [bulkValidationResults, setBulkValidationResults] = useState<StudentValidationResult[]>([]);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkTab, setBulkTab] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Student Form (automatically locked to selected class)
  const [formData, setFormData] = useState({
    schoolId: '',
    name: '',
    rollNo: '',
    email: '',
    class: '',
    section: 'A',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    dob: '2016-05-12',
    bloodGroup: 'A+',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '104 Harmony Blvd, Academic Hills',
    status: 'Active' as 'Active' | 'Graduated' | 'Suspended',
    avatar: '',
  });

  const [idError, setIdError] = useState<string | null>(null);

  // Teacher vs Admin Accessible Classes
  const accessibleClasses = useMemo(() => {
    if (activeRole === 'Teacher') {
      const assigned = currentUser.assignedClasses || [];
      const teacherClasses = classes.filter(
        (c) => assigned.includes(c.name) || c.classTeacher === currentUser.name || assigned.includes(c.id)
      );
      return teacherClasses.length > 0 ? teacherClasses : classes;
    }
    return classes;
  }, [classes, activeRole, currentUser]);

  // Filtered classes in Overview
  const filteredOverviewClasses = useMemo(() => {
    const q = (overviewSearch || globalSearch).toLowerCase().trim();
    if (!q) return accessibleClasses;
    return accessibleClasses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.classTeacher && c.classTeacher.toLowerCase().includes(q)) ||
        (c.roomNumber && c.roomNumber.toLowerCase().includes(q))
    );
  }, [accessibleClasses, overviewSearch, globalSearch]);

  // Students belonging strictly to the selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.class === selectedClass.name);
  }, [students, selectedClass]);

  // Filtered class students based on search and section
  const filteredClassStudents = useMemo(() => {
    return classStudents.filter((s) => {
      const q = classSearchQuery.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);

      const matchesSection =
        selectedSectionFilter === 'All' || s.section === selectedSectionFilter;

      const matchesStatus =
        selectedStatusFilter === 'All' || s.status === selectedStatusFilter;

      return matchesSearch && matchesSection && matchesStatus;
    });
  }, [classStudents, classSearchQuery, selectedSectionFilter, selectedStatusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredClassStudents.length / pageSize) || 1;
  const paginatedStudents = filteredClassStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Open Add Student Modal with pre-locked class
  const openAddModal = (targetCls?: SchoolClass) => {
    const clsToUse = targetCls || selectedClass;
    if (!clsToUse) return;

    const perm = canPerformClassOperations(clsToUse.name, 'student_registration');
    if (!perm.allowed) {
      setRestrictionError(
        perm.reason ||
          `Access restricted: Student enrollment for ${clsToUse.name} is managed exclusively by the assigned Class Teacher, ${clsToUse.classTeacher}. If this assignment needs to change, please contact the Principal.`
      );
      return;
    }

    setRestrictionError(null);
    const classTotal = students.filter((s) => s.class === clsToUse.name).length;
    const nextNum = 120 + students.length + 1;
    const autoId = `STU-2026-${String(nextNum).padStart(4, '0')}`;
    const autoRoll = `2026${String(classTotal + 1).padStart(2, '0')}`;

    setFormData({
      schoolId: autoId,
      name: '',
      rollNo: autoRoll,
      email: '',
      class: clsToUse.name, // AUTOMATICALLY ASSIGNED AND LOCKED
      section: clsToUse.sections && clsToUse.sections.length > 0 ? clsToUse.sections[0] : 'A',
      gender: 'Female',
      dob: '2016-05-12',
      bloodGroup: 'A+',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '104 Harmony Blvd, Academic Hills',
      status: 'Active',
      avatar: '',
    });
    setIdError(null);
    setIsAddModalOpen(true);
  };

  const validateStudentId = (id: string, excludeId?: string) => {
    const clean = id.trim().toUpperCase();
    if (!clean) return 'School ID is required.';
    const duplicate = students.some((s) => s.id.toUpperCase() === clean && s.id !== excludeId);
    if (duplicate) return `School ID "${clean}" is already assigned to another student.`;
    return null;
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    const perm = canPerformClassOperations(selectedClass.name, 'student_registration');
    if (!perm.allowed) {
      setRestrictionError(
        perm.reason ||
          `Access restricted: Student enrollment for ${selectedClass.name} is managed exclusively by the assigned Class Teacher, ${selectedClass.classTeacher}. If this assignment needs to change, please contact the Principal.`
      );
      setIsAddModalOpen(false);
      return;
    }

    const error = validateStudentId(formData.schoolId);
    if (error) {
      setIdError(error);
      return;
    }

    await addStudent({
      id: formData.schoolId.toUpperCase(),
      rollNo: formData.rollNo || `2026${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name,
      avatar: formData.avatar || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200`,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu`,
      class: selectedClass.name, // AUTOMATICALLY ASSIGNED
      section: formData.section,
      gender: formData.gender,
      dob: formData.dob,
      bloodGroup: formData.bloodGroup,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail || `${formData.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      status: formData.status,
      enrollmentDate: new Date().toISOString().split('T')[0],
      attendanceRate: 98.0,
    });

    setIsAddModalOpen(false);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !selectedClass) return;

    const perm = canPerformClassOperations(selectedClass.name, 'student_registration');
    if (!perm.allowed) {
      setRestrictionError(
        perm.reason ||
          `Access restricted: Student modifications for ${selectedClass.name} are managed exclusively by the assigned Class Teacher, ${selectedClass.classTeacher}. If this assignment needs to change, please contact the Principal.`
      );
      setEditingStudent(null);
      return;
    }

    await updateStudent(editingStudent.id, editingStudent);
    setEditingStudent(null);
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent || !selectedClass) return;

    const perm = canPerformClassOperations(selectedClass.name, 'student_registration');
    if (!perm.allowed) {
      setRestrictionError(
        perm.reason ||
          `Access restricted: Student record deletions for ${selectedClass.name} are managed exclusively by the assigned Class Teacher, ${selectedClass.classTeacher}. If this assignment needs to change, please contact the Principal.`
      );
      setDeletingStudent(null);
      return;
    }

    await deleteStudent(deletingStudent.id);
    setDeletingStudent(null);
  };

  // Bulk Import Handlers
  const handleOpenBulkModal = () => {
    setBulkCsvRawText('');
    setBulkValidationResults([]);
    setBulkTab('upload');
    setIsBulkModalOpen(true);
  };

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
    const classNames = classes.map((c) => c.name);
    const results = validateStudentRows(parsed.rows, students, classNames);
    setBulkValidationResults(results);
  };

  const handleConfirmBulkImport = async () => {
    const validRows = bulkValidationResults
      .filter((r) => r.isValid && r.data)
      .map((r) => r.data!);

    if (validRows.length === 0) {
      addToast('No valid student records found to import.', 'error');
      return;
    }

    setIsSubmittingBulk(true);
    const result = await addStudentsBulk(validRows);
    setIsSubmittingBulk(false);

    if (result.success) {
      setIsBulkModalOpen(false);
      setBulkCsvRawText('');
      setBulkValidationResults([]);
    }
  };

  const validCount = bulkValidationResults.filter((r) => r.isValid).length;
  const invalidCount = bulkValidationResults.filter((r) => !r.isValid).length;

  // Class selection handler
  const handleSelectClass = (cls: SchoolClass) => {
    setSelectedClass(cls);
    setClassSearchQuery('');
    setSelectedSectionFilter('All');
    setSelectedStatusFilter('All');
    setCurrentPage(1);
    setRestrictionError(null);
    setActiveView('class-roster');
  };

  // Export handlers
  const handleExportClassCSV = () => {
    if (!selectedClass) return;
    exportStudentsCSV(filteredClassStudents, selectedClass.name);
  };

  const handleExportClassPDF = () => {
    if (!selectedClass) return;
    exportStudentListPDF(filteredClassStudents, `Class Enrollment Roster: ${selectedClass.name}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ==================================================== */}
      {/* VIEW 1: STUDENTS → CLASSES OVERVIEW (DEFAULT) */}
      {/* ==================================================== */}
      {activeView === 'classes' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <GraduationCap className="w-6 h-6" />
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Student Management
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select a class to view enrolled students, manage class rosters, or add new students.
              </p>
            </div>

            {/* Overview Actions & Search */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={downloadStudentImportTemplate}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Download CSV template for bulk student registration"
              >
                <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">CSV Template</span>
              </button>

              {canManageStudents && (
                <button
                  type="button"
                  id="bulk-import-students-btn"
                  onClick={handleOpenBulkModal}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Import students in bulk via CSV file"
                >
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Bulk Import CSV</span>
                </button>
              )}

              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search classes or teachers..."
                  value={overviewSearch}
                  onChange={(e) => setOverviewSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-2xs focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Students
                </span>
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Users className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {students.length}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Active Enrolled Candidates
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Classes
                </span>
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {accessibleClasses.length}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Active Academic Levels
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Avg Class Size
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {accessibleClasses.length > 0
                  ? Math.round(students.length / accessibleClasses.length)
                  : 0}{' '}
                <span className="text-xs font-normal text-slate-400">Students / Class</span>
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Optimal Student-Teacher Ratio
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Attendance Average
                </span>
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Award className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                96.4%
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                Academic Standing: Excellent
              </p>
            </div>
          </div>

          {/* Classes Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Select Class to Manage Students</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  {filteredOverviewClasses.length} Classes
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOverviewClasses.map((cls) => {
                const enrolled = students.filter((s) => s.class === cls.name);
                const count = enrolled.length;
                const capacity = cls.capacity || 40;
                const percentFull = Math.min(100, Math.round((count / capacity) * 100));

                return (
                  <div
                    key={cls.id}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/60 dark:hover:border-purple-500/60 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-100 dark:border-purple-900">
                          {cls.code || 'CLS'}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {cls.roomNumber || 'Room 101'}
                        </span>
                      </div>

                      {/* Class Title */}
                      <div className="mt-3 cursor-pointer" onClick={() => handleSelectClass(cls)}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Class Teacher: {cls.classTeacher || 'Alexander Wright'}
                        </p>
                      </div>

                      {/* Student Count & Progress Bar */}
                      <div
                        className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer"
                        onClick={() => handleSelectClass(cls)}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Enrolled Students</span>
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {count} / {capacity}
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percentFull >= 90
                                ? 'bg-amber-500'
                                : 'bg-purple-600'
                            }`}
                            style={{ width: `${percentFull}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectClass(cls)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        <span>View Students</span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </button>

                      {(activeRole === 'Admin' || activeRole === 'Teacher') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClass(cls);
                            openAddModal(cls);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Student</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 2: CLASS ROSTER (SELECTED CLASS → STUDENTS) */}
      {/* ==================================================== */}
      {activeView === 'class-roster' && selectedClass && (
        <div className="space-y-6">
          {/* Breadcrumb Navigation & Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('classes')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
                title="Back to All Classes"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Students
                  </span>
                  <span className="text-slate-400">&gt;</span>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedClass.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {selectedClass.code || 'CLS'} • {selectedClass.roomNumber || 'Room 101'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Class Teacher: {selectedClass.classTeacher || 'Assigned Faculty'} | Enrolled Students: {classStudents.length}
                </p>
              </div>
            </div>

            {/* Roster Actions: Export & ADD STUDENT BUTTON */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={downloadStudentImportTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                title="Download CSV template for bulk student registration"
              >
                <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Template</span>
              </button>

              <button
                type="button"
                onClick={handleExportClassCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportClassPDF}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Download PDF Roster</span>
              </button>

              {canManageStudents && (
                <button
                  type="button"
                  id="roster-bulk-import-btn"
                  onClick={handleOpenBulkModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 shadow-2xs transition-all cursor-pointer"
                  title="Import students into class via CSV"
                >
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Bulk Import CSV</span>
                </button>
              )}

              {canManageStudents && (
                <button
                  type="button"
                  onClick={() => openAddModal(selectedClass)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student to {selectedClass.name}</span>
                </button>
              )}
            </div>
          </div>

          {/* Restriction / Polite Guidance Banner */}
          {restrictionError && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs flex items-start justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-100">Class Teacher Authorization Notice</p>
                  <p className="mt-0.5 leading-relaxed">{restrictionError}</p>
                </div>
              </div>
              <button
                onClick={() => setRestrictionError(null)}
                className="text-amber-700 dark:text-amber-300 hover:text-amber-900 p-1 rounded-lg"
              >
                <Trash2 className="w-4 h-4 opacity-0 pointer-events-none" />
              </button>
            </div>
          )}

          {/* Read-Only Notice if not designated class teacher */}
          {!canPerformClassOperations(selectedClass.name, 'student_registration').allowed && !restrictionError && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold uppercase tracking-wider">
                  Roster Oversight View
                </span>
                <p>
                  Class Teacher: <span className="font-bold text-slate-900 dark:text-white">{selectedClass.classTeacher || 'Assigned Faculty'}</span>. Student enrollment and roster editing are managed exclusively by the designated Class Teacher.
                </p>
              </div>
            </div>
          )}

          {/* Search, Filter, and View Layout Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search within class */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${selectedClass.name} students...`}
                  value={classSearchQuery}
                  onChange={(e) => {
                    setClassSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Section Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Section:</span>
                <select
                  value={selectedSectionFilter}
                  onChange={(e) => {
                    setSelectedSectionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All Sections</option>
                  {(selectedClass.sections || ['A', 'B']).map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => {
                    setSelectedStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Layout Mode Toggle */}
            <div className="flex items-center self-end md:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setDisplayMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  displayMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  displayMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STUDENTS DATA TABLE */}
          {displayMode === 'table' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">School ID</th>
                      <th className="py-3.5 px-4">Roll #</th>
                      <th className="py-3.5 px-4">Section</th>
                      <th className="py-3.5 px-4">Gender / DOB</th>
                      <th className="py-3.5 px-4">Parent / Guardian</th>
                      <th className="py-3.5 px-4 text-center">Attendance</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedStudents.length > 0 ? (
                      paginatedStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Student Name & Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={student.name}
                                avatarUrl={student.avatar}
                                size="md"
                                className="border border-slate-200 dark:border-slate-700"
                              />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {student.name}
                                </p>
                                <p className="text-[11px] text-slate-400">{student.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* ID */}
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                            {student.id}
                          </td>

                          {/* Roll */}
                          <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            #{student.rollNo}
                          </td>

                          {/* Section */}
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                              {student.section}
                            </span>
                          </td>

                          {/* Gender / DOB */}
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                            <span>{student.gender}</span>
                            <span className="block text-[11px] text-slate-400">{student.dob}</span>
                          </td>

                          {/* Parent Info */}
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {student.parentName}
                            </p>
                            <p className="text-[11px] text-slate-400">{student.parentPhone}</p>
                          </td>

                          {/* Attendance Rate */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                (student.attendanceRate || 95) >= 95
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {student.attendanceRate || 95}%
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                student.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedStudentForView(student)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                                title="View Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {(activeRole === 'Admin' || activeRole === 'Teacher') && (
                                <button
                                  onClick={() => setEditingStudent(student)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-purple-600 transition-colors"
                                  title="Edit Student"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {activeRole === 'Admin' && (
                                <button
                                  onClick={() => setDeletingStudent(student)}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 transition-colors"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          No students found in {selectedClass.name} matching your search or filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredClassStudents.length > pageSize && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}

          {/* STUDENTS CARD GRID (Display Mode: Cards) */}
          {displayMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={student.name}
                          avatarUrl={student.avatar}
                          size="lg"
                          className="border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {student.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {student.id} • #{student.rollNo}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold text-xs">
                        Sec {student.section}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Parent/Guardian:</span>
                        <span className="font-semibold">{student.parentName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Contact:</span>
                        <span>{student.parentPhone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Attendance:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {student.attendanceRate || 95}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        student.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {student.status}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedStudentForView(student)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(activeRole === 'Admin' || activeRole === 'Teacher') && (
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-purple-600"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {activeRole === 'Admin' && (
                        <button
                          onClick={() => setDeletingStudent(student)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODALS */}
      {/* ==================================================== */}

      {/* 1. ADD STUDENT MODAL (Class-Locked Workflow) */}
      {isAddModalOpen && selectedClass && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={`Enroll New Student to ${selectedClass.name}`}
          size="lg"
        >
          <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
            {/* Auto-Assigned Class Banner */}
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <span className="font-bold">Target Class: {selectedClass.name}</span>
                  <span className="block text-[11px] text-purple-700 dark:text-purple-300">
                    Class code {selectedClass.code || 'CLS'} • Room {selectedClass.roomNumber || 'Room 101'}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-200/80 dark:bg-purple-900 text-purple-950 dark:text-purple-100 font-bold">
                Class Locked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Ali"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* School ID */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student School ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU-2026-0129"
                  value={formData.schoolId}
                  onChange={(e) => {
                    setFormData({ ...formData, schoolId: e.target.value });
                    setIdError(null);
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border ${
                    idError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500`}
                />
                {idError && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{idError}</p>}
              </div>

              {/* Roll Number */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 202409"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Section */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                >
                  {(selectedClass.sections || ['A', 'B']).map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              {/* Student Email */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  placeholder="name@eduspike.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Parent & Contact Information Section */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Parent & Emergency Contact Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent/Guardian Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohamed Ali"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    placeholder="parent@gmail.com"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
              >
                Enroll Student
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. VIEW STUDENT PROFILE MODAL */}
      {selectedStudentForView && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStudentForView(null)}
          title="Official Student Enrollment Record"
          size="lg"
        >
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <UserAvatar
                name={selectedStudentForView.name}
                avatarUrl={selectedStudentForView.avatar}
                size="2xl"
                className="border-2 border-purple-200 dark:border-purple-900"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedStudentForView.name}
                </h3>
                <div className="flex flex-wrap gap-x-3 text-slate-500 dark:text-slate-400">
                  <span className="font-mono">{selectedStudentForView.id}</span>
                  <span>•</span>
                  <span>Roll #{selectedStudentForView.rollNo}</span>
                  <span>•</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {selectedStudentForView.class} (Sec {selectedStudentForView.section})
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Gender</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedStudentForView.gender}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedStudentForView.dob}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Blood Group</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedStudentForView.bloodGroup || 'O+'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Parent / Guardian</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedStudentForView.parentName}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Parent Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedStudentForView.parentPhone}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px]">Attendance Standing</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedStudentForView.attendanceRate || 98}% (Satisfactory)
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudentForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. EDIT STUDENT MODAL */}
      {editingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setEditingStudent(null)}
          title={`Edit Student: ${editingStudent.name}`}
          size="lg"
        >
          <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={editingStudent.rollNo}
                  onChange={(e) => setEditingStudent({ ...editingStudent, rollNo: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={editingStudent.parentName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Phone
                </label>
                <input
                  type="tel"
                  value={editingStudent.parentPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={editingStudent.status}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      status: e.target.value as 'Active' | 'Graduated' | 'Suspended',
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* BULK IMPORT STUDENTS MODAL */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          title="Bulk Import Students (CSV)"
          size="lg"
        >
          <div className="space-y-4">
            {/* Guide & Template download */}
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-purple-950 dark:text-purple-200">
                  Bulk Student Enrollment Pipeline
                </p>
                <p className="text-[11px] text-purple-700 dark:text-purple-300">
                  Quickly enroll dozens of students at once. Required headers: <code className="font-mono font-bold">Roll Number, Full Name, Class, Section, Gender, Parent Name, Parent Phone</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadStudentImportTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer"
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
                  Click to browse or drop your student CSV file here
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
                  placeholder={`Roll Number,Full Name,Email,Class,Section,Gender,Date of Birth (YYYY-MM-DD),Blood Group,Parent Name,Parent Phone,Parent Email\n202491,Lucas Bennett,lucas.bennett@eduspike.edu,Class 01,A,Male,2015-05-12,O+,Robert Bennett,+1 (555) 234-5678,robert.bennett@example.com`}
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
                        <th className="py-2 px-3">Roll #</th>
                        <th className="py-2 px-3">Student Name</th>
                        <th className="py-2 px-3">Class & Section</th>
                        <th className="py-2 px-3">Parent Info</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {bulkValidationResults.map((r) => (
                        <tr key={r.rowNumber} className={r.isValid ? 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40' : 'bg-rose-50/30 dark:bg-rose-950/20'}>
                          <td className="py-2 px-3 font-mono text-slate-400">{r.rowNumber}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {r.data?.rollNo || r.raw['Roll Number'] || r.raw['RollNo'] || '-'}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                            {r.data?.name || r.raw['Full Name'] || r.raw['Name'] || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                            {r.data?.class || r.raw['Class'] || '-'} ({r.data?.section || r.raw['Section'] || 'A'})
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                            {r.data?.parentName || r.raw['Parent Name'] || '-'}
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
                    <span>Enrolling Students...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import {validCount} Verified Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 4. DELETE STUDENT MODAL */}
      {deletingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingStudent(null)}
          title="Confirm Student Account Removal"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently remove{' '}
              <strong className="text-slate-900 dark:text-white">{deletingStudent.name}</strong> (
              {deletingStudent.id}) from the academic database?
            </p>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
