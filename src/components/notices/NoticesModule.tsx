import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { Notice } from '../../types';
import { Modal } from '../common/Modal';
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  Eye,
  Filter,
  Megaphone,
  Calendar,
  UserCheck
} from 'lucide-react';

export const NoticesModule: React.FC = () => {
  const { notices, addNotice, updateNotice, deleteNotice, globalSearch } = useSchoolData();
  const { currentUser } = useAuth();

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
    const matchesSearch =
      n.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesAudience =
      selectedAudienceFilter === 'All' || n.audience === selectedAudienceFilter;

    return matchesSearch && matchesAudience;
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notice Board & Announcements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish school notices, emergency alerts, and community announcements
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Notice</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Audience:</span>
          <select
            value={selectedAudienceFilter}
            onChange={(e) => setSelectedAudienceFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-800">All Audiences</option>
            <option value="Teachers" className="dark:bg-slate-800">Teachers Only</option>
            <option value="Students" className="dark:bg-slate-800">Students Only</option>
          </select>
        </div>
      </div>

      {/* Notices Feed Grid */}
      <div className="space-y-4">
        {filteredNotices.map((n) => (
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
                      : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  }`}
                >
                  {n.priority} Priority
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                  Target: {n.audience}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Published on {n.date}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{n.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.content}</p>

              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold pt-1">
                Posted by {n.postedBy} ({n.postedByRole})
              </p>
            </div>

            <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
              <button
                onClick={() => setViewingNotice(n)}
                className="p-2 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                title="Full View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeletingNotice(n)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                title="Delete Notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Publish School Notice">
        <form onSubmit={handleCreateNotice} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Science Fair Registration Deadline Extended"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="All">All School</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Students">Students Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notice Content</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter complete notice announcement text here..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 dark:shadow-none mt-2"
          >
            Publish Notice
          </button>
        </form>
      </Modal>

      {/* Viewing Notice Detail Modal */}
      {viewingNotice && (
        <Modal
          isOpen={!!viewingNotice}
          onClose={() => setViewingNotice(null)}
          title="Announcement Details"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800">
                {viewingNotice.priority} Priority
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Date: {viewingNotice.date}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewingNotice.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              {viewingNotice.content}
            </p>
            <p className="text-xs font-bold text-purple-700 dark:text-purple-400">
              Publisher: {viewingNotice.postedBy} ({viewingNotice.postedByRole})
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Notice Confirmation */}
      {deletingNotice && (
        <Modal
          isOpen={!!deletingNotice}
          onClose={() => setDeletingNotice(null)}
          title="Delete Notice"
          maxWidth="sm"
        >
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deletingNotice.title}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingNotice(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteNotice(deletingNotice.id);
                setDeletingNotice(null);
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
