import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudySummary, StudyQuiz, QuizAttempt } from '../../types';
import { SAMPLE_NOTE_PRESETS, SampleNotePreset } from './sampleNotesData';
import { SummaryView } from './SummaryView';
import { QuizPlayer } from './QuizPlayer';
import { StudyHubHistory } from './StudyHubHistory';
import { AITutorDrawer } from './AITutorDrawer';
import {
  Sparkles,
  BookOpen,
  Brain,
  Layers,
  Award,
  HelpCircle,
  Clock,
  Send,
  RotateCcw,
  CheckCircle2,
  FileText,
  Sliders,
  ChevronDown,
  ArrowRight,
  ListFilter,
  PlusCircle,
  Lightbulb,
  Zap,
} from 'lucide-react';
import { showToast } from '../common/Toast';

export const StudyBuddyModule: React.FC = () => {
  const { currentUser } = useAuth();

  // Active View State
  const [activeTab, setActiveTab] = useState<'studio' | 'summary' | 'quiz' | 'hub'>('studio');

  // Input Form State
  const [subject, setSubject] = useState('Biology');
  const [title, setTitle] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 10');
  const [notes, setNotes] = useState('');
  const [summaryFormat, setSummaryFormat] = useState<'balanced' | 'concise' | 'bullet_points' | 'cheat_sheet'>('balanced');
  const [questionCount, setQuestionCount] = useState(5);
  const [quizDifficulty, setQuizDifficulty] = useState<'Easy' | 'Medium' | 'Challenging'>('Medium');

  // Data State
  const [summaries, setSummaries] = useState<StudySummary[]>([]);
  const [quizzes, setQuizzes] = useState<StudyQuiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [activeSummary, setActiveSummary] = useState<StudySummary | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<StudyQuiz | null>(null);

  // Loading States
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Tutor Drawer State
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorConcept, setTutorConcept] = useState('');
  const [tutorContext, setTutorContext] = useState('');

  // Fetch History on Mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/study-buddy/history');
      if (res.ok) {
        const data = await res.json();
        setSummaries(data.summaries || []);
        setQuizzes(data.quizzes || []);
        setAttempts(data.attempts || []);

        if (data.summaries?.length > 0 && !activeSummary) {
          setActiveSummary(data.summaries[0]);
        }
        if (data.quizzes?.length > 0 && !activeQuiz) {
          setActiveQuiz(data.quizzes[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch study buddy history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadSample = (preset: SampleNotePreset) => {
    setSubject(preset.subject);
    setTitle(preset.topic);
    setGradeLevel(preset.gradeLevel);
    setNotes(preset.notes);
    showToast(`Loaded sample notes for "${preset.topic}"`, 'info');
  };

  const handleGenerateSummary = async () => {
    if (!notes.trim() || notes.trim().length < 10) {
      showToast('Please enter your study notes (at least 10 characters).', 'warning');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const res = await fetch('/api/study-buddy/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || `${subject} Notes`,
          subject,
          notes,
          format: summaryFormat,
          gradeLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      if (data.summary) {
        setSummaries((prev) => [data.summary, ...prev]);
        setActiveSummary(data.summary);
        setActiveTab('summary');
        showToast(data.notice || 'Study summary generated successfully with AI Study Buddy!', 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Error generating summary. Please try again.', 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateQuiz = async (notesToUse?: string, quizTitle?: string, quizSubject?: string) => {
    const rawNotes = notesToUse || notes;
    if (!rawNotes.trim() || rawNotes.trim().length < 10) {
      showToast('Please enter your notes to generate a practice quiz from.', 'warning');
      return;
    }

    setIsGeneratingQuiz(true);
    try {
      const res = await fetch('/api/study-buddy/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quizTitle || title.trim() || `${subject} Practice Quiz`,
          subject: quizSubject || subject,
          notes: rawNotes,
          questionCount,
          difficulty: quizDifficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      if (data.quiz) {
        setQuizzes((prev) => [data.quiz, ...prev]);
        setActiveQuiz(data.quiz);
        setActiveTab('quiz');
        showToast(data.notice || `Generated ${data.quiz.questions.length} practice questions!`, 'success');
      }
    } catch (e: any) {
      showToast(e.message || 'Error generating quiz. Please try again.', 'error');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateBoth = async () => {
    if (!notes.trim() || notes.trim().length < 10) {
      showToast('Please enter your study notes (at least 10 characters).', 'warning');
      return;
    }
    await handleGenerateSummary();
    await handleGenerateQuiz();
  };

  const handleSaveQuizAttempt = async (attemptData: {
    quizId: string;
    quizTitle: string;
    subject: string;
    score: number;
    totalQuestions: number;
    userAnswers: Record<string, number>;
    timeSpentSeconds: number;
  }) => {
    try {
      const res = await fetch('/api/study-buddy/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptData),
      });
      if (res.ok) {
        const data = await res.json();
        setAttempts((prev) => [data.attempt, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save quiz attempt:', e);
    }
  };

  const handleDeleteSummary = async (id: string) => {
    try {
      const res = await fetch(`/api/study-buddy/summary/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSummaries((prev) => prev.filter((s) => s.id !== id));
        if (activeSummary?.id === id) {
          setActiveSummary(null);
          setActiveTab('studio');
        }
        showToast('Study summary deleted.', 'info');
      }
    } catch (e) {
      console.error('Failed to delete summary:', e);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      const res = await fetch(`/api/study-buddy/quiz/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
        if (activeQuiz?.id === id) {
          setActiveQuiz(null);
          setActiveTab('studio');
        }
        showToast('Quiz deleted.', 'info');
      }
    } catch (e) {
      console.error('Failed to delete quiz:', e);
    }
  };

  const handleExplainConceptViaTutor = async (
    concept: string,
    contextNotes?: string,
    questionContext?: string
  ): Promise<string> => {
    const res = await fetch('/api/study-buddy/explain-concept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept, contextNotes, questionContext }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to explain concept');
    }
    return data.explanation || 'No explanation available.';
  };

  const openTutorWithConcept = (concept: string, context?: string) => {
    setTutorConcept(concept);
    setTutorContext(context || notes || '');
    setIsTutorOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Mode Navigation */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>AI-Powered Study Buddy • Powered by Gemini</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Study Buddy & Active Recall Studio
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Input your lecture notes or subject topics to generate high-yield summaries, key formulas, mnemonic memory aids, and interactive multiple-choice practice quizzes.
            </p>
          </div>

          {/* Ask Tutor Quick Trigger */}
          <button
            onClick={() => openTutorWithConcept('', notes)}
            className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 shrink-0 transform hover:-translate-y-0.5"
          >
            <Brain className="w-4 h-4 text-purple-900" />
            <span>Open AI Concept Tutor</span>
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-white/15">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'studio'
                ? 'bg-white text-purple-900 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Note Studio & Generator</span>
          </button>

          {activeSummary && (
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'summary'
                  ? 'bg-white text-purple-900 shadow-md font-extrabold'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Summary View: {activeSummary.title.slice(0, 20)}...</span>
            </button>
          )}

          {activeQuiz && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'quiz'
                  ? 'bg-white text-purple-900 shadow-md font-extrabold'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Practice Quiz: {activeQuiz.title.slice(0, 20)}...</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('hub')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'hub'
                ? 'bg-white text-purple-900 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>My Study Hub & History ({summaries.length + quizzes.length})</span>
          </button>
        </div>
      </div>

      {/* Main View Container */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Notes Input & Generator Studio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Note Editor Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Input Subject Notes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste your lecture transcripts, textbook passages, or bullet notes below.
                  </p>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                    Quick Sample:
                  </span>
                  {SAMPLE_NOTE_PRESETS.slice(0, 3).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadSample(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-slate-700 dark:text-slate-300 text-2xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      {preset.subject}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject & Topic Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="History">History</option>
                    <option value="English Literature">English Literature</option>
                    <option value="Economics">Economics</option>
                    <option value="Geography">Geography</option>
                    <option value="General">General Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Topic / Chapter Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Photosynthesis & Respiration"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Academic Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Middle School">Middle School (Grades 6-8)</option>
                    <option value="Grade 9">Grade 9 (Freshman)</option>
                    <option value="Grade 10">Grade 10 (Sophomore)</option>
                    <option value="Grade 11">Grade 11 (Junior)</option>
                    <option value="Grade 12">Grade 12 (Senior)</option>
                    <option value="Advanced / AP">Advanced Placement / College</option>
                  </select>
                </div>
              </div>

              {/* Textarea for Notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Lecture Notes / Study Material
                  </label>
                  <span>
                    {notes.length} characters • {notes.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={9}
                  placeholder="Paste your study notes, teacher explanations, textbook paragraphs, or list of concepts here..."
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-y font-sans"
                />
              </div>

              {/* Quick Sample Selector Drawer Pills */}
              <div className="pt-2">
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Preloaded Curriculum Presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {SAMPLE_NOTE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadSample(preset)}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 text-left transition-all group"
                    >
                      <span className="text-2xs font-bold text-purple-700 dark:text-purple-400 block">
                        {preset.subject} • {preset.gradeLevel}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-300 line-clamp-1">
                        {preset.topic}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: AI Configuration & Generation Action Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Generation Configuration
                </h3>
              </div>

              {/* Summary Style */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Summary Focus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced' },
                    { id: 'concise', label: 'High-Yield' },
                    { id: 'bullet_points', label: 'Bullets Only' },
                    { id: 'cheat_sheet', label: 'Formula Sheet' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSummaryFormat(f.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                        summaryFormat === f.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Configuration */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quiz Difficulty & Question Count
                </label>

                {/* Difficulty */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Easy', 'Medium', 'Challenging'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setQuizDifficulty(diff)}
                      className={`py-1.5 px-2 rounded-lg text-2xs font-bold border transition-all ${
                        quizDifficulty === diff
                          ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                {/* Count */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Questions:</span>
                  <div className="flex items-center gap-1.5">
                    {[3, 5, 8, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setQuestionCount(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                          questionCount === num
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary || isGeneratingQuiz}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-extrabold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingSummary ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Notes with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Generate Study Summary</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleGenerateQuiz()}
                  disabled={isGeneratingSummary || isGeneratingQuiz}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Questions with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4 text-amber-300" />
                      <span>Generate Practice Quiz</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateBoth}
                  disabled={isGeneratingSummary || isGeneratingQuiz}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-purple-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-purple-900 text-purple-900" />
                  <span>Generate Summary + Quiz (Both)</span>
                </button>
              </div>
            </div>

            {/* Quick Benefits Card */}
            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs space-y-2">
              <span className="font-bold text-purple-900 dark:text-purple-200 block">
                🧠 How Study Buddy Boosts Retention:
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                By transforming dense text into <strong>structured takeaways</strong> and testing with <strong>retrieval practice quizzes</strong>, Study Buddy triggers the Testing Effect to improve long-term recall.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary View Tab */}
      {activeTab === 'summary' && activeSummary && (
        <SummaryView
          summary={activeSummary}
          onGenerateQuizFromSummary={(s) =>
            handleGenerateQuiz(s.originalNotes, `${s.title} Practice Quiz`, s.subject)
          }
          onAskTutor={openTutorWithConcept}
          onBackToInput={() => setActiveTab('studio')}
        />
      )}

      {/* Practice Quiz Tab */}
      {activeTab === 'quiz' && activeQuiz && (
        <QuizPlayer
          quiz={activeQuiz}
          onSaveAttempt={handleSaveQuizAttempt}
          onAskTutor={openTutorWithConcept}
          onBackToHub={() => setActiveTab('hub')}
        />
      )}

      {/* Study Hub & History Tab */}
      {activeTab === 'hub' && (
        <StudyHubHistory
          summaries={summaries}
          quizzes={quizzes}
          attempts={attempts}
          onSelectSummary={(s) => {
            setActiveSummary(s);
            setActiveTab('summary');
          }}
          onSelectQuiz={(q) => {
            setActiveQuiz(q);
            setActiveTab('quiz');
          }}
          onDeleteSummary={handleDeleteSummary}
          onDeleteQuiz={handleDeleteQuiz}
          onNewStudyNote={() => setActiveTab('studio')}
        />
      )}

      {/* Slide-Over AI Tutor Drawer */}
      <AITutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        initialConcept={tutorConcept}
        initialContext={tutorContext}
        onExplainConcept={handleExplainConceptViaTutor}
      />
    </div>
  );
};
