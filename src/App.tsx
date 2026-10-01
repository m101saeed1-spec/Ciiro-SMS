import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolDataProvider } from './context/SchoolDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, NavModule } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { ConnectivityBanner } from './components/common/ConnectivityBanner';
import { AuthModal } from './components/auth/AuthModal';
import { SchoolPortalLogin } from './components/auth/SchoolPortalLogin';

import { DashboardModule } from './components/dashboard/DashboardModule';
import { SchoolsModule } from './components/schools/SchoolsModule';
import { StudentsModule } from './components/students/StudentsModule';
import { TeachersModule } from './components/teachers/TeachersModule';
import { LibraryModule } from './components/library/LibraryModule';
import { AccountModule } from './components/account/AccountModule';
import { ClassModule } from './components/classes/ClassModule';
import { SubjectModule } from './components/subjects/SubjectModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { ExamModule } from './components/exams/ExamModule';
import { NoticesModule } from './components/notices/NoticesModule';
import { FeeModule } from './components/fees/FeeModule';
import { TimetableModule } from './components/timetable/TimetableModule';
import { ChatModule } from './components/chat/ChatModule';
import { StudentProfileModule } from './components/student/StudentProfileModule';
import { ExamRankingModule } from './components/student/ExamRankingModule';
import { ReportFormModule } from './components/student/ReportFormModule';
import { SchoolReportsModule } from './components/reports/SchoolReportsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { DownloadCenterModule } from './components/student/DownloadCenterModule';
import { ActivityLogView } from './components/activity/ActivityLogView';
import { StudyBuddyModule } from './components/studybuddy/StudyBuddyModule';
import { GeminiChatModule } from './components/gemini/GeminiChatModule';
import { FloatingThemeToggle } from './components/common/FloatingThemeToggle';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeModule, setActiveModule] = useState<NavModule>('home');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // If user is not authenticated, display dedicated full-screen School Portal & Role Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans antialiased selection:bg-purple-500 selection:text-white">
        <ConnectivityBanner />
        <SchoolPortalLogin />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex antialiased transition-colors duration-200">
      {/* Network Connectivity Status Banner */}
      <ConnectivityBanner />

      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all">
        {/* Header Navigation */}
        <Header
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onNavigate={(mod) => setActiveModule(mod)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic Module Canvas */}
        <main className={`flex-1 w-full mx-auto ${activeModule === 'chat' ? 'p-3 sm:p-4 lg:p-6 max-w-7xl' : 'p-4 sm:p-6 lg:p-8 max-w-7xl'}`}>
          {activeModule === 'home' && <DashboardModule onNavigate={(mod) => setActiveModule(mod)} />}
          {activeModule === 'schools' && <SchoolsModule />}
          {activeModule === 'studybuddy' && <StudyBuddyModule />}
          {activeModule === 'profile' && <StudentProfileModule />}
          {activeModule === 'students' && <StudentsModule />}
          {activeModule === 'teachers' && <TeachersModule />}
          {activeModule === 'chat' && <ChatModule />}
          {(activeModule === 'fees' || activeModule.startsWith('fee-')) && <FeeModule />}
          {activeModule === 'timetable' && <TimetableModule />}
          {activeModule === 'library' && <LibraryModule />}
          {(activeModule === 'account' || activeModule === 'headteacher' || activeModule === 'headteachers') && <AccountModule />}
          {activeModule === 'settings' && <SettingsModule />}
          {activeModule === 'class' && <ClassModule />}
          {activeModule === 'subject' && <SubjectModule />}
          {activeModule === 'attendance' && <AttendanceModule />}
          {activeModule === 'exam' && <ExamModule />}
          {activeModule === 'ranking' && <ExamRankingModule />}
          {activeModule === 'report' && <SchoolReportsModule onNavigate={(mod) => setActiveModule(mod)} />}
          {activeModule === 'downloads' && <DownloadCenterModule />}
          {activeModule === 'notice' && <NoticesModule />}
          {activeModule === 'activities' && <ActivityLogView />}
          {activeModule === 'gemini' && <GeminiChatModule />}
        </main>
      </div>

      {/* Floating Theme Toggle Persisting User Preference */}
      <FloatingThemeToggle />

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Auth Modal for Switching Account / Logging into other roles */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SchoolDataProvider>
          <MainLayout />
        </SchoolDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

