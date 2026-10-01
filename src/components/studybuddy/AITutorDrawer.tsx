import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  X,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { showToast } from '../common/Toast';

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialConcept?: string;
  initialContext?: string;
  onExplainConcept: (concept: string, contextNotes?: string, questionContext?: string) => Promise<string>;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  initialConcept = '',
  initialContext = '',
  onExplainConcept,
}) => {
  const [query, setQuery] = useState(initialConcept);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Suggested prompt chips for quick student learning
  const promptSuggestions = [
    'Explain in simple ELI5 terms with everyday analogies',
    'How do I remember this for the final exam?',
    'Give a real-world application or example',
    'What are the most common student misconceptions?',
  ];

  const handleAsk = async (customQuery?: string) => {
    const q = (customQuery || query).trim();
    if (!q) {
      showToast('Please type a question or concept to explore.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onExplainConcept(q, initialContext);
      setExplanation(result);
    } catch (e: any) {
      showToast(e?.message || 'Failed to generate explanation.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-all duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Brain className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-1.5">
                AI Study Tutor
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 text-2xs font-black uppercase tracking-wider">
                  Gemini 3.7
                </span>
              </h3>
              <p className="text-xs text-purple-200">
                Personalized conceptual breakdowns & exam tips
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Query Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              What concept or question would you like explained?
            </label>
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Why do light reactions occur on thylakoid membranes? or Explain Newton's 3rd Law with an everyday example."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {promptSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const combined = `${query ? query + '. ' : ''}${suggestion}`;
                    setQuery(combined);
                    handleAsk(combined);
                  }}
                  className="px-2.5 py-1 rounded-lg text-2xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-700 dark:hover:text-purple-300 transition-colors border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleAsk()}
                disabled={isLoading || !query.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ask Tutor</span>
                    <Send className="w-3 h-3 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Explanation Output Container */}
          {explanation && (
            <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200/60 dark:border-purple-800/60">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span>Tutor Explanation</span>
                </div>
                <button
                  onClick={() => setExplanation(null)}
                  className="text-2xs text-purple-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line prose dark:prose-invert max-w-none">
                {explanation}
              </div>
            </div>
          )}

          {/* Tips Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Effective Ways to Use Your AI Tutor:
            </h4>
            <ul className="text-2xs text-slate-600 dark:text-slate-400 space-y-1 pl-4 list-disc">
              <li>Ask for step-by-step mathematical proofs or formula derivations.</li>
              <li>Request simple analogies for complex chemical or biological processes.</li>
              <li>Ask "Why was option B wrong in my quiz?" to correct misconceptions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
