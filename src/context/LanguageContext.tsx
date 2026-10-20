import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { SOMALI_DICTIONARY, translateDynamic } from '../locales/somaliDictionary';

export type Language = 'en' | 'so';

export interface Translations {
  // Navigation & Roles
  dashboard: string;
  schools: string;
  schoolOverview: string;
  students: string;
  myStudents: string;
  teachers: string;
  myTeachers: string;
  facultyDirectory: string;
  headteachers: string;
  headteacherManagement: string;
  platformUsers: string;
  classes: string;
  myClasses: string;
  myClass: string;
  subjects: string;
  mySubjects: string;
  attendance: string;
  myAttendance: string;
  attendanceRoll: string;
  exams: string;
  examsResults: string;
  myResults: string;
  timetable: string;
  myTimetable: string;
  scheduleTimetable: string;
  announcements: string;
  fees: string;
  financialOverview: string;
  myFees: string;
  accountsFees: string;
  reports: string;
  schoolPerformanceReports: string;
  financialReports: string;
  library: string;
  activityAuditLogs: string;
  settings: string;
  platformSettings: string;
  schoolSettings: string;
  profile: string;
  myProfile: string;
  studyBuddy: string;
  geminiAi: string;
  analytics: string;
  downloads: string;
  downloadCenter: string;
  logout: string;
  signOut: string;
  language: string;
  english: string;
  somali: string;
  switchLanguage: string;
  
  // Financial Dashboard Cards & Accountant
  totalAmount: string;
  totalAmountDesc: string;
  totalPaid: string;
  totalPaidDesc: string;
  remaining: string;
  remainingDesc: string;
  collectionRate: string;
  settlementEfficiency: string;
  
  // Classes
  classList: string;
  selectClass: string;
  backToClasses: string;
  allClasses: string;
  classFinancialOverview: string;
  studentsCount: string;
  totalBilled: string;
  remainingAmount: string;
  class: string;
  section: string;
  
  // Students & Financial Rows
  studentName: string;
  studentId: string;
  parentGuardian: string;
  parentPhone: string;
  phoneNumber: string;
  totalFee: string;
  amountPaid: string;
  remainingBalance: string;
  paymentStatus: string;
  paymentAction: string;
  
  // Status Labels
  paid: string;
  unpaid: string;
  partiallyPaid: string;
  active: string;
  inactive: string;
  disabled: string;
  graduated: string;
  suspended: string;
  all: string;
  filterByStatus: string;
  
  // Wizard & Registration
  step: string;
  step1Title: string;
  step1TeacherDesc: string;
  step1StudentDesc: string;
  step2Title: string;
  step2TeacherDesc: string;
  step2StudentDesc: string;
  step3Title: string;
  step3TeacherDesc: string;
  step3StudentDesc: string;
  step4Title: string;
  step4Desc: string;
  continue: string;
  back: string;
  submitAndConfirm: string;
  submitAndRecruit: string;
  submitAndEnroll: string;
  edit: string;
  reviewSummary: string;
  
  // Actions & Buttons
  search: string;
  searchPlaceholder: string;
  filter: string;
  addNewTeacher: string;
  addNewStudent: string;
  bulkImportCsv: string;
  exportCsv: string;
  exportPdf: string;
  markAsPaid: string;
  markAsUnpaid: string;
  recordPayment: string;
  updateStatus: string;
  viewReceipt: string;
  printReceipt: string;
  downloadReceipt: string;
  quickAction: string;
  quickToggle: string;
  confirm: string;
  cancel: string;
  save: string;
  close: string;
  delete: string;
  actions: string;
  
  // Modals & Details
  paymentDetails: string;
  recordNewPayment: string;
  paymentMethod: string;
  cash: string;
  mobileMoney: string;
  bankTransfer: string;
  onlineGateway: string;
  transactionRef: string;
  notes: string;
  fullPayment: string;
  customAmount: string;
  date: string;
  receiptNumber: string;
  issuedTo: string;
  receivedBy: string;
  officialReceipt: string;
  noStudentsFound: string;
  noClassesFound: string;
  noTeachersFound: string;
  
  // Messages & Toasts
  paymentSavedSuccess: string;
  paymentUnpaidSuccess: string;
  paymentFailed: string;
  invalidAmount: string;
  amountExceedsBalance: string;
}

const translations: Record<Language, Translations> = {
  en: {
    dashboard: 'Dashboard',
    schools: 'Schools',
    schoolOverview: 'School Overview',
    students: 'Students',
    myStudents: 'My Students',
    teachers: 'Faculty & Teachers',
    myTeachers: 'My Teachers',
    facultyDirectory: 'Faculty Directory',
    headteachers: 'Headteachers',
    headteacherManagement: 'Headteacher Management',
    platformUsers: 'Platform Users',
    classes: 'Classes',
    myClasses: 'My Classes',
    myClass: 'My Class',
    subjects: 'Subjects',
    mySubjects: 'My Subjects',
    attendance: 'Attendance',
    myAttendance: 'My Attendance',
    attendanceRoll: 'Attendance Roll Call',
    exams: 'Exams & Results',
    examsResults: 'Exams & Results',
    myResults: 'My Results & Transcripts',
    timetable: 'Timetable',
    myTimetable: 'My Timetable',
    scheduleTimetable: 'Schedule & Timetable',
    announcements: 'Announcements',
    fees: 'Fees',
    financialOverview: 'Financial Overview',
    myFees: 'My Invoices & Receipts',
    accountsFees: 'Accounts / Fees',
    reports: 'Reports',
    schoolPerformanceReports: 'School Performance Reports',
    financialReports: 'Financial Reports',
    library: 'Library & Media',
    activityAuditLogs: 'Activity & Audit Trail',
    settings: 'Settings',
    platformSettings: 'Platform Settings',
    schoolSettings: 'School Settings',
    profile: 'My Profile',
    myProfile: 'My Profile',
    studyBuddy: 'Study Buddy AI',
    geminiAi: 'Gemini AI Assistant',
    analytics: 'Analytics',
    downloads: 'Download Center',
    downloadCenter: 'Download Center',
    logout: 'Sign Out',
    signOut: 'Sign Out',
    language: 'Language',
    english: 'English (EN)',
    somali: 'Somali (SO)',
    switchLanguage: 'Switch Language',

    totalAmount: 'TOTAL AMOUNT',
    totalAmountDesc: 'Total fees billed to all students',
    totalPaid: 'TOTAL PAID',
    totalPaidDesc: 'Total amount actually paid',
    remaining: 'REMAINING',
    remainingDesc: 'Total outstanding balance',
    collectionRate: 'Collection Rate',
    settlementEfficiency: 'Settlement Efficiency',

    classList: 'Class Fee Overview',
    selectClass: 'Select Class',
    backToClasses: 'Back to Classes',
    allClasses: 'All Classes',
    classFinancialOverview: 'Class-by-Class Financial Overview',
    studentsCount: 'Students',
    totalBilled: 'Total Billed',
    remainingAmount: 'Remaining',
    class: 'Class',
    section: 'Section',

    studentName: 'Student Name',
    studentId: 'Student ID',
    parentGuardian: 'Parent / Guardian',
    parentPhone: 'Parent Phone',
    phoneNumber: 'Phone Number',
    totalFee: 'Total Fee',
    amountPaid: 'Amount Paid',
    remainingBalance: 'Remaining Balance',
    paymentStatus: 'Payment Status',
    paymentAction: 'Payment Action',

    paid: 'PAID',
    unpaid: 'UNPAID',
    partiallyPaid: 'PARTIAL',
    active: 'Active',
    inactive: 'Inactive',
    disabled: 'Disabled',
    graduated: 'Graduated',
    suspended: 'Suspended',
    all: 'All',
    filterByStatus: 'Filter Status',

    step: 'Step',
    step1Title: 'Personal Info',
    step1TeacherDesc: 'Faculty Identification & Profile',
    step1StudentDesc: 'Student Identity & Class Placement',
    step2Title: 'Contact & Quarters',
    step2TeacherDesc: 'Phone, Email & Address',
    step2StudentDesc: 'Residence & Health Information',
    step3Title: 'Academic Allocation',
    step3TeacherDesc: 'Subjects & Assigned Classes',
    step3StudentDesc: 'Parent & Guardian Details',
    step4Title: 'Review & Confirm',
    step4Desc: 'Final Verification Summary',
    continue: 'Continue',
    back: 'Back',
    submitAndConfirm: 'Submit & Confirm',
    submitAndRecruit: 'Submit & Recruit Teacher',
    submitAndEnroll: 'Submit & Enroll Student',
    edit: 'Edit',
    reviewSummary: 'Review Summary',

    search: 'Search',
    searchPlaceholder: 'Search by name, ID, or query...',
    filter: 'Filter',
    addNewTeacher: 'Add New Teacher',
    addNewStudent: 'Add New Student',
    bulkImportCsv: 'Bulk Import CSV',
    exportCsv: 'Export CSV',
    exportPdf: 'Export PDF',
    markAsPaid: 'Mark Paid',
    markAsUnpaid: 'Mark Unpaid',
    recordPayment: 'Record Payment',
    updateStatus: 'Update Payment',
    viewReceipt: 'View Receipt',
    printReceipt: 'Print Receipt',
    downloadReceipt: 'Download PDF',
    quickAction: 'Quick Action',
    quickToggle: 'Toggle Status',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save Changes',
    close: 'Close',
    delete: 'Delete',
    actions: 'Actions',

    paymentDetails: 'Payment Details',
    recordNewPayment: 'Record Student Payment',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    mobileMoney: 'Mobile Money (EVC / Zaad / Sahal)',
    bankTransfer: 'Bank Transfer',
    onlineGateway: 'Card / Online Gateway',
    transactionRef: 'Reference / Receipt No.',
    notes: 'Notes / Remarks',
    fullPayment: 'Full Settlement',
    customAmount: 'Partial / Custom Amount',
    date: 'Date',
    receiptNumber: 'Receipt No.',
    issuedTo: 'Issued To',
    receivedBy: 'Received By',
    officialReceipt: 'Official School Fee Receipt',
    noStudentsFound: 'No students found matching your search.',
    noClassesFound: 'No registered classes found.',
    noTeachersFound: 'No faculty members found matching your search.',

    paymentSavedSuccess: 'Payment status updated and saved successfully!',
    paymentUnpaidSuccess: 'Student fee status marked as Unpaid.',
    paymentFailed: 'Payment processing failed. Please try again.',
    invalidAmount: 'Please enter a valid payment amount.',
    amountExceedsBalance: 'Payment amount exceeds the student remaining balance.',
  },
  so: {
    dashboard: 'Deshkoodhka',
    schools: 'Dugsiyada',
    schoolOverview: 'Dulmarka Dugsiga',
    students: 'Ardayda',
    myStudents: 'Ardaydayda',
    teachers: 'Macallimiinta',
    myTeachers: 'Macallimiintayda',
    facultyDirectory: 'Liiska Macallimiinta',
    headteachers: 'Maamulayaasha',
    headteacherManagement: 'Maamulka Maamulaha',
    platformUsers: 'Isticmaalayaasha Nidaamka',
    classes: 'Fasallada',
    myClasses: 'Fasalladayda',
    myClass: 'Fasalkayga',
    subjects: 'Maadooyinka',
    mySubjects: 'Maadooyinkayga',
    attendance: 'Xaadiriska & Joogitaanka',
    myAttendance: 'Joogitaankayga',
    attendanceRoll: 'Xaadirinta Ardayda',
    exams: 'Imtixaanaadka & Natiijooyinka',
    examsResults: 'Imtixaanaadka & Natiijooyinka',
    myResults: 'Natiijooyinkayga & Shahaadooyinka',
    timetable: 'Jadwalka Xiisadaha',
    myTimetable: 'Jadwalkayga Xiisadaha',
    scheduleTimetable: 'Jadwalka & Xiisadaha',
    announcements: 'Ogeysiisyada',
    fees: 'Kharashaadka',
    financialOverview: 'Dulmarka Dhaqaalaha',
    myFees: 'Qaansheegyadayda & Rasiidhada',
    accountsFees: 'Xisaabaadka & Kharashaadka',
    reports: 'Warbixinnada',
    schoolPerformanceReports: 'Warbixinta Waxqabadka Dugsiga',
    financialReports: 'Warbixinnada Dhaqaalaha',
    library: 'Maktabadda & Agabka',
    activityAuditLogs: 'Diiwaanka Dhaqdhaqaaqa & Amniga',
    settings: 'Dejinta',
    platformSettings: 'Dejinta Guud ee Nidaamka',
    schoolSettings: 'Dejinta Dugsiga',
    profile: 'Bogga Xogtayda',
    myProfile: 'Bogga Xogtayda',
    studyBuddy: 'Caawiyaha Waxbarashada AI',
    geminiAi: 'Kaaliyaha Gemini AI',
    analytics: 'Falanqaynta & Xogta',
    downloads: 'Xarunta Soo Dejinta',
    downloadCenter: 'Xarunta Soo Dejinta',
    logout: 'Ka Bax Nidaamka',
    signOut: 'Ka Bax',
    language: 'Luqadda',
    english: 'Ingiriis (EN)',
    somali: 'Soomaali (SO)',
    switchLanguage: 'Beddel Luqadda',

    totalAmount: 'WADARTA GUUD',
    totalAmountDesc: 'Wadarta kharashaadka laga rabo dhammaan ardayda',
    totalPaid: 'WADARTA LA BIXIYAY',
    totalPaidDesc: 'Wadarta dhabta ah ee la bixiyay',
    remaining: 'HARAAGA',
    remainingDesc: 'Wadarta haraaga aan weli la bixin',
    collectionRate: 'Heerka Ururinta',
    settlementEfficiency: 'Waxtarka Lacag-bixinta',

    classList: 'Dulmar Dhaqaale ee Fasallada',
    selectClass: 'Dooro Fasalka',
    backToClasses: 'Ku Noqo Fasallada',
    allClasses: 'Dhammaan Fasallada',
    classFinancialOverview: 'Dulmar Dhaqaale Fasalka-Fasal ahaan',
    studentsCount: 'Ardayda',
    totalBilled: 'Wadarta La Dalacay',
    remainingAmount: 'Haraaga',
    class: 'Fasalka',
    section: 'Qaybta',

    studentName: 'Magaca Ardayga',
    studentId: 'Aqoonsiga Ardayga',
    parentGuardian: 'Waalidka / Masuulka',
    parentPhone: 'Taleefanka Waalidka',
    phoneNumber: 'Lambarka Taleefanka',
    totalFee: 'Kharashka Guud',
    amountPaid: 'Qadarka La Bixiyay',
    remainingBalance: 'Haraaga Haray',
    paymentStatus: 'Xaaladda Lacag-bixinta',
    paymentAction: 'Ficilka Lacag-bixinta',

    paid: 'LA BIXIYAY',
    unpaid: 'AAN LA BIXIN',
    partiallyPaid: 'QAYB LA BIXIYAY',
    active: 'Shaqeynaya',
    inactive: 'Aan Shaqeyn',
    disabled: 'La Joojiyay',
    graduated: 'Qalin-jabiyay',
    suspended: 'Hakad la Geliyay',
    all: 'Dhammaan',
    filterByStatus: 'Kala Shaandhee Xaaladda',

    step: 'Tallaabada',
    step1Title: 'Xogta Shakhsiga',
    step1TeacherDesc: 'Aqoonsiga & Xogta Macallinka',
    step1StudentDesc: 'Aqoonsiga Ardayga & Fasalka',
    step2Title: 'Xiriirka & Deganaanshaha',
    step2TeacherDesc: 'Taleefan, Iimayl & Cinwaan',
    step2StudentDesc: 'Cinwaanka & Caafimaadka',
    step3Title: 'Qoondada Waxbarashada',
    step3TeacherDesc: 'Maadooyinka & Fasallada',
    step3StudentDesc: 'Faahfaahinta Waalidka / Masuulka',
    step4Title: 'Dib-u-eegis & Xaqiijin',
    step4Desc: 'Xaqiijinta Ugu Dambaysa ee Diiwaangelinta',
    continue: 'Sii wad',
    back: 'Dib u noqo',
    submitAndConfirm: 'Xaqiiji oo Diiwaangeli',
    submitAndRecruit: 'Diiwaangeli Macallinka',
    submitAndEnroll: 'Diiwaangeli Ardayga',
    edit: 'Wax ka beddel',
    reviewSummary: 'Dulmarka Dib-u-eegista',

    search: 'Raadi',
    searchPlaceholder: 'Ka raadi magac, aqoonsi ama qoraal...',
    filter: 'Kala Shaandhee',
    addNewTeacher: 'Ku dar Macallin Cusub',
    addNewStudent: 'Ku dar Arday Cusub',
    bulkImportCsv: 'Kusoo Geli CSV Fasal/Macallin',
    exportCsv: 'Soo Deji CSV',
    exportPdf: 'Soo Deji PDF',
    markAsPaid: 'Ka Dhig La Bixiyay',
    markAsUnpaid: 'Ka Dhig Aan La Bixin',
    recordPayment: 'Diiwaangeli Lacag',
    updateStatus: 'Cusboonaysii Lacag-bixinta',
    viewReceipt: 'Eeg Rasiidka',
    printReceipt: 'Daabac Rasiidka',
    downloadReceipt: 'Soo Deji PDF',
    quickAction: 'Ficil Degdeg ah',
    quickToggle: 'Beddel Xaaladda',
    confirm: 'Xaqiiji',
    cancel: 'Ka noqo',
    save: 'Keydi Isbeddellada',
    close: 'Xidh',
    delete: 'Tirtir',
    actions: 'Ficillada',

    paymentDetails: 'Faahfaahinta Lacag-bixinta',
    recordNewPayment: 'Diiwaangeli Lacag-bixinta Ardayga',
    paymentMethod: 'Habka Lacag-bixinta',
    cash: 'Lacag Cadaan ah (Kaash)',
    mobileMoney: 'Moobilka (EVC Plus / Zaad / Sahal)',
    bankTransfer: 'Xawaalad / Bangi',
    onlineGateway: 'Kaadhka Bangiga / Online',
    transactionRef: 'Tixraaca / Lambarka Rasiidka',
    notes: 'Faallo / Qoraal',
    fullPayment: 'Bixin Buuxda',
    customAmount: 'Qadar Gaar ah / Qayb',
    date: 'Taariikhda',
    receiptNumber: 'Lambarka Rasiidka',
    issuedTo: 'Loo Soo Saaray',
    receivedBy: 'Qabtay',
    officialReceipt: 'Rasiidka Rasmiga ah ee Kharashka Dugsiga',
    noStudentsFound: 'Lama helin arday u dhigma raadintaada.',
    noClassesFound: 'Lama helin fasallo diiwaangashan.',
    noTeachersFound: 'Lama helin macallimiin u dhigma raadintaada.',

    paymentSavedSuccess: 'Xaaladda lacag-bixinta si guul leh ayaa loo cusboonaysiiyay oo loo keydiyay!',
    paymentUnpaidSuccess: 'Kharashka ardayga waxaa laga dhigay mid Aan La Bixin.',
    paymentFailed: 'Diiwaangelinta lacag-bixintu way fashilantay. Fadlan isku day markale.',
    invalidAmount: 'Fadlan geli qadar sax ah oo lacag-bixin ah.',
    amountExceedsBalance: 'Qadarka la bixinayo wuxuu ka badan yahay haraaga ardayga.',
  },
};

export interface LanguageContextType {
  language: Language;
  currentLanguage: Language;
  isSomali: boolean;
  isEnglish: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  tr: (en: string, so: string) => string;
  tx: (text: string, params?: Record<string, string | number>) => string;
  translate: (text: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'school_management_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'so' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'so' : 'en';
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isSomali = language === 'so';
  const isEnglish = language === 'en';

  const tr = useCallback(
    (en: string, so: string) => {
      return language === 'so' ? so : en;
    },
    [language]
  );

  const tx = useCallback(
    (text: string, params?: Record<string, string | number>) => {
      return translateDynamic(text, language, params);
    },
    [language]
  );

  const translate = tx;

  const formatCurrency = useCallback(
    (amount: number) => {
      return `$${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    []
  );

  const formatNumber = useCallback((num: number) => {
    return Number(num || 0).toLocaleString();
  }, []);

  const value = useMemo(
    () => ({
      language,
      currentLanguage: language,
      isSomali,
      isEnglish,
      setLanguage,
      toggleLanguage,
      t: translations[language],
      tr,
      tx,
      translate,
      formatCurrency,
      formatNumber,
    }),
    [language, isSomali, isEnglish, setLanguage, toggleLanguage, tr, tx, translate, formatCurrency, formatNumber]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Convenience alias for developers
export const useTranslation = useLanguage;

/**
 * Reusable inline translation component
 */
export const Translate: React.FC<{
  text: string;
  params?: Record<string, string | number>;
  className?: string;
}> = ({ text, params, className }) => {
  const { tx } = useLanguage();
  return <span className={className}>{tx(text, params)}</span>;
};

/**
 * Reusable bilingual text selector component
 */
export const T: React.FC<{
  en: string;
  so: string;
  className?: string;
}> = ({ en, so, className }) => {
  const { tr } = useLanguage();
  return <span className={className}>{tr(en, so)}</span>;
};
