import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { SyllabusItem } from '../../types';
import { Modal } from '../common/Modal';
import { FileUploadDropzone, UploadedFileData } from './FileUploadDropzone';
import { FilePreviewModal } from './FilePreviewModal';
import {
  Search,
  Plus,
  FileText,
  Download,
  Eye,
  Trash2,
  Edit,
  Filter,
  Calendar,
  Layers,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SyllabusSection: React.FC = () => {
  const { syllabus, addSyllabusItem, updateSyllabusItem, deleteSyllabusItem, downloadFile, globalSearch } = useSchoolData();
  const { currentUser, activeRole } = useAuth();

  const isStaffOrAdmin = activeRole === 'Admin' || activeRole === 'Teacher';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedTerm, setSelectedTerm] = useState('All Terms');
  const [selectedYear, setSelectedYear] = useState('2026-2027');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SyllabusItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<SyllabusItem | null>(null);
  const [previewItem, setPreviewItem] = useState<SyllabusItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    subject: string;
    class: string;
    term: string;
    academicYear: string;
    description: string;
    topics: string;
    file: UploadedFileData | null;
  }>({
    title: '',
    subject: 'Mathematics',
    class: 'Class 8',
    term: 'Term 1',
    academicYear: '2026-2027',
    description: '',
    topics: '',
    file: null,
  });

  const effectiveSearch = searchQuery || globalSearch;

  // Distinct filter options
  const gradeOptions = ['All Grades', ...Array.from(new Set(syllabus.map((s) => s.class)))];
  const subjectOptions = ['All Subjects', ...Array.from(new Set(syllabus.map((s) => s.subject)))];
  const termOptions = ['All Terms', 'Term 1', 'Term 2', 'Term 3', 'Annual'];
  const yearOptions = ['2026-2027', '2025-2026'];

  const filteredSyllabus = syllabus.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.subject.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      item.class.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      (item.topics && item.topics.some((t) => t.toLowerCase().includes(effectiveSearch.toLowerCase())));

    const matchesGrade = selectedGrade === 'All Grades' || item.class.toLowerCase() === selectedGrade.toLowerCase();
    const matchesSubject = selectedSubject === 'All Subjects' || item.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesTerm = selectedTerm === 'All Terms' || item.term.toLowerCase() === selectedTerm.toLowerCase();
    const matchesYear = !selectedYear || item.academicYear === selectedYear;

    return matchesSearch && matchesGrade && matchesSubject && matchesTerm && matchesYear;
  });

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      subject: 'Mathematics',
      class: 'Class 8',
      term: 'Term 1',
      academicYear: '2026-2027',
      description: '',
      topics: 'Unit 1: Fundamentals\nUnit 2: Application\nUnit 3: Exam Review',
      file: {
        fileName: 'Syllabus_Curriculum_Document.pdf',
        fileSize: '1.4 MB',
        fileType: 'pdf',
        fileData: '--- AUDIENTA CURRICULUM SYLLABUS ---\nAcademic Standard: 2026-2027\nValidated for school year.\n\nLearning Outcomes & Topic Breakdown verified.',
      },
    });
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: SyllabusItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subject: item.subject,
      class: item.class,
      term: item.term,
      academicYear: item.academicYear,
      description: item.description || '',
      topics: (item.topics || []).join('\n'),
      file: {
        fileName: item.fileName,
        fileSize: item.fileSize,
        fileType: item.fileType,
        fileData: item.fileData,
      },
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const topicsArray = formData.topics
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const filePayload = formData.file || {
      fileName: `${formData.subject}_${formData.class}_Syllabus.pdf`,
      fileSize: '1.2 MB',
      fileType: 'pdf' as const,
      fileData: `--- OFFICIAL SYLLABUS: ${formData.title} ---\nSubject: ${formData.subject}\nClass: ${formData.class}\nTerm: ${formData.term}\nAcademic Year: ${formData.academicYear}\n\nTopics:\n${topicsArray.join('\n')}`,
    };

    if (editingItem) {
      updateSyllabusItem(editingItem.id, {
        title: formData.title,
        subject: formData.subject,
        class: formData.class,
        term: formData.term,
        academicYear: formData.academicYear,
        description: formData.description,
        topics: topicsArray,
        fileName: filePayload.fileName,
        fileSize: filePayload.fileSize,
        fileType: filePayload.fileType,
        fileData: filePayload.fileData,
      });
    } else {
      addSyllabusItem({
        title: formData.title,
        subject: formData.subject,
        class: formData.class,
        term: formData.term,
        academicYear: formData.academicYear,
        description: formData.description,
        topics: topicsArray,
        fileName: filePayload.fileName,
        fileSize: filePayload.fileSize,
        fileType: filePayload.fileType,
        fileData: filePayload.fileData,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header filter controls & search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search syllabus by title, subject, grade, or topic keyword..."
              className="w-full bg-slate-50/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pl-4 pr-10 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F7A914]/20 focus:bg-white dark:focus:bg-slate-800 font-medium"
            />
            <Search className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Add button for Teachers/Admins */}
          {isStaffOrAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="btn-gold text-xs py-2.5 px-5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Syllabus Document</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Grade filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Grade / Class</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Subject filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {subjectOptions.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Term filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Academic Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {termOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Syllabus Cards Grid */}
      {filteredSyllabus.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#F7A914] dark:text-[#122E52] mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No syllabus documents found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, grade, term, or academic year filter to find what you need.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSyllabus.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 hover:shadow-md dark:hover:shadow-slate-950/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badges bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] border border-[#1E3A63]/80 font-bold text-[10px]">
                      {item.class}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] border border-[#3B82F6]/30 font-semibold text-[10px]">
                      {item.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                      {item.term}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400">{item.academicYear}</span>
                </div>

                {/* Title and Description */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#3B82F6] dark:group-hover:text-[#F7A914] transition-colors line-clamp-1">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Topics Pills */}
                {item.topics && item.topics.length > 0 && (
                  <div className="mt-3.5 space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Layers className="w-3 h-3 text-[#3B82F6] dark:text-[#60A5FA]" />
                      <span>Curriculum Outline ({item.topics.length} Units)</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {item.topics.slice(0, 3).map((topic, tIdx) => (
                        <li key={tIdx} className="flex items-center gap-1.5 text-[11px] truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F7A914] shrink-0" />
                          <span className="truncate">{topic}</span>
                        </li>
                      ))}
                      {item.topics.length > 3 && (
                        <li className="text-[10px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold pl-3">
                          + {item.topics.length - 3} more topics in document
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Footer: File info & Action buttons */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* File summary pill */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 bg-[#EFF6FF]/30 dark:bg-[#1E3A63] p-2 rounded-xl border border-[#1E3A63] dark:border-[#1E3A63]">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA] shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300 text-[11px]">{item.fileName}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#3B82F6] dark:text-[#60A5FA] shrink-0 bg-[#EFF6FF] dark:bg-[#1E3A63] px-1.5 py-0.5 rounded">
                    {item.fileType} • {item.fileSize}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => downloadFile(item.fileName, item.fileData, item.fileType)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#122E52]/20 hover:bg-[#EFF6FF] dark:hover:bg-[#0B1B32] text-[#3B82F6] dark:text-[#60A5FA] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-[#1E3A63] dark:border-[#1E3A63]"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>

                  {isStaffOrAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#F7A914] rounded-lg hover:bg-[#EFF6FF] dark:hover:bg-[#0B1B32] transition-colors"
                        title="Edit Syllabus"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Delete Syllabus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Syllabus Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingItem ? 'Edit Syllabus Curriculum' : 'Upload Syllabus Document'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Syllabus Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Class 8 Advanced Mathematics - Annual Curriculum"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Class / Grade</label>
              <input
                type="text"
                required
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="e.g. Class 8 or Grade 10"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Mathematics, Science, English"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Academic Term</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Annual">Annual Curriculum</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2026-2027"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Curriculum Topics (One per line)</label>
            <textarea
              rows={3}
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              placeholder="Unit 1: Linear Equations & Algebra&#10;Unit 2: Geometry & Coordinate Planes&#10;Unit 3: Probability & Statistics"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Overview Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Comprehensive syllabus guidelines, learning objectives, and exam milestones."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* File Upload Dropzone */}
          <FileUploadDropzone
            label="Upload Syllabus Document (PDF, DOCX, PPTX)"
            currentFile={formData.file}
            onFileSelected={(file) => setFormData({ ...formData, file })}
            onFileRemoved={() => setFormData({ ...formData, file: null })}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl btn-navy text-white font-bold text-xs shadow-md shadow-md"
            >
              {editingItem ? 'Save Changes' : 'Publish Syllabus'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <Modal isOpen={!!deletingItem} onClose={() => setDeletingItem(null)} title="Delete Syllabus Item" maxWidth="sm">
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to remove syllabus document <span className="font-bold text-slate-900 dark:text-white">{deletingItem.title}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingItem(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteSyllabusItem(deletingItem.id);
                setDeletingItem(null);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <FilePreviewModal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={previewItem.title}
          subtitle={`Curriculum for ${previewItem.subject} (${previewItem.class})`}
          fileName={previewItem.fileName}
          fileType={previewItem.fileType}
          fileSize={previewItem.fileSize}
          uploadedBy={`${previewItem.uploadedBy} (${previewItem.uploadedByRole})`}
          uploadedAt={previewItem.uploadedAt}
          description={previewItem.description}
          topics={previewItem.topics}
          fileData={previewItem.fileData}
          categoryOrSubject={previewItem.subject}
          gradeOrClass={previewItem.class}
          academicYear={previewItem.academicYear}
          term={previewItem.term}
        />
      )}
    </div>
  );
};
