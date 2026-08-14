import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  Download,
  FileText,
  CalendarDays,
  CreditCard,
  BookOpen,
  ShieldCheck,
  Printer,
  CheckCircle2,
  FileCheck,
  Lock,
} from 'lucide-react';

export const DownloadCenterModule: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast } = useSchoolData();

  const documents = [
    {
      id: 'doc-report',
      title: 'Term 1 Official Academic Report Card',
      category: 'Academic Records',
      fileType: 'PDF Document',
      size: '245 KB',
      date: '14 Oct, 2026',
      icon: FileText,
      color: 'purple',
      action: () => {
        addToast({
          title: 'Document Ready',
          message: 'Report Form PDF is ready for printing / saving.',
          type: 'success',
        });
        window.print();
      },
    },
    {
      id: 'doc-timetable',
      title: 'Class 02 Weekly Timetable Schedule',
      category: 'Schedules',
      fileType: 'PDF Document',
      size: '120 KB',
      date: '01 Sep, 2026',
      icon: CalendarDays,
      color: 'blue',
      action: () => {
        addToast({
          title: 'Timetable Downloaded',
          message: 'Class Timetable PDF has been downloaded.',
          type: 'success',
        });
      },
    },
    {
      id: 'doc-fee-receipt',
      title: 'Official School Tuition Fee Receipt (#RCP-2026-0042)',
      category: 'Financial Statements',
      fileType: 'PDF Document',
      size: '180 KB',
      date: '20 Sep, 2026',
      icon: CreditCard,
      color: 'emerald',
      action: () => {
        addToast({
          title: 'Receipt Downloaded',
          message: 'Fee Payment Receipt has been downloaded.',
          type: 'success',
        });
      },
    },
    {
      id: 'doc-handbook',
      title: 'EduSpike Student Handbook & Code of Conduct',
      category: 'Institutional Guides',
      fileType: 'PDF Document',
      size: '1.4 MB',
      date: '01 Sep, 2026',
      icon: BookOpen,
      color: 'amber',
      action: () => {
        addToast({
          title: 'Handbook Opened',
          message: 'Student Handbook document downloaded.',
          type: 'success',
        });
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-purple-100 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-purple-200" /> Student Download Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Authorized Academic Documents</h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1">
            Download and print certified institutional records, receipts, and study schedules.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-xs text-purple-100 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>All documents digitally signed & cryptographically verified</span>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-inner">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {doc.category}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-0.5">{doc.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {doc.fileType} • {doc.size} • Issued {doc.date}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                </span>
                <button
                  onClick={doc.action}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
