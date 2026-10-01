import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavModule } from '../common/Sidebar';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { OwnerAdminDashboard } from './OwnerAdminDashboard';
import { PrincipalDashboard } from './PrincipalDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';
import { AccountantDashboard } from './AccountantDashboard';
import { DashboardFAB } from './DashboardFAB';
import { DashboardAnalyticsVisualizer } from './DashboardAnalyticsVisualizer';

interface DashboardModuleProps {
  onNavigate: (module: NavModule) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const { activeRole } = useAuth();

  const renderDashboardContent = () => {
    // 6 Canonical Roles:
    // 1. Owner Platform (SuperAdmin)
    if (activeRole === 'SuperAdmin') {
      return <SuperAdminDashboard onNavigate={onNavigate} />;
    }

    // 2. School Owner (OwnerAdmin / Admin)
    if (activeRole === 'OwnerAdmin' || activeRole === 'Admin') {
      return <OwnerAdminDashboard onNavigate={onNavigate} />;
    }

    // 3. Headteacher / Principal
    if (activeRole === 'Principal') {
      return <PrincipalDashboard onNavigate={onNavigate} />;
    }

    // 4. Teacher
    if (activeRole === 'Teacher') {
      return <TeacherDashboard onNavigate={onNavigate} />;
    }

    // 5. Student
    if (activeRole === 'Student') {
      return <StudentDashboard onNavigate={onNavigate} />;
    }

    // 6. Accountant
    if (activeRole === 'AccountAdmin') {
      return <AccountantDashboard onNavigate={onNavigate} />;
    }

    // Fallback to OwnerAdminDashboard if unrecognized
    return <OwnerAdminDashboard onNavigate={onNavigate} />;
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


