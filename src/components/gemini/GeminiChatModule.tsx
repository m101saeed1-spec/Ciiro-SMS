import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Bot,
  User,
  Sliders,
  Zap,
  Brain,
  MessageSquare,
  ShieldCheck,
  Download,
  Trash2,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Briefcase,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  taskComplexity?: 'fast' | 'general' | 'complex';
}

interface ChatRolePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  systemInstruction: string;
  samplePrompts: string[];
}

const CHAT_ROLE_PRESETS: ChatRolePreset[] = [
  {
    id: 'general',
    name: 'General School Assistant',
    badge: 'Platform Guide',
    description: 'General academy questions, platform features, policies, and schedules.',
    icon: Sparkles,
    systemInstruction:
      'You are the official EduSpike Platform AI Assistant. You assist students, teachers, administrators, and parents with academy guidance, platform features, academic schedules, and general questions with clarity, warmth, and structure.',
    samplePrompts: [
      'What are the key responsibilities of a Class Teacher versus Subject Teacher?',
      'How do offline attendance export reports work for school audits?',
      'Summarize best practices for organizing term exam schedules.',
    ],
  },
  {
    id: 'academic-advisor',
    name: 'Academic Advisor',
    badge: 'Guidance & Career',
    description: 'Course counseling, academic pathway guidance, and study roadmap.',
    icon: GraduationCap,
    systemInstruction:
      'You are an experienced academic counselor and educational advisor for EduSpike Academy. You assist students and parents with course planning, study strategies, academic balance, and college preparation with encouraging, practical guidance.',
    samplePrompts: [
      'How should a high school student prepare for STEM university admissions?',
      'Create a 4-week study plan to improve chemistry exam performance.',
      'Tips for balancing multiple extracurricular activities with exam revision.',
    ],
  },
  {
    id: 'curriculum-planner',
    name: 'Curriculum & Lesson Planner',
    badge: 'Faculty Specialist',
    description: 'Lesson plans, differentiated instruction, rubrics, and teaching ideas.',
    icon: BookOpen,
    systemInstruction:
      'You are an expert pedagogical specialist and curriculum designer for EduSpike Academy. You help teachers craft engaging lesson plans, formative assessments, rubrics, inquiry-based projects, and differentiated learning tiers.',
    samplePrompts: [
      'Generate a 45-minute lesson plan on Newton’s Laws of Motion with an active lab.',
      'Create a 4-tier grading rubric for a grade 8 historical essay.',
      'Suggest 3 differentiated activities for mixed-ability math students learning algebra.',
    ],
  },
  {
    id: 'admin-assistant',
    name: 'Administrative Specialist',
    badge: 'Operations',
    description: 'Official school correspondence, policy drafting, and procedural templates.',
    icon: Briefcase,
    systemInstruction:
      'You are an administrative operations assistant for EduSpike Academy. You assist principals, administrators, and coordinators with official parent communications, staff notices, policy guidelines, and procedural correspondence.',
    samplePrompts: [
      'Draft an official announcement to parents regarding the upcoming parent-teacher conference.',
      'Write a formal notice about the new digital library and book borrowing policy.',
      'Draft a polite fee reminder notification emphasizing online payment options.',
    ],
  },
  {
    id: 'tutor',
    name: 'STEM & Humanities Tutor',
    badge: 'Personal Tutor',
    description: 'Step-by-step problem explanations, concept breakdowns, and homework hints.',
    icon: Brain,
    systemInstruction:
      'You are an encouraging, patient personal tutor for school students. You explain concepts step-by-step, use relatable everyday analogies, verify student comprehension, and guide them through problem solving without just giving away answers.',
    samplePrompts: [
      'Explain how photosynthesis and cellular respiration are complementary processes.',
      'Walk me step-by-step through solving a quadratic equation by factoring.',
      'What was the primary economic cause of the Industrial Revolution?',
    ],
  },
];

export const GeminiChatModule: React.FC = () => {
  const { currentUser, activeRole, activeSchool, getAuthHeaders } = useAuth();
  const { addToast } = useSchoolData();

  // Multi-turn chat message history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init-1',
        role: 'model',
        content: `👋 Hello **${currentUser.name}**! I am your **Gemini AI Assistant** for ${activeSchool?.name || 'EduSpike Academy'}.\n\nI am configured to support you as a **${activeRole}**. You can ask me to help with:\n* Designing structured lesson plans and rubrics\n* Drafting official school notices or parent correspondence\n* Deep-diving into academic subjects, math problems, or science concepts\n* Formulating revision plans or platform operational guidance\n\nHow can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash',
        taskComplexity: 'general',
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Role persona and system instruction settings
  const [selectedPresetId, setSelectedPresetId] = useState<string>('general');
  const [customSystemInstruction, setCustomSystemInstruction] = useState('');
  const [showRoleConfig, setShowRoleConfig] = useState(false);

  // Task complexity model selection
  // - 'complex' => gemini-3.1-pro-preview
  // - 'general' => gemini-3.5-flash
  // - 'fast' => gemini-3.1-flash-lite
  const [taskComplexity, setTaskComplexity] = useState<'fast' | 'general' | 'complex'>('general');

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activePreset = CHAT_ROLE_PRESETS.find((p) => p.id === selectedPresetId) || CHAT_ROLE_PRESETS[0];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Determine effective system instruction
      const effectiveSystemInstruction = customSystemInstruction.trim() || activePreset.systemInstruction;

      // Prepare conversation history payload
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          messages: historyPayload,
          systemInstruction: effectiveSystemInstruction,
          taskComplexity,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || 'I processed your request, but received an empty response.';

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || (taskComplexity === 'complex' ? 'gemini-3.1-pro-preview' : taskComplexity === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash'),
        taskComplexity,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('[Gemini Chat Error]:', err);
      const errorMessage: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        content: `I encountered an issue connecting to the Gemini service. Please verify your connection or try switching the complexity mode to **Fast Response** or **General Tasks**.\n\n*Error details: ${err?.message || 'Network timeout'}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'system-notice',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear this conversation history?')) {
      setMessages([
        {
          id: `msg-reset-${Date.now()}`,
          role: 'model',
          content: `Chat history reset. How can I help you, **${currentUser.name}**?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.5-flash',
          taskComplexity: 'general',
        },
      ]);
      addToast({ title: 'Conversation Cleared', message: 'Chat history was reset.', type: 'info' });
    }
  };

  const handleExportTranscript = () => {
    const transcriptText = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'model' ? `Gemini (${m.modelUsed || 'AI'})` : currentUser.name}:\n${m.content}\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([transcriptText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gemini_Chat_Transcript_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    addToast({ title: 'Transcript Exported', message: 'Chat transcript downloaded.', type: 'success' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto space-y-4 animate-fade-in">
      {/* Top Header & Persona Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Active Role Persona */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Gemini AI Platform Assistant</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {activePreset.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Multi-turn educational reasoning • Role: {activePreset.name}
              </p>
            </div>
          </div>

          {/* Model Complexity & Config Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Task Complexity Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setTaskComplexity('fast')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  taskComplexity === 'fast'
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="gemini-3.1-flash-lite: optimized for high speed and rapid responses"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Fast</span>
              </button>

              <button
                type="button"
                onClick={() => setTaskComplexity('general')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  taskComplexity === 'general'
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="gemini-3.5-flash: balanced intelligence and versatile multi-turn reasoning"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>General</span>
              </button>

              <button
                type="button"
                onClick={() => setTaskComplexity('complex')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  taskComplexity === 'complex'
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="gemini-3.1-pro-preview: deep reasoning, complex curriculum, coding, and STEM analysis"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>Complex Pro</span>
              </button>
            </div>

            {/* Role Config Toggle */}
            <button
              type="button"
              onClick={() => setShowRoleConfig(!showRoleConfig)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showRoleConfig
                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title="Configure Chatbot Role & System Instruction"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Role Persona</span>
            </button>

            {/* Export & Reset */}
            <button
              type="button"
              onClick={handleExportTranscript}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Export Conversation Transcript"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 transition-colors"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Role Persona Configuration Panel */}
        {showRoleConfig && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-scale-up">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Chatbot Persona & System Instruction
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {CHAT_ROLE_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setCustomSystemInstruction('');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-400 dark:border-purple-600 shadow-2xs ring-2 ring-purple-500/20'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{preset.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom System Instruction Override */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Active System Instruction</span>
                <span className="text-[10px] text-slate-400">Customizable</span>
              </label>
              <textarea
                rows={2}
                value={customSystemInstruction || activePreset.systemInstruction}
                onChange={(e) => setCustomSystemInstruction(e.target.value)}
                placeholder="Enter customized system instruction for Gemini..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Conversation Scrollable Thread */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 overflow-y-auto shadow-2xs space-y-4">
        {messages.map((msg) => {
          const isModel = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end flex-row-reverse'}`}
            >
              {/* Avatar */}
              {isModel ? (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-purple-500/30 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              ) : (
                <UserAvatar
                  name={currentUser.name}
                  avatarUrl={currentUser.avatar}
                  size="sm"
                  className="mt-0.5 shrink-0"
                />
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                  isModel
                    ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700/80 shadow-2xs'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20'
                }`}
              >
                {/* Header inside Bubble */}
                <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] opacity-75">
                  <span className="font-bold">
                    {isModel ? 'Gemini AI Assistant' : currentUser.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {msg.modelUsed && (
                      <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[9px]">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Message Body (with whitespace and line breaks) */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>

                {/* Footer copy action for bot response */}
                {isModel && (
                  <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-[10px]">EduSpike AI Intelligence</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 text-xs border border-slate-100 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Gemini is synthesizing response ({taskComplexity === 'complex' ? 'gemini-3.1-pro-preview' : taskComplexity === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash'})...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      {messages.length <= 3 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Prompts:
          </span>
          {activePreset.samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shadow-2xs text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Message Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message Gemini as ${activePreset.name}... (Press Enter to send, Shift+Enter for new line)`}
            className="flex-1 p-2 text-xs sm:text-sm rounded-xl bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden resize-none"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
