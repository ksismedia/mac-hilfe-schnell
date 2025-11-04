import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Database, Users, Shield, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProcessingRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Verarbeitungsverzeichnis</h1>
          <Badge variant="outline" className="mb-4">
            Art. 30 DSGVO
          </Badge>
          <p className="text-muted-foreground">
            Übersicht aller Verarbeitungstätigkeiten personenbezogener Daten gemäß Art. 30 DSGVO 
            (Datenschutz-Grundverordnung).
          </p>
        </div>

        {/* Übersicht */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verantwortlicher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-semibold">[Ihr Firmenname]</p>
              <p>[Ihre Adresse]</p>
              <p className="mt-2">E-Mail: [Ihre E-Mail]</p>
              <p>Telefon: [Ihre Telefonnummer]</p>
            </div>
          </CardContent>
        </Card>

        {/* Verarbeitungstätigkeit 1: Nutzerverwaltung */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              VT-001: Nutzerverwaltung und Authentifizierung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Zweck der Verarbeitung</h3>
              <p className="text-sm text-muted-foreground">
                Bereitstellung von Nutzerkonten, Authentifizierung und Autorisierung für den Zugang 
                zum UNNA Analyse-Tool.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien betroffener Personen</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">Registrierte Nutzer</Badge>
                <Badge variant="secondary">Kunden</Badge>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien personenbezogener Daten</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>E-Mail-Adresse</li>
                <li>Verschlüsseltes Passwort (bcrypt-Hash)</li>
                <li>Registrierungsdatum</li>
                <li>Letzter Login</li>
                <li>Benutzer-ID (UUID)</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien von Empfängern</h3>
              <div className="bg-muted p-3 rounded text-sm">
                <p className="font-semibold mb-1">Auftragsverarbeiter:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Supabase Inc. (Hosting, Authentifizierung)</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Drittlandtransfer</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                <p className="font-semibold">USA (Supabase/AWS)</p>
                <p className="text-muted-foreground mt-1">
                  Übermittlung auf Basis von EU-Standardvertragsklauseln (EU SCCs)
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Löschfristen
              </h3>
              <p className="text-sm text-muted-foreground">
                Bis zur Löschung des Nutzerkontos durch den Nutzer oder nach 3 Jahren Inaktivität.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Technische und organisatorische Maßnahmen (TOMs)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>SSL/TLS-Verschlüsselung (TLS 1.3)</li>
                <li>Passwort-Hashing mit bcrypt</li>
                <li>Row Level Security (RLS)</li>
                <li>Multi-Faktor-Authentifizierung (optional)</li>
                <li>Session-Management mit automatischem Timeout</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Rechtsgrundlage</h3>
              <Badge>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verarbeitungstätigkeit 2: Website-Analysen */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              VT-002: Website-Analysen und Bewertungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Zweck der Verarbeitung</h3>
              <p className="text-sm text-muted-foreground">
                Durchführung und Speicherung von SEO-, Performance- und Compliance-Analysen 
                für Kundenwebsites.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien betroffener Personen</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">Registrierte Nutzer</Badge>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien personenbezogener Daten</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Analysierte Website-URLs (können personenbezogen sein bei Einzelunternehmen)</li>
                <li>Manuell eingegebene Geschäftsdaten (Firmennamen, Adressen)</li>
                <li>Wettbewerber-Informationen</li>
                <li>Keyword-Daten</li>
                <li>Zeitstempel der Analysen</li>
                <li>Benutzer-ID (Zuordnung)</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien von Empfängern</h3>
              <div className="bg-muted p-3 rounded text-sm">
                <p className="font-semibold mb-1">Auftragsverarbeiter:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Supabase Inc. (Datenbank-Speicherung)</li>
                  <li>Google LLC (KI-Analysen via Gemini API)</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Drittlandtransfer</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                <p className="font-semibold">USA (Supabase/AWS, Google)</p>
                <p className="text-muted-foreground mt-1">
                  Übermittlung auf Basis von EU-Standardvertragsklauseln (EU SCCs)
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Löschfristen
              </h3>
              <p className="text-sm text-muted-foreground">
                Standard: 365 Tage (konfigurierbar in Einstellungen)
                <br />
                Automatische Löschung via Retention Policy
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Technische und organisatorische Maßnahmen (TOMs)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Verschlüsselung at rest (AES-256)</li>
                <li>Verschlüsselung in transit (TLS 1.3)</li>
                <li>Row Level Security (RLS) - nur eigene Analysen sichtbar</li>
                <li>Regelmäßige Backups (automatisch)</li>
                <li>Zugriffsprotokollierung (Audit-Logs)</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Rechtsgrundlage</h3>
              <Badge>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verarbeitungstätigkeit 3: KI-Nutzungsprotokolle */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              VT-003: KI-Nutzungsprotokolle (EU AI Act Compliance)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Zweck der Verarbeitung</h3>
              <p className="text-sm text-muted-foreground">
                Protokollierung von KI-gestützten Analysen zur Einhaltung der EU KI-Verordnung, 
                Qualitätssicherung und Nachvollziehbarkeit.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien betroffener Personen</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">Registrierte Nutzer</Badge>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien personenbezogener Daten</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Benutzer-ID</li>
                <li>Analyse-ID</li>
                <li>KI-Modell und Funktion</li>
                <li>Eingabedaten (Website-Daten)</li>
                <li>Ausgabedaten (Analyseergebnisse)</li>
                <li>Confidence Score</li>
                <li>Review-Status (manuell geprüft ja/nein)</li>
                <li>Zeitstempel</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien von Empfängern</h3>
              <div className="bg-muted p-3 rounded text-sm">
                <p className="font-semibold mb-1">Auftragsverarbeiter:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Supabase Inc. (Speicherung der Logs)</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Drittlandtransfer</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                <p className="font-semibold">USA (Supabase/AWS)</p>
                <p className="text-muted-foreground mt-1">
                  Übermittlung auf Basis von EU-Standardvertragsklauseln (EU SCCs)
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Löschfristen
              </h3>
              <p className="text-sm text-muted-foreground">
                2 Jahre (gem. EU AI Act Anforderungen für Hochrisiko-Systeme, vorsorglich angewendet)
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Technische und organisatorische Maßnahmen (TOMs)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Verschlüsselung at rest und in transit</li>
                <li>Row Level Security (RLS)</li>
                <li>Automatische Retention Policy (730 Tage)</li>
                <li>Unveränderlichkeit der Logs (append-only)</li>
                <li>Zugriffskontrolle und Audit-Trail</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Rechtsgrundlage</h3>
              <Badge>Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung gem. EU AI Act)</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verarbeitungstätigkeit 4: Audit-Logs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              VT-004: Sicherheits- und Audit-Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Zweck der Verarbeitung</h3>
              <p className="text-sm text-muted-foreground">
                Sicherstellung der IT-Sicherheit, Erkennung unbefugter Zugriffe, Nachvollziehbarkeit 
                sicherheitsrelevanter Ereignisse.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien betroffener Personen</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">Registrierte Nutzer</Badge>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien personenbezogener Daten</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Benutzer-ID</li>
                <li>Aktion (erstellen, ändern, löschen, login, logout)</li>
                <li>Ressourcen-Typ und -ID</li>
                <li>IP-Adresse (anonymisiert nach 7 Tagen)</li>
                <li>User Agent</li>
                <li>Zeitstempel</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Kategorien von Empfängern</h3>
              <div className="bg-muted p-3 rounded text-sm">
                <p className="font-semibold mb-1">Auftragsverarbeiter:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Supabase Inc. (Speicherung der Logs)</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Löschfristen
              </h3>
              <p className="text-sm text-muted-foreground">
                730 Tage (2 Jahre)
                <br />
                IP-Adressen werden nach 7 Tagen anonymisiert
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Technische und organisatorische Maßnahmen (TOMs)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Verschlüsselung at rest und in transit</li>
                <li>Unveränderlichkeit der Logs (append-only)</li>
                <li>Automatische IP-Anonymisierung nach 7 Tagen</li>
                <li>Zugriffsbeschränkung (nur autorisierte Administratoren)</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Rechtsgrundlage</h3>
              <Badge>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an IT-Sicherheit)</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Download-Option */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Verarbeitungsverzeichnis exportieren</h3>
                <p className="text-sm text-muted-foreground">
                  Für die Vorlage bei Aufsichtsbehörden oder interne Dokumentation
                </p>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                <Download className="h-4 w-4" />
                Als PDF drucken
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-sm font-semibold mb-2">ℹ️ Hinweis:</p>
          <p className="text-sm text-muted-foreground">
            Dieses Verarbeitungsverzeichnis ist gem. Art. 30 DSGVO zu führen und bei Bedarf der 
            Aufsichtsbehörde vorzulegen. Bitte aktualisieren Sie die Platzhalter mit Ihren Firmendaten 
            und passen Sie das Verzeichnis bei Änderungen der Verarbeitungstätigkeiten an.
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Stand: {new Date().toLocaleDateString('de-DE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>
    </div>
  );
}
