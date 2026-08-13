import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Student } from '../../types';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
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
  UserCheck
} from 'lucide-react';

export const StudentsModule: React.FC = () => {
  const { activeRole } = useAuth();
  const { students, addStudent, updateStudent, deleteStudent, globalSearch } = useSchoolData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // New Student Form
  const [formData, setFormData] = useState({
    schoolId: 'STU-2026-0127',
    name: '',
    rollNo: '',
    email: '',
    class: 'Class 01',
    section: 'A',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    dob: '2016-05-12',
    bloodGroup: 'A+',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    status: 'Active' as 'Active' | 'Graduated' | 'Suspended',
  });

  const [idError, setIdError] = useState<string | null>(null);

  const openAddModal = () => {
    const nextNum = 125 + students.length + 1;
    const autoId = `STU-2026-${String(nextNum).padStart(4, '0')}`;
    setFormData({
      schoolId: autoId,
      name: '',
      rollNo: `2026${String(nextNum).slice(-2)}`,
      email: '',
      class: 'Class 01',
      section: 'A',
      gender: 'Female',
      dob: '2016-05-12',
      bloodGroup: 'A+',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      status: 'Active',
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

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateStudentId(formData.schoolId);
    if (error) {
      setIdError(error);
      return;
    }

    addStudent({
      id: formData.schoolId.toUpperCase(),
      rollNo: formData.rollNo || `2026${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name,
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200`,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu`,
      class: formData.class,
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

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, editingStudent);
    setEditingStudent(null);
  };

  const effectiveSearch = searchQuery || globalSearch;

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      s.parentName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesClass =
      selectedClassFilter === 'All' || s.class === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student records, class enrollments, and profiles
          </p>
        </div>
        {(activeRole === 'Admin' || activeRole === 'Teacher') && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll #..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All Classes</option>
              <option value="Class 01">Class 01</option>
              <option value="Class 02">Class 02</option>
              <option value="Class 03">Class 03</option>
              <option value="Class 04">Class 04</option>
              <option value="Class 05">Class 05</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6">Roll No / ID</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Class & Sec</th>
                <th className="py-3.5 px-4">Parent Info</th>
                <th className="py-3.5 px-4">Attendance Rate</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 pl-6 font-bold text-slate-800">
                      <div>
                        <span>#{st.rollNo}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{st.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{st.name}</p>
                          <p className="text-[11px] text-slate-400">{st.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs">
                        {st.class} ({st.section})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{st.parentName}</p>
                      <p className="text-[11px] text-slate-400">{st.parentPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{ width: `${st.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{st.attendanceRate}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          st.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudentForView(st)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="View ID Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(activeRole === 'Admin' || activeRole === 'Teacher') && (
                          <>
                            <button
                              onClick={() => setEditingStudent(st)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Student"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingStudent(st)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Student"
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

        {/* Pagination Bar */}
        <div className="px-6 py-2 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredStudents.length}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Student Profile & ID Card Modal */}
      {selectedStudentForView && (
        <Modal
          isOpen={!!selectedStudentForView}
          onClose={() => setSelectedStudentForView(null)}
          title="Student Profile & ID Card"
          maxWidth="md"
        >
          <div className="space-y-6">
            {/* ID Card Visual */}
            <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6" />
                  <span className="font-extrabold text-sm uppercase tracking-wider">EduSpike Student ID</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  2026-2027
                </span>
              </div>

              <div className="flex items-center gap-5">
                <img
                  src={selectedStudentForView.avatar}
                  alt={selectedStudentForView.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30"
                />
                <div>
                  <h3 className="text-lg font-bold">{selectedStudentForView.name}</h3>
                  <p className="text-xs text-purple-200 mt-0.5">Roll No: #{selectedStudentForView.rollNo}</p>
                  <p className="text-xs font-semibold text-white mt-1 bg-white/20 inline-block px-2.5 py-0.5 rounded-md">
                    {selectedStudentForView.class} - Section {selectedStudentForView.section}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Guardian / Parent</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedStudentForView.parentName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Parent Contact</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedStudentForView.parentPhone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Date of Birth</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedStudentForView.dob}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="font-bold text-slate-800 block mt-0.5">{selectedStudentForView.bloodGroup}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Enroll New Student">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          {idError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {idError}
            </div>
          )}

          {/* School ID Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Generated Student School ID <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                UNIQUE ID
              </span>
            </div>
            <input
              type="text"
              required
              value={formData.schoolId}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setFormData({ ...formData, schoolId: val });
                setIdError(validateStudentId(val));
              }}
              placeholder="e.g. STU-2026-0127"
              className="w-full bg-purple-50/50 border border-purple-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Unique School ID for student login and academic record linking.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Liam Parker"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="e.g. 202609"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="Class 01">Class 01</option>
                <option value="Class 02">Class 02</option>
                <option value="Class 03">Class 03</option>
                <option value="Class 04">Class 04</option>
                <option value="Class 05">Class 05</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Name</label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="e.g. Jonathan Parker"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone</label>
              <input
                type="text"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="+1 (555) 000-1122"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 mt-2"
          >
            Save & Enroll Student
          </button>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          title="Edit Student Information"
        >
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
              <input
                type="text"
                value={editingStudent.name}
                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
                <input
                  type="text"
                  value={editingStudent.class}
                  onChange={(e) => setEditingStudent({ ...editingStudent, class: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone</label>
                <input
                  type="text"
                  value={editingStudent.parentPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
            >
              Update Changes
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Student Confirmation */}
      {deletingStudent && (
        <Modal
          isOpen={!!deletingStudent}
          onClose={() => setDeletingStudent(null)}
          title="Confirm Delete Student"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 mb-6">
            Are you sure you want to remove <span className="font-bold text-slate-800">{deletingStudent.name}</span> from the student directory?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingStudent(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteStudent(deletingStudent.id);
                setDeletingStudent(null);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
