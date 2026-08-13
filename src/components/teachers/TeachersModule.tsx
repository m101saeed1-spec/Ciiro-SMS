import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Teacher } from '../../types';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
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
  Layers
} from 'lucide-react';

export const TeachersModule: React.FC = () => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, globalSearch } = useSchoolData();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

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

  const [idError, setIdError] = useState<string | null>(null);

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
    setIsAddModalOpen(true);
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

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateTeacherId(formData.teacherId);
    if (error) {
      setIdError(error);
      return;
    }

    addTeacher({
      teacherId: formData.teacherId.toUpperCase(),
      name: formData.name,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@eduspike.edu`,
      phone: formData.phone || '+1 (555) 000-9988',
      subjects: formData.subjects.split(',').map((s) => s.trim()),
      classesAssigned: formData.classesAssigned.split(',').map((c) => c.trim()),
      qualification: formData.qualification,
      joiningDate: new Date().toISOString().split('T')[0],
      gender: formData.gender,
      status: 'Active',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty & Teachers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage teacher profiles, qualifications, and assigned class subjects
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by teacher name, subject, ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6">Teacher ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Assigned Subjects</th>
                <th className="py-3.5 px-4">Assigned Classes</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginatedTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 pl-6 font-bold text-slate-800">{t.teacherId}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-100"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{t.name}</p>
                        <p className="text-[11px] text-slate-400">{t.qualification}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {t.subjects.map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-purple-100/80 text-purple-700 text-[10px] font-bold"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold text-slate-700">
                      {t.classesAssigned.join(', ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{t.phone}</p>
                    <p className="text-[11px] text-slate-400">{t.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingTeacher(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="View Faculty Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTeacher(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Teacher"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTeacher(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-2 border-t border-slate-100">
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

      {/* Teacher View Modal */}
      {viewingTeacher && (
        <Modal
          isOpen={!!viewingTeacher}
          onClose={() => setViewingTeacher(null)}
          title="Faculty Profile"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
              <img
                src={viewingTeacher.avatar}
                alt={viewingTeacher.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-300"
              />
              <div>
                <h3 className="text-base font-bold text-slate-800">{viewingTeacher.name}</h3>
                <p className="text-xs font-semibold text-purple-700">{viewingTeacher.qualification}</p>
                <p className="text-xs text-slate-500 mt-1">ID: {viewingTeacher.teacherId} • Joined {viewingTeacher.joiningDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Phone</span>
                <span className="font-bold text-slate-800 block mt-0.5">{viewingTeacher.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Email</span>
                <span className="font-bold text-slate-800 block mt-0.5 truncate">{viewingTeacher.email}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Teacher Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Faculty Member">
        <form onSubmit={handleCreateTeacher} className="space-y-3">
          {idError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {idError}
            </div>
          )}

          {/* Teacher School ID Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Teacher School ID Number <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
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
              className="w-full bg-purple-50/50 border border-purple-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Robert Vance"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@eduspike.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 mt-2"
          >
            Save Faculty Record
          </button>
        </form>
      </Modal>

      {/* Delete Teacher */}
      {deletingTeacher && (
        <Modal
          isOpen={!!deletingTeacher}
          onClose={() => setDeletingTeacher(null)}
          title="Confirm Delete Faculty"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 mb-6">
            Are you sure you want to remove <span className="font-bold text-slate-800">{deletingTeacher.name}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingTeacher(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteTeacher(deletingTeacher.id);
                setDeletingTeacher(null);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
