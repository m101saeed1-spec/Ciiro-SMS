import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { TimetableSlot } from '../../types';
import {
  CalendarDays,
  Clock,
  Plus,
  Filter,
  User,
  Layers,
  Sparkles,
  Printer,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  BookOpen,
  MapPin,
  Coffee,
  CalendarCheck,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIME_PRESETS = [
  { label: '08:00 - 08:45', start: '08:00', end: '08:45', name: 'Period 1' },
  { label: '08:45 - 09:30', start: '08:45', end: '09:30', name: 'Period 2' },
  { label: '09:30 - 10:15', start: '09:30', end: '10:15', name: 'Period 3' },
  { label: '10:15 - 10:45', start: '10:15', end: '10:45', name: 'Morning Break', isBreak: true },
  { label: '10:45 - 11:30', start: '10:45', end: '11:30', name: 'Period 4' },
  { label: '11:30 - 12:15', start: '11:30', end: '12:15', name: 'Period 5' },
  { label: '12:15 - 13:00', start: '12:15', end: '13:00', name: 'Lunch Break', isBreak: true },
  { label: '13:00 - 13:45', start: '13:00', end: '13:45', name: 'Period 6' },
  { label: '13:45 - 14:30', start: '13:45', end: '14:30', name: 'Period 7' },
];

export const TimetableModule: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const {
    classes,
    subjects,
    teachers,
    students,
    timetables,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    addToast,
  } = useSchoolData();

  // Role context evaluation
  const currentStudent = useMemo(() => {
    if (activeRole === 'Student') {
      return students.find((s) => s.id === currentUser.studentId) || null;
    }
    return null;
  }, [activeRole, currentUser, students]);

  // Selected filters
  const [selectedClass, setSelectedClass] = useState<string>(
    currentStudent ? currentStudent.class : 'Class 01'
  );
  const [selectedSection, setSelectedSection] = useState<string>(
    currentStudent ? currentStudent.section : 'A'
  );
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    activeRole === 'Teacher' && currentUser.teacherId ? currentUser.teacherId : teachers[0]?.teacherId || ''
  );

  // Modals
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Form State
  const [slotForm, setSlotForm] = useState({
    class: 'Class 01',
    section: 'A',
    day: 'Monday',
    startTime: '08:00',
    endTime: '08:45',
    type: 'Subject' as TimetableSlot['type'],
    subject: 'Mathematics',
    teacherId: teachers[0]?.teacherId || '',
    roomNumber: 'Room 101',
    notes: '',
  });

  // Keep selectedClass synced if student or parent context changes
  React.useEffect(() => {
    if (currentStudent) {
      setSelectedClass(currentStudent.class);
      setSelectedSection(currentStudent.section);
    }
  }, [currentStudent]);

  // Filter slots for active view
  const currentSlots = useMemo(() => {
    if (viewMode === 'teacher') {
      return timetables.filter((t) => t.teacherId === selectedTeacherId);
    }
    return timetables.filter(
      (t) => t.class === selectedClass && (!t.section || t.section === selectedSection)
    );
  }, [timetables, viewMode, selectedTeacherId, selectedClass, selectedSection]);

  // Handlers
  const handleOpenCreate = (day?: string, timePreset?: typeof TIME_PRESETS[0]) => {
    setConflictError(null);
    setEditingSlot(null);
    setSlotForm({
      class: selectedClass,
      section: selectedSection,
      day: day || 'Monday',
      startTime: timePreset ? timePreset.start : '08:00',
      endTime: timePreset ? timePreset.end : '08:45',
      type: timePreset?.isBreak ? 'Break' : 'Subject',
      subject: timePreset?.isBreak ? 'Recess Break' : subjects[0]?.name || 'Mathematics',
      teacherId: teachers[0]?.teacherId || '',
      roomNumber: 'Room 101',
      notes: '',
    });
    setIsAddSlotOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setConflictError(null);
    setEditingSlot(slot);
    setSlotForm({
      class: slot.class,
      section: slot.section,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      type: slot.type,
      subject: slot.subject || '',
      teacherId: slot.teacherId || teachers[0]?.teacherId || '',
      roomNumber: slot.roomNumber || '',
      notes: slot.notes || '',
    });
    setIsAddSlotOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const teacherObj = teachers.find((t) => t.teacherId === slotForm.teacherId);

    const payload = {
      class: slotForm.class,
      section: slotForm.section,
      day: slotForm.day,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      type: slotForm.type,
      subject: slotForm.type === 'Subject' ? slotForm.subject : slotForm.subject || slotForm.type,
      teacherId: slotForm.type === 'Subject' ? slotForm.teacherId : undefined,
      teacherName: slotForm.type === 'Subject' && teacherObj ? teacherObj.name : undefined,
      roomNumber: slotForm.roomNumber,
      notes: slotForm.notes,
    };

    if (editingSlot) {
      const res = await updateTimetableSlot(editingSlot.id, payload);
      if (res.success) {
        setIsAddSlotOpen(false);
      } else {
        setConflictError(res.error || 'Schedule collision occurred.');
      }
    } else {
      const res = await addTimetableSlot(payload);
      if (res.success) {
        setIsAddSlotOpen(false);
      } else {
        setConflictError(res.error || 'Schedule collision occurred.');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Color generator for subjects
  const getSubjectColor = (subjectName?: string, type?: string) => {
    if (type === 'Break') return 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200';
    if (type === 'Assembly') return 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/80 text-purple-900 dark:text-purple-200';
    switch (subjectName) {
      case 'Mathematics':
        return 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/70 text-blue-900 dark:text-blue-200';
      case 'English':
      case 'Literature':
        return 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70 text-emerald-900 dark:text-emerald-200';
      case 'Science':
      case 'Physics':
      case 'Chemistry':
        return 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/70 text-purple-900 dark:text-purple-200';
      case 'History':
      case 'Geography':
        return 'bg-orange-50/90 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/70 text-orange-900 dark:text-orange-200';
      case 'Computer Science':
      case 'Robotics':
        return 'bg-cyan-50/90 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/70 text-cyan-900 dark:text-cyan-200';
      case 'Arts & Crafts':
      case 'Music':
        return 'bg-pink-50/90 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800/70 text-pink-900 dark:text-pink-200';
      default:
        return 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100';
    }
  };

  // Only the Headteacher (Principal) has authority to create, edit, or remove timetable periods.
  // Teachers, Students, School Owners, and Accountants have read-only view access.
  const canManageTimetable = activeRole === 'Principal';

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 dark:bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-200 dark:shadow-purple-950/50">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              {activeRole === 'Student'
                ? 'My Class Timetable'
                : activeRole === 'Teacher'
                ? 'Faculty & Class Timetable'
                : 'Class Timetable Management'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {canManageTimetable
                ? 'Manage weekly schedules with automated teacher, room, and class conflict prevention.'
                : activeRole === 'Teacher'
                ? 'View your personal weekly teaching slots and inspect schedules across classes.'
                : 'Weekly structured schedule with subject periods, faculty, and classroom locations.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Timetable (PDF)
          </button>

          {canManageTimetable && (
            <button
              onClick={() => handleOpenCreate()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 dark:hover:bg-purple-500 shadow-md shadow-purple-200 dark:shadow-purple-950/50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Period Slot
            </button>
          )}
        </div>
      </div>

      {/* View Switchers & Dropdowns Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Toggle Mode for Admin & Teacher */}
        {(canManageTimetable || activeRole === 'Teacher') && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('class')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'class'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Class Schedule
            </button>
            <button
              onClick={() => setViewMode('teacher')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'teacher'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Teacher Schedule
            </button>
          </div>
        )}

        {/* Filters according to mode */}
        <div className="flex items-center gap-3 flex-wrap">
          {viewMode === 'class' ? (
            <>
              {/* If Admin or Teacher, allow selecting class */}
              {(canManageTimetable || activeRole === 'Teacher') && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Class:</span>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Section:</span>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>
              )}

              {/* If Student */}
              {activeRole === 'Student' && currentStudent && (
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-semibold flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Class: {currentStudent.class} • Section {currentStudent.section}
                </div>
              )}
            </>
          ) : (
            /* Teacher Schedule Selector */
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Faculty Member:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.teacherId}>
                    {t.name} ({t.teacherId} - {t.subject})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Weekly Timetable Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white text-base">
              {viewMode === 'class'
                ? `Weekly Timetable: ${selectedClass} (Section ${selectedSection})`
                : `Teaching Schedule: ${
                    teachers.find((t) => t.teacherId === selectedTeacherId)?.name || selectedTeacherId
                  }`}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Monday through Friday • Academic Term 2026
            </span>
          </div>

          <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/60 px-2.5 py-1 rounded-full">
            {currentSlots.length} Scheduled Slot(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5 font-bold uppercase w-32 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  Time Slot
                </th>
                {DAYS_OF_WEEK.map((day) => (
                  <th key={day} className="p-3.5 font-bold uppercase border-r border-slate-200 dark:border-slate-800 last:border-r-0 text-slate-600 dark:text-slate-300">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TIME_PRESETS.map((preset) => {
                if (preset.isBreak) {
                  return (
                    <tr key={preset.label} className="bg-amber-50/40 dark:bg-amber-950/20">
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                        <div className="font-mono text-slate-800 dark:text-slate-200">{preset.label}</div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">{preset.name}</div>
                      </td>
                      <td colSpan={5} className="p-3 text-center text-amber-800 dark:text-amber-300 font-semibold italic">
                        <div className="flex items-center justify-center gap-2">
                          <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>{preset.name} — All Classes & Faculty</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={preset.label} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Time Column */}
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800">
                      <div className="font-mono text-slate-800 dark:text-white font-bold">{preset.label}</div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold">{preset.name}</div>
                    </td>

                    {/* Days Columns */}
                    {DAYS_OF_WEEK.map((day) => {
                      const slot = currentSlots.find(
                        (s) =>
                          s.day === day &&
                          ((s.startTime <= preset.start && s.endTime >= preset.end) ||
                            (s.startTime >= preset.start && s.startTime < preset.end))
                      );

                      return (
                        <td
                          key={day}
                          className="p-2.5 border-r border-slate-100 dark:border-slate-800/80 last:border-r-0 align-top h-24 relative group"
                        >
                          {slot ? (
                            <div
                              className={`h-full p-2.5 rounded-xl border flex flex-col justify-between transition-all shadow-2xs hover:shadow-sm ${getSubjectColor(
                                slot.subject,
                                slot.type
                              )}`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-bold text-xs leading-tight text-slate-900 dark:text-white">
                                    {slot.subject || slot.type}
                                  </span>
                                  {canManageTimetable && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                      <button
                                        onClick={() => handleOpenEdit(slot)}
                                        className="p-1 rounded bg-white/80 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
                                        title="Edit Slot"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => deleteTimetableSlot(slot.id)}
                                        className="p-1 rounded bg-white/80 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs"
                                        title="Remove Slot"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {viewMode === 'teacher' ? (
                                  <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 mt-1">
                                    {slot.class} (Sec {slot.section})
                                  </div>
                                ) : (
                                  slot.teacherName && (
                                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-1 font-medium">
                                      <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                      <span className="truncate">{slot.teacherName}</span>
                                    </div>
                                  )
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400">
                                {slot.roomNumber && (
                                  <span className="flex items-center gap-1 truncate max-w-[90px]">
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{slot.roomNumber}</span>
                                  </span>
                                )}
                                <span className="font-mono font-medium">
                                  {slot.startTime}-{slot.endTime}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Empty Slot Cell */
                            <div className="h-full rounded-xl border border-dashed border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-colors">
                              {canManageTimetable ? (
                                <button
                                  onClick={() => handleOpenCreate(day, preset)}
                                  className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-[11px]"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                              ) : (
                                <span className="text-[11px] italic text-slate-300 dark:text-slate-600">Free Period</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Add / Edit Timetable Slot with Conflict Alerts (Admin) */}
      {/* ========================================================================= */}
      {isAddSlotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-800 dark:text-white text-lg">
                  {editingSlot ? 'Edit Timetable Period' : 'Schedule Timetable Period'}
                </h2>
              </div>
              <button
                onClick={() => setIsAddSlotOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Collision Error Alert */}
            {conflictError && (
              <div className="my-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Collision Detected:</span>
                  <span>{conflictError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-4 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Class *
                  </label>
                  <select
                    value={slotForm.class}
                    onChange={(e) => setSlotForm({ ...slotForm, class: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Section *
                  </label>
                  <select
                    value={slotForm.section}
                    onChange={(e) => setSlotForm({ ...slotForm, section: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Day *
                  </label>
                  <select
                    value={slotForm.day}
                    onChange={(e) => setSlotForm({ ...slotForm, day: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Period Type *
                  </label>
                  <select
                    value={slotForm.type}
                    onChange={(e) =>
                      setSlotForm({
                        ...slotForm,
                        type: e.target.value as TimetableSlot['type'],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
                  >
                    <option value="Subject">Subject Class</option>
                    <option value="Break">Break / Recess</option>
                    <option value="Assembly">Morning Assembly</option>
                    <option value="Study">Study Hall / Library</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Subject / Name *
                  </label>
                  {slotForm.type === 'Subject' ? (
                    <select
                      value={slotForm.subject}
                      onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={slotForm.subject}
                      onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  )}
                </div>
              </div>

              {slotForm.type === 'Subject' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Assigned Teacher *
                    </label>
                    <select
                      value={slotForm.teacherId}
                      onChange={(e) => setSlotForm({ ...slotForm, teacherId: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 [&>option]:bg-white [&>option]:dark:bg-slate-800 [&>option]:dark:text-white"
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.teacherId}>
                          {t.name} ({t.subject})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Classroom / Room No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Room 101, Science Lab A"
                      value={slotForm.roomNumber}
                      onChange={(e) => setSlotForm({ ...slotForm, roomNumber: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 dark:bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 dark:hover:bg-purple-500 shadow-md shadow-purple-200 dark:shadow-purple-950/50 transition-all"
                >
                  {editingSlot ? 'Update Period' : 'Schedule Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
