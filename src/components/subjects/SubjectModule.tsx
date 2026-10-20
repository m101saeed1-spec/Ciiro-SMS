import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Subject } from '../../types';
import { Modal } from '../common/Modal';
import { BookMarked, Plus, Edit, Trash2, Search, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

export const SubjectModule: React.FC = () => {
  const { activeRole, currentUser } = useAuth();
  const { subjects, addSubject, updateSubject, deleteSubject, teachers, students, globalSearch } = useSchoolData();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Theory' as 'Theory' | 'Practical' | 'Both',
    classes: 'Class 01, Class 02',
    teachers: teachers[0]?.name || 'Alexander Wright',
    passMarks: 40,
    totalMarks: 100,
  });

  const effectiveSearch = searchQuery || globalSearch;

  // Student filtering
  const student = students.find((s) => s.id === currentUser.studentId);
  const studentClass = student?.class || 'Class 02';

  const accessibleSubjects = activeRole === 'Student'
    ? subjects.filter((s) => s.classes.includes(studentClass) || s.classes.some((c) => studentClass.includes(c)))
    : subjects;

  const filteredSubjects = accessibleSubjects.filter(
    (s) =>
      s.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(effectiveSearch.toLowerCase())
  );

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    addSubject({
      name: formData.name,
      code: formData.code || `SUB-${Math.floor(100 + Math.random() * 900)}`,
      type: formData.type,
      classes: formData.classes.split(',').map((c) => c.trim()),
      teachers: [formData.teachers],
      passMarks: Number(formData.passMarks),
      totalMarks: Number(formData.totalMarks),
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      code: '',
      type: 'Theory',
      classes: 'Class 01, Class 02',
      teachers: teachers[0]?.name || 'Alexander Wright',
      passMarks: 40,
      totalMarks: 100,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold border border-[#1E3A63] flex items-center gap-1">
              <BookMarked className="w-3.5 h-3.5" />
              {activeRole === 'Student' ? 'Enrolled Curriculum' : 'Academic Curriculum'}
            </span>
            {activeRole === 'Student' && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{studentClass}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeRole === 'Student' ? 'My Subjects' : 'Subjects Curriculum'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeRole === 'Student'
              ? `Courses and syllabi assigned to your class (${studentClass}) for the 2026-2027 academic session.`
              : 'Manage course subjects, examination pass marks, assigned teachers, and class applicability'}
          </p>
        </div>

        {activeRole !== 'Student' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gold"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subject title or code..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((sub) => (
          <div
            key={sub.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-2.5 py-1 rounded-lg">
                  {sub.code}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                  {sub.type}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{sub.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pass Requirement: <span className="font-bold text-slate-700 dark:text-slate-200">{sub.passMarks}</span> / {sub.totalMarks} Marks
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-medium">Assigned Faculty:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{sub.teachers.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-medium">Applicable Classes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sub.classes.map((cls, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold rounded">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {activeRole !== 'Student' ? (
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setEditingSubject(sub)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] hover:bg-[#3B82F6]/10 dark:hover:bg-[#3B82F6]/20"
                  title="Edit Subject"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingSubject(sub)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3" /> Read Only
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Subject Modal (Admin only) */}
      {activeRole !== 'Student' && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Subject">
          <form onSubmit={handleCreateSubject} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Chemistry"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CHEM-202"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="Theory" className="dark:bg-slate-800">Theory</option>
                  <option value="Practical" className="dark:bg-slate-800">Practical</option>
                  <option value="Both" className="dark:bg-slate-800">Both</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="btn-gold w-full mt-2"
            >
              Create Subject
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Subject Modal (Admin only) */}
      {deletingSubject && activeRole !== 'Student' && (
        <Modal
          isOpen={!!deletingSubject}
          onClose={() => setDeletingSubject(null)}
          title="Delete Subject"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deletingSubject.name}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingSubject(null)}
              className="btn-outline-navy text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteSubject(deletingSubject.id);
                setDeletingSubject(null);
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
