import React, { useState } from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Student, SchoolClass } from '../../types';
import {
  User,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Users,
  ShieldCheck,
  AlertCircle,
  Edit3,
  HeartPulse,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { RegistrationWizard, WizardStepDef } from '../common/RegistrationWizard';
import {
  studentStep1Schema,
  studentStep2Schema,
  studentStep3Schema,
  studentStep4Schema,
} from '../../schemas/registrationSchemas';

interface StudentRegistrationWizardProps {
  targetClass?: SchoolClass | null;
  onClose: () => void;
  onSuccess: (student: Student) => void;
}

export const StudentRegistrationWizard: React.FC<StudentRegistrationWizardProps> = ({
  targetClass,
  onClose,
  onSuccess,
}) => {
  const { students, classes, addStudent } = useSchoolData();
  const { t, currentLanguage } = useLanguage();
  const isSomali = currentLanguage === 'so';

  // Wizard active step: 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Derive target class
  const activeClass = targetClass || (classes.length > 0 ? classes[0] : null);
  const classTotal = activeClass ? students.filter((s) => s.class === activeClass.name).length : 0;
  const nextNum = 120 + students.length + 1;
  const autoId = `STU-2026-${String(nextNum).padStart(4, '0')}`;
  const autoRoll = `2026${String(classTotal + 1).padStart(2, '0')}`;

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Student Identity & Class Allocation
    schoolId: autoId,
    name: '',
    rollNo: autoRoll,
    className: activeClass ? activeClass.name : 'Class 01',
    section: activeClass?.sections && activeClass.sections.length > 0 ? activeClass.sections[0] : 'A',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    dob: '2016-05-12',
    bloodGroup: 'A+',
    avatar: '',

    // Step 2: Contact & Residential Info
    email: '',
    address: '104 Harmony Blvd, Academic Hills',
    city: 'Hargeisa',
    medicalNotes: 'No known allergies or medical restrictions',

    // Step 3: Parent & Guardian Details
    parentName: '',
    parentRelation: 'Father' as 'Father' | 'Mother' | 'Guardian',
    parentPhone: '',
    parentEmail: '',
    parentOccupation: 'Civil Servant / Educator',

    // Step 4: Verification
    agreedToTerms: true,
  });

  // Validation Errors per field
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
      const parseResult = studentStep1Schema.safeParse({
        schoolId: formData.schoolId,
        name: formData.name,
        rollNo: formData.rollNo,
        className: formData.className,
        section: formData.section,
        gender: formData.gender,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        avatar: formData.avatar,
      });

      handleZodIssues(parseResult);

      // Duplicate School ID check
      const cleanId = formData.schoolId.trim().toUpperCase();
      if (cleanId) {
        const isDuplicate = students.some((s) => s.id.toUpperCase() === cleanId);
        if (isDuplicate) {
          newErrors.schoolId = isSomali
            ? `Aqoonsiga ardayga "${cleanId}" waxaa horey loogu qoray arday kale.`
            : `School ID "${cleanId}" is already registered to another student.`;
        }
      }
    }

    if (stepNumber === 2) {
      const parseResult = studentStep2Schema.safeParse({
        email: formData.email,
        address: formData.address,
        city: formData.city,
        medicalNotes: formData.medicalNotes,
      });

      handleZodIssues(parseResult);
    }

    if (stepNumber === 3) {
      const parseResult = studentStep3Schema.safeParse({
        parentName: formData.parentName,
        parentRelation: formData.parentRelation,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        parentOccupation: formData.parentOccupation,
      });

      handleZodIssues(parseResult);
    }

    if (stepNumber === 4) {
      const parseResult = studentStep4Schema.safeParse({
        agreedToTerms: formData.agreedToTerms,
      });

      handleZodIssues(parseResult);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    const avatarUrl =
      formData.avatar ||
      (formData.gender === 'Male'
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200');

    try {
      const result = await addStudent({
        id: formData.schoolId.trim().toUpperCase(),
        rollNo: formData.rollNo.trim() || autoRoll,
        name: formData.name.trim(),
        avatar: avatarUrl,
        email: generatedEmail,
        class: formData.className,
        section: formData.section,
        gender: formData.gender,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        parentEmail: formData.parentEmail.trim() || `${formData.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        address: `${formData.address}, ${formData.city}`,
        attendanceRate: 100,
        status: 'Active',
      });

      if (result.success && result.student) {
        onSuccess(result.student);
        onClose();
      } else {
        setServerError(result.error || (isSomali ? 'Diiwaangelinta ardaygu way fashilantay.' : 'Failed to complete student enrollment. Please try again.'));
      }
    } catch (err: any) {
      setServerError(err.message || 'An unexpected error occurred during student enrollment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps Configuration
  const steps: WizardStepDef[] = [
    { num: 1, title: t.step1Title, desc: t.step1StudentDesc, icon: User },
    { num: 2, title: t.step2Title, desc: t.step2StudentDesc, icon: MapPin },
    { num: 3, title: t.step3Title, desc: t.step3StudentDesc, icon: Users },
    { num: 4, title: t.step4Title, desc: t.step4Desc, icon: ShieldCheck },
  ];

  // Render Step Contents
  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            {/* Target Class Banner */}
            <div className="p-3.5 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A63] border border-[#1E3A63] dark:border-[#1E3A63] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#122E52] text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                    {isSomali ? `Diiwaangelinta Fasalka: ${formData.className}` : `Class Enrollment: ${formData.className}`}
                  </span>
                  <span className="text-[11px] text-[#3B82F6] dark:text-[#60A5FA] block">
                    {activeClass ? `${isSomali ? 'Qolka' : 'Room'}: ${activeClass.roomNumber || 'Room 101'} • ${isSomali ? 'Macallinka' : 'Teacher'}: ${activeClass.classTeacher || 'Assigned Staff'}` : 'Academic Roster'}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] dark:bg-[#1E3A63] text-[#12233F] dark:text-slate-200 font-bold text-[10px] uppercase tracking-wider">
                {targetClass ? (isSomali ? 'Fasal La Xiray' : 'Class Locked') : (isSomali ? 'Xulashada Fasalka' : 'Class Assignment')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Magaca Buuxa ee Ardayga' : 'Student Full Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder={isSomali ? 'Tusaale: Fatima Ali Warsame' : 'e.g. Fatima Ali Warsame'}
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

              {/* School ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isSomali ? 'Aqoonsiga Ardayga ee Dugsiga' : 'Student School ID'} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#3B82F6] dark:text-[#60A5FA] bg-[#EFF6FF] dark:bg-[#1E3A63] px-2 py-0.5 rounded border border-[#1E3A63] dark:border-[#1E3A63] font-mono">
                    {isSomali ? 'AQOONSI GAAR AH' : 'UNIQUE ID'}
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.schoolId}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData({ ...formData, schoolId: val });
                    if (errors.schoolId) setErrors({ ...errors, schoolId: '' });
                  }}
                  placeholder="e.g. STU-2026-0129"
                  className={`w-full bg-[#EFF6FF] dark:bg-slate-800 border ${
                    errors.schoolId ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-[#1E3A63] dark:border-slate-700'
                  } rounded-xl py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-100 uppercase focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                />
                {errors.schoolId && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.schoolId}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Roll Number */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Lambarka Roll-ka #' : 'Roll #'}
                </label>
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="e.g. 202601"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </div>

              {/* Class Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Fasalka La Qorayo' : 'Target Class'} <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={!!targetClass}
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer disabled:opacity-75"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Qaybta (Section)' : 'Section'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer"
                >
                  {(activeClass?.sections || ['A', 'B', 'C']).map((sec) => (
                    <option key={sec} value={sec}>
                      {isSomali ? `Qaybta ${sec}` : `Section ${sec}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date of Birth */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Taariikhda Dhalashada' : 'Date of Birth'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => {
                    setFormData({ ...formData, dob: e.target.value });
                    if (errors.dob) setErrors({ ...errors, dob: '' });
                  }}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                    errors.dob ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                  } rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                />
              </div>

              {/* Gender */}
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

              {/* Blood Group */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Nooca Dhiigga' : 'Blood Group'}
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A63] border border-[#1E3A63] dark:border-[#1E3A63] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#122E52] text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {isSomali ? 'Tallaabada 2: Deganaanshaha & Caafimaadka' : 'Step 2: Student Residence & Health Information'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSomali ? 'Cinwaanka guriga ee baska dugsiga iyo xogta caafimaadka' : 'Residential address for school buses, student email, and medical records'}
                </p>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isSomali ? 'Iimaylka Ardayga (Ikhtiyaari)' : 'Student Email (Optional)'}
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
                      : 'student@eduspike.edu'
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Wadada / Xaafadda' : 'Street Address'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: '' });
                    }}
                    placeholder={isSomali ? 'Tusaale: Wadada 26 Juun, Hargeisa' : 'e.g. 104 Harmony Blvd, Academic Hills'}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                      errors.address ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl py-2.5 pl-9 pr-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                  />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Magaalada / Degmada' : 'City / District'}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={isSomali ? 'Tusaale: Mogadishu' : 'e.g. Mogadishu'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </div>
            </div>

            {/* Medical Notes */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>{isSomali ? 'Xogta Caafimaadka & Xasaasiyadda' : 'Special Medical Notes & Allergies'}</span>
              </label>
              <textarea
                rows={2}
                value={formData.medicalNotes}
                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                placeholder={isSomali ? 'Xus haddii ardaygu leeyahay xasaasiyad ama baahi gaar ah...' : 'Mention any known dietary restrictions, asthma, or special accommodation requirements...'}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A63] border border-[#1E3A63] dark:border-[#1E3A63] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#122E52] text-white">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {isSomali ? 'Tallaabada 3: Waalidka / Masuulka' : 'Step 3: Parent & Emergency Contact Details'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSomali ? 'Waalidka mas’uulka ka ah kharashaadka iyo wargelinta SMS' : 'Primary guardian for fee billing, SMS notifications, and academic alerts'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Parent Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Magaca Buuxa ee Waalidka/Masuulka' : 'Parent / Guardian Full Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => {
                    setFormData({ ...formData, parentName: e.target.value });
                    if (errors.parentName) setErrors({ ...errors, parentName: '' });
                  }}
                  placeholder={isSomali ? 'Tusaale: Mohamed Ali Warsame' : 'e.g. Mohamed Ali Warsame'}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                    errors.parentName ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                  } rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                />
                {errors.parentName && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.parentName}</span>
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Xiriirka Ardayga' : 'Relationship to Student'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.parentRelation}
                  onChange={(e) => setFormData({ ...formData, parentRelation: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 cursor-pointer"
                >
                  <option value="Father">{isSomali ? 'Aabbo (Father)' : 'Father'}</option>
                  <option value="Mother">{isSomali ? 'Hooyo (Mother)' : 'Mother'}</option>
                  <option value="Guardian">{isSomali ? 'Masuul Sharci ah (Guardian)' : 'Legal Guardian'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Parent Phone */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Taleefanka Waalidka' : 'Parent Contact Phone'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, parentPhone: e.target.value });
                      if (errors.parentPhone) setErrors({ ...errors, parentPhone: '' });
                    }}
                    placeholder="+252 (61) 500-2834"
                    className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                      errors.parentPhone ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl py-2.5 pl-9 pr-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                  />
                </div>
                {errors.parentPhone && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.parentPhone}</span>
                  </p>
                )}
              </div>

              {/* Parent Email */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isSomali ? 'Iimaylka Waalidka (Rasiidhada Kharashka)' : 'Parent Email (for Invoice Receipts)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, parentEmail: e.target.value });
                      if (errors.parentEmail) setErrors({ ...errors, parentEmail: '' });
                    }}
                    placeholder={
                      formData.parentName
                        ? `${formData.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`
                        : 'parent@gmail.com'
                    }
                    className={`w-full bg-slate-50 dark:bg-slate-800 border ${
                      errors.parentEmail ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl py-2.5 pl-9 pr-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20`}
                  />
                </div>
                {errors.parentEmail && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.parentEmail}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Parent Occupation */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isSomali ? 'Shaqada Waalidka / Masuulka' : 'Parent / Guardian Occupation'}
              </label>
              <input
                type="text"
                value={formData.parentOccupation}
                onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                placeholder={isSomali ? 'Tusaale: Ganacsade / Macallin' : 'e.g. Civil Engineer / Merchant'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#122E52] to-[#1E3A63] border border-[#1E3A63] dark:border-[#1E3A63] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#122E52] text-white shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {isSomali ? 'Dib-u-eegista & Xaqiijinta Ardayga' : 'Final Review & Enrollment Verification'}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {isSomali ? 'Hubi dhammaan macluumaadka ardayga ka hor inta aan la diiwaangelin' : 'Verify all student registration data prior to database submission.'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] font-bold text-[10px] tracking-wide uppercase">
                {isSomali ? 'Tallaabada 4 ee 4' : 'Step 4 of 4'}
              </span>
            </div>

            {/* Student Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  name={formData.name || 'Student Candidate'}
                  avatarUrl={formData.avatar}
                  size="xl"
                  ring="ring-2 ring-[#F7A914]/30 dark:ring-[#F7A914]/30"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {formData.name || (isSomali ? 'Arday Cusub' : 'Unnamed Student')}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] font-bold text-[11px]">
                      {formData.className} • {isSomali ? 'Qaybta' : 'Sec'} {formData.section}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Roll #{formData.rollNo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    ID: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formData.schoolId}</span> • {formData.dob} ({formData.gender}, {formData.bloodGroup})
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

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Residence & Health */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>{isSomali ? 'Deganaanshaha & Caafimaadka' : 'Residence & Health'}</span>
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
                    <span className="text-slate-400">{isSomali ? 'Cinwaan:' : 'Address:'}</span>{' '}
                    <span>{formData.address}, {formData.city}</span>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400">Email:</span>{' '}
                    <span>{formData.email || `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@eduspike.edu`}</span>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400">{isSomali ? 'Caafimaad:' : 'Medical:'}</span>{' '}
                    <span>{formData.medicalNotes}</span>
                  </p>
                </div>
              </div>

              {/* Parent Details */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>{isSomali ? 'Waalidka / Masuulka' : 'Parent / Guardian'}</span>
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
                    <span className="text-slate-400">{isSomali ? 'Masuul:' : 'Guardian:'}</span>{' '}
                    <span className="font-semibold">{formData.parentName} ({formData.parentRelation})</span>
                  </p>
                  <p>
                    <span className="text-slate-400">{isSomali ? 'Tel:' : 'Phone:'}</span>{' '}
                    <span className="font-semibold">{formData.parentPhone}</span>
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400">Email:</span>{' '}
                    <span>{formData.parentEmail || `${formData.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Admission Confirmation Policy */}
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
                    ? 'Waxaan xaqiijinayaa in dhammaan shuruudaha diiwaangelinta, xogta waalidka iyo fasalka ardayga la xaqiijiyay.'
                    : 'I confirm that all admission criteria, parent documentation, and class allocation rules have been authenticated for official student enrollment.'}
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
      submitButtonLabel={t.submitAndEnroll}
      renderStepContent={renderStepContent}
    />
  );
};
