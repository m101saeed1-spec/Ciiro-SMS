import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { SchoolCalendarEvent, SchoolEventType } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Filter,
  CheckCircle2,
  CalendarCheck,
  PartyPopper,
  GraduationCap,
  CalendarDays,
  ListFilter,
  AlertCircle,
  X,
  Eye,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface InteractiveSchoolCalendarProps {
  onNavigate?: (module: any) => void;
  className?: string;
}

const INITIAL_EVENTS: SchoolCalendarEvent[] = [
  {
    id: 'evt-001',
    title: 'Mid-Term Examinations (Term 1)',
    type: 'exam',
    date: '2026-10-12',
    endDate: '2026-10-16',
    time: '08:30 AM - 01:30 PM',
    location: 'Main Academic Halls & Examination Centers',
    description: 'Comprehensive mid-term evaluation covering STEM and Humanities core curriculum.',
    targetAudience: 'Students',
    status: 'Upcoming',
  },
  {
    id: 'evt-002',
    title: 'National Teachers & Education Day',
    type: 'holiday',
    date: '2026-10-21',
    description: 'Campus closed in honor of national educators and academic excellence across Somalia.',
    targetAudience: 'All',
    status: 'Upcoming',
  },
  {
    id: 'evt-003',
    title: 'Annual STEM & Robotics Innovation Fair',
    type: 'academic',
    date: '2026-10-28',
    time: '09:00 AM - 04:00 PM',
    location: 'Science Auditorium & Innovation Pavilion',
    description: 'Student project exhibitions, coding demonstrations, and robotics competition.',
    targetAudience: 'All',
    status: 'Upcoming',
  },
  {
    id: 'evt-004',
    title: 'Inter-School Athletics Championship',
    type: 'sports',
    date: '2026-11-04',
    time: '08:00 AM - 02:00 PM',
    location: 'Campus Sports Complex & Track Stadium',
    description: 'Track and field tournaments, football finals, and sportsmanship awards.',
    targetAudience: 'All',
    status: 'Upcoming',
  },
  {
    id: 'evt-005',
    title: 'Term 1 Parent-Teacher Academic Conference',
    type: 'meeting',
    date: '2026-11-14',
    time: '09:00 AM - 03:00 PM',
    location: 'Classroom Blocks & Central Amphitheater',
    description: 'One-on-one parent conferences reviewing progress transcripts and term attendance.',
    targetAudience: 'Parents',
    status: 'Upcoming',
  },
  {
    id: 'evt-006',
    title: 'Final Term Examinations',
    type: 'exam',
    date: '2026-12-07',
    endDate: '2026-12-15',
    time: '08:30 AM - 01:00 PM',
    location: 'All Grade Classrooms',
    description: 'Cumulative final examinations for Term 1 grading and academic ranking.',
    targetAudience: 'Students',
    status: 'Upcoming',
  },
  {
    id: 'evt-007',
    title: 'Winter & New Academic Year Holiday Break',
    type: 'holiday',
    date: '2026-12-20',
    endDate: '2027-01-03',
    description: 'School winter recess and semester break for all faculty and students.',
    targetAudience: 'All',
    status: 'Upcoming',
  },
];

export const InteractiveSchoolCalendar: React.FC<InteractiveSchoolCalendarProps> = ({
  onNavigate,
  className = '',
}) => {
  const { activeRole, isPrincipal, isOwnerAdmin, isSuperAdmin } = useAuth();
  const { exams = [], addToast } = useSchoolData();
  const { tr } = useLanguage();

  const canManageEvents = isSuperAdmin || isOwnerAdmin || isPrincipal || activeRole === 'Teacher';

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 4)); // Oct 2026 baseline
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [eventsList, setEventsList] = useState<SchoolCalendarEvent[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<SchoolCalendarEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'academic' as SchoolEventType,
    date: '2026-10-15',
    time: '09:00 AM - 12:00 PM',
    location: 'Main Auditorium',
    description: '',
    targetAudience: 'All' as 'All' | 'Students' | 'Teachers' | 'Parents',
  });

  // Combine static events with dynamic exams registered in the system
  const allEvents = useMemo(() => {
    const dynamicExamEvents: SchoolCalendarEvent[] = (exams || []).map((ex) => ({
      id: `dynamic-exam-${ex.id}`,
      title: ex.title,
      type: 'exam',
      date: ex.startDate || '2026-10-12',
      endDate: ex.endDate,
      time: '08:30 AM - 01:00 PM',
      location: `Classes: ${ex.classes?.join(', ') || 'All Grades'}`,
      description: `${ex.term} institutional exam evaluation series.`,
      targetAudience: 'Students',
      status: ex.status || 'Upcoming',
    }));

    // Deduplicate by ID
    const combined = [...eventsList];
    dynamicExamEvents.forEach((de) => {
      if (!combined.some((e) => e.title === de.title && e.date === de.date)) {
        combined.push(de);
      }
    });

    return combined;
  }, [eventsList, exams]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      if (selectedTypeFilter !== 'all' && evt.type !== selectedTypeFilter) return false;
      return true;
    });
  }, [allEvents, selectedTypeFilter]);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 4));
  };

  // Build Calendar Days for Month View
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: SchoolCalendarEvent[];
    }> = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        dateString: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        events: filteredEvents.filter((e) => e.date === dateStr),
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(dayNum).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const isToday = dateStr === '2026-10-04' || dateStr === new Date().toISOString().slice(0, 10);

      days.push({
        dateString: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday,
        events: filteredEvents.filter((e) => {
          if (e.date === dateStr) return true;
          if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
          return false;
        }),
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        dateString: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        events: filteredEvents.filter((e) => e.date === dateStr),
      });
    }

    return days;
  }, [year, month, filteredEvents]);

  // Build Week Days for Weekly View
  const weekDays = useMemo(() => {
    const currentDayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

    const days: Array<{
      date: Date;
      dateString: string;
      dayName: string;
      dayNumber: number;
      isToday: boolean;
      events: SchoolCalendarEvent[];
    }> = [];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = dateStr === '2026-10-04';

      days.push({
        date: d,
        dateString: dateStr,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        isToday,
        events: filteredEvents.filter((e) => {
          if (e.date === dateStr) return true;
          if (e.endDate && dateStr >= e.date && dateStr <= e.endDate) return true;
          return false;
        }),
      });
    }

    return days;
  }, [currentDate, filteredEvents]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) {
      addToast('Please enter an event title', 'warning');
      return;
    }

    const created: SchoolCalendarEvent = {
      id: `evt-custom-${Date.now()}`,
      title: newEvent.title.trim(),
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      description: newEvent.description,
      targetAudience: newEvent.targetAudience,
      status: 'Upcoming',
    };

    setEventsList((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewEvent({
      title: '',
      type: 'academic',
      date: '2026-10-15',
      time: '09:00 AM - 12:00 PM',
      location: 'Main Auditorium',
      description: '',
      targetAudience: 'All',
    });
    addToast(`Calendar event "${created.title}" scheduled successfully!`, 'success');
  };

  const getEventTypeBadge = (type: SchoolEventType) => {
    switch (type) {
      case 'exam':
        return {
          bg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          dot: 'bg-rose-500',
          label: 'Exam Evaluation',
        };
      case 'holiday':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          label: 'School Holiday',
        };
      case 'sports':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          label: 'Sports Tournament',
        };
      case 'meeting':
        return {
          bg: 'bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] border-[#3B82F6]/30 dark:border-[#3B82F6]/40',
          dot: 'bg-[#3B82F6]',
          label: 'Academic Meeting',
        };
      case 'academic':
      default:
        return {
          bg: 'bg-[#FEF3C7] dark:bg-[#1E3A63] text-[#92400E] dark:text-[#F7A914] border-[#FDE68A] dark:border-[#1E3A63]',
          dot: 'bg-[#F7A914]',
          label: 'Academic Event',
        };
    }
  };

  return (
    <div className={`p-6 sm:p-7 rounded-3xl border shadow-xs space-y-6 font-sans card-theme ${className}`}>
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & INTERACTIVE NAVIGATION TOOLBAR                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight" >
                {tr('Interactive School Calendar & Academic Schedule', 'Jadwalka Dugsiga & Dhacdooyinka')}
              </h2>
              <p className="text-xs subtext-theme">
                {tr('Track upcoming examination terms, public holidays, sports events, and parent-teacher meetings.', 'La soco imtixaanaadka, fasaxyada, iyo dhacdooyinka dugsiga.')}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher, Filter & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter by Category */}
          <div className="relative">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer outline-none focus:ring-2 focus:ring-[#3B82F6]"
              
            >
              <option value="all">{tr('All Event Categories', 'Dhammaan Noocyada')}</option>
              <option value="exam">{tr('Exams & Assessments', 'Imtixaanaad')}</option>
              <option value="holiday">{tr('Public Holidays & Breaks', 'Fasaxyo')}</option>
              <option value="academic">{tr('Academic & STEM Events', 'Dhacdooyinka Tacliinta')}</option>
              <option value="sports">{tr('Sports & Tournaments', 'Ciyaaraha')}</option>
              <option value="meeting">{tr('Conferences & Meetings', 'Kulamada')}</option>
            </select>
          </div>

          {/* Monthly vs Weekly View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-[#3B82F6] dark:text-[#60A5FA] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tr('Monthly', 'Bille')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-[#3B82F6] dark:text-[#60A5FA] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tr('Weekly', 'Toddobaadle')}
            </button>
          </div>

          {/* Today Button & Chevron Nav */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              
            >
              {tr('Today', 'Maanta')}
            </button>
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add Event Button for Authorized Roles */}
          {canManageEvents && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn-gold"
            >
              <Plus className="w-4 h-4" />
              <span>{tr('Add Event', 'Kudar Dhacdo')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Current Month / Period Headline Banner */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tight" >
          {viewMode === 'month'
            ? `${monthNames[month]} ${year}`
            : `Week of ${monthNames[weekDays[0].date.getMonth()]} ${weekDays[0].date.getDate()}, ${weekDays[0].date.getFullYear()}`}
        </h3>
        
        <div className="flex items-center gap-3 text-xs subtext-theme font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Exams</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Holidays</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F7A914]" />
            <span>Academic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Sports</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIEW A: MONTHLY CALENDAR GRID                                          */}
      {/* ========================================================================= */}
      {viewMode === 'month' && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-extrabold py-2.5" >
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Day Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {calendarDays.map((cell, idx) => {
              return (
                <div
                  key={`${cell.dateString}-${idx}`}
                  className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors ${
                    !cell.isCurrentMonth ? 'bg-slate-50/40 dark:bg-slate-950/40 opacity-40' : ''
                  } ${cell.isToday ? 'bg-[#122E52]/5 dark:bg-[#122E52]/30 ring-1 ring-inset ring-[#F7A914]/40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? 'bg-[#122E52] text-[#F7A914] font-black'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.events.length > 0 && (
                      <span className="text-[10px] font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                        {cell.events.length} {cell.events.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Event Badges inside Cell */}
                  <div className="space-y-1 mt-1.5 overflow-hidden">
                    {cell.events.slice(0, 2).map((evt) => {
                      const badge = getEventTypeBadge(evt.type);
                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`px-1.5 py-1 rounded-md text-[10px] font-bold truncate cursor-pointer transition-all hover:scale-101 border ${badge.bg}`}
                          title={evt.title}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                            <span className="truncate">{evt.title}</span>
                          </div>
                        </div>
                      );
                    })}

                    {cell.events.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(cell.events[0])}
                        className="text-[9px] font-extrabold text-[#3B82F6] dark:text-[#60A5FA] hover:underline block text-center"
                      >
                        +{cell.events.length - 2} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW B: WEEKLY CALENDAR EXPANDED VIEW                                  */}
      {/* ========================================================================= */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <div
              key={day.dateString}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 min-h-[220px] transition-all ${
                day.isToday
                  ? 'bg-[#122E52]/5 dark:bg-[#122E52]/30 border-[#F7A914] shadow-xs ring-1 ring-[#F7A914]/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase">
                    {day.dayName.slice(0, 3)}
                  </span>
                  <span className="text-lg font-black" >
                    {day.dayNumber}
                  </span>
                </div>
                {day.isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-[#122E52] text-[#F7A914] text-[9px] font-black uppercase">
                    Today
                  </span>
                )}
              </div>

              {/* Day Events */}
              <div className="space-y-2 flex-1">
                {day.events.length === 0 ? (
                  <div className="text-[11px] subtext-theme italic pt-4 text-center">
                    No scheduled events
                  </div>
                ) : (
                  day.events.map((evt) => {
                    const badge = getEventTypeBadge(evt.type);
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all hover:scale-102 space-y-1 ${badge.bg}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${badge.dot}`} />
                          <span className="font-black truncate">{evt.title}</span>
                        </div>
                        {evt.time && (
                          <div className="text-[10px] font-medium opacity-85 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{evt.time}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. UPCOMING HIGHLIGHTED AGENDA TICKER                                      */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3B82F6]" />
            <h4 className="text-xs font-black uppercase tracking-wider" >
              {tr('Upcoming Key School Milestones', 'Dhacdooyinka Muhiimka ah ee Soo Socda')}
            </h4>
          </div>
          <span className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA]">
            {allEvents.length} {tr('Active Milestones', 'Dhacdo')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allEvents.slice(0, 3).map((evt) => {
            const badge = getEventTypeBadge(evt.type);
            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#F7A914] dark:hover:border-[#F7A914] transition-all cursor-pointer space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] font-bold font-mono text-[#3B82F6] dark:text-[#60A5FA]">
                    {evt.date}
                  </span>
                </div>

                <h5 className="text-xs font-black truncate" >
                  {evt.title}
                </h5>

                <p className="text-[11px] subtext-theme line-clamp-1">
                  {evt.description || evt.location || 'Campus Academic Activity'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. EVENT DETAILS DIALOG MODAL                                              */}
      {/* ========================================================================= */}
      {selectedEvent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.title}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${getEventTypeBadge(selectedEvent.type).bg}`}>
                {getEventTypeBadge(selectedEvent.type).label}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                Audience: {selectedEvent.targetAudience || 'All School Community'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#3B82F6]" />
                <span className="font-bold" >
                  Date: {selectedEvent.date} {selectedEvent.endDate ? `to ${selectedEvent.endDate}` : ''}
                </span>
              </div>

              {selectedEvent.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#3B82F6]" />
                  <span className="subtext-theme font-medium">Time: {selectedEvent.time}</span>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3B82F6]" />
                  <span className="subtext-theme font-medium">Venue: {selectedEvent.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h5 className="text-xs font-bold" >
                Description & Academic Notice
              </h5>
              <p className="text-xs subtext-theme leading-relaxed">
                {selectedEvent.description || 'Official scheduled school event recorded in the centralized academic calendar.'}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE EVENT MODAL                                                     */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Schedule New School Event / Exam / Holiday"
          size="md"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Event / Exam Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Science Fair, Mid-Term Exam, National Holiday"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Event Category</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as SchoolEventType })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer"
                  
                >
                  <option value="exam">Examination</option>
                  <option value="holiday">School Holiday / Recess</option>
                  <option value="academic">Academic & STEM Fair</option>
                  <option value="sports">Sports Tournament</option>
                  <option value="meeting">Parent / Faculty Meeting</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Target Audience</label>
                <select
                  value={newEvent.targetAudience}
                  onChange={(e) => setNewEvent({ ...newEvent, targetAudience: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer"
                  
                >
                  <option value="All">All School Community</option>
                  <option value="Students">Students Only</option>
                  <option value="Teachers">Faculty & Staff</option>
                  <option value="Parents">Parents & Guardians</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer"
                  
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Time Range</label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM - 01:00 PM"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Campus Location / Venue</label>
              <input
                type="text"
                placeholder="e.g. Main Auditorium, Science Lab 2"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Brief description of the event, preparation notes, or schedule..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gold"
              >
                Schedule Event
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
