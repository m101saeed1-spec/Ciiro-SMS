import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USER_PROFILES } from '../data/initialData';

interface AuthContextType {
  currentUser: UserProfile;
  activeRole: UserRole;
  updateProfile: (updated: Partial<UserProfile>) => void;
  adminUpdateUserRole: (userId: string, newRole: UserRole, reason?: string) => Promise<{ success: boolean; error?: string }>;
  adminToggleUserStatus: (userId: string, status: 'Active' | 'Disabled', reason?: string) => Promise<{ success: boolean; error?: string }>;
  adminCreateUser: (userData: Partial<UserProfile> & { schoolId: string; name: string; email: string; role: UserRole }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, role: UserRole) => boolean;
  loginWithSchoolId: (schoolId: string, password: string, userType: UserRole, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  activeChildId: string;
  setActiveChildId: (childId: string) => void;
  getAuthHeaders: () => Record<string, string>;
  userProfiles: UserProfile[];
  refreshProfiles: () => Promise<void>;
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

  const refreshProfiles = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUserProfiles(data);
        }
      }
    } catch {
      // Ignored
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

  const updateProfile = async (updated: Partial<UserProfile>) => {
    // Exclude security-critical locked attributes from user modification
    const { role: _, id: __, status: ___, schoolId: ____, ...safeFields } = updated as any;
    
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(safeFields),
      });
    } catch {
      // Offline fallback
    }

    setUserProfiles((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, ...safeFields } : p))
    );
  };

  // Admin Role Management: Change target user's role (Admin Only)
  const adminUpdateUserRole = async (
    userId: string,
    newRole: UserRole,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== 'Admin') {
      return { success: false, error: 'Access Denied: Only School Administrators can assign or reassign roles.' };
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newRole, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update user role' };
      }

      setUserProfiles((prev) =>
        prev.map((p) =>
          p.id === userId
            ? {
                ...p,
                role: newRole,
                roleAssignedBy: `${currentUser.name} (${currentUser.id})`,
                roleAssignedAt: new Date().toISOString().slice(0, 10),
              }
            : p
        )
      );

      return { success: true };
    } catch {
      // Fallback local update
      setUserProfiles((prev) =>
        prev.map((p) =>
          p.id === userId
            ? {
                ...p,
                role: newRole,
                roleAssignedBy: `${currentUser.name} (${currentUser.id})`,
                roleAssignedAt: new Date().toISOString().slice(0, 10),
              }
            : p
        )
      );
      return { success: true };
    }
  };

  // Admin Account Status Toggle: Active / Disabled (Admin Only)
  const adminToggleUserStatus = async (
    userId: string,
    status: 'Active' | 'Disabled',
    reason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== 'Admin') {
      return { success: false, error: 'Access Denied: Only School Administrators can change user status.' };
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update user status' };
      }

      setUserProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, status } : p))
      );
      return { success: true };
    } catch {
      setUserProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, status } : p))
      );
      return { success: true };
    }
  };

  // Admin Provision New User with official role (Admin Only)
  const adminCreateUser = async (
    userData: Partial<UserProfile> & { schoolId: string; name: string; email: string; role: UserRole }
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== 'Admin') {
      return { success: false, error: 'Access Denied: Only School Administrators can provision accounts.' };
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to provision user' };
      }

      const createdUser: UserProfile = data.user;
      setUserProfiles((prev) => [...prev, createdUser]);
      return { success: true };
    } catch {
      const newUser: UserProfile = {
        id: `usr-${userData.role.toLowerCase()}-${Date.now().toString(36)}`,
        schoolId: userData.schoolId.toUpperCase(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        password: userData.password || 'password123',
        status: 'Active',
        roleAssignedBy: `${currentUser.name} (${currentUser.id})`,
        roleAssignedAt: new Date().toISOString().slice(0, 10),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        joinDate: new Date().toISOString().slice(0, 10),
        ...userData,
      };
      setUserProfiles((prev) => [...prev, newUser]);
      return { success: true };
    }
  };

  const login = (email: string, role: UserRole) => {
    const target = userProfiles.find((p) => p.role === role);
    if (target && target.status !== 'Disabled') {
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

      if (match.status === 'Disabled') {
        return { success: false, error: 'Account Suspended: This account has been disabled by the Administrator.' };
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
        updateProfile,
        adminUpdateUserRole,
        adminToggleUserStatus,
        adminCreateUser,
        login,
        loginWithSchoolId,
        logout,
        isAuthenticated,
        activeChildId,
        setActiveChildId,
        getAuthHeaders,
        userProfiles,
        refreshProfiles,
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
