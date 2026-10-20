import { z } from 'zod';

// ============================================================================
// 1. TEACHER REGISTRATION SCHEMAS (Steps 1-4)
// ============================================================================

export const teacherStep1Schema = z.object({
  teacherId: z
    .string()
    .trim()
    .min(3, { message: 'Teacher ID must be at least 3 characters long.' })
    .max(20, { message: 'Teacher ID cannot exceed 20 characters.' })
    .regex(/^[A-Z0-9_-]+$/i, { message: 'Teacher ID can only contain letters, numbers, hyphens, and underscores.' }),
  name: z
    .string()
    .trim()
    .min(2, { message: 'Teacher full name must be at least 2 characters.' })
    .max(80, { message: 'Teacher name cannot exceed 80 characters.' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  joiningDate: z
    .string()
    .min(1, { message: 'Joining / employment date is required.' }),
  avatar: z.string().optional().or(z.literal('')),
});

export const teacherStep2Schema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address (e.g. teacher@school.edu).' })
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || val.replace(/\D/g, '').length >= 7, {
      message: 'Phone number must contain at least 7 digits.',
    })
    .optional()
    .or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  emergencyContactName: z.string().trim().optional().or(z.literal('')),
  emergencyContactPhone: z
    .string()
    .trim()
    .refine((val) => !val || val.replace(/\D/g, '').length >= 7, {
      message: 'Emergency phone number must contain at least 7 digits.',
    })
    .optional()
    .or(z.literal('')),
});

export const teacherStep3Schema = z.object({
  qualification: z
    .string()
    .trim()
    .min(2, { message: 'Academic degree / qualification is required (e.g. M.Sc in Physics).' }),
  employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract']),
  subjects: z
    .array(z.string().trim())
    .min(1, { message: 'Please assign at least one teaching subject.' }),
  classesAssigned: z
    .array(z.string().trim())
    .min(1, { message: 'Please assign at least one teaching class.' }),
});

export const teacherStep4Schema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must certify faculty credentials and agree to institution terms.',
  }),
});

export const fullTeacherRegistrationSchema = teacherStep1Schema
  .merge(teacherStep2Schema)
  .merge(teacherStep3Schema)
  .merge(teacherStep4Schema);

export type TeacherRegistrationFormData = z.infer<typeof fullTeacherRegistrationSchema>;


// ============================================================================
// 2. STUDENT REGISTRATION SCHEMAS (Steps 1-4)
// ============================================================================

export const studentStep1Schema = z.object({
  schoolId: z
    .string()
    .trim()
    .min(3, { message: 'Student School ID must be at least 3 characters.' })
    .max(20, { message: 'School ID cannot exceed 20 characters.' })
    .regex(/^[A-Z0-9_-]+$/i, { message: 'School ID can only contain alphanumeric characters, hyphens, and underscores.' }),
  name: z
    .string()
    .trim()
    .min(2, { message: 'Student full name must be at least 2 characters.' })
    .max(80, { message: 'Student name cannot exceed 80 characters.' }),
  rollNo: z
    .string()
    .trim()
    .min(1, { message: 'Roll number is required.' }),
  className: z
    .string()
    .trim()
    .min(1, { message: 'Target class enrollment is required.' }),
  section: z
    .string()
    .trim()
    .min(1, { message: 'Section is required.' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z
    .string()
    .min(1, { message: 'Date of birth is required.' }),
  bloodGroup: z.string().optional().or(z.literal('')),
  avatar: z.string().optional().or(z.literal('')),
});

export const studentStep2Schema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid student email address.' })
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .trim()
    .min(3, { message: 'Residential street address is required for transport/records (at least 3 chars).' }),
  city: z
    .string()
    .trim()
    .min(2, { message: 'City / District is required.' }),
  medicalNotes: z.string().trim().optional().or(z.literal('')),
});

export const studentStep3Schema = z.object({
  parentName: z
    .string()
    .trim()
    .min(2, { message: 'Parent or legal guardian name is required (min 2 chars).' })
    .max(80, { message: 'Parent name cannot exceed 80 characters.' }),
  parentRelation: z.enum(['Father', 'Mother', 'Guardian']),
  parentPhone: z
    .string()
    .trim()
    .min(7, { message: 'Parent contact phone number is required (min 7 digits).' })
    .refine((val) => val.replace(/\D/g, '').length >= 7, {
      message: 'Please enter a valid phone number with at least 7 digits.',
    }),
  parentEmail: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid parent email address for invoice delivery.' })
    .optional()
    .or(z.literal('')),
  parentOccupation: z.string().trim().optional().or(z.literal('')),
});

export const studentStep4Schema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must confirm student admission and policy compliance.',
  }),
});

export const fullStudentRegistrationSchema = studentStep1Schema
  .merge(studentStep2Schema)
  .merge(studentStep3Schema)
  .merge(studentStep4Schema);

export type StudentRegistrationFormData = z.infer<typeof fullStudentRegistrationSchema>;
