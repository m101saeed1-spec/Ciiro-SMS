import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Notice } from '../../types';
import { Modal } from '../common/Modal';
import { exportNoticePDF } from '../../utils/pdfExport';
import {
  Bell,
  Plus,
  Trash2,
  Eye,
  Filter,
  Megaphone,
  Calendar,
  FileDown,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';

export const NoticesModule: React.FC = () => {
  const { notices, addNotice, deleteNotice, globalSearch } = useSchoolData();
  const { currentUser, isStudent, activeRole, isSuperAdmin, isOwnerAdmin, isPrincipal, isTeacher } = useAuth();
  const { t, tr, tx, isSomali } = useLanguage();

  // Strict role check: Students cannot publish or delete announcements
  const canManageNotices = !isStudent && (isPrincipal || isOwnerAdmin || isTeacher || isSuperAdmin || activeRole === 'Admin');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'All' as 'All' | 'Teachers' | 'Students',
    priority: 'High' as 'High' | 'Medium' | 'Low',
  });

  const effectiveSearch = searchQuery || globalSearch;

  const filteredNotices = notices.filter((n) => {
    // Audience filter
    if (isStudent && n.audience === 'Teachers') {
      return false; // Students should not see teacher-only notices
    }

    const matchesSearch =
      n.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesAudience =
      selectedAudienceFilter === 'All' || n.audience === selectedAudienceFilter;

    return matchesSearch && matchesAudience;
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageNotices) return;

    addNotice({
      title: formData.title,
      content: formData.content,
      postedBy: currentUser.name,
      postedByRole: currentUser.role,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      audience: formData.audience,
      priority: formData.priority,
    });
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      content: '',
      audience: 'All',
      priority: 'High',
    });
  };

  const handleDownloadPDF = (notice: Notice) => {
    exportNoticePDF(notice);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-[#3B82F6] dark:text-[#60A5FA]" />
            <span>{t.announcements}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {tr(
              'Official institution bulletins, academic schedules, and public notices',
              'Ogeysiisyada rasmiga ah ee dugsiga, jadwalka waxbarashada iyo wararka guud'
            )}
          </p>
        </div>

        {/* Post notice button only visible for authorized staff, hidden for students */}
        {canManageNotices && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gold"
          >
            <Plus className="w-4 h-4" />
            <span>{tr('Post New Notice', 'Ku dar Ogeysiis Cusub')}</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{tr('Audience:', 'Dadka Loo Qoray:')}</span>
          <select
            value={selectedAudienceFilter}
            onChange={(e) => setSelectedAudienceFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-800">{tr('All Audiences', 'Dhammaan')}</option>
            {!isStudent && <option value="Teachers" className="dark:bg-slate-800">{tr('Teachers Only', 'Macallimiinta Kaliya')}</option>}
            <option value="Students" className="dark:bg-slate-800">{tr('Students Only', 'Ardayda Kaliya')}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {tr(`Showing ${filteredNotices.length} notices`, `Waxaa la muujinayaa ${filteredNotices.length} ogeysiis`)}
        </div>
      </div>

      {/* Notices Feed Grid */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
              {tr('No Announcements Available', 'Ma jiraan wax ogeysiisyo ah oo hadda yaalla')}
            </h3>
            <p className="text-xs text-slate-400">
              {tr('New notices and circulars will appear here when published.', 'Ogeysiisyada cusub waxay kasoo muuqan doonaan halkan marka la daabaco.')}
            </p>
          </div>
        ) : (
          filteredNotices.map((n) => (
            <div
              key={n.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-6 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      n.priority === 'High'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : n.priority === 'Medium'
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] border border-[#3B82F6]/30'
                    }`}
                  >
                    {tx(`${n.priority} Priority`)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    {tr('Target:', 'Loo Beegsaday:')} {tx(n.audience)}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {n.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{n.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{n.content}</p>

                <p className="text-[11px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold pt-1">
                  {tr('Posted by', 'Waxaa soo dhigay')} {n.postedBy} ({tx(n.postedByRole)})
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                <button
                  onClick={() => setViewingNotice(n)}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#3B82F6] dark:hover:text-[#F7A914] hover:bg-[#122E52]/10 dark:hover:bg-[#0B1B32] transition-colors cursor-pointer"
                  title={tr('View Notice Details', 'Eeg Faahfaahinta Ogeysiiska')}
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDownloadPDF(n)}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] hover:bg-[#3B82F6]/10 dark:hover:bg-[#3B82F6]/20 transition-colors cursor-pointer"
                  title={tr('Download Notice PDF', 'Soo Deji PDF-ka Ogeysiiska')}
                >
                  <FileDown className="w-4 h-4" />
                </button>

                {/* Delete button only rendered for staff/admins, NEVER for students */}
                {canManageNotices && (
                  <button
                    onClick={() => setDeletingNotice(n)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title={tr('Delete Notice', 'Tirtir Ogeysiiska')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Notice Modal (Only accessible by staff) */}
      {canManageNotices && isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={tr('Publish School Notice', 'Daabac Ogeysiiska Dugsiga')}
        >
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tr('Notice Title', 'Cinwaanka Ogeysiiska')}
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={tr('e.g. Science Fair Registration Deadline Extended', 'Tusaale: Waqtiga Diiwaangelinta Imtixaanka')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('Target Audience', 'Dadka Loo Qoray')}
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] cursor-pointer"
                >
                  <option value="All">{tr('All School', 'Dhammaan Dugsiga')}</option>
                  <option value="Teachers">{tr('Teachers Only', 'Macallimiinta Kaliya')}</option>
                  <option value="Students">{tr('Students Only', 'Ardayda Kaliya')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr('Priority Level', 'Heerka Ahmiyadda')}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] cursor-pointer"
                >
                  <option value="High">{tr('High Priority', 'Ahmiyad Sare')}</option>
                  <option value="Medium">{tr('Medium Priority', 'Ahmiyad Dhexe')}</option>
                  <option value="Low">{tr('Low Priority', 'Ahmiyad Hoose')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {tr('Notice Content', 'Qoraalka Ogeysiiska')}
              </label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={tr('Enter complete notice announcement text here...', 'Geli qoraalka buuxa ee ogeysiiska halkan...')}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="btn-outline-navy text-xs py-2 px-4"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="btn-gold"
              >
                {tr('Publish Notice', 'Daabac Ogeysiiska')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Viewing Notice Detail Modal */}
      {viewingNotice && (
        <Modal
          isOpen={!!viewingNotice}
          onClose={() => setViewingNotice(null)}
          title={tr('Official Notice Bulletin', 'Faahfaahinta Ogeysiiska Rasmiga ah')}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] font-bold text-xs border border-[#1E3A63] dark:border-[#1E3A63]">
                  {tx(`${viewingNotice.priority} Priority`)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                  {tr('Audience:', 'Loo Beegsaday:')} {tx(viewingNotice.audience)}
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">{viewingNotice.date}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingNotice.title}</h3>

            <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
              {viewingNotice.content}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-[#122E52] dark:text-[#F7A914]">
                {tr('Published By:', 'Waxaa Soo Saaray:')} {viewingNotice.postedBy} ({tx(viewingNotice.postedByRole)})
              </p>

              <button
                type="button"
                onClick={() => handleDownloadPDF(viewingNotice)}
                className="btn-outline-navy"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{t.exportPdf}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Notice Confirmation (Staff only) */}
      {canManageNotices && deletingNotice && (
        <Modal
          isOpen={!!deletingNotice}
          onClose={() => setDeletingNotice(null)}
          title={tr('Delete Announcement', 'Tirtir Ogeysiiska')}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{tr('Are you sure you want to permanently delete this notice?', 'Ma hubtaa inaad rabto inaad si joogto ah u tirtirto ogeysiiskan?')}</span>
            </div>

            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              "{deletingNotice.title}"
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  deleteNotice(deletingNotice.id);
                  setDeletingNotice(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20 cursor-pointer"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
