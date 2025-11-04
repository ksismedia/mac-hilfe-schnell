import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Database, Shield, AlertTriangle, Download, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuditLogService } from '@/services/AuditLogService';

export const ComplianceDocumentation = () => {
  const [retentionSettings, setRetentionSettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load retention settings
    const { data: retention } = await supabase
      .from('data_retention_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    setRetentionSettings(retention);

    // Load recent audit logs
    const logs = await AuditLogService.getRecentLogs(10);
    setAuditLogs(logs || []);
  };

  const handleExportDocumentation = () => {
    const doc = `
DSGVO & AI-ACT COMPLIANCE DOKUMENTATION
Handwerk Stars Analyse-Tool
Generiert am: ${new Date().toLocaleString('de-DE')}

=== 1. DATENVERARBEITUNG ===

Zweck:
- Betriebsinterne Website-Analyse für Handwerksbetriebe
- Performance-, SEO- und Compliance-Bewertungen
- Wettbewerbsvergleiche

Verarbeitete Daten:
• Benutzerdaten: E-Mail, Authentifizierung
• Analysedaten: URLs, Firmennamen, Bewertungen, Analysen
• Technische Logs: IP-Adressen, Browser-Info, Zeitstempel
• AI-Protokolle: Eingaben/Ausgaben, Confidence-Scores

Rechtsgrundlage:
- Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
- Art. 6 Abs. 1 lit. f DSGVO (Berechtigte Interessen)

Speicherdauer:
- Analysedaten: ${retentionSettings?.retention_days || 365} Tage
- Audit-Logs: 730 Tage (2 Jahre)
- Automatische Löschung: ${retentionSettings?.auto_delete_enabled ? 'Aktiviert' : 'Deaktiviert'}

=== 2. TECHNISCHE MASSNAHMEN ===

Verschlüsselung:
✓ SSL/TLS für Datenübertragung
✓ Verschlüsselte Speicherung (Supabase)
✓ Sichere Authentifizierung (Supabase Auth)

Zugriffskontrolle:
✓ Row Level Security (RLS) aktiviert
✓ Benutzerspezifische Datentrennung
✓ Audit-Logging aller Zugriffe

=== 3. AI-ACT COMPLIANCE ===

AI-Nutzung:
- Google PageSpeed API (Performance-Analyse)
- Keyword-Analyse
- Content-Bewertung

Transparenz:
✓ AI-Kennzeichnung in allen Analysen
✓ Confidence-Scores sichtbar
✓ Vollständige Protokollierung

Human-in-the-Loop:
✓ Manuelle Überprüfung erforderlich
✓ Freigabe-Workflow implementiert
✓ Mensch hat finale Entscheidung

=== 4. VERWENDETE DIENSTE ===

Supabase (Cloud-Anbieter):
- Datenbank, Authentifizierung, Storage
- Standort: [Region wählen]
- Auftragsverarbeitungsvertrag: Erforderlich

Google APIs:
- PageSpeed Insights
- Places API (Bewertungen)

=== 5. BETROFFENENRECHTE ===

Nutzer haben folgende Rechte:
- Auskunft (Art. 15 DSGVO)
- Berichtigung (Art. 16 DSGVO)
- Löschung (Art. 17 DSGVO)
- Datenübertragbarkeit (Art. 20 DSGVO)
- Widerspruch (Art. 21 DSGVO)

Kontakt: [Ihre Kontaktdaten hier einfügen]

=== 6. DATENSCHUTZ-FOLGENABSCHÄTZUNG ===

Risikobewertung: NIEDRIG bis MITTEL
- Keine sensiblen personenbezogenen Daten
- Betriebsinterne Nutzung
- Angemessene Schutzmaßnahmen

Empfohlene Maßnahmen:
1. AVV mit Supabase abschließen
2. Regelmäßige Zugriffsüberprüfung
3. Schulung der Mitarbeiter
4. Jährliche Überprüfung der Maßnahmen
    `;

    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DSGVO-AI-Act-Dokumentation-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Compliance Dokumentation</h1>
        <p className="text-muted-foreground">
          DSGVO und AI-Act Konformität für betriebsinterne Nutzung
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Überblick</TabsTrigger>
          <TabsTrigger value="data">Datenverarbeitung</TabsTrigger>
          <TabsTrigger value="ai">AI-Nutzung</TabsTrigger>
          <TabsTrigger value="audit">Audit-Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Status
              </CardTitle>
              <CardDescription>
                Aktuelle Compliance-Maßnahmen und Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Datenspeicherung</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Verschlüsselt auf Supabase-Servern
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Aufbewahrungsfrist</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {retentionSettings?.retention_days || 365} Tage (automatische Löschung {retentionSettings?.auto_delete_enabled ? 'aktiv' : 'inaktiv'})
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Zugriffskontrolle</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    RLS aktiviert, benutzerspezifische Trennung
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Audit-Logging</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Alle Aktionen werden protokolliert
                  </p>
                </div>
              </div>

              <Button onClick={handleExportDocumentation} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Vollständige Dokumentation exportieren
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Processing Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verarbeitete Datenarten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-primary bg-muted/30">
                  <h4 className="font-semibold mb-1">Benutzerdaten</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>E-Mail-Adresse (Authentifizierung)</li>
                    <li>Login-Zeitpunkte</li>
                    <li>Benutzer-ID (UUID)</li>
                  </ul>
                </div>

                <div className="p-3 border-l-4 border-primary bg-muted/30">
                  <h4 className="font-semibold mb-1">Analysedaten</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Website-URLs</li>
                    <li>Firmennamen und Adressen</li>
                    <li>Google Bewertungen (öffentliche Daten)</li>
                    <li>Performance-Metriken</li>
                    <li>SEO-Daten</li>
                  </ul>
                </div>

                <div className="p-3 border-l-4 border-primary bg-muted/30">
                  <h4 className="font-semibold mb-1">Protokolldaten</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>IP-Adresse</li>
                    <li>Browser-Informationen (User-Agent)</li>
                    <li>Zeitstempel aller Aktionen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Usage Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Act Konformität</CardTitle>
              <CardDescription>
                Transparenz und Nachvollziehbarkeit der AI-Nutzung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Verwendete AI-Systeme</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Google PageSpeed Insights API (Performance)</li>
                    <li>• Keyword-Analyse (SEO)</li>
                    <li>• Content-Bewertung</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Transparenz-Maßnahmen</h4>
                  <ul className="text-sm space-y-1">
                    <li>✓ AI-generierte Inhalte sind gekennzeichnet</li>
                    <li>✓ Confidence-Scores werden angezeigt</li>
                    <li>✓ Alle AI-Anfragen werden protokolliert</li>
                    <li>✓ Eingabe- und Ausgabedaten gespeichert</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Human-in-the-Loop</h4>
                  <ul className="text-sm space-y-1">
                    <li>✓ Manuelle Überprüfung erforderlich</li>
                    <li>✓ Freigabe-Checkboxen vorhanden</li>
                    <li>✓ Kommentarfunktion für Korrekturen</li>
                    <li>✓ Finale Entscheidung beim Menschen</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Letzte Aktivitäten</CardTitle>
              <CardDescription>
                Protokollierte Aktionen der letzten Tage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Aktivitäten protokolliert
                  </p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3 border rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold capitalize">{log.action}</span>
                          {' - '}
                          <span className="text-muted-foreground">{log.resource_type}</span>
                          {log.resource_name && (
                            <span className="text-muted-foreground"> - {log.resource_name}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('de-DE')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Button 
                onClick={() => AuditLogService.exportLogs()} 
                variant="outline" 
                className="w-full mt-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Audit-Logs exportieren
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
