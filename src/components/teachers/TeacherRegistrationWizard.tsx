import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Teacher } from '../../types';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  AlertCircle,
  Edit3,
  ShieldCheck,
  MapPin,
  HeartPulse,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { RegistrationWizard, WizardStepDef } from '../common/RegistrationWizard';
import {
  teacherStep1Schema,
  teacherStep2Schema,
  teacherStep3Schema,
  teacherStep4Schema,
} from '../../schemas/registrationSchemas';

interface TeacherRegistrationWizardProps {
  onClose: () => void;
  onSuccess: (teacher: Teacher) => void;
}

export const TeacherRegistrationWizard: React.FC<TeacherRegistrationWizardProps> = ({
  onClose,
  onSuccess,
}) => {
  const { teachers, classes, addTeacher } = useSchoolData();
  const { t, currentLanguage } = useLanguage();
  const isSomali = currentLanguage === 'so';

  // Wizard active step: 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto ID Generation
  const nextNum = 7 + teachers.length + 1;
  const autoId = `TCH-2026-${String(nextNum).padStart(4, '0')}`;

  const [formData, setFormData] = useState({
    // Step 1: Personal & Identification
    teacherId: autoId,
    name: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    joiningDate: new Date().toISOString().split('T')[0],
    avatar: '',

    // Step 2: Contact & Address
    email: '',
    phone: '',
    address: 'Academic Staff Quarters, Block B',
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Step 3: Academic & Allocation
    qualification: 'M.Sc in Education & Science',
    employmentType: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'Contract',
    subjects: ['Mathematics', 'Physics'],
    classesAssigned: classes.length > 0 ? [classes[0].name] : ['Class 01', 'Class 02'],
    customSubjectInput: '',
    customClassInput: '',

    // Step 4: Terms
    agreedToTerms: true,
  });

  // Validation Errors per field
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Available subjects suggestions
  const suggestedSubjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English Language',
    'Literature',
    'History',
    'Geography',
    'Computer Science',
    'Islamic Studies',
    'Art & Design',
    'Physical Education',
  ];

  // Zod-based Step Validation
  const validateStepWithZod = (stepNumber: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    const handleZodIssues = (result: any) => {
      if (!result.success && result.error) {
        const issues = result.error.issues || result.error.errors || [];
        issues.forEach((err: any) => {
          if (err.path && err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
      }
    };

    if (stepNumber === 1) {
      const parseResult = teacherStep1Schema.safeParse({
        teacherId: formData.teacherId,
        name: formData.name,
        gender: formData.gender,
        joiningDate: formData.joiningDate,
        avatar: formData.avatar,
      });

      handleZodIssues(parseResult);

      // Unique identifier verification
      const cleanId = formData.teacherId.trim().toUpperCase();
      if (cleanId) {
        const isDuplicate = teachers.some((t) => t.teacherId.toUpperCase() === cleanId);
        if (isDuplicate) {
          newErrors.teacherId = isSomali
            ? `Aqoonsiga macallinka "${cleanId}" waxaa horey loogu qoray macallin kale.`
            : `Teacher ID "${cleanId}" is already assigned to another faculty member.`;
        }
      }
    }

    if (stepNumber === 2) {
      const parseResult = teacherStep2Schema.safeParse({
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
      });

      handleZodIssues(parseResult);
    }

    if (stepNumber === 3) {
      const parseResult = teacherStep3Schema.safeParse({
        qualification: formData.qualification,
        employmentType: formData.employmentType,
        subjects: formData.subjects,
        classesAssigned: formData.classesAssigned,
      });

      handleZodIssues(parseResult);
    }

    if (stepNumber === 4) {
      const parseResult = teacherStep4Schema.safeParse({
        agreedToTerms: formData.agreedToTerms,
      });

      handleZodIssues(parseResult);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Subject toggle
  const toggleSubject = (sub: string) => {
    setFormData((prev) => {
      const exists = prev.subjects.includes(sub);
      const updated = exists ? prev.subjects.filter((s) => s !== sub) : [...prev.subjects, sub];
      return { ...prev, subjects: updated };
    });
    if (errors.subjects) {
      setErrors((prev) => ({ ...prev, subjects: '' }));
    }
  };

  const addCustomSubject = () => {
    const trimmed = formData.customSubjectInput.trim();
    if (trimmed && !formData.subjects.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, trimmed],
        customSubjectInput: '',
      }));
      if (errors.subjects) {
        setErrors((prev) => ({ ...prev, subjects: '' }));
      }
    }
  };

  // Class toggle
  const toggleClass = (className: string) => {
    setFormData((prev) => {
      const exists = prev.classesAssigned.includes(className);
      const updated = exists
        ? prev.classesAssigned.filter((c) => c !== className)
        : [...prev.classesAssigned, className];
      return { ...prev, classesAssigned: updated };
    });
    if (errors.classesAssigned) {
      setErrors((prev) => ({ ...prev, classesAssigned: '' }));
    }
  };

  const addCustomClass = () => {
    const trimmed = formData.customClassInput.trim();
    if (trimmed && !formData.classesAssigned.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        classesAssigned: [...prev.classesAssigned, trimmed],
        customClassInput: '',
      }));
      if (errors.classesAssigned) {
        setErrors((prev) => ({ ...prev, classesAssigned: '' }));
      }
    }
  };

  // Final Submission Handler
  const handleSubmit = async () => {
    if (!validateStepWithZod(1) || !validateStepWithZod(2) || !validateStepWithZod(3) || !validateStepWithZod(4)) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const generatedEmail =
      formData.email.trim() ||
      `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@eduspike.edu`;

    const generatedPhone = formData.phone.trim() || '+1 (555) 019-8822';

    const avatarUrl =
      formData.avatar ||
      (formData.gender === 'Male'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200');

    try {
      const result = await addTeacher({
        teacherId: formData.teacherId.trim().toUpperCase(),
        name: formData.name.trim(),
        avatar: avatarUrl,
        email: generatedEmail,
        phone: generatedPhone,
        subjects: formData.subjects,
        classesAssigned: formData.classesAssigned,
        qualification: formData.qualification.trim(),
        joiningDate: formData.joiningDate,
        gender: formData.gender,
        status: 'Active',
      });

      if (result.success && result.teacher) {
        onSuccess(result.teacher);
        onClose();
      } else {
        setServerError(result.error || (isSomali ? 'Diiwaangelinta macallinku way fashilantay.' : 'Failed to save teacher registration. Please try again.'));
      }
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred during teacher registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps Configuration
  const steps: WizardStepDef[] = [
    { num: 1, title: t.step1Title, desc: t.step1TeacherDesc, icon: User },
    { num: 2, title: t.step2Title, desc: t.step2TeacherDesc, icon: Mail },
    { num: 3, title: t.step3Title, desc: t.step3TeacherDesc, icon: GraduationCap },
    { num: 4, title: t.step4Title, desc: t.step4Desc, icon: ShieldCheck },
  ];

  // Render Step Contents
  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A63] border border-[#1E3A63] dark:border-[#1E3A63] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#122E52] text-white">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {isSomali ? 'Tallaabada 1: Aqoonsiga & Xogta Macallinka' : 'Step 1: Faculty Identification & Profile'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSomali ? 'U qoondee aqoonsi rasmi ah iyo faahfaahinta shakhsiga' : 'Assign a permanent unique faculty ID and personal credentials'}
                </p>
              </div>
            </div>

            {/* Teacher ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isSomali ? 'Aqoonsiga Macallinka ee Dugsiga' : 'Faculty School ID Number'} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#EFF6FF] dark:bg-[#1E3A63] px-2 py-0.5 rounded border border-[#1E3A63] dark:border-[#1E3A63] font-mono">
                  {isSomali ? 'AQOONSI GAAR AH' : 'OFFICIAL ID'}
                </span>
              </div>
              <input
                type="text"
                value={formData.teacherId}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setFormData({ ...formData, teacherId: val });
                  if (errors.teacherId) setErrors({ ...errors, teacherId: '' });
                }}
                placeholder="e.g. TCH-2026-0008"
                className={`w-full bg-[#EFF6FF] dark:bg-slate-800 border ${
                  errors.teacherId ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-[#1E3A63] dark:border-slate-700'
                } rounded-xl py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-100 uppercase focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
              />
              {errors.teacherId && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.teacherId}</span>
                </p>
              )}
            </div>

            {/* Teacher Full Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isSomali ? 'Magaca Buuxa ee Macallinka' : 'Teacher Full Name & Title'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder={isSomali ? 'Tusaale: Dr. Ahmed Hassan Mohamed' : 'e.g. Dr. Robert Vance or Ms. Zahra Mohamed'}
                className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                  errors.name ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Gender & Joining Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Jinsiga' : 'Gender'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer"
                >
                  <option value="Female">{isSomali ? 'Dheddig (Female)' : 'Female'}</option>
                  <option value="Male">{isSomali ? 'Lab (Male)' : 'Male'}</option>
                  <option value="Other">{isSomali ? 'Kale (Other)' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Taariikhda Billaabashada Shaqada' : 'Joining / Employment Date'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </div>
            </div>

            {/* Avatar Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={formData.name || 'Faculty Member'}
                  avatarUrl={formData.avatar}
                  size="lg"
                  ring="ring-2 ring-[#F7A914]/30 dark:ring-[#F7A914]/30"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    {isSomali ? 'Sawirka Profile-ka' : 'Profile Picture Preview'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {isSomali ? 'Sawir toos ah ama geli link sawir' : 'Auto-generated photo based on gender, or paste image URL'}
                  </span>
                </div>
              </div>
              <input
                type="text"
                placeholder={isSomali ? 'Geli Link-ga Sawirka' : 'Paste Image URL (optional)'}
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2.5 max-w-[180px] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A63] border border-[#1E3A63] dark:border-[#1E3A63] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#122E52] text-white">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {isSomali ? 'Tallaabada 2: Xiriirka & Deganaanshaha' : 'Step 2: Contact Details & Residence'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSomali ? 'Kanaallada rasmiga ah ee xiriirka iyo xaaladaha degdegga ah' : 'Official communication channels and emergency point of contact'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Cinwaanka Iimaylka Rasmiga ah' : 'Official Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder={
                      formData.name
                        ? `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@eduspike.edu`
                        : 'teacher@eduspike.edu'
                    }
                    className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                      errors.email ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl py-2.5 pl-9 pr-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Lambarka Taleefanka' : 'Phone / Mobile Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="+252 (61) 500-9988"
                    className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                      errors.phone ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl py-2.5 pl-9 pr-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isSomali ? 'Cinwaanka Guriga / Deegaanka' : 'Residential Address / Quarters'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={isSomali ? 'Degmada, Magaalada, Wadada' : 'Street Address, City, Postal Area'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>{isSomali ? 'Qofka lala xiriirayo xaaladaha degdegga ah (Ikhtiyaari)' : 'Emergency Contact Person (Optional)'}</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={isSomali ? 'Magaca Qofka Degdegga' : 'Emergency Contact Name'}
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder={isSomali ? 'Taleefanka Degdegga' : 'Emergency Contact Phone'}
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A63] border border-[#1E3A63] dark:border-[#1E3A63] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#122E52] text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {isSomali ? 'Tallaabada 3: Shahaadooyinka & Maadooyinka' : 'Step 3: Academic Qualifications & Teaching Assignments'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSomali ? 'Dooro maadooyinka iyo fasallada macallinku dhigi doono' : 'Select subjects and classes the teacher is qualified and appointed to teach'}
                </p>
              </div>
            </div>

            {/* Qualification & Contract Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Heerka Aqoonta / Shahaadada' : 'Academic Degree / Qualification'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => {
                    setFormData({ ...formData, qualification: e.target.value });
                    if (errors.qualification) setErrors({ ...errors, qualification: '' });
                  }}
                  placeholder={isSomali ? 'Tusaale: B.Ed / M.Sc in Physics' : 'e.g. M.Sc in Physics & B.Ed'}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                    errors.qualification ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                  } rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                />
                {errors.qualification && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.qualification}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Nooca Shaqada' : 'Employment Status'}
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer"
                >
                  <option value="Full-Time">{isSomali ? 'Waqti Buuxa (Full-Time)' : 'Full-Time Faculty'}</option>
                  <option value="Part-Time">{isSomali ? 'Waqti Dhiman (Part-Time)' : 'Part-Time Lecturer'}</option>
                  <option value="Contract">{isSomali ? 'Qandaraas (Contract)' : 'Contract / Visiting'}</option>
                </select>
              </div>
            </div>

            {/* Assigned Subjects Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isSomali ? 'Maadooyinka loo qoondeeyay' : 'Assigned Teaching Subjects'} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold">
                  {formData.subjects.length} {isSomali ? 'la doortay' : 'selected'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
                {suggestedSubjects.map((sub) => {
                  const isSelected = formData.subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#122E52] text-white shadow-xs scale-105'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-[#1E3A63]'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {sub}
                    </button>
                  );
                })}
              </div>

              {/* Custom Subject Input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder={isSomali ? 'Ama qor maaddo cusub oo riix Ku dar...' : 'Or type custom subject and press Add...'}
                  value={formData.customSubjectInput}
                  onChange={(e) => setFormData({ ...formData, customSubjectInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSubject();
                    }
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomSubject}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-[#122E52]/20 dark:hover:bg-[#0B1B32] text-slate-800 dark:text-slate-100 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {isSomali ? 'Ku dar Maaddo' : 'Add Subject'}
                </button>
              </div>
              {errors.subjects && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.subjects}</span>
                </p>
              )}
            </div>

            {/* Assigned Classes Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isSomali ? 'Fasallada loo xilsaaray' : 'Assigned Classes / Grades'} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold">
                  {formData.classesAssigned.length} {isSomali ? 'la doortay' : 'selected'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {classes.map((cls) => {
                  const isSelected = formData.classesAssigned.includes(cls.name);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleClass(cls.name)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs scale-105'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-indigo-400'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {cls.name}
                    </button>
                  );
                })}
              </div>

              {/* Custom Class Input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder={isSomali ? 'Ama geli fasal kale (tusaale: Class 06)...' : 'Or enter custom class (e.g. Class 06)...'}
                  value={formData.customClassInput}
                  onChange={(e) => setFormData({ ...formData, customClassInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomClass();
                    }
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomClass}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-800 dark:text-slate-100 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {isSomali ? 'Ku dar Fasal' : 'Add Class'}
                </button>
              </div>
              {errors.classesAssigned && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.classesAssigned}</span>
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#122E52] to-indigo-50 dark:from-[#122E52] dark:to-indigo-950/40 border border-[#1E3A63] dark:border-[#1E3A63] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#122E52] text-white shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {isSomali ? 'Dib-u-eegista & Xaqiijinta Macallinka' : 'Final Review & Faculty Verification'}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {isSomali ? 'Hubi dhammaan xogta ka hor inta aan la keydin' : 'Review candidate details below. Click any section edit icon to make modifications.'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] font-bold text-[10px] tracking-wide uppercase">
                {isSomali ? 'Tallaabada 4 ee 4' : 'Step 4 of 4'}
              </span>
            </div>

            {/* Profile Highlight Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  name={formData.name || 'Faculty Member'}
                  avatarUrl={formData.avatar}
                  size="xl"
                  ring="ring-2 ring-[#F7A914]/30 dark:ring-[#F7A914]/30"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {formData.name || (isSomali ? 'Macallin Cusub' : 'Unnamed Teacher')}
                  </h3>
                  <p className="text-xs font-semibold text-[#3B82F6] dark:text-[#60A5FA]">
                    {formData.qualification}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formData.teacherId}</span> • {formData.joiningDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#3B82F6] border border-slate-200 dark:border-slate-600 shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.edit}</span>
              </button>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Contact Card */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>{isSomali ? 'Faahfaahinta Xiriirka' : 'Contact Details'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[11px] font-bold text-[#3B82F6] hover:underline cursor-pointer"
                  >
                    {t.edit}
                  </button>
                </div>
                <div className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <p className="truncate">
                    <span className="text-slate-400">Email:</span>{' '}
                    <span className="font-semibold">{formData.email || `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@eduspike.edu`}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">{isSomali ? 'Tel:' : 'Phone:'}</span>{' '}
                    <span className="font-semibold">{formData.phone || '+252 (61) 500-9988'}</span>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400">{isSomali ? 'Cinwaan:' : 'Address:'}</span>{' '}
                    <span>{formData.address}</span>
                  </p>
                </div>
              </div>

              {/* Employment Card */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isSomali ? 'Xilka & Shaqada' : 'Academic Appointment'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[11px] font-bold text-[#3B82F6] hover:underline cursor-pointer"
                  >
                    {t.edit}
                  </button>
                </div>
                <div className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <p>
                    <span className="text-slate-400">{isSomali ? 'Qandaraas:' : 'Contract:'}</span>{' '}
                    <span className="font-semibold text-emerald-600">{formData.employmentType}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">{isSomali ? 'Maadooyin:' : 'Subjects:'}</span>{' '}
                    <span className="font-semibold">{formData.subjects.join(', ')}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">{isSomali ? 'Fasallo:' : 'Classes:'}</span>{' '}
                    <span className="font-semibold">{formData.classesAssigned.join(', ')}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Terms Certification */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => {
                    setFormData({ ...formData, agreedToTerms: e.target.checked });
                    if (errors.agreedToTerms) setErrors({ ...errors, agreedToTerms: '' });
                  }}
                  className="mt-0.5 rounded text-[#3B82F6] focus:ring-[#3B82F6] w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight font-medium">
                  {isSomali
                    ? 'Waxaan xaqiijinayaa in shahaadooyinka, aqoonta iyo macluumaadka macallinka la xaqiijiyay si waafaqsan shuruucda dugsiga.'
                    : 'I hereby certify that the faculty credentials, background checks, and teaching certifications have been verified in accordance with school governance standards.'}
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1 pl-6">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.agreedToTerms}</span>
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <RegistrationWizard
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      validateStep={validateStepWithZod}
      onSubmit={handleSubmit}
      onCancel={onClose}
      isSubmitting={isSubmitting}
      serverError={serverError}
      submitButtonLabel={t.submitAndRecruit}
      renderStepContent={renderStepContent}
    />
  );
};
