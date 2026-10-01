import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { LearningResource } from '../../types';
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
  FileCheck,
  FileSpreadsheet,
  Layers,
  GraduationCap,
  Sparkles,
  BookMarked,
  Tag,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const LearningResourcesSection: React.FC = () => {
  const {
    learningResources,
    addLearningResource,
    updateLearningResource,
    deleteLearningResource,
    incrementResourceDownloads,
    downloadFile,
    globalSearch,
  } = useSchoolData();
  const { currentUser, activeRole } = useAuth();

  const isStaffOrAdmin = activeRole === 'Admin' || activeRole === 'Teacher';

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('All Types');
  const [selectedGrade, setSelectedGrade] = useState<string>('All Grades');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [deletingResource, setDeletingResource] = useState<LearningResource | null>(null);
  const [previewResource, setPreviewResource] = useState<LearningResource | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    resourceType: LearningResource['resourceType'];
    subject: string;
    class: string;
    topic: string;
    description: string;
    term: string;
    academicYear: string;
    file: UploadedFileData | null;
  }>({
    title: '',
    resourceType: 'Notes',
    subject: 'Physics',
    class: 'Class 8',
    topic: '',
    description: '',
    term: 'Term 1',
    academicYear: '2026-2027',
    file: null,
  });

  const effectiveSearch = searchQuery || globalSearch;

  // Filter Options
  const resourceTypeOptions = [
    'All Types',
    'Notes',
    'Past Paper',
    'Worksheet',
    'Assignment',
    'Study Guide',
    'Lab Manual',
    'Formula Sheet',
  ];
  const gradeOptions = ['All Grades', ...Array.from(new Set(learningResources.map((r) => r.class)))];
  const subjectOptions = ['All Subjects', ...Array.from(new Set(learningResources.map((r) => r.subject)))];

  const filteredResources = learningResources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      res.subject.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      res.class.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (res.topic && res.topic.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      (res.description && res.description.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      res.resourceType.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesType =
      selectedResourceType === 'All Types' || res.resourceType.toLowerCase() === selectedResourceType.toLowerCase();
    const matchesGrade = selectedGrade === 'All Grades' || res.class.toLowerCase() === selectedGrade.toLowerCase();
    const matchesSubject = selectedSubject === 'All Subjects' || res.subject.toLowerCase() === selectedSubject.toLowerCase();

    return matchesSearch && matchesType && matchesGrade && matchesSubject;
  });

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      resourceType: 'Notes',
      subject: 'Physics',
      class: 'Class 8',
      topic: '',
      description: '',
      term: 'Term 1',
      academicYear: '2026-2027',
      file: {
        fileName: 'Physics_Optics_StudyNotes.pdf',
        fileSize: '1.8 MB',
        fileType: 'pdf',
        fileData: '--- AUDIENTA ACADEMIC STUDY NOTES ---\nTopic: Optics and Light Reflection\nKey Formulas, diagrams, and sample problems.',
      },
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (res: LearningResource) => {
    setEditingResource(res);
    setFormData({
      title: res.title,
      resourceType: res.resourceType,
      subject: res.subject,
      class: res.class,
      topic: res.topic || '',
      description: res.description || '',
      term: res.term || 'Term 1',
      academicYear: res.academicYear || '2026-2027',
      file: {
        fileName: res.fileName,
        fileSize: res.fileSize,
        fileType: res.fileType,
        fileData: res.fileData,
      },
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const filePayload = formData.file || {
      fileName: `${formData.subject}_${formData.resourceType.replace(/\s+/g, '')}.pdf`,
      fileSize: '1.5 MB',
      fileType: 'pdf' as const,
      fileData: `--- EDUCATIONAL MATERIAL: ${formData.title} ---\nType: ${formData.resourceType}\nSubject: ${formData.subject}\nClass: ${formData.class}\nTopic: ${formData.topic}\n\n${formData.description}`,
    };

    if (editingResource) {
      updateLearningResource(editingResource.id, {
        title: formData.title,
        resourceType: formData.resourceType,
        subject: formData.subject,
        class: formData.class,
        topic: formData.topic,
        description: formData.description,
        term: formData.term,
        academicYear: formData.academicYear,
        fileName: filePayload.fileName,
        fileSize: filePayload.fileSize,
        fileType: filePayload.fileType,
        fileData: filePayload.fileData,
      });
    } else {
      addLearningResource({
        title: formData.title,
        resourceType: formData.resourceType,
        subject: formData.subject,
        class: formData.class,
        topic: formData.topic,
        description: formData.description,
        term: formData.term,
        academicYear: formData.academicYear,
        fileName: filePayload.fileName,
        fileSize: filePayload.fileSize,
        fileType: filePayload.fileType,
        fileData: filePayload.fileData,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDownload = (res: LearningResource) => {
    downloadFile(res.fileName, res.fileData, res.fileType);
    incrementResourceDownloads(res.id);
  };

  const getResourceTypeColor = (type: LearningResource['resourceType']) => {
    switch (type) {
      case 'Notes':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80';
      case 'Past Paper':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
      case 'Worksheet':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80';
      case 'Assignment':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80';
      case 'Study Guide':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search learning materials, past papers, worksheets, notes, topics..."
              className="w-full bg-slate-50/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pl-4 pr-10 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-slate-800 font-medium"
            />
            <Search className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {isStaffOrAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Learning Resource</span>
            </button>
          )}
        </div>

        {/* Filter Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Resource Category</label>
            <select
              value={selectedResourceType}
              onChange={(e) => setSelectedResourceType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {resourceTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Grade / Class</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {gradeOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {subjectOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center">
          <BookMarked className="w-12 h-12 text-purple-300 dark:text-purple-700 mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No learning resources found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your category, grade, or subject filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 hover:shadow-md dark:hover:shadow-slate-950/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Type and Class tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg border font-bold text-[10px] ${getResourceTypeColor(
                        res.resourceType
                      )}`}
                    >
                      {res.resourceType}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                      {res.class}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-medium">
                      {res.subject}
                    </span>
                  </div>

                  {res.downloadsCount !== undefined && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                      <Download className="w-3 h-3" /> {res.downloadsCount}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                  {res.title}
                </h3>

                {/* Topic if specified */}
                {res.topic && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 font-semibold mt-1">
                    <Tag className="w-3 h-3 text-purple-500 shrink-0" />
                    <span className="truncate">{res.topic}</span>
                  </div>
                )}

                {/* Description */}
                {res.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                )}

                {/* Author and Date Meta */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  <span>By {res.uploadedBy}</span>
                  <span>{res.uploadedAt}</span>
                </div>
              </div>

              {/* Card Footer: File details + Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 bg-purple-50/30 dark:bg-purple-950/20 p-2 rounded-xl border border-purple-100/60 dark:border-purple-900/40">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300 text-[11px]">{res.fileName}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 shrink-0 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded">
                    {res.fileType} • {res.fileSize}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewResource(res)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownload(res)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-purple-200/80 dark:border-purple-800/80"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>

                  {isStaffOrAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(res)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                        title="Edit Resource"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingResource(res)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Delete Resource"
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

      {/* Add / Edit Learning Resource Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingResource ? 'Edit Learning Resource' : 'Upload Educational Resource'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Resource Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Physics Quantum Mechanics Quick Revision Guide"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Resource Category</label>
              <select
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Notes">Notes</option>
                <option value="Past Paper">Past Paper</option>
                <option value="Worksheet">Worksheet</option>
                <option value="Assignment">Assignment</option>
                <option value="Study Guide">Study Guide</option>
                <option value="Lab Manual">Lab Manual</option>
                <option value="Formula Sheet">Formula Sheet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Physics, Chemistry, English"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Class / Grade</label>
              <input
                type="text"
                required
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="e.g. Class 8 or Grade 12"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Topic / Unit (Optional)</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Wave Optics & Laser Physics"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">Description & Instructions</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description, practice instructions, or study tips..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* File Upload Dropzone */}
          <FileUploadDropzone
            label="Upload Resource File (PDF, DOCX, PPTX, XLSX, Images)"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20"
            >
              {editingResource ? 'Save Changes' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Resource Confirmation */}
      {deletingResource && (
        <Modal isOpen={!!deletingResource} onClose={() => setDeletingResource(null)} title="Delete Learning Resource" maxWidth="sm">
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to remove resource <span className="font-bold text-slate-900 dark:text-white">{deletingResource.title}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingResource(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteLearningResource(deletingResource.id);
                setDeletingResource(null);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewResource && (
        <FilePreviewModal
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          title={previewResource.title}
          subtitle={`${previewResource.resourceType} • ${previewResource.subject} (${previewResource.class})`}
          fileName={previewResource.fileName}
          fileType={previewResource.fileType}
          fileSize={previewResource.fileSize}
          uploadedBy={`${previewResource.uploadedBy} (${previewResource.uploadedByRole})`}
          uploadedAt={previewResource.uploadedAt}
          description={previewResource.description}
          fileData={previewResource.fileData}
          categoryOrSubject={previewResource.subject}
          gradeOrClass={previewResource.class}
          academicYear={previewResource.academicYear}
          term={previewResource.term}
        />
      )}
    </div>
  );
};
