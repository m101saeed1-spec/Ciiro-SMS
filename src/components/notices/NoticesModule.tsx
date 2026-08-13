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
    audience: 'All' as 'All' | 'Teachers' | 'Students' | 'Parents',
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
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Audience:</span>
          <select
            value={selectedAudienceFilter}
            onChange={(e) => setSelectedAudienceFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Audiences</option>
            <option value="Teachers">Teachers Only</option>
            <option value="Students">Students Only</option>
            <option value="Parents">Parents Only</option>
          </select>
        </div>
      </div>

      {/* Notices Feed Grid */}
      <div className="space-y-4">
        {filteredNotices.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    n.priority === 'High'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {n.priority} Priority
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  Target: {n.audience}
                </span>
                <span className="text-[11px] text-slate-400">Published on {n.date}</span>
              </div>

              <h3 className="text-base font-bold text-slate-800">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>

              <p className="text-[11px] text-purple-600 font-semibold pt-1">
                Posted by {n.postedBy} ({n.postedByRole})
              </p>
            </div>

            <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
              <button
                onClick={() => setViewingNotice(n)}
                className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Full View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeletingNotice(n)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Science Fair Registration Deadline Extended"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              >
                <option value="All">All School</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Students">Students Only</option>
                <option value="Parents">Parents Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notice Content</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter complete notice announcement text here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 mt-2"
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
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                {viewingNotice.priority} Priority
              </span>
              <span className="text-xs text-slate-400">Date: {viewingNotice.date}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{viewingNotice.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {viewingNotice.content}
            </p>
            <p className="text-xs font-bold text-purple-700">
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
          <p className="text-xs text-slate-600 mb-6">
            Are you sure you want to delete <span className="font-bold text-slate-800">{deletingNotice.title}</span>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeletingNotice(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteNotice(deletingNotice.id);
                setDeletingNotice(null);
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
