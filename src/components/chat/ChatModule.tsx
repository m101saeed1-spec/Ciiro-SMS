import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Users,
  Bell,
  BellOff,
  MoreVertical,
  Trash2,
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
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { ChatGroup, ChatMessage, ChatMember, ChatGroupType } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export const ChatModule: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const {
    teachers,
    chatGroups,
    activeChatGroupId,
    setActiveChatGroupId,
    activeChatMessages,
    sendChatMessage,
    deleteChatMessage,
    toggleMessageReaction,
    createChatGroup,
    deleteChatGroup,
    joinChatGroup,
    leaveChatGroup,
    toggleMuteGroup,
    markGroupRead,
    fetchChatMessages,
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
  const [showMemberDrawer, setShowMemberDrawer] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [mockAttachment, setMockAttachment] = useState<{ name: string; size: string; type: string } | null>(null);

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

  // Handle message sending
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageInput.trim() && !mockAttachment) || !activeGroup) return;

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
      attachments: mockAttachment
        ? [
            {
              id: `att-${Date.now()}`,
              name: mockAttachment.name,
              size: mockAttachment.size,
              type: mockAttachment.type,
              url: '#',
            },
          ]
        : undefined,
    };

    const success = await sendChatMessage(payload);
    if (success) {
      setMessageInput('');
      setIsAnnouncementMode(false);
      setReplyingTo(null);
      setMockAttachment(null);
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

  const getGroupBadgeColor = (type: ChatGroupType) => {
    switch (type) {
      case 'AllTeachers':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Department':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Subject':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ClassTeacher':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getGroupIcon = (type: ChatGroupType) => {
    switch (type) {
      case 'AllTeachers':
        return <Megaphone className="w-4 h-4 text-purple-600" />;
      case 'Department':
        return <Layers className="w-4 h-4 text-blue-600" />;
      case 'Subject':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'ClassTeacher':
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div id="teacher-chat-module" className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[640px] bg-slate-50">
      {/* Top Banner: Faculty-Only Security Guarantee */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white px-4 py-2.5 flex items-center justify-between shadow-xs border-b border-emerald-800 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 bg-white/10 rounded-md backdrop-blur-xs">
            <ShieldAlert className="w-4 h-4 text-emerald-200" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
              <span>FACULTY ENCRYPTED CHANNEL</span>
              <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                Verified Faculty & Admins Only
              </span>
            </p>
            <p className="text-[11px] text-emerald-100/80 leading-tight">
              Strict isolation: Students and parents have zero visibility or membership access to teacher chats.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="create-group-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat Group</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 3-column Layout (Groups Sidebar | Active Chat | Group Info Drawer) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Groups Navigation */}
        <div className="w-80 sm:w-88 border-r border-slate-200 bg-white flex flex-col shrink-0">
          {/* Search Groups */}
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="search-groups-input"
                type="text"
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                placeholder="Search teacher groups..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
              />
              {groupSearchQuery && (
                <button
                  onClick={() => setGroupSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
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
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                    selectedTypeFilter === filter.id
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-medium">No chat groups found</p>
                <p className="text-[11px] mt-1">Try adjusting your search or create a new group.</p>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isActive = activeGroup?.id === group.id;
                return (
                  <button
                    key={group.id}
                    id={`chat-group-item-${group.id}`}
                    onClick={() => setActiveChatGroupId(group.id)}
                    className={`w-full text-left p-3 transition-colors flex items-start gap-3 relative ${
                      isActive
                        ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Icon / Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {getGroupIcon(group.type)}
                    </div>

                    {/* Group info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {group.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {group.lastMessage?.timestamp || ''}
                        </span>
                      </div>

                      {/* Last Message Snippet */}
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        {group.lastMessage ? (
                          <>
                            <span className="font-medium text-slate-700">
                              {group.lastMessage.senderName.split(' ')[0]}:
                            </span>{' '}
                            {group.lastMessage.isAnnouncement ? '📢 ' : ''}
                            {group.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic text-slate-400">No messages yet</span>
                        )}
                      </p>

                      {/* Group badges & status */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${getGroupBadgeColor(
                            group.type
                          )}`}
                        >
                          {group.type}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {group.members.length}
                        </span>
                        {group.isMutedForCurrentUser && (
                          <BellOff className="w-3 h-3 text-slate-400 ml-auto" />
                        )}
                        {(group.unreadCount || 0) > 0 && !group.isMutedForCurrentUser && (
                          <span className="ml-auto bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
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
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Active Group Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {getGroupIcon(activeGroup.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {activeGroup.name}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getGroupBadgeColor(
                        activeGroup.type
                      )}`}
                    >
                      {activeGroup.type === 'AllTeachers'
                        ? 'Master Faculty'
                        : activeGroup.department || activeGroup.subject || activeGroup.targetClass || activeGroup.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                    <span>{activeGroup.members.length} faculty members</span>
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
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
                      <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                      <input
                        type="text"
                        value={messageSearchQuery}
                        onChange={(e) => {
                          setMessageSearchQuery(e.target.value);
                          fetchChatMessages(activeGroup.id, e.target.value);
                        }}
                        placeholder="Search conversation..."
                        className="text-xs outline-hidden w-36"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setIsSearchingMessages(false);
                          setMessageSearchQuery('');
                          fetchChatMessages(activeGroup.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      id="search-in-chat-btn"
                      onClick={() => setIsSearchingMessages(true)}
                      className="p-2 text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors"
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
                  className={`p-2 rounded-lg transition-colors ${
                    activeGroup.isMutedForCurrentUser
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                  title={activeGroup.isMutedForCurrentUser ? 'Unmute Group' : 'Mute Notifications'}
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
                  className={`p-2 rounded-lg transition-colors ${
                    showMemberDrawer
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                  title="Group Members & Details"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {/* Security Reminder Box */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 text-center max-w-xl mx-auto">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-900">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Teacher-to-Teacher Confidential Communication</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Created {activeGroup.createdAt} by {activeGroup.createdByName}. All messages are isolated from student & parent profiles.
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
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="bg-slate-200/80 text-slate-600 text-[11px] px-3 py-1 rounded-full">
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
                    {/* Avatar */}
                    <UserAvatar
                      name={msg.senderName}
                      avatarUrl={msg.senderAvatar}
                      size="sm"
                    />

                    {/* Bubble Content */}
                    <div
                      className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${
                        isCurrentUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* Sender Meta Info */}
                      <div className="flex items-center gap-1.5 mb-1 text-[11px]">
                        <span className="font-semibold text-slate-800">{msg.senderName}</span>
                        {msg.senderRole === 'Admin' ? (
                          <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-purple-200">
                            Admin
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">
                            {msg.senderDesignation || 'Faculty'}
                          </span>
                        )}
                        <span className="text-slate-400 text-[10px]">• {msg.timestamp}</span>
                      </div>

                      {/* Replying-to Preview */}
                      {msg.replyTo && (
                        <div
                          className={`mb-1 p-2 rounded-lg text-xs border-l-2 bg-slate-100 text-slate-600 max-w-full truncate ${
                            isCurrentUser
                              ? 'border-emerald-600 bg-emerald-50/50'
                              : 'border-slate-400'
                          }`}
                        >
                          <span className="font-semibold text-slate-700 block text-[10px]">
                            Replying to {msg.replyTo.senderName}:
                          </span>
                          <p className="truncate text-[11px]">{msg.replyTo.content}</p>
                        </div>
                      )}

                      {/* Main Message Box */}
                      <div
                        className={`rounded-2xl p-3 text-xs shadow-2xs relative ${
                          msg.isAnnouncement
                            ? 'bg-amber-50 border-2 border-amber-300 text-amber-950 font-medium'
                            : isCurrentUser
                            ? 'bg-emerald-700 text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {/* Announcement Header */}
                        {msg.isAnnouncement && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 pb-1 mb-1.5 border-b border-amber-200">
                            <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                            <span>FACULTY ANNOUNCEMENT</span>
                          </div>
                        )}

                        {/* Content text */}
                        <p className="whitespace-pre-wrap leading-relaxed select-text">{msg.content}</p>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {msg.attachments.map((att, attIdx) => (
                              <div
                                key={att.id || `att-${msg.id}-${attIdx}`}
                                className={`flex items-center justify-between p-2 rounded-lg text-xs gap-3 ${
                                  isCurrentUser
                                    ? 'bg-emerald-800/60 border border-emerald-600 text-emerald-50'
                                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 shrink-0" />
                                  <span className="truncate font-medium">{att.name}</span>
                                  <span className="text-[10px] opacity-75">({att.size})</span>
                                </div>
                                <button
                                  onClick={() => addToast(`Downloading ${att.name}...`, 'info')}
                                  className="p-1 hover:bg-black/10 rounded transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Emoji Reactions display */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(msg.reactions).map(([emoji, usersList], rIdx) => {
                            const users = (usersList || []) as string[];
                            return (
                              <button
                                key={`reaction-${emoji}-${msg.id}-${rIdx}`}
                                onClick={() => toggleMessageReaction(activeGroup.id, msg.id, emoji)}
                                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border shadow-2xs transition-all ${
                                  users.includes(currentUser?.name || '')
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                                title={`Reacted by: ${users.join(', ')}`}
                              >
                                <span>{emoji}</span>
                                <span className="font-semibold text-[10px]">{users.length}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Action Bar (Hover Overlay) */}
                      <div
                        className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Quick Reaction Pills */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-xs">
                          {COMMON_EMOJIS.slice(0, 4).map((emoji, eIdx) => (
                            <button
                              key={`quick-${emoji}-${msg.id}-${eIdx}`}
                              onClick={() => toggleMessageReaction(activeGroup.id, msg.id, emoji)}
                              className="text-xs hover:scale-125 px-1 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Reply button */}
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-full shadow-2xs transition-colors"
                          title="Reply to message"
                        >
                          <Reply className="w-3 h-3" />
                        </button>

                        {/* Delete (if owner/sender/admin) */}
                        {(isCurrentUser || activeRole === 'Admin') && (
                          <button
                            onClick={() => deleteChatMessage(activeGroup.id, msg.id)}
                            className="p-1 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-full shadow-2xs transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Replying-To Banner */}
            {replyingTo && (
              <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold">{replyingTo.senderName}:</span>
                  <span className="truncate text-emerald-700">{replyingTo.content}</span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-emerald-700 hover:text-emerald-900 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Pending Mock Attachment Banner */}
            {mockAttachment && (
              <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span className="font-semibold">{mockAttachment.name}</span>
                  <span className="text-[10px] text-slate-500">({mockAttachment.size})</span>
                </div>
                <button
                  onClick={() => setMockAttachment(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              {/* Announcement Mode Toggle */}
              <button
                type="button"
                id="toggle-announcement-mode-btn"
                onClick={() => setIsAnnouncementMode(!isAnnouncementMode)}
                className={`p-2 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 ${
                  isAnnouncementMode
                    ? 'bg-amber-500 text-white shadow-2xs ring-2 ring-amber-300'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Toggle Announcement formatting"
              >
                <Megaphone className="w-4 h-4" />
                <span className="hidden sm:inline">Announcement</span>
              </button>

              {/* Attach File simulation */}
              <button
                type="button"
                id="attach-file-btn"
                onClick={() =>
                  setMockAttachment({
                    name: 'Faculty_Lesson_Plan_Q3.pdf',
                    size: '245 KB',
                    type: 'pdf',
                  })
                }
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="Attach Document / Lesson Plan"
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
                  isAnnouncementMode
                    ? 'Broadcast an important faculty announcement...'
                    : `Message ${activeGroup.name}...`
                }
                className={`flex-1 px-4 py-2 border rounded-xl text-xs outline-hidden focus:ring-2 transition-all ${
                  isAnnouncementMode
                    ? 'border-amber-400 bg-amber-50/50 focus:ring-amber-400'
                    : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-emerald-500'
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                id="send-chat-message-btn"
                disabled={!messageInput.trim() && !mockAttachment}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-400">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-emerald-700" />
            <h3 className="text-sm font-semibold text-slate-700">Select a Teacher Chat Group</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              Choose a channel on the left to participate in real-time faculty discussions, share announcements, or coordinate curriculum.
            </p>
          </div>
        )}

        {/* RIGHT COLUMN: Collapsible Group Info & Faculty Members Drawer */}
        {showMemberDrawer && activeGroup && (
          <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-600" />
                <span>Group Information</span>
              </h4>
              <button
                onClick={() => setShowMemberDrawer(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Group Overview Card */}
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 mx-auto flex items-center justify-center shadow-2xs mb-2">
                  {getGroupIcon(activeGroup.type)}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{activeGroup.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {activeGroup.description || 'Dedicated faculty collaboration workspace.'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getGroupBadgeColor(
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
                  <h5 className="text-xs font-bold text-slate-800">
                    Faculty Members ({activeGroup.members.length})
                  </h5>
                  {isOwnerOrMod && (
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {activeGroup.members.map((member, mIdx) => (
                    <div
                      key={`member-${member.teacherId || member.teacherName}-${mIdx}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          name={member.teacherName}
                          avatarUrl={member.avatar}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {member.teacherName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {member.designation || member.role}
                          </p>
                        </div>
                      </div>

                      {/* Group Role Badge */}
                      {member.groupRole === 'owner' ? (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                          Creator
                        </span>
                      ) : member.groupRole === 'moderator' ? (
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                          Moderator
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded shrink-0">
                          Faculty
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger / Action Zone */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                {activeGroup.type !== 'AllTeachers' && (
                  <button
                    onClick={() => {
                      if (confirm(`Leave group "${activeGroup.name}"?`)) {
                        leaveChatGroup(activeGroup.id);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 py-2 rounded-lg transition-colors border border-slate-200"
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
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors border border-red-200"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Faculty Member</h3>
                  <p className="text-[11px] text-slate-500">
                    Invite colleagues to {activeGroup.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Teacher
                </label>
                <select
                  value={selectedMemberToAdd}
                  onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
                >
                  <option value="">-- Choose a teacher --</option>
                  {teachers
                    .filter((t) => !activeGroup.members.some((m) => m.teacherId === t.id || m.teacherId === t.teacherId))
                    .map((t, tIdx) => (
                      <option key={`opt-${t.id || t.teacherId || tIdx}`} value={t.id || t.teacherId}>
                        {t.name} ({t.subjects.join(', ')})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
                      const { updateChatGroup } = useSchoolData as any;
                      // Update group through context
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
                      addToast(`${teacher.name} added to ${activeGroup.name}!`);
                      setShowAddMemberModal(false);
                      setSelectedMemberToAdd('');
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg shadow-xs transition-colors"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create Teacher Chat Group</h3>
                  <p className="text-[11px] text-slate-500">
                    Faculty-restricted communication channel for staff collaboration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="p-6 space-y-4">
              {/* Group Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Science Faculty, Grade 8 Coordinators"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Briefly describe the purpose of this faculty group..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none"
                />
              </div>

              {/* Group Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Group Classification
                  </label>
                  <select
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value as ChatGroupType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
                  >
                    <option value="Department">Department Group</option>
                    <option value="Subject">Subject Group</option>
                    <option value="ClassTeacher">Class Teachers Group</option>
                    <option value="Custom">Custom Faculty Committee</option>
                  </select>
                </div>

                {newGroupType === 'Department' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={newGroupDept}
                      onChange={(e) => setNewGroupDept(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={newGroupSubject}
                      onChange={(e) => setNewGroupSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Grade/Class
                    </label>
                    <select
                      value={newGroupClass}
                      onChange={(e) => setNewGroupClass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invite Teachers ({selectedMemberIds.length} selected)
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 p-1">
                  {teachers.map((t, tIdx) => {
                    const isChecked = selectedMemberIds.includes(t.id) || selectedMemberIds.includes(t.teacherId);
                    return (
                      <label
                        key={`create-group-tch-${t.id || t.teacherId || tIdx}`}
                        className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs"
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
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{t.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{t.subjects.join(', ')}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
