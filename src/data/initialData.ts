import {
  Student,
  Teacher,
  LibraryBook,
  SchoolClass,
  Subject,
  AttendanceRecord,
  Exam,
  StudentMark,
  Notice,
  ActivityLog,
  UserProfile
} from '../types';

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-1',
    schoolId: 'ADM-2026-0001',
    password: 'password123',
    name: 'Priscilla Lily',
    email: 'admin@eduspike.edu',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 019-2834',
    designation: 'Principal & Chief Administrator',
    joinDate: '2020-08-15',
    bio: 'Overseeing academic excellence, administrative operations, and holistic student development at EduSpike International School.',
    address: '452 Academy Blvd, Suite 100, Education City'
  },
  {
    id: 'usr-teacher-1',
    schoolId: 'TCH-2026-0007',
    password: 'password123',
    name: 'Alexander Wright',
    email: 'alexander.wright@eduspike.edu',
    role: 'Teacher',
    teacherId: 'TCH-2026-0007',
    assignedClasses: ['Class 01', 'Class 02', 'Class 04'],
    assignedSubjects: ['Mathematics', 'Physics'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 234-5678',
    designation: 'Head of Mathematics Department',
    joinDate: '2021-03-10',
    bio: 'Passionate educator with 8+ years of experience in algebra, geometry, and advanced STEM mentoring.',
    address: '88 Innovation Way, Academic Quarter'
  },
  {
    id: 'usr-student-1',
    schoolId: 'STU-2026-0125',
    password: 'password123',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@eduspike.edu',
    role: 'Student',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 345-6789',
    studentId: 'STU-2026-0125',
    designation: 'Class 02 - Section A',
    joinDate: '2023-09-01',
    bio: 'Enthusiastic 2nd grade student passionate about literature, drawing, and mathematics puzzles.',
    address: '104 Maple Street, Harmony Hills'
  },
  {
    id: 'usr-parent-1',
    schoolId: 'PAR-2026-0042',
    password: 'password123',
    name: 'Robert Jenkins',
    email: 'robert.jenkins@gmail.com',
    role: 'Parent',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '+1 (555) 456-7890',
    studentId: 'STU-2026-0125',
    linkedStudentIds: ['STU-2026-0125', 'STU-2026-0126'], // Linked to Sarah Jenkins and Mia Jenkins
    designation: 'Parent / Guardian of Sarah & Mia Jenkins',
    joinDate: '2023-09-01',
    bio: 'Parent committed to supporting school activities and child education progression.',
    address: '104 Maple Street, Harmony Hills'
  }
];

export const INITIAL_BOOKS: LibraryBook[] = [
  {
    id: 'bk-1',
    bookId: '#0011',
    name: 'Literature',
    writer: 'Wade Warren',
    subject: 'English',
    class: '02',
    publishDate: '22 Oct, 2022',
    status: 'Available',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=150',
    totalCopies: 12,
    availableCopies: 9
  },
  {
    id: 'bk-2',
    bookId: '#0021',
    name: 'Mathematics',
    writer: 'David Morgan',
    subject: 'Mathematics',
    class: '01',
    publishDate: '12 Sep, 2023',
    status: 'Borrowed',
    borrowerName: 'Sarah Jenkins',
    borrowerRole: 'Student',
    dueDate: '25 Aug, 2026',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=150',
    totalCopies: 8,
    availableCopies: 0
  },
  {
    id: 'bk-3',
    bookId: '#0031',
    name: 'English Language',
    writer: 'Kristin Watson',
    subject: 'Physics',
    class: '03',
    publishDate: '23 Nov, 2020',
    status: 'Available',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=150',
    totalCopies: 15,
    availableCopies: 14
  },
  {
    id: 'bk-4',
    bookId: '#0013',
    name: 'Mathematics Vol 2',
    writer: 'Savannah Nguyen',
    subject: 'Mathematics',
    class: '04',
    publishDate: '12 Oct, 2022',
    status: 'Available',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=150',
    totalCopies: 10,
    availableCopies: 7
  },
  {
    id: 'bk-5',
    bookId: '#0018',
    name: 'Physics Principles',
    writer: 'Jacob Jones',
    subject: 'Physics',
    class: '01',
    publishDate: '22 Oct, 2022',
    status: 'Borrowed',
    borrowerName: 'Alexander Wright',
    borrowerRole: 'Teacher',
    dueDate: '30 Aug, 2026',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=150',
    totalCopies: 5,
    availableCopies: 1
  },
  {
    id: 'bk-6',
    bookId: '#0019',
    name: 'World Literature Classics',
    writer: 'Arlene McCoy',
    subject: 'Literature',
    class: '02',
    publishDate: '23 Sep, 2023',
    status: 'Available',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=150',
    totalCopies: 20,
    availableCopies: 18
  },
  {
    id: 'bk-7',
    bookId: '#0025',
    name: 'Modern Chemistry',
    writer: 'Eleanor Pena',
    subject: 'Chemistry',
    class: '05',
    publishDate: '15 Jan, 2024',
    status: 'Available',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=150',
    totalCopies: 8,
    availableCopies: 6
  },
  {
    id: 'bk-8',
    bookId: '#0034',
    name: 'World History Anthology',
    writer: 'Guy Hawkins',
    subject: 'History',
    class: '06',
    publishDate: '18 Aug, 2021',
    status: 'Available',
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=150',
    totalCopies: 14,
    availableCopies: 11
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-2026-0125',
    rollNo: '202402',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    email: 'sarah.jenkins@eduspike.edu',
    class: 'Class 02',
    section: 'A',
    gender: 'Female',
    dob: '2016-04-12',
    bloodGroup: 'A+',
    parentName: 'Robert Jenkins',
    parentPhone: '+1 (555) 456-7890',
    parentEmail: 'robert.jenkins@gmail.com',
    status: 'Active',
    enrollmentDate: '2023-09-01',
    attendanceRate: 97.2
  },
  {
    id: 'STU-2026-0011',
    rollNo: '202401',
    name: 'Ethan Howard',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    email: 'ethan.howard@eduspike.edu',
    class: 'Class 01',
    section: 'A',
    gender: 'Male',
    dob: '2017-02-18',
    bloodGroup: 'O+',
    parentName: 'Laura Howard',
    parentPhone: '+1 (555) 987-6543',
    parentEmail: 'laura.howard@gmail.com',
    status: 'Active',
    enrollmentDate: '2023-09-01',
    attendanceRate: 94.8
  },
  {
    id: 'STU-2026-0031',
    rollNo: '202403',
    name: 'Olivia Martinez',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
    email: 'olivia.m@eduspike.edu',
    class: 'Class 03',
    section: 'B',
    gender: 'Female',
    dob: '2015-08-25',
    bloodGroup: 'B+',
    parentName: 'Carlos Martinez',
    parentPhone: '+1 (555) 321-7654',
    parentEmail: 'carlos.m@gmail.com',
    status: 'Active',
    enrollmentDate: '2022-09-01',
    attendanceRate: 98.5
  },
  {
    id: 'STU-2026-0041',
    rollNo: '202404',
    name: 'Liam Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    email: 'liam.chen@eduspike.edu',
    class: 'Class 04',
    section: 'A',
    gender: 'Male',
    dob: '2014-11-05',
    bloodGroup: 'AB+',
    parentName: 'David Chen',
    parentPhone: '+1 (555) 876-5432',
    parentEmail: 'david.chen@gmail.com',
    status: 'Active',
    enrollmentDate: '2021-09-01',
    attendanceRate: 92.0
  },
  {
    id: 'STU-2026-0126',
    rollNo: '202405',
    name: 'Mia Jenkins',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    email: 'mia.jenkins@eduspike.edu',
    class: 'Class 02',
    section: 'B',
    gender: 'Female',
    dob: '2016-01-30',
    bloodGroup: 'O-',
    parentName: 'Robert Jenkins',
    parentPhone: '+1 (555) 456-7890',
    parentEmail: 'robert.jenkins@gmail.com',
    status: 'Active',
    enrollmentDate: '2023-09-01',
    attendanceRate: 96.0
  },
  {
    id: 'STU-2026-0061',
    rollNo: '202406',
    name: 'Lucas Baker',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    email: 'lucas.baker@eduspike.edu',
    class: 'Class 05',
    section: 'A',
    gender: 'Male',
    dob: '2013-06-14',
    bloodGroup: 'A-',
    parentName: 'Hannah Baker',
    parentPhone: '+1 (555) 345-1234',
    parentEmail: 'hannah.baker@gmail.com',
    status: 'Active',
    enrollmentDate: '2020-09-01',
    attendanceRate: 95.4
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'TCH-001',
    teacherId: 'TCH-2026-0007',
    name: 'Alexander Wright',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    email: 'alexander.wright@eduspike.edu',
    phone: '+1 (555) 234-5678',
    subjects: ['Mathematics', 'Physics'],
    classesAssigned: ['Class 01', 'Class 02', 'Class 04'],
    qualification: 'M.Sc in Applied Mathematics',
    joiningDate: '2021-03-10',
    gender: 'Male',
    status: 'Active'
  },
  {
    id: 'TCH-002',
    teacherId: '#T002',
    name: 'Emily Davis',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    email: 'emily.davis@eduspike.edu',
    phone: '+1 (555) 345-8901',
    subjects: ['English', 'Literature'],
    classesAssigned: ['Class 02', 'Class 03'],
    qualification: 'M.A. in English Literature',
    joiningDate: '2019-08-20',
    gender: 'Female',
    status: 'Active'
  },
  {
    id: 'TCH-003',
    teacherId: '#T003',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    email: 'marcus.vance@eduspike.edu',
    phone: '+1 (555) 456-9012',
    subjects: ['Physics', 'Chemistry'],
    classesAssigned: ['Class 03', 'Class 05'],
    qualification: 'Ph.D. in Physics Science',
    joiningDate: '2020-01-15',
    gender: 'Male',
    status: 'Active'
  },
  {
    id: 'TCH-004',
    teacherId: '#T004',
    name: 'Sophia Reed',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    email: 'sophia.reed@eduspike.edu',
    phone: '+1 (555) 567-0123',
    subjects: ['Computer Science', 'Mathematics'],
    classesAssigned: ['Class 04', 'Class 05'],
    qualification: 'B.Tech in Computer Science',
    joiningDate: '2022-09-01',
    gender: 'Female',
    status: 'Active'
  }
];

export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'cls-1',
    name: 'Class 01',
    code: 'CLS-01',
    sections: ['A', 'B'],
    classTeacher: 'Alexander Wright',
    classTeacherId: 'TCH-001',
    totalStudents: 32,
    capacity: 40,
    roomNumber: 'Room 101'
  },
  {
    id: 'cls-2',
    name: 'Class 02',
    code: 'CLS-02',
    sections: ['A', 'B'],
    classTeacher: 'Emily Davis',
    classTeacherId: 'TCH-002',
    totalStudents: 28,
    capacity: 35,
    roomNumber: 'Room 102'
  },
  {
    id: 'cls-3',
    name: 'Class 03',
    code: 'CLS-03',
    sections: ['A', 'B', 'C'],
    classTeacher: 'Marcus Vance',
    classTeacherId: 'TCH-003',
    totalStudents: 35,
    capacity: 40,
    roomNumber: 'Room 103'
  },
  {
    id: 'cls-4',
    name: 'Class 04',
    code: 'CLS-04',
    sections: ['A', 'B'],
    classTeacher: 'Sophia Reed',
    classTeacherId: 'TCH-004',
    totalStudents: 30,
    capacity: 35,
    roomNumber: 'Room 201'
  },
  {
    id: 'cls-5',
    name: 'Class 05',
    code: 'CLS-05',
    sections: ['A'],
    classTeacher: 'Alexander Wright',
    classTeacherId: 'TCH-001',
    totalStudents: 25,
    capacity: 30,
    roomNumber: 'Room 202'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'Mathematics',
    code: 'MATH-101',
    type: 'Theory',
    classes: ['Class 01', 'Class 02', 'Class 03', 'Class 04', 'Class 05'],
    teachers: ['Alexander Wright', 'Sophia Reed'],
    passMarks: 40,
    totalMarks: 100
  },
  {
    id: 'sub-2',
    name: 'English',
    code: 'ENG-102',
    type: 'Theory',
    classes: ['Class 01', 'Class 02', 'Class 03', 'Class 04', 'Class 05'],
    teachers: ['Emily Davis'],
    passMarks: 40,
    totalMarks: 100
  },
  {
    id: 'sub-3',
    name: 'Physics',
    code: 'PHY-201',
    type: 'Both',
    classes: ['Class 03', 'Class 04', 'Class 05'],
    teachers: ['Marcus Vance', 'Alexander Wright'],
    passMarks: 40,
    totalMarks: 100
  },
  {
    id: 'sub-4',
    name: 'Computer Science',
    code: 'CS-301',
    type: 'Practical',
    classes: ['Class 04', 'Class 05'],
    teachers: ['Sophia Reed'],
    passMarks: 35,
    totalMarks: 100
  },
  {
    id: 'sub-5',
    name: 'Literature',
    code: 'LIT-103',
    type: 'Theory',
    classes: ['Class 02', 'Class 03'],
    teachers: ['Emily Davis'],
    passMarks: 40,
    totalMarks: 100
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '2026-08-12',
    class: 'Class 02',
    section: 'A',
    studentId: 'STU-2026-0125',
    studentName: 'Sarah Jenkins',
    rollNo: '202402',
    status: 'Present',
    remarks: 'On time'
  },
  {
    id: 'att-2',
    date: '2026-08-12',
    class: 'Class 01',
    section: 'A',
    studentId: 'STU-2026-0011',
    studentName: 'Ethan Howard',
    rollNo: '202401',
    status: 'Present'
  },
  {
    id: 'att-3',
    date: '2026-08-12',
    class: 'Class 03',
    section: 'B',
    studentId: 'STU-2026-0031',
    studentName: 'Olivia Martinez',
    rollNo: '202403',
    status: 'Late',
    remarks: 'Traffic delay'
  },
  {
    id: 'att-4',
    date: '2026-08-12',
    class: 'Class 04',
    section: 'A',
    studentId: 'STU-2026-0041',
    studentName: 'Liam Chen',
    rollNo: '202404',
    status: 'Absent',
    remarks: 'Sick leave granted'
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'ex-1',
    title: 'Mid-Term Examination 2026',
    term: 'Mid-Term',
    startDate: '2026-09-15',
    endDate: '2026-09-25',
    classes: ['Class 01', 'Class 02', 'Class 03', 'Class 04', 'Class 05'],
    status: 'Upcoming'
  },
  {
    id: 'ex-2',
    title: 'First Unit Test 2026',
    term: 'First Term',
    startDate: '2026-06-10',
    endDate: '2026-06-15',
    classes: ['Class 01', 'Class 02', 'Class 03'],
    status: 'Completed'
  }
];

export const INITIAL_MARKS: StudentMark[] = [
  {
    id: 'mrk-1',
    examId: 'ex-2',
    studentId: 'STU-2026-0125',
    studentName: 'Sarah Jenkins',
    rollNo: '202402',
    class: 'Class 02',
    section: 'A',
    subject: 'Mathematics',
    marksObtained: 95,
    totalMarks: 100,
    grade: 'A+',
    remarks: 'Outstanding logical reasoning'
  },
  {
    id: 'mrk-2',
    examId: 'ex-2',
    studentId: 'STU-2026-0125',
    studentName: 'Sarah Jenkins',
    rollNo: '202402',
    class: 'Class 02',
    section: 'A',
    subject: 'English',
    marksObtained: 88,
    totalMarks: 100,
    grade: 'A',
    remarks: 'Great reading comprehension'
  },
  {
    id: 'mrk-3',
    examId: 'ex-2',
    studentId: 'STU-2026-0011',
    studentName: 'Ethan Howard',
    rollNo: '202401',
    class: 'Class 01',
    section: 'A',
    subject: 'Mathematics',
    marksObtained: 91,
    totalMarks: 100,
    grade: 'A+',
    remarks: 'Excellent computation speed'
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: 'Mid-Term Exam Date Sheet & Syllabus Released',
    content: 'The Mid-Term Examination 2026 schedules and subject-wise syllabus guidelines have been published. Please review the schedule under the Exam module.',
    postedBy: 'Priscilla Lily',
    postedByRole: 'Admin',
    date: '10 Aug, 2026',
    audience: 'All',
    priority: 'High'
  },
  {
    id: 'not-2',
    title: 'Annual Science Fair Registration Open',
    content: 'Students from Class 02 to Class 05 are invited to submit science project proposals to their respective physics or chemistry teachers by end of month.',
    postedBy: 'Marcus Vance',
    postedByRole: 'Teacher',
    date: '08 Aug, 2026',
    audience: 'Students',
    priority: 'Medium'
  },
  {
    id: 'not-3',
    title: 'Parent-Teacher Meeting (PTM) Schedule',
    content: 'Quarterly Parent-Teacher Meeting will be held on Saturday, August 28th from 9:00 AM to 1:00 PM in the Main Auditorium.',
    postedBy: 'Priscilla Lily',
    postedByRole: 'Admin',
    date: '04 Aug, 2026',
    audience: 'Parents',
    priority: 'High'
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    user: 'Priscilla Lily',
    action: 'issued book "Mathematics" (#0021) to Sarah Jenkins',
    timestamp: '10 mins ago',
    type: 'book'
  },
  {
    id: 'act-2',
    user: 'Alexander Wright',
    action: 'updated attendance for Class 02 - Section A',
    timestamp: '25 mins ago',
    type: 'attendance'
  },
  {
    id: 'act-3',
    user: 'Emily Davis',
    action: 'added new notice "Mid-Term Exam Syllabus"',
    timestamp: '2 hours ago',
    type: 'notice'
  },
  {
    id: 'act-4',
    user: 'Priscilla Lily',
    action: 'enrolled new student "Lucas Baker" to Class 05',
    timestamp: 'Yesterday at 3:15 PM',
    type: 'student'
  }
];
