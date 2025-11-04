import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Shield, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AVV() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Auftragsverarbeitungsverträge (AVV)</h1>
          <Badge variant="outline" className="mb-4">
            Art. 28 DSGVO
          </Badge>
          <p className="text-muted-foreground">
            Dokumentation der Auftragsverarbeitungsverträge mit unseren Drittanbietern gemäß 
            Art. 28 DSGVO (Datenschutz-Grundverordnung).
          </p>
        </div>

        {/* Übersicht */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Übersicht Auftragsverarbeiter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Wir setzen folgende Auftragsverarbeiter ein, mit denen jeweils ein 
              Auftragsverarbeitungsvertrag (Data Processing Agreement - DPA) geschlossen wurde:
            </p>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Supabase Inc.</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      AVV vorhanden
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Dienst:</strong> Datenbank-Hosting, Authentifizierung, Backend-Services</p>
                    <p><strong>Standort:</strong> USA (AWS)</p>
                    <p><strong>Datenübermittlung:</strong> EU-Standardvertragsklauseln (EU SCCs)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Google LLC (Gemini AI)</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      AVV vorhanden
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Dienst:</strong> KI-gestützte Analysen (Gemini API)</p>
                    <p><strong>Standort:</strong> USA / EU (verschiedene Rechenzentren)</p>
                    <p><strong>Datenübermittlung:</strong> EU-Standardvertragsklauseln (EU SCCs)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supabase AVV Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Supabase Inc. - AVV Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Vertragsgrundlage</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Der Auftragsverarbeitungsvertrag mit Supabase ist Teil der{' '}
                <strong>Supabase Terms of Service</strong> und des <strong>Data Processing Addendum (DPA)</strong>.
              </p>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a 
                  href="https://supabase.com/legal/dpa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  Supabase DPA einsehen
                </a>
              </Button>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Verarbeitete Daten</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Benutzer-Authentifizierungsdaten (E-Mail, verschlüsseltes Passwort)</li>
                <li>Gespeicherte Analysen und Analyseergebnisse</li>
                <li>Manuelle Eingaben (Wettbewerber, Keywords, etc.)</li>
                <li>KI-Nutzungsprotokolle (gem. EU AI Act)</li>
                <li>Audit-Logs und Sicherheitsprotokolle</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Technische und organisatorische Maßnahmen (TOMs)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Verschlüsselung in transit (TLS 1.3) und at rest (AES-256)</li>
                <li>ISO 27001, SOC 2 Type II zertifiziert</li>
                <li>Row Level Security (RLS) für Datenisolierung</li>
                <li>Regelmäßige Sicherheitsaudits und Penetrationstests</li>
                <li>Backup und Disaster Recovery</li>
                <li>GDPR-konforme Datenverarbeitung</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Datenübermittlung in Drittländer</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm">
                <p className="font-semibold mb-1">⚠️ Datenübermittlung in die USA</p>
                <p className="text-muted-foreground">
                  Supabase nutzt AWS-Infrastruktur. Datenübermittlung in die USA erfolgt auf Basis von:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><strong>EU-Standardvertragsklauseln (EU SCCs)</strong></li>
                  <li><strong>AWS Data Privacy Framework</strong></li>
                  <li>Zusätzliche Schutzmaßnahmen (Verschlüsselung, Zugriffskontrollen)</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Unterauftragsverarbeiter</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Supabase setzt folgende Unterauftragsverarbeiter ein:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li><strong>Amazon Web Services (AWS)</strong> - Hosting-Infrastruktur</li>
                <li><strong>Fly.io</strong> - Edge Functions Hosting</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Vollständige Liste:{' '}
                <a 
                  href="https://supabase.com/docs/company/subprocessors" 
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase Subprocessors
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google/Gemini AVV Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Google LLC - AVV Details (Gemini AI)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Vertragsgrundlage</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Der Auftragsverarbeitungsvertrag ist Teil der{' '}
                <strong>Google Cloud Platform Terms</strong> und des{' '}
                <strong>Google Cloud Data Processing Amendment</strong>.
              </p>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a 
                  href="https://cloud.google.com/terms/data-processing-terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  Google Cloud DPA einsehen
                </a>
              </Button>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Verarbeitete Daten</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Website-URLs für Analysen</li>
                <li>SEO-Metadaten (Title, Description, Keywords)</li>
                <li>Textinhalte für Content-Analysen</li>
                <li>Keine personenbezogenen Daten von End-Nutzern</li>
              </ul>
              <p className="text-sm text-green-700 mt-2 bg-green-50 p-2 rounded">
                ✓ <strong>Wichtig:</strong> Google verarbeitet keine personenbezogenen Daten von Ihren Website-Besuchern. 
                Es werden nur technische Website-Daten analysiert.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Technische und organisatorische Maßnahmen (TOMs)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>ISO 27001, SOC 2/3 zertifiziert</li>
                <li>Verschlüsselung in transit und at rest</li>
                <li>Keine Nutzung der Daten für eigene Werbezwecke (Gemini API Policy)</li>
                <li>Automatische Löschung nach Verarbeitungsende</li>
                <li>GDPR-konforme Datenverarbeitung</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Datenübermittlung in Drittländer</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-sm">
                <p className="font-semibold mb-1">⚠️ Datenübermittlung in die USA</p>
                <p className="text-muted-foreground">
                  Google nutzt weltweite Rechenzentren. Datenübermittlung erfolgt auf Basis von:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><strong>EU-Standardvertragsklauseln (EU SCCs)</strong></li>
                  <li><strong>EU-US Data Privacy Framework</strong></li>
                  <li>Zusätzliche Schutzmaßnahmen und Verschlüsselung</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Zweck der Verarbeitung</h3>
              <p className="text-sm text-muted-foreground">
                Google Gemini wird ausschließlich verwendet für:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                <li>SEO-Analysen und Bewertungen</li>
                <li>Content-Qualitätsbewertungen</li>
                <li>Keyword-Relevanz-Analysen</li>
              </ul>
              <p className="text-sm text-green-700 mt-2 bg-green-50 p-2 rounded">
                ✓ <strong>Keine Profilbildung:</strong> Es werden keine Nutzerprofile erstellt oder 
                Daten für Werbezwecke verwendet.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ihre Pflichten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pflichten als Verantwortlicher
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Als Verantwortlicher (Controller) müssen Sie sicherstellen:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
              <li>
                <strong>Rechtsgrundlage:</strong> Sie haben eine Rechtsgrundlage für die Datenverarbeitung 
                (z.B. Vertrag, Einwilligung, berechtigtes Interesse)
              </li>
              <li>
                <strong>Information:</strong> Ihre Nutzer sind über die Datenverarbeitung informiert 
                (z.B. in Ihrer Datenschutzerklärung)
              </li>
              <li>
                <strong>Betroffenenrechte:</strong> Sie ermöglichen Ihren Nutzern die Ausübung ihrer Rechte 
                (Auskunft, Löschung, etc.)
              </li>
              <li>
                <strong>Vertraulichkeit:</strong> Sie behandeln personenbezogene Daten vertraulich
              </li>
              <li>
                <strong>Meldepflichten:</strong> Bei Datenschutzverletzungen informieren Sie umgehend die 
                Aufsichtsbehörde und ggf. Betroffene
              </li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mt-4">
              <p className="text-sm font-semibold mb-2">💡 Hinweis für Ihre Datenschutzerklärung</p>
              <p className="text-sm text-muted-foreground">
                Sie müssen in Ihrer eigenen Datenschutzerklärung (auf Ihrer analysierten Website) 
                darauf hinweisen, wenn Sie die Analyse-Ergebnisse von unserem Tool auf Ihrer Website 
                veröffentlichen und dabei personenbezogene Daten verarbeitet werden.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Zuletzt aktualisiert: {new Date().toLocaleDateString('de-DE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p className="mt-2">
            Bei Fragen zu unseren AVVs kontaktieren Sie uns bitte unter: <strong>[Ihre E-Mail]</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
