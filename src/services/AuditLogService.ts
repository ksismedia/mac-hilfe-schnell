import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'export';
export type ResourceType = 'analysis' | 'manual_data' | 'export';

interface AuditLogData {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  resourceName?: string;
  details?: Record<string, any>;
}

export class AuditLogService {
  private static getUserAgent(): string {
    return navigator.userAgent;
  }

  private static async getIPAddress(): Promise<string | null> {
    try {
      // In production you might want to use a proper IP detection service
      return null;
    } catch {
      return null;
    }
  }

  static async log(data: AuditLogData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user found for audit log');
        return;
      }

      const ipAddress = await this.getIPAddress();

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        resource_name: data.resourceName,
        details: data.details || {},
        ip_address: ipAddress,
        user_agent: this.getUserAgent()
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging should never break the main flow
    }
  }

  static async getRecentLogs(limit: number = 50) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async exportLogs(startDate?: Date, endDate?: Date) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    // Create CSV export
    const headers = ['Zeitstempel', 'Aktion', 'Ressourcentyp', 'Ressourcenname', 'Details'];
    const rows = data.map(log => [
      new Date(log.created_at).toLocaleString('de-DE'),
      log.action,
      log.resource_type,
      log.resource_name || '-',
      JSON.stringify(log.details || {})
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}
