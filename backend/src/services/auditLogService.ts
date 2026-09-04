import prisma from '../config/db';

export class AuditLogService {
  /**
   * Log an action to the audit trail
   */
  static async log(
    actorType: string,
    actorId: string | null,
    action: string,
    targetType?: string,
    targetId?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorType,
          actorId: actorId || 'anonymous',
          action,
          targetType,
          targetId,
          ipAddress
        }
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      console.error('Audit log failed:', error);
    }
  }
}