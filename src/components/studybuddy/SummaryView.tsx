import React, { useState } from 'react';
import { StudySummary } from '../../types';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Copy,
  Check,
  Printer,
  Brain,
  Lightbulb,
  FileCode2,
  HelpCircle,
  Clock,
  GraduationCap,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { showToast } from '../common/Toast';

interface SummaryViewProps {
  summary: StudySummary;
  onGenerateQuizFromSummary: (summary: StudySummary) => void;
  onAskTutor: (concept: string, context?: string) => void;
  onBackToInput: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  summary,
  onGenerateQuizFromSummary,
  onAskTutor,
  onBackToInput,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'concepts' | 'definitions' | 'formulas' | 'mnemonics'>('all');

  const handleCopy = () => {
    const markdown = `# ${summary.title} (${summary.subject})
*Grade Level: ${summary.gradeLevel || 'Secondary'} | Generated via AI Study Buddy*

## Executive Summary
${summary.summary}

## Key High-Yield Concepts
${summary.keyConcepts.map((c) => `- ${c}`).join('\n')}

## Core Definitions & Terminology
${summary.definitions.map((d) => `* **${d.term}**: ${d.explanation}`).join('\n')}

${
  summary.formulasOrRules && summary.formulasOrRules.length > 0
    ? `## Key Formulas & Rules\n${summary.formulasOrRules.map((f) => `- ${f}`).join('\n')}\n`
    : ''
}
${
  summary.mnemonics && summary.mnemonics.length > 0
    ? `## Memory Aids & Mnemonics\n${summary.mnemonics.map((m) => `- ${m}`).join('\n')}\n`
    : ''
}
`;

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    showToast('Summary copied to clipboard in Markdown format!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Meta Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {summary.subject}
            </span>
            {summary.gradeLevel && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {summary.gradeLevel}
              </span>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Generated {summary.createdAt}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {summary.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            title="Copy summary text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={() => onGenerateQuizFromSummary(summary)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-purple-500/25 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Practice Quiz from Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Full Summary Overview
        </button>
        <button
          onClick={() => setActiveTab('concepts')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'concepts'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Key Concepts ({summary.keyConcepts.length})
        </button>
        <button
          onClick={() => setActiveTab('definitions')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'definitions'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          Definitions ({summary.definitions.length})
        </button>
        {summary.formulasOrRules && summary.formulasOrRules.length > 0 && (
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'formulas'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-amber-500" />
            Formulas & Rules ({summary.formulasOrRules.length})
          </button>
        )}
        {summary.mnemonics && summary.mnemonics.length > 0 && (
          <button
            onClick={() => setActiveTab('mnemonics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'mnemonics'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Mnemonics ({summary.mnemonics.length})
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Executive Summary & Concepts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary Card */}
          {(activeTab === 'all' || activeTab === 'concepts') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Executive Summary & Takeaways
                  </h3>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  High-Yield Revision
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-purple-50/40 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                {summary.summary}
              </div>
            </div>
          )}

          {/* Key Concepts Bullet Points */}
          {(activeTab === 'all' || activeTab === 'concepts') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Core High-Yield Concepts
                </h3>
              </div>

              <div className="space-y-3">
                {summary.keyConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-3 group hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                        {concept}
                      </p>
                    </div>
                    <button
                      onClick={() => onAskTutor(concept, summary.summary)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-purple-600 dark:text-purple-400 hover:underline shrink-0 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-purple-200 dark:border-purple-800"
                      title="Ask AI Tutor to explain this concept"
                    >
                      <Brain className="w-3 h-3" />
                      <span>Explain</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas & Rules */}
          {summary.formulasOrRules && summary.formulasOrRules.length > 0 && (activeTab === 'all' || activeTab === 'formulas') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Formulas, Equations & Governing Rules
                </h3>
              </div>

              <div className="space-y-2.5">
                {summary.formulasOrRules.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 flex items-center justify-between font-mono text-xs sm:text-sm text-amber-950 dark:text-amber-200"
                  >
                    <span className="select-all font-semibold">{formula}</span>
                    <button
                      onClick={() => onAskTutor(`How do I apply this formula: "${formula}"?`, summary.summary)}
                      className="text-xs font-sans text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Step-by-Step</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Vocabulary Glossary & Mnemonics */}
        <div className="space-y-6">
          {/* Key Terminology Definitions */}
          {(activeTab === 'all' || activeTab === 'definitions') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Essential Vocabulary
                </h3>
              </div>

              <div className="space-y-3">
                {summary.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 group hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                        {def.term}
                      </span>
                      <button
                        onClick={() => onAskTutor(def.term, def.explanation)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600"
                        title="Deeper explanation"
                      >
                        <Brain className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {def.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mnemonics & Memory Aids */}
          {summary.mnemonics && summary.mnemonics.length > 0 && (activeTab === 'all' || activeTab === 'mnemonics') && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                    Memory Aids & Mnemonics
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Tricks to memorize for upcoming exams
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                {summary.mnemonics.map((mnemonic, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed shadow-2xs"
                  >
                    💡 {mnemonic}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Practice Quiz Promo Card */}
          <div className="bg-gradient-to-br from-purple-700 to-indigo-700 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-2xs font-bold uppercase tracking-wider mb-3">
                <GraduationCap className="w-3 h-3" />
                Active Recall Mode
              </div>
              <h4 className="text-base font-extrabold mb-1">
                Ready to test your retention?
              </h4>
              <p className="text-xs text-purple-100 leading-relaxed mb-4">
                Research shows taking a practice test immediately after studying improves 30-day exam retention by over 50%.
              </p>
            </div>

            <button
              onClick={() => onGenerateQuizFromSummary(summary)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-900" />
              <span>Generate Practice Quiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
