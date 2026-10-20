/**
 * Comprehensive Somali Translation Dictionary & Dynamic Language Matchers
 * Covers all domains: Academic, Administrative, Financial, Attendance,
 * Examinations, User Roles, Permissions, UI Controls, Forms, and Toasts.
 */

export const SOMALI_DICTIONARY: Record<string, string> = {
  // Navigation & Core Modules
  'dashboard': 'Deshkoodhka',
  'home': 'Hoyga',
  'schools': 'Dugsiyada',
  'school overview': 'Dulmarka Dugsiga',
  'students': 'Ardayda',
  'my students': 'Ardaydayda',
  'student directory': 'Diiwaanka Ardayda',
  'teachers': 'Macallimiinta',
  'my teachers': 'Macallimiintayda',
  'faculty & teachers': 'Kulliyadda & Macallimiinta',
  'faculty directory': 'Liiska Macallimiinta',
  'headteachers': 'Maamulayaasha',
  'headteacher management': 'Maamulka Maamulaha',
  'platform users': 'Isticmaalayaasha Nidaamka',
  'classes': 'Fasallada',
  'my classes': 'Fasalladayda',
  'my class': 'Fasalkayga',
  'class fee overview': 'Dulmar Dhaqaale ee Fasallada',
  'class list': 'Liiska Fasallada',
  'subjects': 'Maadooyinka',
  'my subjects': 'Maadooyinkayga',
  'attendance': 'Xaadiriska & Joogitaanka',
  'my attendance': 'Joogitaankayga',
  'attendance roll call': 'Xaadirinta Ardayda',
  'take attendance': 'Xaadirinta Fasalka',
  'exams': 'Imtixaanaadka',
  'exams & results': 'Imtixaanaadka & Natiijooyinka',
  'my results': 'Natiijooyinkayga',
  'my results & transcripts': 'Natiijooyinkayga & Shahaadooyinka',
  'timetable': 'Jadwalka Xiisadaha',
  'my timetable': 'Jadwalkayga Xiisadaha',
  'schedule & timetable': 'Jadwalka & Xiisadaha',
  'announcements': 'Ogeysiisyada',
  'notices': 'Ogeysiisyada & Wararka',
  'fees': 'Kharashaadka',
  'financial overview': 'Dulmarka Dhaqaalaha',
  'my invoices & receipts': 'Qaansheegyadayda & Rasiidhada',
  'accounts / fees': 'Xisaabaadka & Kharashaadka',
  'reports': 'Warbixinnada',
  'school performance reports': 'Warbixinta Waxqabadka Dugsiga',
  'financial reports': 'Warbixinnada Dhaqaalaha',
  'library': 'Maktabadda',
  'library & media': 'Maktabadda & Agabka',
  'activity & audit trail': 'Diiwaanka Dhaqdhaqaaqa & Amniga',
  'activity audit logs': 'Diiwaanka Dhaqdhaqaaqa & Amniga',
  'activity logs': 'Diiwaanka Dhaqdhaqaaqa',
  'settings': 'Dejinta',
  'platform settings': 'Dejinta Guud ee Nidaamka',
  'school settings': 'Dejinta Dugsiga',
  'profile': 'Bogga Xogtayda',
  'my profile': 'Bogga Xogtayda',
  'study buddy': 'Caawiyaha Waxbarashada',
  'study buddy ai': 'Caawiyaha Waxbarashada AI',
  'gemini ai': 'Kaaliyaha Gemini AI',
  'gemini ai assistant': 'Kaaliyaha Gemini AI',
  'analytics': 'Falanqaynta & Xogta',
  'downloads': 'Soo Dejinta',
  'download center': 'Xarunta Soo Dejinta',
  'logout': 'Ka Bax Nidaamka',
  'sign out': 'Ka Bax',
  'sign in': 'Soo Gal',
  'switch account': 'Beddel Koontada',
  'language': 'Luqadda',
  'english': 'Ingiriis (EN)',
  'somali': 'Soomaali (SO)',
  'switch language': 'Beddel Luqadda',

  // Roles & Designations
  'superadmin': 'Maamulaha Sare ee Nidaamka',
  'platform super administrator': 'Maamulaha Sare ee Nidaamka',
  'platform owner': 'Mulkiilaha Nidaamka',
  'owneradmin': 'Mulkiilaha Dugsiga',
  'school owner': 'Mulkiilaha Dugsiga',
  'principal': 'Maamulaha Dugsiga',
  'headteacher': 'Maamulaha Dugsiga',
  'headteacher (principal)': 'Maamulaha Dugsiga',
  'teacher': 'Macallin',
  'faculty': 'Macallin',
  'class teacher': 'Macallinka Fasalka',
  'student': 'Arday',
  'accountadmin': 'Xisaabiye',
  'accountant': 'Xisaabiye',
  'admin': 'Maamule',
  'administrator': 'Maamule',
  'role': 'Doorka',
  'assigned role': 'Doorka Loo Qoondeeyay',

  // Financial & Accountant Dashboard Cards
  'total amount': 'WADARTA GUUD',
  'total amount billed': 'Wadarta Kharashaadka La Dalacay',
  'total fees billed to all students': 'Wadarta kharashaadka laga rabo dhammaan ardayda',
  'total paid': 'WADARTA LA BIXIYAY',
  'total amount actually paid': 'Wadarta dhabta ah ee la bixiyay',
  'remaining': 'HARAAGA',
  'remaining balance': 'Haraaga Haray',
  'total outstanding balance': 'Wadarta haraaga aan weli la bixin',
  'collection rate': 'Heerka Ururinta',
  'settlement efficiency': 'Waxtarka Lacag-bixinta',
  'total billed': 'Wadarta La Dalacay',
  'remaining amount': 'Qadarka Haray',
  'amount paid': 'Qadarka La Bixiyay',
  'total fee': 'Kharashka Guud',
  'payment status': 'Xaaladda Lacag-bixinta',
  'payment action': 'Ficilka Lacag-bixinta',
  'payment details': 'Faahfaahinta Lacag-bixinta',
  'record payment': 'Diiwaangeli Lacag',
  'record new payment': 'Diiwaangeli Lacag-bixinta Ardayga',
  'record student payment': 'Diiwaangeli Lacag-bixinta Ardayga',
  'payment method': 'Habka Lacag-bixinta',
  'cash': 'Lacag Cadaan ah (Kaash)',
  'mobile money': 'Moobilka (EVC Plus / Zaad / Sahal)',
  'mobile money (evc / zaad / sahal)': 'Moobilka (EVC Plus / Zaad / Sahal)',
  'bank transfer': 'Xawaalad / Bangi',
  'card / online gateway': 'Kaadhka Bangiga / Online',
  'online gateway': 'Kaadhka Bangiga / Online',
  'transaction ref': 'Tixraaca / Lambarka Rasiidka',
  'reference / receipt no.': 'Tixraaca / Lambarka Rasiidka',
  'notes / remarks': 'Faallo / Qoraal',
  'notes': 'Qoraallo',
  'full settlement': 'Bixin Buuxda',
  'full payment': 'Bixin Buuxda',
  'partial / custom amount': 'Qadar Gaar ah / Qayb',
  'custom amount': 'Qadar Gaar ah',
  'receipt no.': 'Lambarka Rasiidka',
  'receipt number': 'Lambarka Rasiidka',
  'issued to': 'Loo Soo Saaray',
  'received by': 'Qabtay',
  'official school fee receipt': 'Rasiidka Rasmiga ah ee Kharashka Dugsiga',
  'official receipt': 'Rasiidka Rasmiga ah',
  'view receipt': 'Eeg Rasiidka',
  'print receipt': 'Daabac Rasiidka',
  'download pdf': 'Soo Deji PDF',
  'download receipt': 'Soo Deji Rasiidka',
  'mark paid': 'Ka Dhig La Bixiyay',
  'mark unpaid': 'Ka Dhig Aan La Bixin',
  'mark as paid': 'Ka Dhig La Bixiyay',
  'mark as unpaid': 'Ka Dhig Aan La Bixin',
  'toggle status': 'Beddel Xaaladda',
  'quick toggle': 'Beddel Degdeg ah',
  'quick action': 'Ficil Degdeg ah',
  'update payment': 'Cusboonaysii Lacag-bixinta',
  'update status': 'Cusboonaysii Xaaladda',

  // Status Labels
  'paid': 'LA BIXIYAY',
  'unpaid': 'AAN LA BIXIN',
  'partial': 'QAYB LA BIXIYAY',
  'partially paid': 'Qayb la bixiyay',
  'overdue': 'Waqtigu Dhaafay',
  'pending': 'Hannaanka ku jira',
  'active': 'Shaqeynaya',
  'inactive': 'Aan Shaqeyn',
  'disabled': 'La Joojiyay',
  'graduated': 'Qalin-jabiyay',
  'suspended': 'Hakad la Geliyay',
  'archived': 'La Kaydiyay',
  'all': 'Dhammaan',
  'all classes': 'Dhammaan Fasallada',
  'all status': 'Dhammaan Xaaladaha',
  'filter status': 'Kala Shaandhee Xaaladda',
  'filter by status': 'Kala Shaandhee Xaaladda',
  'present': 'Joogay',
  'absent': 'Maqnaa',
  'late': 'Daahay',
  'excused': 'Cudurdaar',
  'passed': 'Gudbay',
  'failed': 'Dhacay',
  'excellent': 'Aad u Wanaagsan',
  'good': 'Wanaagsan',
  'average': 'Dhexdhexaad',

  // Table & Form Field Headers
  'student name': 'Magaca Ardayga',
  'student id': 'Aqoonsiga Ardayga',
  'school id': 'Aqoonsiga Dugsiga',
  'roll no': 'Lambarka Roll-ka',
  'roll no.': 'Lambarka Roll-ka',
  'roll number': 'Lambarka Roll-ka',
  'class': 'Fasalka',
  'target class': 'Fasalka La Beegsanayo',
  'section': 'Qaybta',
  'gender': 'Lab / Dheddig',
  'male': 'Lab',
  'female': 'Dheddig',
  'other': 'Kale',
  'date of birth': 'Taariikhda Dhalashada',
  'dob': 'Dhalashada',
  'joining date': 'Taariikhda Ku Biirista',
  'employment date': 'Taariikhda Shaqaalaynta',
  'blood group': 'Nooca Dhiigga',
  'avatar': 'Sawirka Profile-ka',
  'photo': 'Sawirka',
  'email': 'Iimaylka',
  'email address': 'Cinwaanka Iimaylka',
  'phone': 'Taleefanka',
  'phone number': 'Lambarka Taleefanka',
  'parent / guardian': 'Waalidka / Masuulka',
  'parent name': 'Magaca Waalidka',
  'parent phone': 'Taleefanka Waalidka',
  'parent email': 'Iimaylka Waalidka',
  'parent relation': 'Xiriirka Waalidka',
  'father': 'Aabbe',
  'mother': 'Hooyo',
  'guardian': 'Masuul',
  'relationship': 'Xiriirka',
  'occupation': 'Shaqada',
  'parent occupation': 'Shaqada Waalidka',
  'address': 'Cinwaanka',
  'residential address': 'Cinwaanka Hoyga',
  'city': 'Magaalada',
  'city / district': 'Magaalada / Degmada',
  'medical notes': 'Xogta Caafimaadka',
  'emergency contact': 'Qofka Xaaladaha Degdegga ah',
  'emergency contact name': 'Magaca Qofka Degdegga ah',
  'emergency contact phone': 'Taleefanka Degdegga ah',
  'qualification': 'Shahaadada / Aqoonsiga',
  'academic qualification': 'Shahaadada Waxbarashada',
  'employment type': 'Nooca Shaqaalaynta',
  'full-time': 'Waqti Buuxa',
  'part-time': 'Waqti Dhiman',
  'contract': 'Qandaraas',
  'subjects assigned': 'Maadooyinka Loo Qoondeeyay',
  'classes assigned': 'Fasallada Loo Qoondeeyay',
  'assigned classes': 'Fasallada Loo Qoondeeyay',
  'teacher name': 'Magaca Macallinka',
  'teacher id': 'Aqoonsiga Macallinka',

  // Registration Wizard
  'step': 'Tallaabada',
  'step 1': 'Tallaabada 1',
  'step 2': 'Tallaabada 2',
  'step 3': 'Tallaabada 3',
  'step 4': 'Tallaabada 4',
  'personal info': 'Xogta Shakhsiga',
  'personal information': 'Xogta Shakhsiga',
  'faculty identification & profile': 'Aqoonsiga & Xogta Macallinka',
  'student identity & class placement': 'Aqoonsiga Ardayga & Fasalka',
  'contact & quarters': 'Xiriirka & Deganaanshaha',
  'contact & residential info': 'Xiriirka & Cinwaanka Hoyga',
  'phone, email & address': 'Taleefan, Iimayl & Cinwaan',
  'residence & health information': 'Cinwaanka & Caafimaadka',
  'academic allocation': 'Qoondada Waxbarashada',
  'subjects & assigned classes': 'Maadooyinka & Fasallada Loo Qoondeeyay',
  'parent & guardian details': 'Faahfaahinta Waalidka / Masuulka',
  'review & confirm': 'Dib-u-eegis & Xaqiijin',
  'review & verification': 'Dib-u-eegis & Xaqiijin',
  'final verification summary': 'Xaqiijinta Ugu Dambaysa ee Diiwaangelinta',
  'continue': 'Sii wad',
  'back': 'Dib u noqo',
  'submit & confirm': 'Xaqiiji oo Diiwaangeli',
  'submit & recruit teacher': 'Diiwaangeli Macallinka',
  'submit & enroll student': 'Diiwaangeli Ardayga',
  'edit': 'Wax ka beddel',
  'review summary': 'Dulmarka Dib-u-eegista',

  // Actions & Buttons
  'search': 'Raadi',
  'search placeholder': 'Ka raadi magac, aqoonsi ama qoraal...',
  'filter': 'Kala Shaandhee',
  'add new teacher': 'Ku dar Macallin Cusub',
  'add new student': 'Ku dar Arday Cusub',
  'add teacher': 'Ku dar Macallin',
  'add student': 'Ku dar Arday',
  'add class': 'Ku dar Fasal',
  'add subject': 'Ku dar Maaddo',
  'add notice': 'Ku dar Ogeysiis',
  'bulk import csv': 'Kusoo Geli CSV Fasal/Macallin',
  'export csv': 'Soo Deji CSV',
  'export pdf': 'Soo Deji PDF',
  'confirm': 'Xaqiiji',
  'cancel': 'Ka noqo',
  'save': 'Keydi',
  'save changes': 'Keydi Isbeddellada',
  'close': 'Xidh',
  'delete': 'Tirtir',
  'actions': 'Ficillada',
  'view': 'Eeg',
  'details': 'Faahfaahin',
  'refresh': 'Cusboonaysii',
  'print': 'Daabac',
  'download': 'Soo Deji',
  'create school': 'Abuur Dugsi Cusub',
  'register school': 'Diiwaangeli Dugsi',
  'register headteacher': 'Diiwaangeli Maamulaha Dugsiga',

  // Messages & Toasts
  'payment saved successfully!': 'Xaaladda lacag-bixinta si guul leh ayaa loo cusboonaysiiyay oo loo keydiyay!',
  'payment status updated and saved successfully!': 'Xaaladda lacag-bixinta si guul leh ayaa loo cusboonaysiiyay oo loo keydiyay!',
  'student fee status marked as unpaid.': 'Kharashka ardayga waxaa laga dhigay mid Aan La Bixin.',
  'payment processing failed. please try again.': 'Diiwaangelinta lacag-bixintu way fashilantay. Fadlan isku day markale.',
  'please enter a valid payment amount.': 'Fadlan geli qadar sax ah oo lacag-bixin ah.',
  'payment amount exceeds the student remaining balance.': 'Qadarka la bixinayo wuxuu ka badan yahay haraaga ardayga.',
  'no students found matching your search.': 'Lama helin arday u dhigma raadintaada.',
  'no classes found.': 'Lama helin fasallo diiwaangashan.',
  'no faculty members found matching your search.': 'Lama helin macallimiin u dhigma raadintaada.',
  'welcome back': 'Kusoo dhawoow markale',
};

/**
 * Normalizes text for fuzzy dictionary lookups
 */
export function normalizeKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Intelligent dynamic translation function that translates arbitrary English strings
 * into Somali using dictionary lookup, fuzzy matching, and dynamic regex patterns.
 */
export function translateDynamic(
  text: string,
  targetLang: 'en' | 'so',
  params?: Record<string, string | number>
): string {
  if (!text || typeof text !== 'string') return text || '';
  if (targetLang === 'en') {
    if (!params) return text;
    let res = text;
    Object.entries(params).forEach(([k, v]) => {
      res = res.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
    return res;
  }

  const clean = normalizeKey(text);

  // 1. Direct dictionary lookup
  if (SOMALI_DICTIONARY[clean]) {
    let translated = SOMALI_DICTIONARY[clean];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        translated = translated.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return translated;
  }

  // 2. Dynamic Pattern Matchers (e.g. "Class 01", "15 Students", "Step 1 of 4")
  let translatedText = text;

  // Pattern: "Class X" or "Class 0X"
  if (/^class\s+([0-9a-zA-Z_-]+)$/i.test(text.trim())) {
    const match = text.trim().match(/^class\s+([0-9a-zA-Z_-]+)$/i);
    if (match) return `Fasalka ${match[1]}`;
  }

  // Pattern: "X Students"
  if (/^(\d+)\s+students$/i.test(text.trim())) {
    const match = text.trim().match(/^(\d+)\s+students$/i);
    if (match) return `${match[1]} Arday`;
  }

  // Pattern: "X Teachers" or "X Faculty"
  if (/^(\d+)\s+(teachers|faculty)$/i.test(text.trim())) {
    const match = text.trim().match(/^(\d+)\s+(teachers|faculty)$/i);
    if (match) return `${match[1]} Macallin`;
  }

  // Pattern: "X Classes"
  if (/^(\d+)\s+classes$/i.test(text.trim())) {
    const match = text.trim().match(/^(\d+)\s+classes$/i);
    if (match) return `${match[1]} Fasal`;
  }

  // Pattern: "Step X of Y"
  if (/^step\s+(\d+)\s+of\s+(\d+)$/i.test(text.trim())) {
    const match = text.trim().match(/^step\s+(\d+)\s+of\s+(\d+)$/i);
    if (match) return `Tallaabada ${match[1]} ee ${match[2]}`;
  }

  // Pattern: "Page X of Y"
  if (/^page\s+(\d+)\s+of\s+(\d+)$/i.test(text.trim())) {
    const match = text.trim().match(/^page\s+(\d+)\s+of\s+(\d+)$/i);
    if (match) return `Bogga ${match[1]} ee ${match[2]}`;
  }

  // Pattern: "Showing X to Y of Z"
  if (/^showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i.test(text.trim())) {
    const match = text.trim().match(/^showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i);
    if (match) return `Muujinaya ${match[1]} ilaa ${match[2]} ee ${match[3]}`;
  }

  // Pattern: "Welcome back, {Name}"
  if (/^welcome back,?\s+(.+)$/i.test(text.trim())) {
    const match = text.trim().match(/^welcome back,?\s+(.+)$/i);
    if (match) return `Kusoo dhawoow, ${match[1]}`;
  }

  // Pattern: "Total: $X"
  if (/^total:\s*(\$?[0-9,.]+)/i.test(text.trim())) {
    const match = text.trim().match(/^total:\s*(\$?[0-9,.]+)/i);
    if (match) return `Wadarta: ${match[1]}`;
  }

  // 3. Fallback: Interpolate params if present, else return original
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      translatedText = translatedText.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
  }

  return translatedText;
}
