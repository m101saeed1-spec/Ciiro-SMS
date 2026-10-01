import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { SyllabusSection } from './SyllabusSection';
import { BooksSection } from './BooksSection';
import { LearningResourcesSection } from './LearningResourcesSection';
import {
  BookOpen,
  BookMarked,
  FileText,
  Layers,
  GraduationCap,
  Sparkles,
  Download,
  FolderTree,
  ShieldCheck,
} from 'lucide-react';

export type LibraryTab = 'syllabus' | 'books' | 'resources';

export const LibraryModule: React.FC = () => {
  const { books, syllabus, learningResources } = useSchoolData();
  const { activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>('syllabus');

  // Stats calculations
  const totalBooksCount = books.length;
  const totalSyllabusCount = syllabus.length;
  const totalResourcesCount = learningResources.length;
  const totalAvailableBooks = books.filter((b) => b.status === 'Available').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Academic Library & Repository</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Verified
            </span>
          </h1>
          <nav className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <span className="hover:text-slate-600 dark:hover:text-slate-300">Audienta Portal</span>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              {activeTab === 'syllabus' ? 'Syllabus Curriculum' : activeTab === 'books' ? 'Books Catalog' : 'Learning Resources'}
            </span>
          </nav>
        </div>

        {/* Quick stat indicators pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="font-bold">{totalSyllabusCount}</span>
            <span className="text-slate-400 text-[11px]">Syllabi</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold">{totalBooksCount}</span>
            <span className="text-slate-400 text-[11px]">Books</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="font-bold">{totalResourcesCount}</span>
            <span className="text-slate-400 text-[11px]">Resources</span>
          </div>
        </div>
      </div>

      {/* Tab Selector Header Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {/* Syllabus Tab */}
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'syllabus'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Syllabus ({totalSyllabusCount})</span>
        </button>

        {/* Books Tab */}
        <button
          onClick={() => setActiveTab('books')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'books'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Books Catalog ({totalBooksCount})</span>
        </button>

        {/* Learning Resources Tab */}
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'resources'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Learning Resources ({totalResourcesCount})</span>
        </button>
      </div>

      {/* Render Active Section */}
      <div className="transition-opacity duration-200">
        {activeTab === 'syllabus' && <SyllabusSection />}
        {activeTab === 'books' && <BooksSection />}
        {activeTab === 'resources' && <LearningResourcesSection />}
      </div>
    </div>
  );
};
