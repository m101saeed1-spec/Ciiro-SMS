import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Users,
  Bell,
  BellOff,
  Trash2,
  Edit,
  Reply,
  Smile,
  Paperclip,
  ShieldAlert,
  Megaphone,
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  Info,
  UserPlus,
  LogOut,
  X,
  FileText,
  Download,
  CheckCheck,
  ChevronLeft,
  Lock,
  Compass,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { ChatGroup, ChatMessage, ChatMember, ChatGroupType } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { FilePreviewModal } from '../library/FilePreviewModal';
import { ChatThreadDrawer } from './ChatThreadDrawer';
import { auditLogService } from '../../services/auditLogService';

export const ChatModule: React.FC = () => {
  const { currentUser, activeRole, activeSchoolId, activeSchool } = useAuth();
  const {
    teachers,
    chatGroups,
    activeChatGroupId,
    setActiveChatGroupId,
    activeChatMessages,
    sendChatMessage,
    editChatMessage,
    deleteChatMessage,
    toggleMessageReaction,
    createChatGroup,
    deleteChatGroup,
    leaveChatGroup,
    toggleMuteGroup,
    markGroupRead,
    fetchChatMessages,
    downloadFile,
    addToast,
  } = useSchoolData();

  // State
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [groupSearchQuery, setGroupSearchQuery] = useState<string>('');
  const [messageSearchQuery, setMessageSearchQuery] = useState<string>('');
  const [isSearchingMessages, setIsSearchingMessages] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isAnnouncementMode, setIsAnnouncementMode] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [activeThreadPostId, setActiveThreadPostId] = useState<string | null>(null);
  const [showMemberDrawer, setShowMemberDrawer] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [isUploadingMain, setIsUploadingMain] = useState<boolean>(false);
  const [mainUploadProgress, setMainUploadProgress] = useState<number>(0);
  const [pendingAttachment, setPendingAttachment] = useState<{
    name: string;
    size: string;
    type: string;
    fileData?: string;
  } | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{
    name: string;
    size: string;
    type: string;
    fileData?: string;
  } | null>(null);
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'chat'>('list');
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Group Form State
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [newGroupType, setNewGroupType] = useState<ChatGroupType>('Department');
  const [newGroupDept, setNewGroupDept] = useState<string>('Science');
  const [newGroupSubject, setNewGroupSubject] = useState<string>('Physics');
  const [newGroupClass, setNewGroupClass] = useState<string>('Class 8');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeGroup = chatGroups.find((g) => g.id === activeChatGroupId) || chatGroups[0];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  // Mark group as read when active group changes
  useEffect(() => {
    if (activeGroup?.id) {
      markGroupRead(activeGroup.id);
    }
  }, [activeGroup?.id]);

  // Sync mobile view on active chat group selection
  const handleSelectGroup = (groupId: string) => {
    setActiveChatGroupId(groupId);
    setMobileActiveView('chat');
  };

  // Filter groups
  const filteredGroups = chatGroups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(groupSearchQuery.toLowerCase())) ||
      (g.department && g.department.toLowerCase().includes(groupSearchQuery.toLowerCase())) ||
      (g.subject && g.subject.toLowerCase().includes(groupSearchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedTypeFilter === 'all') return true;
    return g.type.toLowerCase() === selectedTypeFilter.toLowerCase();
  });

  // Real File Upload Handler with Progress and Validation
  const handleProcessFile = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      addToast('File exceeds maximum allowable size (25 MB)', 'error');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'txt', 'zip'];
    if (!allowed.includes(ext)) {
      addToast(`Invalid file format .${ext}. Allowed: PDF, DOCX, PPTX, XLSX, Images`, 'error');
      return;
    }

    let fileType = 'pdf';
    if (['doc', 'docx'].includes(ext)) fileType = 'docx';
    else if (['ppt', 'pptx'].includes(ext)) fileType = 'pptx';
    else if (['xls', 'xlsx'].includes(ext)) fileType = 'xlsx';
    else if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) fileType = 'image';

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    setIsUploadingMain(true);
    setMainUploadProgress(20);

    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();

    const progressTimer = setInterval(() => {
      setMainUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 25;
      });
    }, 100);

    reader.onload = () => {
      clearInterval(progressTimer);
      setMainUploadProgress(100);
      setTimeout(() => {
        setIsUploadingMain(false);
        const resultString = typeof reader.result === 'string' ? reader.result : '';
        setPendingAttachment({
          name: file.name,
          size: formatSize(file.size),
          type: fileType,
          fileData: isImg ? resultString : (resultString.slice(0, 10000) || `Resource Content for ${file.name}`),
        });
        addToast(`Attached "${file.name}"`, 'info');
        auditLogService.logAction(currentUser?.id || 'usr-1', 'file_attached', 'Chat', {
          fileName: file.name,
          fileSize: file.size,
          fileType,
          schoolId: activeSchoolId,
        });
      }, 250);
    };

    reader.onerror = () => {
      clearInterval(progressTimer);
      setIsUploadingMain(false);
      addToast('Failed to read file', 'error');
    };

    if (isImg) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleStartEditMessage = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setMessageInput(msg.content);
    setReplyingTo(null);
  };

  const handleCancelEditMessage = () => {
    setEditingMessage(null);
    setMessageInput('');
  };

  // Handle message sending & editing
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && !pendingAttachment) return;
    if (!activeGroup) return;

    // Handle Edit Mode
    if (editingMessage) {
      const success = await editChatMessage(activeGroup.id, editingMessage.id, messageInput.trim());
      if (success) {
        setEditingMessage(null);
        setMessageInput('');
      }
      return;
    }

    const payload = {
      groupId: activeGroup.id,
      content: messageInput.trim(),
      isAnnouncement: isAnnouncementMode,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            content: replyingTo.content,
          }
        : undefined,
      attachments: pendingAttachment
        ? [
            {
              id: `att-${Date.now()}`,
              name: pendingAttachment.name,
              size: pendingAttachment.size,
              type: pendingAttachment.type,
              url: '#',
              fileData: pendingAttachment.fileData,
            },
          ]
        : undefined,
    };

    const success = await sendChatMessage(payload);
    if (success) {
      setMessageInput('');
      setIsAnnouncementMode(false);
      setReplyingTo(null);
      setPendingAttachment(null);
    }
  };

  // Handle Create Group Submission
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      addToast('Please enter a valid group name', 'error');
      return;
    }

    const newGroup = await createChatGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || undefined,
      type: newGroupType,
      department: newGroupType === 'Department' ? newGroupDept : undefined,
      subject: newGroupType === 'Subject' ? newGroupSubject : undefined,
      targetClass: newGroupType === 'ClassTeacher' ? newGroupClass : undefined,
      memberIds: selectedMemberIds,
    });

    if (newGroup) {
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setSelectedMemberIds([]);
      setMobileActiveView('chat');
    }
  };

  // Quick Emoji reactions list
  const COMMON_EMOJIS = ['👍', '❤️', '👏', '💡', '📌', '✅'];

  // Check if current user is owner or moderator
  const currentUserMember = activeGroup?.members.find(
    (m) =>
      m.teacherId === currentUser?.id ||
      m.teacherId === (currentUser as any)?.teacherId ||
      m.teacherName.toLowerCase() === currentUser?.name.toLowerCase()
  );
  const isOwnerOrMod =
    activeRole === 'Admin' ||
    currentUserMember?.groupRole === 'owner' ||
    currentUserMember?.groupRole === 'moderator';

  // Audienta Brand badge styles for classifications
  const getGroupBadgeStyle = (type: ChatGroupType) => {
    switch (type) {
      case 'AllTeachers':
        return 'bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] border-[#1E3A63]/80';
      case 'Department':
        return 'bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] border-[#3B82F6]/30 dark:border-[#3B82F6]/40';
      case 'Subject':
        return 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/80';
      case 'ClassTeacher':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getGroupIcon = (type: ChatGroupType) => {
    switch (type) {
      case 'AllTeachers':
        return <Megaphone className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />;
      case 'Department':
        return <Layers className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />;
      case 'Subject':
        return <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'ClassTeacher':
        return <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />;
    }
  };

  const filteredMembers = activeGroup?.members.filter((m) =>
    m.teacherName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    (m.designation && m.designation.toLowerCase().includes(memberSearchQuery.toLowerCase()))
  ) || [];

  return (
    <div id="teacher-chat-module" className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[640px] bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Top Banner: Faculty-Only Security Guarantee with Audienta Brand Gradient */}
      <div className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#122E52] text-white px-4 py-3 flex items-center justify-between shadow-xs border-b border-[#1E3A63] shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
            <Lock className="w-4 h-4 text-[#F7A914]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-white">
                Faculty Encrypted Workspace
              </span>
              <span className="bg-[#F7A914]/20 text-[#F7A914] border border-[#1E3A63] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                Staff & Admins Only
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight hidden sm:block mt-0.5">
              Secure internal channels for curriculum planning, student performance discussions, and department announcements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="create-group-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 btn-navy text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm shadow-md transition-all cursor-pointer border border-[#1E3A63]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 3-column Layout (Groups Sidebar | Active Chat | Group Info Drawer) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT COLUMN: Groups Navigation */}
        <div
          className={`w-full md:w-80 lg:w-88 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 transition-all ${
            mobileActiveView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Groups */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                id="search-groups-input"
                type="text"
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                placeholder="Search teacher channels..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#3B82F6] focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
              />
              {groupSearchQuery && (
                <button
                  onClick={() => setGroupSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'department', label: 'Departments' },
                { id: 'subject', label: 'Subjects' },
                { id: 'classTeacher', label: 'Classes' },
                { id: 'custom', label: 'Custom' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedTypeFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-all cursor-pointer ${
                    selectedTypeFilter === filter.id
                      ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#3B82F6]" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No channels found</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or create a new group.</p>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isActive = activeGroup?.id === group.id;
                return (
                  <button
                    key={group.id}
                    id={`chat-group-item-${group.id}`}
                    onClick={() => handleSelectGroup(group.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative cursor-pointer ${
                      isActive
                        ? 'bg-[#EFF6FF]/80 dark:bg-[#1E3A63] border-l-4 border-[#122E52] dark:border-[#1E3A63]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Icon / Avatar */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
                      isActive
                        ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] border-[#1E3A63]'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                      {getGroupIcon(group.type)}
                    </div>

                    {/* Group info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className={`text-xs font-bold truncate ${
                          isActive ? 'text-[#12233F] dark:text-[#F7A914]' : 'text-slate-900 dark:text-white'
                        }`}>
                          {group.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {group.lastMessage?.timestamp || ''}
                        </span>
                      </div>

                      {/* Last Message Snippet */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate flex items-center gap-1">
                        {group.lastMessage ? (
                          <>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {group.lastMessage.senderName.split(' ')[0]}:
                            </span>{' '}
                            {group.lastMessage.isAnnouncement ? '📢 ' : ''}
                            {group.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic text-slate-400 dark:text-slate-500">No messages yet</span>
                        )}
                      </p>

                      {/* Group badges & status */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getGroupBadgeStyle(
                            group.type
                          )}`}
                        >
                          {group.type}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" /> {group.members.length}
                        </span>
                        {group.isMutedForCurrentUser && (
                          <BellOff className="w-3 h-3 text-amber-500 dark:text-amber-400 ml-auto" />
                        )}
                        {(group.unreadCount || 0) > 0 && !group.isMutedForCurrentUser && (
                          <span className="ml-auto bg-[#122E52] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Active Chat Panel */}
        {activeGroup ? (
          <div
            className={`flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden ${
              mobileActiveView === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Active Group Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileActiveView('list')}
                  className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="Back to channel list"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#122E52]/20 border border-[#1E3A63]/80 flex items-center justify-center shadow-2xs shrink-0">
                  {getGroupIcon(activeGroup.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeGroup.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${getGroupBadgeStyle(
                        activeGroup.type
                      )}`}
                    >
                      {activeGroup.type === 'AllTeachers'
                        ? 'Master Faculty'
                        : activeGroup.department || activeGroup.subject || activeGroup.targetClass || activeGroup.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      {activeGroup.members.length} faculty members
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {activeGroup.members.slice(0, 3).map((m) => m.teacherName).join(', ')}
                      {activeGroup.members.length > 3 ? ` +${activeGroup.members.length - 3} more` : ''}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Action Icons */}
              <div className="flex items-center gap-1.5">
                {/* Search In Chat */}
                <div className="relative">
                  {isSearchingMessages ? (
                    <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
                      <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-1.5" />
                      <input
                        type="text"
                        value={messageSearchQuery}
                        onChange={(e) => {
                          setMessageSearchQuery(e.target.value);
                          fetchChatMessages(activeGroup.id, e.target.value);
                        }}
                        placeholder="Search chat..."
                        className="text-xs text-slate-900 dark:text-white outline-none w-32 sm:w-44 bg-transparent"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setIsSearchingMessages(false);
                          setMessageSearchQuery('');
                          fetchChatMessages(activeGroup.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id="search-in-chat-btn"
                      onClick={() => setIsSearchingMessages(true)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Search messages in group"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Mute Notifications Toggle */}
                <button
                  id="mute-group-btn"
                  onClick={() => toggleMuteGroup(activeGroup.id)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    activeGroup.isMutedForCurrentUser
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                  title={activeGroup.isMutedForCurrentUser ? 'Unmute Channel' : 'Mute Notifications'}
                >
                  {activeGroup.isMutedForCurrentUser ? (
                    <BellOff className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </button>

                {/* Toggle Member Details Drawer */}
                <button
                  id="toggle-group-members-btn"
                  onClick={() => setShowMemberDrawer(!showMemberDrawer)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    showMemberDrawer
                      ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] ring-1 ring-[#F7A914]/30 dark:ring-[#F7A914]/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                  title="Group Members & Details"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-slate-950/60">
              {/* Security Reminder Card */}
              <div className="bg-[#122E52]/5 dark:bg-[#122E52]/30 border border-[#1E3A63] dark:border-[#1E3A63] rounded-2xl p-3 text-center max-w-xl mx-auto shadow-2xs">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#12233F] dark:text-white">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA]" />
                  <span>Confidential Faculty Communication</span>
                </div>
                <p className="text-[11px] text-[#3B82F6] dark:text-[#60A5FA] mt-0.5">
                  Created {activeGroup.createdAt} by {activeGroup.createdByName}. Strictly isolated from student & parent views.
                </p>
              </div>

              {/* Message List */}
              {activeChatMessages.map((msg) => {
                const isCurrentUser =
                  msg.senderId === currentUser?.id ||
                  msg.senderId === (currentUser as any)?.teacherId ||
                  msg.senderName.toLowerCase() === currentUser?.name.toLowerCase();

                const isSystem = msg.senderId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <span className="bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    id={`message-bubble-${msg.id}`}
                    className={`flex items-start gap-2.5 group ${
                      isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar with subtle active status */}
                    <UserAvatar
                      name={msg.senderName}
                      avatarUrl={msg.senderAvatar}
                      size="sm"
                      status="Active"
                      showStatus={true}
                    />

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${
                        isCurrentUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Sender Meta Info */}
                      <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{msg.senderName}</span>
                        {msg.senderRole === 'Admin' ? (
                          <span className="bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] text-[9px] font-bold px-1.5 py-0.2 rounded border border-[#1E3A63]">
                            Admin
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                            {msg.senderDesignation || 'Faculty'}
                          </span>
                        )}
                        <span className="text-slate-400 dark:text-slate-500 text-[10px]">• {msg.timestamp}</span>
                      </div>

                      {/* Replying-to Preview */}
                      {msg.replyTo && (
                        <div
                          className={`mb-1 p-2 rounded-xl text-xs border-l-2 max-w-full truncate ${
                            isCurrentUser
                              ? 'border-[#1E3A63] bg-[#0B1B32] text-slate-200'
                              : 'border-[#1E3A63] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-bold text-[10px] opacity-85 block">
                            Replying to {msg.replyTo.senderName}:
                          </span>
                          <p className="truncate text-[11px]">{msg.replyTo.content}</p>
                        </div>
                      )}

                      {/* Main Message Box */}
                      <div
                        className={`rounded-2xl p-3.5 text-xs shadow-xs relative transition-all ${
                          msg.isAnnouncement
                            ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 font-medium'
                            : isCurrentUser
                            ? 'bg-gradient-to-r from-[#122E52] to-[#1E3A63] text-white rounded-tr-xs shadow-md shadow-md'
                            : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-tl-xs'
                        }`}
                      >
                        {/* Announcement Header */}
                        {msg.isAnnouncement && (
                          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 dark:text-amber-300 pb-1.5 mb-2 border-b border-amber-200 dark:border-amber-800/80">
                            <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>FACULTY ANNOUNCEMENT</span>
                          </div>
                        )}

                        {/* Content text */}
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <p className="whitespace-pre-wrap leading-relaxed select-text font-normal inline">{msg.content}</p>
                          {msg.isEdited && (
                            <span
                              className={`text-[9px] font-semibold italic ${
                                isCurrentUser ? 'text-[#F7A914]' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              (edited)
                            </span>
                          )}
                        </div>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2.5 space-y-1.5">
                            {msg.attachments.map((att, attIdx) => (
                              <div
                                key={att.id || `att-${msg.id}-${attIdx}`}
                                className={`flex items-center justify-between p-2.5 rounded-xl text-xs gap-3 transition-colors ${
                                  isCurrentUser
                                    ? 'bg-white/15 border border-white/20 text-white'
                                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewAttachment({
                                      name: att.name,
                                      size: att.size,
                                      type: att.type,
                                      fileData: att.fileData,
                                    })
                                  }
                                  className="flex items-center gap-2 truncate text-left hover:underline cursor-pointer flex-1"
                                >
                                  <FileText className="w-4 h-4 shrink-0 text-[#F7A914]" />
                                  <span className="truncate font-semibold">{att.name}</span>
                                  <span className="text-[10px] opacity-75">({att.size})</span>
                                </button>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewAttachment({
                                        name: att.name,
                                        size: att.size,
                                        type: att.type,
                                        fileData: att.fileData,
                                      })
                                    }
                                    className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                    title="Preview Attachment"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadFile(att.name, att.fileData, att.type)}
                                    className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                    title="Download File"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Emoji Reactions display */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(msg.reactions).map(([emoji, usersList], rIdx) => {
                            const users = (usersList || []) as string[];
                            const hasReacted = users.includes(currentUser?.name || '');
                            return (
                              <button
                                key={`reaction-${emoji}-${msg.id}-${rIdx}`}
                                onClick={() => toggleMessageReaction(activeGroup.id, msg.id, emoji)}
                                className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border shadow-2xs transition-all cursor-pointer ${
                                  hasReacted
                                    ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] border-[#1E3A63] text-[#12233F] dark:text-white font-bold'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                                title={`Reacted by: ${users.join(', ')}`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px]">{users.length}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                        {/* Action Bar (Hover Overlay) */}
                      <div
                        className={`flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Quick Reaction Pills */}
                        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 shadow-xs">
                          {COMMON_EMOJIS.slice(0, 4).map((emoji, eIdx) => (
                            <button
                              key={`quick-${emoji}-${msg.id}-${eIdx}`}
                              onClick={() => toggleMessageReaction(activeGroup.id, msg.id, emoji)}
                              className="text-xs hover:scale-125 px-1 py-0.5 transition-transform cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Reply in Thread button */}
                        <button
                          onClick={() => setActiveThreadPostId(msg.id)}
                          className="p-1.5 text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#F7A914] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-2xs transition-colors cursor-pointer"
                          title="Reply in thread"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>

                        {/* Quote Reply button */}
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1.5 text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#F7A914] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-2xs transition-colors cursor-pointer"
                          title="Quote reply"
                        >
                          <Reply className="w-3 h-3" />
                        </button>

                        {/* Edit button (for sender or Admin) */}
                        {(isCurrentUser || activeRole === 'Admin') && (
                          <button
                            onClick={() => handleStartEditMessage(msg)}
                            className="p-1.5 text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#F7A914] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-2xs transition-colors cursor-pointer"
                            title="Edit message"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}

                        {/* Delete (if owner/sender/admin) */}
                        {(isCurrentUser || activeRole === 'Admin') && (
                          <button
                            onClick={() => deleteChatMessage(activeGroup.id, msg.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-2xs transition-colors cursor-pointer"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Thread Replies Counter Button */}
                      {((msg.replies && msg.replies.length > 0) || (msg.replyCount && msg.replyCount > 0)) && (
                        <button
                          onClick={() => setActiveThreadPostId(msg.id)}
                          className="flex items-center gap-1.5 text-xs text-[#3B82F6] dark:text-[#60A5FA] font-semibold hover:underline mt-1.5 cursor-pointer bg-[#EFF6FF]/90 dark:bg-[#1E3A63] px-2.5 py-1 rounded-xl border border-[#1E3A63] dark:border-[#1E3A63] transition-all hover:border-[#1E3A63] shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA]" />
                          <span>
                            {msg.replies?.length || msg.replyCount}{' '}
                            {(msg.replies?.length || msg.replyCount) === 1 ? 'reply' : 'replies'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">• View thread</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Replying-To Banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-[#122E52]/20 border-t border-[#1E3A63]/80 flex items-center justify-between text-xs text-[#12233F] dark:text-white">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA] shrink-0" />
                  <span className="font-bold">{replyingTo.senderName}:</span>
                  <span className="truncate text-[#3B82F6] dark:text-[#60A5FA]">{replyingTo.content}</span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-[#3B82F6] dark:text-[#60A5FA] hover:text-[#12233F] dark:hover:text-white ml-2 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Editing-Message Banner */}
            {editingMessage && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 truncate">
                  <Edit className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-bold">Editing Message:</span>
                  <span className="truncate text-amber-700 dark:text-amber-300">{editingMessage.content}</span>
                </div>
                <button
                  onClick={handleCancelEditMessage}
                  className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white ml-2 p-1 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span className="text-[11px]">Cancel</span>
                </button>
              </div>
            )}

            {/* Pending Real Attachment Banner */}
            {pendingAttachment && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA] shrink-0" />
                  <span className="font-bold truncate">{pendingAttachment.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                    ({pendingAttachment.size})
                  </span>
                </div>
                <button
                  onClick={() => setPendingAttachment(null)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-1 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleProcessFile(file);
                  e.target.value = '';
                }
              }}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.svg"
            />

            {/* Upload Progress Bar */}
            {isUploadingMain && (
              <div className="px-4 py-2 bg-slate-50 dark:bg-[#122E52]/20 border-t border-[#1E3A63] text-xs">
                <div className="flex items-center justify-between mb-1 text-[#12233F] dark:text-white font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] animate-spin" />
                    <span>Validating & uploading attachment...</span>
                  </span>
                  <span>{mainUploadProgress}%</span>
                </div>
                <div className="w-full bg-[#FEF3C7] dark:bg-[#1E3A63] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#122E52] to-[#1E3A63] h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${mainUploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
            >
              {/* Announcement Mode Toggle */}
              <button
                type="button"
                id="toggle-announcement-mode-btn"
                onClick={() => setIsAnnouncementMode(!isAnnouncementMode)}
                className={`p-2 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isAnnouncementMode
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-2 ring-amber-300 dark:ring-amber-600'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Broadcast as Faculty Announcement"
              >
                <Megaphone className="w-4 h-4" />
                <span className="hidden sm:inline">Announcement</span>
              </button>

              {/* Attach File Button */}
              <button
                type="button"
                id="attach-file-btn"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#F7A914] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Upload Document / File (PDF, DOC, PPT, XLS, Image)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Message Input Box */}
              <input
                id="chat-message-input"
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={
                  editingMessage
                    ? 'Edit your message...'
                    : isAnnouncementMode
                    ? 'Broadcast an important faculty announcement...'
                    : `Message ${activeGroup.name}...`
                }
                className={`flex-1 px-4 py-2.5 border rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 transition-all ${
                  editingMessage
                    ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20 focus:ring-amber-400'
                    : isAnnouncementMode
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 focus:ring-amber-400 placeholder:text-amber-800/60 dark:placeholder:text-amber-300/60'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:ring-[#3B82F6] placeholder:text-slate-400 dark:placeholder:text-slate-500'
                }`}
              />

              {/* Send or Save Button */}
              <button
                type="submit"
                id="send-chat-message-btn"
                disabled={!messageInput.trim() && !pendingAttachment}
                className="btn-navy disabled:opacity-40 text-white p-2.5 rounded-xl shadow-md shadow-md transition-all cursor-pointer"
                title={editingMessage ? 'Save Changes' : 'Send Message'}
              >
                {editingMessage ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-[#3B82F6]" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Select a Teacher Channel</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-center">
              Choose a channel on the left to participate in real-time faculty discussions, share announcements, or coordinate curriculum.
            </p>
          </div>
        )}

        {/* THREAD DRAWER */}
        {activeThreadPostId && activeGroup && (
          (() => {
            const threadPost = activeChatMessages.find((m) => m.id === activeThreadPostId);
            if (!threadPost) return null;
            return (
              <ChatThreadDrawer
                post={threadPost}
                groupId={activeGroup.id}
                onClose={() => setActiveThreadPostId(null)}
                onPreviewAttachment={(att) =>
                  setPreviewAttachment({
                    name: att.name,
                    size: att.size,
                    type: att.type,
                    fileData: att.fileData,
                  })
                }
              />
            );
          })()
        )}

        {/* RIGHT COLUMN: Collapsible Group Info & Faculty Members Drawer */}
        {showMemberDrawer && activeGroup && (
          <div className="w-full sm:w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 absolute sm:static right-0 top-0 bottom-0 z-20 shadow-lg sm:shadow-none animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
                <span>Group Information</span>
              </h4>
              <button
                onClick={() => setShowMemberDrawer(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Group Overview Card */}
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-[#1E3A63]/80 mx-auto flex items-center justify-center shadow-2xs mb-2">
                  {getGroupIcon(activeGroup.type)}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeGroup.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeGroup.description || 'Dedicated faculty collaboration workspace.'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getGroupBadgeStyle(
                      activeGroup.type
                    )}`}
                  >
                    {activeGroup.type}
                  </span>
                </div>
              </div>

              {/* Members Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA]" />
                    <span>Faculty Members ({activeGroup.members.length})</span>
                  </h5>
                  {isOwnerOrMod && (
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="text-xs text-[#3B82F6] dark:text-[#60A5FA] hover:text-[#122E52] dark:hover:text-[#F7A914] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>

                {/* Member search input */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {filteredMembers.map((member, mIdx) => (
                    <div
                      key={`member-${member.teacherId || member.teacherName}-${mIdx}`}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          name={member.teacherName}
                          avatarUrl={member.avatar}
                          size="sm"
                          status="Active"
                          showStatus={true}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {member.teacherName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {member.designation || member.role}
                          </p>
                        </div>
                      </div>

                      {/* Group Role Badge */}
                      {member.groupRole === 'owner' ? (
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 shrink-0">
                          Creator
                        </span>
                      ) : member.groupRole === 'moderator' ? (
                        <span className="text-[9px] bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] font-bold px-2 py-0.5 rounded-md border border-[#3B82F6]/30 shrink-0">
                          Moderator
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium px-2 py-0.5 rounded-md shrink-0">
                          Faculty
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger / Action Zone */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {activeGroup.type !== 'AllTeachers' && (
                  <button
                    onClick={() => {
                      if (confirm(`Leave group "${activeGroup.name}"?`)) {
                        leaveChatGroup(activeGroup.id);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 py-2 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Leave Group</span>
                  </button>
                )}

                {(isOwnerOrMod || activeRole === 'Admin') && activeGroup.type !== 'AllTeachers' && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to permanently delete "${activeGroup.name}"?`)) {
                        deleteChatGroup(activeGroup.id);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 py-2 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/60 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Group (Admin/Owner)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && activeGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Faculty Member</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Invite colleagues to {activeGroup.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Teacher
                </label>
                <select
                  value={selectedMemberToAdd}
                  onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white dark:bg-slate-800"
                >
                  <option value="">-- Choose a faculty member --</option>
                  {teachers
                    .filter((t) => !activeGroup.members.some((m) => m.teacherId === t.id || m.teacherId === t.teacherId))
                    .map((t, tIdx) => (
                      <option key={`opt-${t.id || t.teacherId || tIdx}`} value={t.id || t.teacherId}>
                        {t.name} ({t.subjects.join(', ')})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedMemberToAdd}
                  onClick={async () => {
                    const teacher = teachers.find(
                      (t) => t.id === selectedMemberToAdd || t.teacherId === selectedMemberToAdd
                    );
                    if (teacher) {
                      const newMember: ChatMember = {
                        teacherId: teacher.teacherId || teacher.id,
                        teacherName: teacher.name,
                        avatar: teacher.avatar,
                        role: 'Teacher',
                        designation: teacher.subjects.join(', '),
                        groupRole: 'member',
                        joinedAt: new Date().toISOString().slice(0, 10),
                      };
                      const updatedMemberList = [...activeGroup.members, newMember];
                      await fetch(`/api/chat/groups/${activeGroup.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'x-user-role': activeRole,
                          'x-user-id': currentUser?.id || '',
                          'x-user-school-id': currentUser?.schoolId || '',
                        },
                        body: JSON.stringify({ members: updatedMemberList }),
                      });
                      addToast(`${teacher.name} added to ${activeGroup.name}!`, 'success');
                      setShowAddMemberModal(false);
                      setSelectedMemberToAdd('');
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold btn-navy disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Add to Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CHAT GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Teacher Chat Group</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Faculty-restricted communication channel for staff collaboration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="p-6 space-y-4">
              {/* Group Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Science Faculty, Grade 8 Coordinators"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-[#3B82F6] outline-none"
                />
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Briefly describe the purpose of this faculty group..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-[#3B82F6] outline-none resize-none"
                />
              </div>

              {/* Group Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Classification
                  </label>
                  <select
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value as ChatGroupType)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white dark:bg-slate-800"
                  >
                    <option value="Department">Department Group</option>
                    <option value="Subject">Subject Group</option>
                    <option value="ClassTeacher">Class Teachers Group</option>
                    <option value="Custom">Custom Committee</option>
                  </select>
                </div>

                {newGroupType === 'Department' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Department
                    </label>
                    <select
                      value={newGroupDept}
                      onChange={(e) => setNewGroupDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white dark:bg-slate-800"
                    >
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Humanities">Humanities & Social Studies</option>
                      <option value="Languages">Languages & Literature</option>
                      <option value="Arts">Creative Arts</option>
                      <option value="Physical Education">Physical Education</option>
                    </select>
                  </div>
                )}

                {newGroupType === 'Subject' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={newGroupSubject}
                      onChange={(e) => setNewGroupSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white dark:bg-slate-800"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                    </select>
                  </div>
                )}

                {newGroupType === 'ClassTeacher' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Class
                    </label>
                    <select
                      value={newGroupClass}
                      onChange={(e) => setNewGroupClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-none bg-white dark:bg-slate-800"
                    >
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Select Faculty Members */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Invite Teachers ({selectedMemberIds.length} selected)
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 p-1 bg-slate-50 dark:bg-slate-800/50">
                  {teachers.map((t, tIdx) => {
                    const isChecked = selectedMemberIds.includes(t.id) || selectedMemberIds.includes(t.teacherId);
                    return (
                      <label
                        key={`create-group-tch-${t.id || t.teacherId || tIdx}`}
                        className="flex items-center gap-2.5 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const idToUse = t.teacherId || t.id;
                            if (e.target.checked) {
                              setSelectedMemberIds((prev) => [...prev, idToUse]);
                            } else {
                              setSelectedMemberIds((prev) => prev.filter((id) => id !== idToUse && id !== t.id));
                            }
                          }}
                          className="rounded text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer"
                        />
                        <UserAvatar name={t.name} avatarUrl={t.avatar} size="xs" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{t.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t.subjects.join(', ')}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline-navy text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs py-2 px-4"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <FilePreviewModal
          isOpen={!!previewAttachment}
          onClose={() => setPreviewAttachment(null)}
          title={previewAttachment.name}
          subtitle={`Chat Attachment • ${previewAttachment.size}`}
          fileName={previewAttachment.name}
          fileType={previewAttachment.type}
          fileSize={previewAttachment.size}
          uploadedBy="Teacher Chat Channel"
          uploadedAt="Recent"
          fileData={previewAttachment.fileData}
        />
      )}
    </div>
  );
};
