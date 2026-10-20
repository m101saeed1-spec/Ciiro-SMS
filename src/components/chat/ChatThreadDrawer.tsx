import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  Paperclip,
  Smile,
  Trash2,
  Edit,
  Eye,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { ChatMessage, ChatReply, ChatAttachment } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { auditLogService } from '../../services/auditLogService';

interface ChatThreadDrawerProps {
  post: ChatMessage;
  groupId: string;
  onClose: () => void;
  onPreviewAttachment: (att: { name: string; size: string; type: string; fileData?: string }) => void;
}

export const ChatThreadDrawer: React.FC<ChatThreadDrawerProps> = ({
  post,
  groupId,
  onClose,
  onPreviewAttachment,
}) => {
  const { currentUser, activeRole, activeSchoolId } = useAuth();
  const {
    sendChatReply,
    editChatReply,
    deleteChatReply,
    toggleReplyReaction,
    toggleMessageReaction,
    downloadFile,
    addToast,
  } = useSchoolData();

  const [replyInput, setReplyInput] = useState<string>('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [pendingAttachment, setPendingAttachment] = useState<{
    name: string;
    size: string;
    type: string;
    fileData?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const COMMON_EMOJIS = ['👍', '❤️', '👏', '💡', '📌', '✅'];

  // File upload simulation with progress tracking and validation
  const handleProcessFile = (file: File) => {
    // 25MB validation
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

    setIsUploading(true);
    setUploadProgress(15);

    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    reader.onload = () => {
      clearInterval(progressTimer);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        const resultString = typeof reader.result === 'string' ? reader.result : '';
        setPendingAttachment({
          name: file.name,
          size: formatSize(file.size),
          type: fileType,
          fileData: isImg ? resultString : (resultString.slice(0, 10000) || `Resource Data for ${file.name}`),
        });
        addToast(`Attached "${file.name}" ready to post.`);
        auditLogService.logAction(currentUser?.id || 'usr-1', 'file_attached', 'Chat', {
          fileName: file.name,
          fileSize: file.size,
          fileType,
          schoolId: activeSchoolId,
        });
      }, 300);
    };

    reader.onerror = () => {
      clearInterval(progressTimer);
      setIsUploading(false);
      addToast('Failed to read file', 'error');
    };

    if (isImg) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() && !pendingAttachment) return;

    const attachments: ChatAttachment[] | undefined = pendingAttachment
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
      : undefined;

    const ok = await sendChatReply(groupId, post.id, {
      content: replyInput.trim(),
      attachments,
    });

    if (ok) {
      setReplyInput('');
      setPendingAttachment(null);
      setTimeout(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSaveEditReply = async (replyId: string) => {
    if (!editInput.trim()) return;
    const ok = await editChatReply(groupId, post.id, replyId, editInput.trim());
    if (ok) {
      setEditingReplyId(null);
      setEditInput('');
    }
  };

  const replies = post.replies || [];

  return (
    <div
      id="chat-thread-drawer"
      className="w-full md:w-96 lg:w-[420px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 absolute md:static right-0 top-0 bottom-0 z-30 shadow-2xl md:shadow-none animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] rounded-xl">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">Thread Discussion</h4>
              <span className="bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] text-[10px] font-bold px-2 py-0.2 rounded-full border border-[#1E3A63]/80 shrink-0">
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Started by {post.senderName} • {post.timestamp}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Thread"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Thread Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-slate-950/40">
        {/* Parent / Root Message Card */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-start gap-2.5 mb-2">
            <UserAvatar name={post.senderName} avatarUrl={post.senderAvatar} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {post.senderName}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{post.timestamp}</span>
              </div>
              <span className="text-[10px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold">
                {post.senderDesignation || post.senderRole}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {/* Root Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-2.5 space-y-1.5">
              {post.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <button
                    type="button"
                    onClick={() => onPreviewAttachment(att)}
                    className="flex items-center gap-2 truncate text-left hover:underline cursor-pointer flex-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                    <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{att.name}</span>
                    <span className="text-[10px] text-slate-400">({att.size})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(att.name, att.fileData, att.type)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Root Message Reactions */}
          <div className="flex flex-wrap items-center gap-1 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
            {COMMON_EMOJIS.slice(0, 4).map((emoji) => (
              <button
                key={`root-react-${emoji}`}
                onClick={() => toggleMessageReaction(groupId, post.id, emoji)}
                className="text-xs p-1 hover:scale-125 transition-transform cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {emoji}
              </button>
            ))}

            {post.reactions &&
              Object.entries(post.reactions).map(([emoji, usersList]) => {
                const users = (usersList || []) as string[];
                const hasReacted = users.includes(currentUser?.name || '');
                return (
                  <button
                    key={`root-badge-${emoji}`}
                    onClick={() => toggleMessageReaction(groupId, post.id, emoji)}
                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                      hasReacted
                        ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] border-[#1E3A63] text-[#12233F] dark:text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{users.length}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Divider with replies count */}
        <div className="flex items-center gap-3 my-2">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {replies.length === 0 ? 'No replies yet' : `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
          </span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
        </div>

        {/* Replies List */}
        {replies.map((reply) => {
          const isUserReply =
            reply.authorId === currentUser?.id ||
            reply.authorId === (currentUser as any)?.teacherId ||
            reply.authorName.toLowerCase() === currentUser?.name.toLowerCase();

          const isEditingThis = editingReplyId === reply.id;

          return (
            <div
              key={reply.id}
              id={`thread-reply-${reply.id}`}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-all group"
            >
              {/* Author & Timestamp */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <UserAvatar name={reply.authorName} avatarUrl={reply.authorAvatar} size="xs" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {reply.authorName}
                      </span>
                      {reply.authorRole === 'Admin' || reply.authorRole === 'SuperAdmin' ? (
                        <span className="bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] text-[9px] font-bold px-1.5 py-0.2 rounded border border-[#1E3A63]">
                          Admin
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{reply.timestamp}</span>
                  {(isUserReply || activeRole === 'Admin' || activeRole === 'SuperAdmin') && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity ml-1">
                      <button
                        onClick={() => {
                          setEditingReplyId(reply.id);
                          setEditInput(reply.content);
                        }}
                        className="p-1 text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#F7A914] rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Reply"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteChatReply(groupId, post.id, reply.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Reply"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reply Body (or inline edit) */}
              {isEditingThis ? (
                <div className="mt-1 space-y-2">
                  <input
                    type="text"
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-[#1E3A63] bg-[#EFF6FF]/30 dark:bg-[#1E3A63] rounded-xl text-slate-900 dark:text-white outline-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setEditingReplyId(null)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEditReply(reply.id)}
                      className="px-3 py-1 text-[11px] font-bold bg-[#122E52] hover:bg-[#0B1B32] text-white rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {reply.content}
                  {reply.isEdited && (
                    <span className="text-[9px] text-slate-400 italic ml-1.5">(edited)</span>
                  )}
                </p>
              )}

              {/* Reply Attachments */}
              {reply.attachments && reply.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {reply.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() => onPreviewAttachment(att)}
                        className="flex items-center gap-1.5 truncate text-left hover:underline cursor-pointer flex-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{att.name}</span>
                        <span className="text-[10px] text-slate-400">({att.size})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadFile(att.name, att.fileData, att.type)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Reactions */}
              <div className="flex flex-wrap items-center gap-1 mt-2">
                <div className="opacity-0 group-hover:opacity-100 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-1 py-0.5 transition-opacity">
                  {COMMON_EMOJIS.slice(0, 3).map((emoji) => (
                    <button
                      key={`rpl-react-${emoji}-${reply.id}`}
                      onClick={() => toggleReplyReaction(groupId, post.id, reply.id, emoji)}
                      className="text-[11px] p-0.5 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {reply.reactions &&
                  Object.entries(reply.reactions).map(([emoji, usersList]) => {
                    const users = (usersList || []) as string[];
                    const hasReacted = users.includes(currentUser?.name || '');
                    return (
                      <button
                        key={`rpl-badge-${emoji}-${reply.id}`}
                        onClick={() => toggleReplyReaction(groupId, post.id, reply.id, emoji)}
                        className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          hasReacted
                            ? 'bg-[#EFF6FF] dark:bg-[#1E3A63] border-[#1E3A63] text-[#12233F] dark:text-white font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{users.length}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}

        <div ref={threadEndRef} />
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#122E52]/20 border-t border-[#1E3A63] text-xs">
          <div className="flex items-center justify-between mb-1 text-[#12233F] dark:text-white font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6] animate-spin" />
              <span>Validating & encrypting file attachment...</span>
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[#FEF3C7] dark:bg-[#1E3A63] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#122E52] to-[#1E3A63] h-1.5 rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Pending Attachment Banner */}
      {pendingAttachment && !isUploading && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA] shrink-0" />
            <span className="font-bold truncate">{pendingAttachment.name}</span>
            <span className="text-[10px] text-slate-500 shrink-0">({pendingAttachment.size})</span>
          </div>
          <button
            onClick={() => setPendingAttachment(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Thread Reply Composer Form */}
      <form
        onSubmit={handleSendReply}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#F7A914] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Attach PDF, DOCX, PPTX, XLSX, Images"
        >
          <Paperclip className="w-4 h-4" />
        </button>

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
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.svg,.txt,.zip"
        />

        <input
          type="text"
          value={replyInput}
          onChange={(e) => setReplyInput(e.target.value)}
          placeholder={`Reply to ${post.senderName}...`}
          className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6] bg-slate-50 dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        <button
          type="submit"
          disabled={!replyInput.trim() && !pendingAttachment}
          className="btn-navy disabled:opacity-40 text-white p-2 rounded-xl shadow-xs transition-all cursor-pointer"
          title="Send Thread Reply"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
