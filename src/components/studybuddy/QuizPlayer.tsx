import React, { useState, useEffect } from 'react';
import { StudyQuiz, QuizAttempt } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  Brain,
  Lightbulb,
  Trophy,
  ArrowRight,
  BookOpen,
  Eye,
  Check,
} from 'lucide-react';
import { showToast } from '../common/Toast';

interface QuizPlayerProps {
  quiz: StudyQuiz;
  onSaveAttempt: (attemptData: {
    quizId: string;
    quizTitle: string;
    subject: string;
    score: number;
    totalQuestions: number;
    userAnswers: Record<string, number>;
    timeSpentSeconds: number;
  }) => Promise<void>;
  onAskTutor: (concept: string, context?: string) => void;
  onBackToHub: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  onSaveAttempt,
  onAskTutor,
  onBackToHub,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<'immediate' | 'exam'>('immediate'); // Immediate gives instant feedback after clicking an option

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isCompleted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const toggleHint = (questionId: string) => {
    setRevealedHints((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleFinishQuiz = async () => {
    setIsCompleted(true);
    setIsTimerRunning(false);
    const score = calculateScore();

    setIsSaving(true);
    try {
      await onSaveAttempt({
        quizId: quiz.id,
        quizTitle: quiz.title,
        subject: quiz.subject,
        score,
        totalQuestions,
        userAnswers,
        timeSpentSeconds: timeSeconds,
      });
      showToast(`Quiz completed! Score: ${score}/${totalQuestions}`, 'success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setUserAnswers({});
    setRevealedHints({});
    setCurrentQuestionIndex(0);
    setTimeSeconds(0);
    setIsTimerRunning(true);
    setIsCompleted(false);
  };

  const score = calculateScore();
  const percentage = Math.round((score / Math.max(totalQuestions, 1)) * 100);
  const answeredCount = Object.keys(userAnswers).length;

  if (totalQuestions === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          No questions found in this quiz.
        </h3>
        <button
          onClick={onBackToHub}
          className="px-4 py-2 bg-[#122E52] text-white rounded-xl text-xs font-bold"
        >
          Return to Study Buddy
        </button>
      </div>
    );
  }

  // Final Results Screen
  if (isCompleted) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Scorecard Hero */}
        <div className="bg-gradient-to-br from-[#122E52] via-[#0B1B32] to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold mb-1">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Practice Quiz Completed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{quiz.title}</h2>
              <p className="text-xs sm:text-sm text-[#F7A914]">
                Subject: {quiz.subject} • Completed in {formatTime(timeSeconds)}
              </p>
            </div>

            {/* Circular Percentage Badge */}
            <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[180px]">
              <div className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
                {percentage}%
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#F7A914] mt-1">
                {score} of {totalQuestions} Correct
              </div>
              <span className="mt-2 text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20">
                {percentage >= 80 ? '🌟 Mastery Achieved' : percentage >= 60 ? '👍 Solid Effort' : '💪 Needs Review'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleRestart}
              className="px-4 py-2.5 rounded-xl bg-white text-[#12233F] hover:bg-[#EFF6FF] text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={onBackToHub}
              className="px-4 py-2.5 rounded-xl bg-[#122E52] hover:bg-[#F7A914] text-white text-xs font-bold transition-all border border-[#1E3A63] flex items-center gap-2"
            >
              <span>Back to Study Buddy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Detailed Question by Question Review */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#3B82F6]" />
              Detailed Answer Rationale & Review
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {score}/{totalQuestions} questions answered correctly
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selectedAnswer = userAnswers[q.id];
              const isCorrect = selectedAnswer === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {q.question}
                      </h4>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedAnswer === optIdx;
                      const isTheRightAnswer = optIdx === q.correctAnswerIndex;

                      let badgeStyle =
                        'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                      if (isTheRightAnswer) {
                        badgeStyle =
                          'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 font-bold';
                      } else if (isChosen && !isTheRightAnswer) {
                        badgeStyle =
                          'border-rose-500 bg-rose-100/70 dark:bg-rose-900/50 text-rose-900 dark:text-rose-100 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${badgeStyle}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-2xs text-slate-700 dark:text-slate-300 shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isTheRightAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isChosen && !isTheRightAnswer && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pedagogical Explanation Box */}
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                        💡 Pedagogical Explanation:
                      </span>
                      <p>{q.explanation}</p>
                    </div>

                    <button
                      onClick={() =>
                        onAskTutor(
                          `Why is the answer to "${q.question}" option ${String.fromCharCode(
                            65 + q.correctAnswerIndex
                          )} (${q.options[q.correctAnswerIndex]})?`,
                          `Explanation provided: ${q.explanation}`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#122E52]/20 text-[#3B82F6] dark:text-[#60A5FA] border border-[#1E3A63] font-semibold text-2xs shrink-0 flex items-center gap-1 hover:bg-[#EFF6FF] transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Ask AI Tutor</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Question In-Progress View
  const selectedOption = userAnswers[currentQuestion.id];
  const isAnswered = selectedOption !== undefined;
  const isCorrectChoice = isAnswered && selectedOption === currentQuestion.correctAnswerIndex;

  return (
    <div className="space-y-6">
      {/* Top Header Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA]">
              {quiz.subject}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            {currentQuestion.difficulty && (
              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentQuestion.difficulty}
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {quiz.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>{formatTime(timeSeconds)}</span>
          </div>

          <button
            onClick={onBackToHub}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Exit Quiz
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#122E52] h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <span className="w-8 h-8 rounded-xl bg-[#122E52] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
            Q{currentQuestionIndex + 1}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((optionText, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isTheCorrect = optIdx === currentQuestion.correctAnswerIndex;

            let cardStyles =
              'border-slate-200 dark:border-slate-700 hover:border-[#122E52] dark:hover:border-[#F7A914] bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200';

            if (isAnswered) {
              if (isTheCorrect) {
                cardStyles =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs';
              } else if (isSelected && !isTheCorrect) {
                cardStyles =
                  'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 shadow-xs';
              } else {
                cardStyles =
                  'opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400';
              }
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 text-sm cursor-pointer ${cardStyles}`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? isTheCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-snug">{optionText}</span>
                </div>

                {isAnswered && isTheCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isTheCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Rationale when Answered */}
        {isAnswered && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border animate-fade-in ${
              isCorrectChoice
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-100'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrectChoice ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Brilliant! That's correct.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Not quite. Let's learn why:</span>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  onAskTutor(
                    `Why is "${currentQuestion.options[currentQuestion.correctAnswerIndex]}" correct for question: "${currentQuestion.question}"?`,
                    currentQuestion.explanation
                  )
                }
                className="text-xs font-semibold underline flex items-center gap-1 text-[#3B82F6] dark:text-[#60A5FA] hover:text-[#122E52]"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Explain in simpler terms</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 mt-1">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Hint Accordion */}
        {currentQuestion.hint && !isAnswered && (
          <div className="pt-2">
            {!revealedHints[currentQuestion.id] ? (
              <button
                onClick={() => toggleHint(currentQuestion.id)}
                className="text-xs font-semibold text-[#3B82F6] dark:text-[#60A5FA] hover:underline flex items-center gap-1.5"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Need a hint?</span>
              </button>
            ) : (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 animate-fade-in">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Clue:</span> {currentQuestion.hint}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishQuiz}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/25 flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>{isSaving ? 'Submitting...' : 'Complete & View Score'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
