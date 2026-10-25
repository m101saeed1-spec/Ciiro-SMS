import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavModule } from '../common/Sidebar';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { PrincipalDashboard } from './PrincipalDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';
import { DashboardFAB } from './DashboardFAB';
import { DashboardAnalyticsVisualizer } from './DashboardAnalyticsVisualizer';

interface DashboardModuleProps {
  onNavigate: (module: NavModule) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const { activeRole } = useAuth();

  const renderDashboardContent = () => {
    // 3 Main School Roles + Platform SuperAdmin:
    if (activeRole === 'SuperAdmin') {
      return <SuperAdminDashboard onNavigate={onNavigate} />;
    }

    if (activeRole === 'Principal') {
      return <PrincipalDashboard onNavigate={onNavigate} />;
    }

    if (activeRole === 'Teacher') {
      return <TeacherDashboard onNavigate={onNavigate} />;
    }

    if (activeRole === 'Student') {
      return <StudentDashboard onNavigate={onNavigate} />;
    }

    // Fallback to Principal Dashboard for school administrative oversight
    return <PrincipalDashboard onNavigate={onNavigate} />;
  };

  return (
    <div className="relative space-y-6">
      {/* Primary Role-Specific Dashboard Workspace */}
      {renderDashboardContent()}

      {/* Comprehensive Recharts Data Visualizer: Attendance Trends & Academic Performance Metrics */}
      <DashboardAnalyticsVisualizer onNavigate={onNavigate} />

      {/* Floating Action Quick Access Button */}
      <DashboardFAB onNavigate={onNavigate} />
    </div>
  );
};
