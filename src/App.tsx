import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SchoolDataProvider } from './context/SchoolDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, NavModule } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { ConnectivityBanner } from './components/common/ConnectivityBanner';
import { AuthModal } from './components/auth/AuthModal';

import { DashboardModule } from './components/dashboard/DashboardModule';
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
import { DownloadCenterModule } from './components/student/DownloadCenterModule';
import { ActivityLogView } from './components/activity/ActivityLogView';

const MainLayout: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NavModule>('home');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
          {activeModule === 'profile' && <StudentProfileModule />}
          {activeModule === 'students' && <StudentsModule />}
          {activeModule === 'teachers' && <TeachersModule />}
          {activeModule === 'chat' && <ChatModule />}
          {activeModule === 'fees' && <FeeModule />}
          {activeModule === 'timetable' && <TimetableModule />}
          {activeModule === 'library' && <LibraryModule />}
          {activeModule === 'account' && <AccountModule />}
          {activeModule === 'class' && <ClassModule />}
          {activeModule === 'subject' && <SubjectModule />}
          {activeModule === 'attendance' && <AttendanceModule />}
          {activeModule === 'exam' && <ExamModule />}
          {activeModule === 'ranking' && <ExamRankingModule />}
          {activeModule === 'report' && <ReportFormModule />}
          {activeModule === 'downloads' && <DownloadCenterModule />}
          {activeModule === 'notice' && <NoticesModule />}
          {activeModule === 'activities' && <ActivityLogView />}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Auth Modal */}
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

