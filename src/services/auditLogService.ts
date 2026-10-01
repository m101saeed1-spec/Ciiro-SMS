import { ActivityLog, ActivityLogSeverity, ActivityLogModule, UserRole } from '../types';

export interface AuditLogParams {
  action: string;
  details?: string;
  description?: string;
  resource?: string;
  module?: ActivityLogModule | string;
  type?: ActivityLog['type'];
  severity?: ActivityLogSeverity;
  schoolId?: string;
  schoolName?: string;
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  userSchoolId?: string;
}

class AuditLogService {
  private static instance: AuditLogService;
  private localLogs: ActivityLog[] = [];

  private constructor() {
    try {
      const saved = localStorage.getItem('eduspike_audit_logs');
      if (saved) {
        this.localLogs = JSON.parse(saved);
      }
    } catch {
      this.localLogs = [];
    }
  }

  public static getInstance(): AuditLogService {
    if (!AuditLogService.instance) {
      AuditLogService.instance = new AuditLogService();
    }
    return AuditLogService.instance;
  }

  public async log(params: AuditLogParams): Promise<ActivityLog> {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toISOString().slice(0, 10);
    const timestampStr = `${dateFormatted} ${timeFormatted}`;

    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user: params.userName || 'System',
      userName: params.userName || 'System',
      userId: params.userId || 'usr-system',
      userSchoolId: params.userSchoolId,
      userRole: params.userRole || 'Admin',
      schoolId: params.schoolId || 'school-1',
      schoolName: params.schoolName || 'EduSpike Academy',
      resource: params.resource || 'System',
      action: params.action,
      details: params.details || params.description,
      description: params.description || params.details,
      module: params.module || 'System',
      type: params.type || 'security',
      severity: params.severity || 'info',
      ipAddress: '192.168.1.10',
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Client',
      timestamp: timestampStr,
    };

    // Save locally
    this.localLogs.unshift(newLog);
    if (this.localLogs.length > 500) {
      this.localLogs = this.localLogs.slice(0, 500);
    }
    try {
      localStorage.setItem('eduspike_audit_logs', JSON.stringify(this.localLogs.slice(0, 200)));
    } catch {
      // Ignore quota error
    }

    // Dispatch to server asynchronously
    try {
      fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': params.userId || 'usr-admin-1',
          'x-school-id': params.schoolId || 'school-1',
        },
        body: JSON.stringify({
          action: params.action,
          details: params.details || params.description,
          description: params.description || params.details,
          resource: params.resource,
          module: params.module,
          type: params.type,
          severity: params.severity,
          schoolId: params.schoolId,
          schoolName: params.schoolName,
          userRole: params.userRole,
        }),
      }).catch(() => {});
    } catch {
      // Ignore offline mode
    }

    return newLog;
  }

  public logLogin(user: { id: string; name: string; role: UserRole; schoolId?: string; tenantSchoolId?: string }, schoolName?: string) {
    return this.log({
      action: `User Login: ${user.name} authenticated as ${user.role}`,
      details: `Successful School ID session authentication for ID [${user.schoolId || user.id}]`,
      resource: 'Authentication',
      module: 'Authentication',
      type: 'auth',
      severity: 'info',
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userSchoolId: user.schoolId,
      schoolId: user.tenantSchoolId || 'school-1',
      schoolName,
    });
  }

  public logLogout(user: { id: string; name: string; role: UserRole; schoolId?: string; tenantSchoolId?: string }) {
    return this.log({
      action: `User Logout: ${user.name} terminated session`,
      details: `Session closed for ${user.role} account [${user.schoolId || user.id}]`,
      resource: 'Authentication',
      module: 'Authentication',
      type: 'auth',
      severity: 'info',
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userSchoolId: user.schoolId,
      schoolId: user.tenantSchoolId || 'school-1',
    });
  }

  public logProfileUpdate(
    user: { id: string; name: string; role: UserRole; schoolId?: string; tenantSchoolId?: string },
    fields: string,
    details?: string
  ) {
    return this.log({
      action: `Profile Update: Modified fields (${fields})`,
      details: details || `User ${user.name} updated profile settings`,
      resource: 'Profile',
      module: 'Security',
      type: 'security',
      severity: 'info',
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userSchoolId: user.schoolId,
      schoolId: user.tenantSchoolId || 'school-1',
    });
  }

  public logDataModification(
    user: { id: string; name: string; role: UserRole; schoolId?: string; tenantSchoolId?: string },
    action: string,
    resource: string,
    details: string,
    severity: ActivityLogSeverity = 'info',
    schoolId?: string,
    schoolName?: string
  ) {
    return this.log({
      action,
      details,
      resource,
      module: resource,
      type: resource.toLowerCase() as ActivityLog['type'],
      severity,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userSchoolId: user.schoolId,
      schoolId: schoolId || user.tenantSchoolId || 'school-1',
      schoolName,
    });
  }

  public logFileUpload(
    user: { id: string; name: string; role: UserRole; schoolId?: string; tenantSchoolId?: string },
    fileName: string,
    fileType: string,
    resource: string,
    schoolId?: string,
    schoolName?: string
  ) {
    return this.log({
      action: `File Uploaded: "${fileName}" (${fileType.toUpperCase()})`,
      details: `Secure document attached to ${resource} repository by ${user.name} (${user.role})`,
      resource,
      module: 'Upload',
      type: 'upload',
      severity: 'success',
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userSchoolId: user.schoolId,
      schoolId: schoolId || user.tenantSchoolId || 'school-1',
      schoolName,
    });
  }

  public logAction(
    userId: string,
    action: string,
    resource: string = 'System',
    extra?: Record<string, any>
  ) {
    return this.log({
      action: `Action: ${action}`,
      details: extra ? (extra.details || JSON.stringify(extra)) : `Performed ${action} on ${resource}`,
      resource,
      module: resource,
      userId,
      schoolId: extra?.schoolId,
    });
  }

  public logSchoolAction(
    user: { id: string; name: string; role: UserRole; schoolId?: string },
    action: string,
    school: { id: string; name: string; code: string },
    details: string,
    severity: ActivityLogSeverity = 'warning'
  ) {
    return this.log({
      action: `School Management: ${action} - "${school.name}" (${school.code})`,
      details,
      resource: 'Schools',
      module: 'Schools',
      type: 'school',
      severity,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userSchoolId: user.schoolId,
      schoolId: school.id,
      schoolName: school.name,
    });
  }
}

export const auditLogService = AuditLogService.getInstance();
