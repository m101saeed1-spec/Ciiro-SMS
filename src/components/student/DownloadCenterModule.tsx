import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  exportStudentReportPDF,
  exportFeeReceiptPDF,
  exportDocumentManifestPDF,
} from '../../utils/pdfExport';
import { exportDocumentsCSV } from '../../utils/csvExport';
import {
  Download,
  FileText,
  CalendarDays,
  CreditCard,
  BookOpen,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Search,
  X,
  FileSpreadsheet,
  FileDown,
  Layers,
  Filter,
} from 'lucide-react';

export const DownloadCenterModule: React.FC = () => {
  const { currentUser, activeSchool } = useAuth();
  const { students, marks, studentMarks, feePayments, addToast } = useSchoolData();

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handlePrintDocument = (docId: string, title: string) => {
    addToast({
      title: 'Initiating Print',
      message: `Opening browser print preview for "${title}".`,
      type: 'info',
    });

    if (docId === 'doc-report') {
      const targetStudent = students.find((s) => s.id === currentUser.studentId) || students[0];
      const targetMarks = (studentMarks && studentMarks.length > 0 ? studentMarks : marks).filter(
        (m) => m.studentId === targetStudent.id
      );

      try {
        exportStudentReportPDF(targetStudent, targetMarks, {
          schoolName: activeSchool?.name,
          generatedBy: currentUser.name,
        });
      } catch {
        // Fallback to browser print
      }
      setTimeout(() => {
        window.print();
      }, 400);
      return;
    }

    if (docId === 'doc-fee-receipt') {
      const targetPayment = feePayments.find((p) => p.studentId === currentUser.studentId) || feePayments[0];
      if (targetPayment) {
        try {
          exportFeeReceiptPDF(targetPayment, undefined, {
            schoolName: activeSchool?.name,
            generatedBy: currentUser.name,
          });
        } catch {
          // Fallback to browser print
        }
      }
      setTimeout(() => {
        window.print();
      }, 400);
      return;
    }

    // Default browser print
    window.print();
  };

  const rawDocuments = [
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
        const targetStudent = students.find((s) => s.id === currentUser.studentId) || students[0];
        const targetMarks = (studentMarks && studentMarks.length > 0 ? studentMarks : marks).filter(
          (m) => m.studentId === targetStudent.id
        );
        exportStudentReportPDF(targetStudent, targetMarks, {
          schoolName: activeSchool?.name,
          generatedBy: currentUser.name,
        });
        addToast({
          title: 'Document Ready',
          message: 'Report Form PDF has been generated and downloaded.',
          type: 'success',
        });
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
        const targetPayment = feePayments.find((p) => p.studentId === currentUser.studentId) || feePayments[0];
        if (targetPayment) {
          exportFeeReceiptPDF(targetPayment, undefined, {
            schoolName: activeSchool?.name,
            generatedBy: currentUser.name,
          });
        }
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

  // Available unique categories
  const categories = useMemo(() => {
    const set = new Set(rawDocuments.map((d) => d.category));
    return ['All', ...Array.from(set)];
  }, [rawDocuments]);

  // Filtered documents by search query and category
  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rawDocuments.filter((doc) => {
      const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.fileType.toLowerCase().includes(q) ||
        doc.date.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [rawDocuments, searchQuery, selectedCategory]);

  // Export Document Manifest CSV
  const handleExportCSV = () => {
    exportDocumentsCSV(
      filteredDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        fileType: d.fileType,
        size: d.size,
        date: d.date,
      })),
      activeSchool?.name
    );
    addToast({
      title: 'CSV Manifest Downloaded',
      message: `Exported ${filteredDocuments.length} document records as CSV.`,
      type: 'success',
    });
  };

  // Export Document Manifest PDF
  const handleExportPDF = () => {
    exportDocumentManifestPDF(
      filteredDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        fileType: d.fileType,
        size: d.size,
        date: d.date,
      })),
      {
        schoolName: activeSchool?.name,
        generatedBy: currentUser.name,
      }
    );
    addToast({
      title: 'PDF Manifest Downloaded',
      message: `Exported document inventory manifest as PDF.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-200/50 dark:shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-purple-100 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-purple-200" /> Academic Download Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Authorized Academic Documents</h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1">
            Download and print certified institutional records, report cards, receipts, and study schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download CSV Manifest Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
            title="Download document list as CSV file"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Download CSV</span>
          </button>

          {/* Export PDF Manifest Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
            title="Export document list as PDF file"
          >
            <FileDown className="w-4 h-4 text-purple-200" />
            <span>Export PDF</span>
          </button>

          {/* Browser Print Overview Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
            title="Print entire documents overview directly from browser"
          >
            <Printer className="w-4 h-4 text-purple-200" />
            <span>Print Overview</span>
          </button>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 px-3 border border-white/20 text-xs text-purple-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Digitally signed</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Real-time Search Input Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="document-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title, category, format (e.g. 'Report Card', 'Financial', 'Timetable')..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {filteredDocuments.length} of {rawDocuments.length} available
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs shadow-purple-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Documents Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn't find any documents matching "{searchQuery}" in category "{selectedCategory}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                      {doc.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{doc.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {doc.fileType} • {doc.size} • Issued {doc.date}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Dedicated Browser Print Button */}
                    <button
                      type="button"
                      onClick={() => handlePrintDocument(doc.id, doc.title)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                      title={`Print ${doc.title} directly from browser`}
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Print</span>
                    </button>

                    {/* Download PDF Button */}
                    <button
                      type="button"
                      onClick={doc.action}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-200 dark:shadow-none transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
