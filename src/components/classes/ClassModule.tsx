import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { SchoolClass } from '../../types';
import { Modal } from '../common/Modal';
import {
  Layers,
  Plus,
  Users,
  UserCheck,
  Edit,
  Trash2,
  Eye,
  Building
} from 'lucide-react';

export const ClassModule: React.FC = () => {
  const { classes, addClass, updateClass, deleteClass, students, teachers } = useSchoolData();

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
          <h1 className="text-2xl font-bold text-slate-800">Class Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic grades, sections, room allocations, and assigned class teachers
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.class === cls.name);
          return (
            <div
              key={cls.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg">
                    {cls.name.replace('Class ', '')}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {cls.roomNumber}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800">{cls.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Code: {cls.code}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Class Teacher:</span>
                    <span className="font-bold text-purple-700">{cls.classTeacher}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Active Sections:</span>
                    <div className="flex gap-1">
                      {cls.sections.map((sec) => (
                        <span
                          key={sec}
                          className="px-2 py-0.5 rounded bg-purple-100/70 text-purple-700 text-[10px] font-bold"
                        >
                          Sec {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Enrolled Students:</span>
                    <span className="font-bold text-slate-800">
                      {classStudents.length || cls.totalStudents} / {cls.capacity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedClassForView(cls)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Students
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingClass(cls)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingClass(cls)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
            <p className="text-xs text-slate-500">
              Class Teacher: <span className="font-bold text-slate-800">{selectedClassForView.classTeacher}</span> | Room: {selectedClassForView.roomNumber}
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {students.filter((s) => s.class === selectedClassForView.name).length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No students currently enrolled in this class.</p>
              ) : (
                students
                  .filter((s) => s.class === selectedClassForView.name)
                  .map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-800">{st.name}</p>
                          <p className="text-[10px] text-slate-400">Roll No: #{st.rollNo}</p>
                        </div>
                      </div>
                      <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md text-[10px]">
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Class Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Class 06"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class Teacher</label>
              <select
                value={formData.classTeacher}
                onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Allocation</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="Room 203"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 mt-2"
          >
            Save Class
          </button>
        </form>
      </Modal>

      {/* Delete Class */}
      {deletingClass && (
        <Modal
          isOpen={!!deletingClass}
          onClose={() => setDeletingClass(null)}
          title="Delete Class"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 mb-6">
            Are you sure you want to delete <span className="font-bold text-slate-800">{deletingClass.name}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingClass(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteClass(deletingClass.id);
                setDeletingClass(null);
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
