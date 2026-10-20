import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { SchoolClass } from '../../types';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import {
  Layers,
  Plus,
  Users,
  UserCheck,
  Edit,
  Trash2,
  Eye,
  Building,
  Award,
  ShieldCheck,
} from 'lucide-react';

export const ClassModule: React.FC = () => {
  const { activeRole, isPrincipal, isOwnerAdmin, isAdmin, currentUser } = useAuth();
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    nominateClassTeacher,
    students,
    teachers,
  } = useSchoolData();

  const canManageClasses =
    isPrincipal ||
    isOwnerAdmin ||
    isAdmin ||
    activeRole === 'Principal' ||
    activeRole === 'OwnerAdmin' ||
    activeRole === 'Admin';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClassForView, setSelectedClassForView] = useState<SchoolClass | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [deletingClass, setDeletingClass] = useState<SchoolClass | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    sections: 'A, B',
    classTeacher: teachers[0]?.name || 'Alexander Wright',
    capacity: 35,
    roomNumber: 'Room 203',
  });

  // Role-scoped class list (Teachers see their assigned classes)
  const displayedClasses = React.useMemo(() => {
    if (activeRole === 'Teacher') {
      const assigned = currentUser.assignedClasses || [];
      const teacherFiltered = classes.filter(
        (c) =>
          assigned.includes(c.name) ||
          c.classTeacher === currentUser.name ||
          (currentUser.classTeacherOf || []).includes(c.name)
      );
      return teacherFiltered.length > 0 ? teacherFiltered : classes;
    }
    return classes;
  }, [classes, activeRole, currentUser]);

  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    sections: '',
    classTeacher: '',
    capacity: 35,
    roomNumber: '',
    reason: 'Nominated by School Principal',
  });

  const handleOpenEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    setEditFormData({
      name: cls.name,
      code: cls.code,
      sections: cls.sections.join(', '),
      classTeacher: cls.classTeacher,
      capacity: cls.capacity,
      roomNumber: cls.roomNumber,
      reason: 'Official appointment by School Principal',
    });
  };

  const handleUpdateClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const selectedTeacher = teachers.find((t) => t.name === editFormData.classTeacher);
    const teacherChanged = editFormData.classTeacher !== editingClass.classTeacher;

    if (teacherChanged && selectedTeacher) {
      await nominateClassTeacher(
        editingClass.id,
        selectedTeacher.teacherId || selectedTeacher.id,
        selectedTeacher.name,
        editFormData.reason
      );
    }

    await updateClass(editingClass.id, {
      name: editFormData.name,
      code: editFormData.code,
      sections: editFormData.sections.split(',').map((s) => s.trim()),
      roomNumber: editFormData.roomNumber,
      capacity: Number(editFormData.capacity),
      classTeacher: editFormData.classTeacher,
      classTeacherId: selectedTeacher?.id || editingClass.classTeacherId,
    });

    setEditingClass(null);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    addClass({
      name: formData.name,
      code: formData.code || `CLS-${Math.floor(10 + Math.random() * 90)}`,
      sections: formData.sections.split(',').map((s) => s.trim()),
      classTeacher: formData.classTeacher,
      classTeacherId: teachers.find((t) => t.name === formData.classTeacher)?.id || 'TCH-001',
      totalStudents: 0,
      capacity: Number(formData.capacity),
      roomNumber: formData.roomNumber,
    });
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      code: '',
      sections: 'A, B',
      classTeacher: teachers[0]?.name || 'Alexander Wright',
      capacity: 35,
      roomNumber: 'Room 203',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {activeRole === 'Teacher' ? 'My Classes' : activeRole === 'Student' ? 'My Class' : 'Class Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeRole === 'Teacher'
              ? 'Classes and cohorts assigned to you for teaching and classroom records'
              : 'Manage academic grades, sections, room allocations, and assigned class teachers'}
          </p>
        </div>
        {canManageClasses && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        )}
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedClasses.map((cls) => {
          const classStudents = students.filter((s) => s.class === cls.name);
          return (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center font-black text-lg shadow-inner">
                    {cls.name.replace('Class ', '')}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    {cls.roomNumber}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cls.name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Code: {cls.code}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Class Teacher:</span>
                    <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA]">{cls.classTeacher}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Active Sections:</span>
                    <div className="flex gap-1">
                      {cls.sections.map((sec) => (
                        <span
                          key={sec}
                          className="px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] text-[10px] font-bold border border-[#1E3A63]"
                        >
                          Sec {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Enrolled Students:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {classStudents.length || cls.totalStudents} / {cls.capacity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedClassForView(cls)}
                  className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] hover:text-[#122E52] dark:hover:text-[#F7A914] flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Students
                </button>
                <div className="flex items-center gap-1">
                  {canManageClasses && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#F7A914] hover:bg-[#122E52]/10 dark:hover:bg-[#122E52]/30 transition-colors cursor-pointer"
                      title="Edit Class & Nominate Class Teacher"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  )}
                  {canManageClasses && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] hover:bg-[#3B82F6]/10 dark:hover:bg-[#3B82F6]/20 transition-colors cursor-pointer"
                      title="Edit Class Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {canManageClasses && (
                    <button
                      type="button"
                      onClick={() => setDeletingClass(cls)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Students View Modal */}
      {selectedClassForView && (
        <Modal
          isOpen={!!selectedClassForView}
          onClose={() => setSelectedClassForView(null)}
          title={`Students in ${selectedClassForView.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Class Teacher: <span className="font-bold text-slate-900 dark:text-white">{selectedClassForView.classTeacher}</span> | Room: {selectedClassForView.roomNumber}
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {students.filter((s) => s.class === selectedClassForView.name).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No students currently enrolled in this class.</p>
              ) : (
                students
                  .filter((s) => s.class === selectedClassForView.name)
                  .map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar name={st.name} avatarUrl={st.avatar} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{st.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">Roll No: #{st.rollNo}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#3B82F6]/10 border border-[#1E3A63] px-2 py-0.5 rounded-md text-[10px]">
                        Section {st.section}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Class Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Class">
        <form onSubmit={handleCreateClass} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Class 06"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class Teacher</label>
              <select
                value={formData.classTeacher}
                onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.name} className="dark:bg-slate-800">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Allocation</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="Room 203"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-gold w-full mt-2"
          >
            Save Class
          </button>
        </form>
      </Modal>

      {/* Edit Class & Nominate Class Teacher Modal */}
      {editingClass && (
        <Modal
          isOpen={!!editingClass}
          onClose={() => setEditingClass(null)}
          title={`Edit & Nominate: ${editingClass.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateClassSubmit} className="space-y-3.5">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#3B82F6] dark:text-[#60A5FA]">
                School Principal / Admin executive action: update classroom settings or nominate/transfer Class Teacher
                authority. All previous student logs and attendance history are fully preserved.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class Code</label>
                <input
                  type="text"
                  required
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Designated Class Teacher</span>
                <span className="text-[10px] text-[#3B82F6] dark:text-[#60A5FA] font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" /> Principal Nomination
                </span>
              </label>
              <select
                value={editFormData.classTeacher}
                onChange={(e) => setEditFormData({ ...editFormData, classTeacher: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.name} className="dark:bg-slate-800">
                    {t.name} ({t.teacherId}) — {t.qualification}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sections</label>
                <input
                  type="text"
                  required
                  value={editFormData.sections}
                  onChange={(e) => setEditFormData({ ...editFormData, sections: e.target.value })}
                  placeholder="A, B"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Allocation</label>
                <input
                  type="text"
                  required
                  value={editFormData.roomNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, roomNumber: e.target.value })}
                  placeholder="Room 203"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Executive Appointment Remarks
              </label>
              <input
                type="text"
                required
                value={editFormData.reason}
                onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                placeholder="Official appointment order rationale"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="btn-outline-navy text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gold"
              >
                Update Class & Nominate
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Class */}
      {deletingClass && (
        <Modal
          isOpen={!!deletingClass}
          onClose={() => setDeletingClass(null)}
          title="Delete Class"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deletingClass.name}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingClass(null)}
              className="btn-outline-navy text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteClass(deletingClass.id);
                setDeletingClass(null);
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
