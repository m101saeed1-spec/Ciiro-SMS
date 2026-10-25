import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolDataProvider } from './context/SchoolDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Sidebar, NavModule } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { ConnectivityBanner } from './components/common/ConnectivityBanner';
import { AuthModal } from './components/auth/AuthModal';

// Public Website Components
import { PublicLayout } from './components/public/PublicLayout';
import { PublicNavRoute } from './components/public/PublicNavbar';
import { WelcomeEntryFlow } from './components/auth/WelcomeEntryFlow';

// Workspace Module Components
import { DashboardModule } from './components/dashboard/DashboardModule';
import { SchoolsModule } from './components/schools/SchoolsModule';
import { StudentsModule } from './components/students/StudentsModule';
import { TeachersModule } from './components/teachers/TeachersModule';
import { LibraryModule } from './components/library/LibraryModule';
import { PlatformAnalyticsModule } from './components/platform/PlatformAnalyticsModule';
import { PlatformReportsModule } from './components/platform/PlatformReportsModule';
import { ClassModule } from './components/classes/ClassModule';
import { SubjectModule } from './components/subjects/SubjectModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { ExamModule } from './components/exams/ExamModule';
import { NoticesModule } from './components/notices/NoticesModule';
import { FeeModule } from './components/fees/FeeModule';
import { TimetableModule } from './components/timetable/TimetableModule';
import { StudentProfileModule } from './components/student/StudentProfileModule';
import { ExamRankingModule } from './components/student/ExamRankingModule';
import { ReportFormModule } from './components/student/ReportFormModule';
import { SchoolReportsModule } from './components/reports/SchoolReportsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { DownloadCenterModule } from './components/student/DownloadCenterModule';
import { ActivityLogView } from './components/activity/ActivityLogView';
import { StudyBuddyModule } from './components/studybuddy/StudyBuddyModule';
import { AssessmentsModule } from './components/assessments/AssessmentsModule';


interface MainLayoutProps {
  onViewPublicWebsite: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onViewPublicWebsite }) => {
  const { activeRole } = useAuth();
  const [activeModule, setActiveModule] = useState<NavModule>('home');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B1B32] text-[#12233F] dark:text-slate-100 font-sans flex antialiased transition-colors duration-200">
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
        {/* Header Navigation with Public Website and Logout actions */}
        <Header
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onNavigate={(mod) => setActiveModule(mod)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onViewPublicWebsite={onViewPublicWebsite}
        />

        <main
          className="p-4 sm:p-6 lg:p-8 max-w-7xl"
        >
          {activeModule === 'home' && <DashboardModule onNavigate={(mod) => setActiveModule(mod)} />}
          {activeModule === 'schools' && <SchoolsModule />}
          {activeModule === 'studybuddy' && <StudyBuddyModule />}
          {activeModule === 'profile' && <StudentProfileModule />}
          {activeModule === 'students' && <StudentsModule />}
          {activeModule === 'teachers' && <TeachersModule />}
          {(activeModule === 'fees' || activeModule.startsWith('fee-')) && <FeeModule />}
          {activeModule === 'timetable' && <TimetableModule />}
          {activeModule === 'library' && <LibraryModule />}
          {(activeModule === 'account' || activeModule === 'settings') && <SettingsModule />}
          {activeModule === 'class' && <ClassModule />}
          {activeModule === 'subject' && <SubjectModule />}
          {activeModule === 'attendance' && <AttendanceModule />}
          {activeModule === 'exam' && <ExamModule />}
          {activeModule === 'assessments' && <AssessmentsModule />}
          {activeModule === 'ranking' && (activeRole === 'SuperAdmin' ? <PlatformAnalyticsModule /> : <ExamRankingModule />)}
          {activeModule === 'report' && (activeRole === 'SuperAdmin' ? <PlatformReportsModule /> : <SchoolReportsModule onNavigate={(mod) => setActiveModule(mod)} />)}
          {activeModule === 'downloads' && <DownloadCenterModule />}
          {activeModule === 'notice' && <NoticesModule />}
          {activeModule === 'activities' && <ActivityLogView />}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Auth Modal for Switching Account / Logging into other roles */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, hasEnteredWorkspace, logout } = useAuth();
  const [currentPublicRoute, setCurrentPublicRoute] = useState<PublicNavRoute>('home');

  // Application view modes: 'public' | 'welcome-entry' | 'workspace'
  const [appMode, setAppMode] = useState<'public' | 'welcome-entry' | 'workspace'>(() => {
    const isAuth = localStorage.getItem('ileys_authenticated') === 'true';
    const isEntered = localStorage.getItem('ileys_workspace_entered') === 'true';
    if (isAuth && isEntered) return 'workspace';
    if (isAuth) return 'welcome-entry';
    return 'public';
  });

  const handleNavigatePublic = (route: PublicNavRoute) => {
    setCurrentPublicRoute(route);
    setAppMode('public');
  };

  const handleAuthSuccess = (isPlatformOwner: boolean) => {
    if (isPlatformOwner) {
      setAppMode('workspace');
    } else {
      setAppMode('welcome-entry');
    }
  };

  const handleWorkspaceSuccess = () => {
    setAppMode('workspace');
  };

  const handleLogout = () => {
    logout();
    setAppMode('public');
    setCurrentPublicRoute('home');
  };

  return (
    <>
      {/* 1. PUBLIC MARKETING WEBSITE */}
      {appMode === 'public' && (
        <PublicLayout
          currentRoute={currentPublicRoute}
          onNavigate={(route) => {
            if (route === 'signin' && isAuthenticated) {
              // If already authenticated, redirect to workspace or welcome entry
              if (hasEnteredWorkspace) {
                setAppMode('workspace');
              } else {
                setAppMode('welcome-entry');
              }
            } else {
              handleNavigatePublic(route);
            }
          }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* 2. AUTHENTICATED WELCOME & SCHOOL / ROLE / 4-DIGIT ID VERIFICATION */}
      {appMode === 'welcome-entry' && (
        <WelcomeEntryFlow
          onSuccessEnter={handleWorkspaceSuccess}
          onLogout={handleLogout}
        />
      )}

      {/* 3. AUTHENTICATED SCHOOL MANAGEMENT WORKSPACE & DASHBOARDS */}
      {appMode === 'workspace' && (
        <MainLayout
          onViewPublicWebsite={() => {
            setAppMode('public');
            setCurrentPublicRoute('home');
          }}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <SchoolDataProvider>
            <AppContent />
          </SchoolDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
