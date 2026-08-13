import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USER_PROFILES } from '../data/initialData';

interface AuthContextType {
  currentUser: UserProfile;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  login: (email: string, role: UserRole) => boolean;
  loginWithSchoolId: (schoolId: string, password: string, userType: UserRole, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  activeChildId: string;
  setActiveChildId: (childId: string) => void;
  getAuthHeaders: () => Record<string, string>;
  userProfiles: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('eduspike_profiles');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILES;
  });

  const [activeRoleId, setActiveRoleId] = useState<string>(() => {
    return localStorage.getItem('eduspike_active_profile_id') || 'usr-admin-1';
  });

  const [activeChildId, setActiveChildId] = useState<string>(() => {
    return localStorage.getItem('eduspike_active_child_id') || 'STU-2026-0125';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('eduspike_profiles', JSON.stringify(userProfiles));
  }, [userProfiles]);

  useEffect(() => {
    localStorage.setItem('eduspike_active_profile_id', activeRoleId);
  }, [activeRoleId]);

  useEffect(() => {
    localStorage.setItem('eduspike_active_child_id', activeChildId);
  }, [activeChildId]);

  const currentUser = userProfiles.find((p) => p.id === activeRoleId) || userProfiles[0];
  const activeRole = currentUser.role;

  // Initialize activeChildId if parent switches or user logs in
  useEffect(() => {
    if (currentUser.role === 'Parent' && currentUser.linkedStudentIds && currentUser.linkedStudentIds.length > 0) {
      if (!currentUser.linkedStudentIds.includes(activeChildId)) {
        setActiveChildId(currentUser.linkedStudentIds[0]);
      }
    } else if (currentUser.role === 'Student' && (currentUser.studentId || currentUser.schoolId)) {
      setActiveChildId(currentUser.studentId || currentUser.schoolId);
    }
  }, [currentUser, activeChildId]);

  const switchRole = (role: UserRole) => {
    const target = userProfiles.find((p) => p.role === role);
    if (target) {
      setActiveRoleId(target.id);
      setIsAuthenticated(true);
      if (target.role === 'Parent' && target.linkedStudentIds?.length) {
        setActiveChildId(target.linkedStudentIds[0]);
      } else if (target.role === 'Student' && (target.studentId || target.schoolId)) {
        setActiveChildId(target.studentId || target.schoolId);
      }
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    return {
      'x-user-id': currentUser.id,
      'x-school-id': currentUser.schoolId || currentUser.studentId || currentUser.teacherId || '',
      'x-user-role': currentUser.role,
      'x-student-id': currentUser.studentId || activeChildId || '',
      'Content-Type': 'application/json',
    };
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUserProfiles((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, ...updated } : p))
    );
  };

  const login = (email: string, role: UserRole) => {
    const target = userProfiles.find((p) => p.role === role);
    if (target) {
      setActiveRoleId(target.id);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const loginWithSchoolId = async (
    schoolId: string,
    password: string,
    userType: UserRole,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, password, userType, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      const user: UserProfile = data.user;

      setUserProfiles((prev) => {
        const idx = prev.findIndex((p) => p.id === user.id);
        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = user;
          return copy;
        }
        return [...prev, user];
      });

      setActiveRoleId(user.id);
      setIsAuthenticated(true);

      if (user.role === 'Parent' && user.linkedStudentIds && user.linkedStudentIds.length > 0) {
        setActiveChildId(user.linkedStudentIds[0]);
      } else if (user.role === 'Student' && (user.studentId || user.schoolId)) {
        setActiveChildId(user.studentId || user.schoolId);
      }

      if (rememberMe) {
        localStorage.setItem('eduspike_token', data.token);
      }

      return { success: true };
    } catch {
      // Fallback client check if backend server is offline or loading
      const cleanId = schoolId.trim().toUpperCase();
      const match = userProfiles.find((p) =>
        p.role === userType &&
        (p.schoolId?.toUpperCase() === cleanId ||
          p.studentId?.toUpperCase() === cleanId ||
          p.teacherId?.toUpperCase() === cleanId)
      );

      if (!match) {
        return { success: false, error: `No ${userType} account found with ID "${cleanId}".` };
      }

      const validPass = match.password || 'password123';
      if (password !== validPass) {
        return { success: false, error: 'Incorrect password for this School ID.' };
      }

      setActiveRoleId(match.id);
      setIsAuthenticated(true);
      return { success: true };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        switchRole,
        updateProfile,
        login,
        loginWithSchoolId,
        logout,
        isAuthenticated,
        activeChildId,
        setActiveChildId,
        getAuthHeaders,
        userProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
