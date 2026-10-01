import React from 'react';
import { StudySummary, StudyQuiz, QuizAttempt } from '../../types';
import {
  BookOpen,
  Sparkles,
  Award,
  Clock,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  FileText,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface StudyHubHistoryProps {
  summaries: StudySummary[];
  quizzes: StudyQuiz[];
  attempts: QuizAttempt[];
  onSelectSummary: (summary: StudySummary) => void;
  onSelectQuiz: (quiz: StudyQuiz) => void;
  onDeleteSummary: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onNewStudyNote: () => void;
}

export const StudyHubHistory: React.FC<StudyHubHistoryProps> = ({
  summaries,
  quizzes,
  attempts,
  onSelectSummary,
  onSelectQuiz,
  onDeleteSummary,
  onDeleteQuiz,
  onNewStudyNote,
}) => {
  // Compute analytics
  const safeSummaries = summaries || [];
  const safeQuizzes = quizzes || [];
  const safeAttempts = attempts || [];
  const totalSummaries = safeSummaries.length;
  const totalQuizzes = safeQuizzes.length;
  const totalAttempts = safeAttempts.length;
  const averageScore =
    safeAttempts.length > 0
      ? Math.round(safeAttempts.reduce((acc, curr) => acc + (curr?.percentage || 0), 0) / safeAttempts.length)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Analytics Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Summaries Created
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSummaries}
          </div>
          <span className="text-2xs text-purple-600 dark:text-purple-400 font-semibold">
            High-yield study guides
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Quizzes Generated
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalQuizzes}
          </div>
          <span className="text-2xs text-blue-600 dark:text-blue-400 font-semibold">
            Active recall sets
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Quizzes Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalAttempts}
          </div>
          <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-semibold">
            Practice sessions logged
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Average Quiz Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {attempts.length > 0 ? `${averageScore}%` : 'N/A'}
          </div>
          <span className="text-2xs text-amber-600 dark:text-amber-400 font-semibold">
            {averageScore >= 80 ? 'Mastery status' : 'Keep practicing'}
          </span>
        </div>
      </div>

      {/* Grid of Saved Summaries & Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Summaries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Saved Study Summaries ({summaries.length})
            </h3>
            <button
              onClick={onNewStudyNote}
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>+ New Note</span>
            </button>
          </div>

          {summaries.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No saved summaries yet. Enter your notes in the Studio to generate one!
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-slate-50/60 dark:bg-slate-800/40 transition-all flex items-start justify-between gap-3 group"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onSelectSummary(summary)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-2xs font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        {summary.subject}
                      </span>
                      <span className="text-2xs text-slate-400">
                        {summary.createdAt}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-1">
                      {summary.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {summary.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onSelectSummary(summary)}
                      className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      title="Open Summary"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSummary(summary.id)}
                      className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Summary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Quizzes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Practice Quizzes ({quizzes.length})
            </h3>
            <span className="text-xs text-slate-400">Interactive Tests</span>
          </div>

          {quizzes.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No quizzes generated yet. Generate a quiz from your notes above!
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {quizzes.map((quiz) => {
                // Find latest attempt for this quiz
                const lastAttempt = attempts.find((a) => a.quizId === quiz.id);

                return (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/60 dark:bg-slate-800/40 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => onSelectQuiz(quiz)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-2xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {quiz.subject}
                        </span>
                        <span className="text-2xs text-slate-400">
                          {quiz.questions.length} questions
                        </span>
                        {lastAttempt && (
                          <span
                            className={`px-2 py-0.5 rounded text-2xs font-bold ${
                              lastAttempt.percentage >= 80
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                            }`}
                          >
                            Best Score: {lastAttempt.percentage}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Created {quiz.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onSelectQuiz(quiz)}
                        className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Start Quiz"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => onDeleteQuiz(quiz.id)}
                        className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Attempt History Table */}
      {attempts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Practice Quiz Attempt History
            </h3>
            <span className="text-xs text-slate-500">
              {attempts.length} attempts recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Quiz Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Time Spent</th>
                  <th className="py-3 px-4">Date Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {attempt.quizTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {attempt.subject}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {attempt.score} / {attempt.totalQuestions}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-2xs ${
                          attempt.percentage >= 80
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                            : attempt.percentage >= 60
                            ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                            : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                        }`}
                      >
                        {attempt.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {attempt.timeSpentSeconds ? `${attempt.timeSpentSeconds}s` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {attempt.completedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
