import { supabase } from "@/integrations/supabase/client";

interface ThreatInfo {
  type: string;
  platform: string;
  description: string;
}

export interface SafeBrowsingResult {
  url: string;
  isSafe: boolean | null;
  threats: ThreatInfo[];
  checkedAt: string;
  error?: string;
}

export class SafeBrowsingService {
  /**
   * Check if a URL is safe using Google Safe Browsing API
   */
  static async checkUrl(url: string): Promise<SafeBrowsingResult> {
    try {
      console.log('Checking Safe Browsing status for:', url);

      const { data, error } = await supabase.functions.invoke('check-safe-browsing', {
        body: { url }
      });

      if (error) {
        console.error('Safe Browsing check error:', error);
        return {
          url,
          isSafe: null,
          threats: [],
          checkedAt: new Date().toISOString(),
          error: error.message || 'Fehler bei der Sicherheitsüberprüfung',
        };
      }

      return data as SafeBrowsingResult;
    } catch (error) {
      console.error('Safe Browsing service error:', error);
      return {
        url,
        isSafe: null,
        threats: [],
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      };
    }
  }

  /**
   * Get a user-friendly security status message
   */
  static getSecurityStatusMessage(result: SafeBrowsingResult): {
    title: string;
    description: string;
    severity: 'success' | 'warning' | 'error' | 'info';
  } {
    if (result.error) {
      return {
        title: 'Überprüfung fehlgeschlagen',
        description: 'Die Sicherheitsüberprüfung konnte nicht durchgeführt werden.',
        severity: 'info',
      };
    }

    if (result.isSafe === null) {
      return {
        title: 'Status unbekannt',
        description: 'Der Sicherheitsstatus konnte nicht ermittelt werden.',
        severity: 'info',
      };
    }

    if (result.isSafe) {
      return {
        title: 'Keine Sicherheitsbedrohungen',
        description: 'Die Website wurde von Google Safe Browsing als sicher eingestuft.',
        severity: 'success',
      };
    }

    const threatCount = result.threats.length;
    const threatTypes = result.threats.map(t => t.type).join(', ');

    return {
      title: `${threatCount} Sicherheitsbedrohung${threatCount > 1 ? 'en' : ''} erkannt`,
      description: `Google Safe Browsing hat folgende Bedrohungen identifiziert: ${threatTypes}`,
      severity: 'error',
    };
  }

  /**
   * Calculate a security score based on Safe Browsing results
   */
  static calculateSecurityScore(result: SafeBrowsingResult): number {
    if (result.error || result.isSafe === null) {
      return 50; // Unknown status
    }

    if (result.isSafe) {
      return 100; // Perfect score
    }

    // Deduct points based on threat severity
    let score = 100;
    const threatScores: Record<string, number> = {
      'MALWARE': 40,
      'SOCIAL_ENGINEERING': 35,
      'UNWANTED_SOFTWARE': 20,
      'POTENTIALLY_HARMFUL_APPLICATION': 15,
    };

    result.threats.forEach(threat => {
      score -= threatScores[threat.type] || 10;
    });

    return Math.max(0, score);
  }
}
