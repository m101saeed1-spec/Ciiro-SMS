import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { Assessment, AssessmentQuestion, AssessmentSubmission } from '../../types';
import {
  FileCheck,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Award,
  BookOpen,
  Layers,
  Send,
  X,
  Check,
  Eye,
  Edit3,
  ShieldAlert,
} from 'lucide-react';

export const AssessmentsModule: React.FC = () => {
  const { currentUser, activeRole, isSuperAdmin } = useAuth();
  const {
    assessments,
    assessmentSubmissions,
    createAssessment,
    submitAssessmentAnswer,
    gradeAssessmentSubmission,
    classes,
    subjects,
    addToast,
  } = useSchoolData();

  const isPrincipal = activeRole === 'Principal' || isSuperAdmin;
  const isTeacher = activeRole === 'Teacher';
  const isStudent = activeRole === 'Student';

  // Teacher assigned classes & subjects
  const teacherClasses = currentUser.assignedClasses && currentUser.assignedClasses.length > 0
    ? currentUser.assignedClasses
    : classes.map((c) => c.name);
  const teacherSubjects = currentUser.assignedSubjects && currentUser.assignedSubjects.length > 0
    ? currentUser.assignedSubjects
    : subjects.map((s) => s.name);

  // Filter assessments based on role
  const visibleAssessments = assessments.filter((asm) => {
    if (isPrincipal) return true;
    if (isTeacher) {
      return teacherClasses.includes(asm.className) && teacherSubjects.includes(asm.subject);
    }
    if (isStudent) {
      const studentClass = currentUser.studentClass || 'Class 01';
      return asm.className === studentClass || asm.className === 'All';
    }
    return true;
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssessmentForTaking, setSelectedAssessmentForTaking] = useState<Assessment | null>(null);
  const [selectedAssessmentForGrading, setSelectedAssessmentForGrading] = useState<Assessment | null>(null);

  // Form state for creating assessment
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClass, setNewClass] = useState(classes[0]?.name || 'Class 01');
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'Mathematics');
  const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [questions, setQuestions] = useState<Omit<AssessmentQuestion, 'id'>[]>([
    { questionText: '', questionType: 'short_answer', points: 10, correctAnswer: '' }
  ]);

  // Student answers form state
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});

  // Grading form state
  const [gradingScores, setGradingScores] = useState<Record<string, { score: number; feedback: string }>>({});

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { questionText: '', questionType: 'short_answer', points: 10, correctAnswer: '' }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast('Please enter an assessment title.', 'error');
      return;
    }
    const totalPoints = questions.reduce((acc, q) => acc + Number(q.points || 0), 0);
    const formattedQuestions: AssessmentQuestion[] = questions.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`,
    }));

    const success = await createAssessment({
      title: newTitle,
      description: newDescription,
      className: newClass,
      subject: newSubject,
      deadline: newDeadline,
      totalPoints,
      questions: formattedQuestions,
      status: 'Active',
    });

    if (success) {
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setQuestions([{ questionText: '', questionType: 'short_answer', points: 10, correctAnswer: '' }]);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessmentForTaking) return;
    const success = await submitAssessmentAnswer(selectedAssessmentForTaking.id, studentAnswers);
    if (success) {
      setSelectedAssessmentForTaking(null);
      setStudentAnswers({});
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    const data = gradingScores[submissionId];
    if (!data) return;
    await gradeAssessmentSubmission(submissionId, data.score, data.feedback);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914]">
              <FileCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Academic Assessments & Quizzes
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Student Assessments & Assignments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isStudent
              ? 'Complete assigned quizzes, submit your answers, and review your graded results.'
              : 'Create and dispatch class assessments with structured questions, track deadlines, and grade student submissions.'}
          </p>
        </div>

        {(isPrincipal || isTeacher) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-gold shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#122E52]" />
            <span>Create Assessment</span>
          </button>
        )}
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleAssessments.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <FileCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No assessments found</h3>
            <p className="text-xs text-slate-500 mt-1">There are no active assessments assigned for your class or subjects right now.</p>
          </div>
        ) : (
          visibleAssessments.map((asm) => {
            const mySubmission = assessmentSubmissions.find(
              (s) => s.assessmentId === asm.id && (isStudent ? s.studentId === (currentUser.studentId || currentUser.id) : true)
            );
            const submissionsCount = assessmentSubmissions.filter((s) => s.assessmentId === asm.id).length;

            return (
              <div
                key={asm.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA]">
                      {asm.subject}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {asm.className}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {asm.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {asm.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Due: {asm.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-500" />
                      <span>{asm.totalPoints} Points ({asm.questions.length} Qs)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    {isStudent ? (
                      mySubmission ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> {mySubmission.status === 'Graded' ? `Score: ${mySubmission.score}/${asm.totalPoints}` : 'Submitted'}
                        </span>
                      ) : (
                        <span className="font-bold text-amber-600">Pending Submission</span>
                      )
                    ) : (
                      <span className="text-slate-500 font-semibold">{submissionsCount} Student Submissions</span>
                    )}
                  </div>

                  {isStudent ? (
                    <button
                      onClick={() => {
                        setSelectedAssessmentForTaking(asm);
                        setStudentAnswers({});
                      }}
                      className="px-4 py-2 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {mySubmission ? 'Review / Retake' : 'Take Assessment'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedAssessmentForGrading(asm)}
                      className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      View Submissions & Grade
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Assessment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1B32]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Assessment</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assessment Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Quiz: Quadratic Equations"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Class</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="All">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Instructions / Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide instructions for students..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Questions Builder</h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-xs hover:bg-emerald-100 cursor-pointer"
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Question #{idx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={q.questionText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => prev.map((item, i) => i === idx ? { ...item, questionText: val } : item));
                          }}
                          placeholder="Enter question text..."
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setQuestions((prev) => prev.map((item, i) => i === idx ? { ...item, points: val } : item));
                          }}
                          placeholder="Points"
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Question Type</label>
                        <select
                          value={q.questionType}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setQuestions((prev) => prev.map((item, i) => i === idx ? { ...item, questionType: val } : item));
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                        >
                          <option value="short_answer">Short Answer</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Expected / Correct Answer</label>
                        <input
                          type="text"
                          value={q.correctAnswer || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuestions((prev) => prev.map((item, i) => i === idx ? { ...item, correctAnswer: val } : item));
                          }}
                          placeholder="Correct answer key..."
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#122E52] text-white font-bold cursor-pointer shadow-md"
                >
                  Publish & Send Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Take Assessment Modal */}
      {selectedAssessmentForTaking && (
        <div className="fixed inset-0 z-50 bg-[#0B1B32]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-[#3B82F6]">{selectedAssessmentForTaking.subject}</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedAssessmentForTaking.title}</h2>
              </div>
              <button
                onClick={() => setSelectedAssessmentForTaking(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">{selectedAssessmentForTaking.description}</p>

            <form onSubmit={handleStudentSubmit} className="space-y-6 text-xs">
              {selectedAssessmentForTaking.questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Q{idx + 1}. {q.questionText}</span>
                    <span className="text-purple-600 dark:text-purple-400 text-[11px]">({q.points} pts)</span>
                  </div>

                  <input
                    type="text"
                    value={studentAnswers[q.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStudentAnswers((prev) => ({ ...prev, [q.id]: val }));
                    }}
                    placeholder="Type your answer here..."
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              ))}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAssessmentForTaking(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Assessment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher / Principal Grading Modal */}
      {selectedAssessmentForGrading && (
        <div className="fixed inset-0 z-50 bg-[#0B1B32]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-[#3B82F6]">Submissions & Grading</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedAssessmentForGrading.title}</h2>
              </div>
              <button
                onClick={() => setSelectedAssessmentForGrading(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {assessmentSubmissions.filter((s) => s.assessmentId === selectedAssessmentForGrading.id).length === 0 ? (
                <div className="py-12 text-center text-slate-500">No student submissions received for this assessment yet.</div>
              ) : (
                assessmentSubmissions
                  .filter((s) => s.assessmentId === selectedAssessmentForGrading.id)
                  .map((sub) => {
                    const currentScore = gradingScores[sub.id]?.score !== undefined ? gradingScores[sub.id].score : (sub.score || 0);
                    const currentFeedback = gradingScores[sub.id]?.feedback !== undefined ? gradingScores[sub.id].feedback : (sub.teacherFeedback || '');

                    return (
                      <div key={sub.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sub.studentName}</h4>
                            <span className="text-[11px] text-slate-500 font-mono">Class: {sub.class} · Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${sub.status === 'Graded' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                            {sub.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Student Answers:</span>
                          {Object.entries(sub.answers).map(([qId, ans]) => (
                            <div key={qId} className="text-slate-600 dark:text-slate-300">
                              <span className="font-mono text-[10px] text-[#3B82F6]">{qId}:</span> {ans}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
                          <div>
                            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Score (Max: {selectedAssessmentForGrading.totalPoints})</label>
                            <input
                              type="number"
                              value={currentScore}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setGradingScores((prev) => ({
                                  ...prev,
                                  [sub.id]: { score: val, feedback: currentFeedback }
                                }));
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Teacher Feedback</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={currentFeedback}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGradingScores((prev) => ({
                                    ...prev,
                                    [sub.id]: { score: currentScore, feedback: val }
                                  }));
                                }}
                                placeholder="Provide constructive feedback..."
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                              />
                              <button
                                onClick={() => handleSaveGrade(sub.id)}
                                className="px-4 py-2 rounded-xl bg-[#122E52] text-white font-bold hover:bg-[#0B1B32] cursor-pointer shadow-xs"
                              >
                                Save Grade
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
