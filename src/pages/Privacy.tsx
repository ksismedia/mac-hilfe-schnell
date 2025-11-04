import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Database, Eye, FileText, Mail } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Datenschutzerklärung</h1>
          <Badge variant="outline" className="mb-4">
            Stand: {new Date().toLocaleDateString('de-DE')}
          </Badge>
          <p className="text-muted-foreground">
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst und behandeln diese vertraulich 
            sowie entsprechend der gesetzlichen Datenschutzvorschriften und dieser Datenschutzerklärung.
          </p>
        </div>

        <div className="space-y-6">
          {/* Verantwortlicher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                1. Verantwortlicher
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold">[Ihr Firmenname]</p>
                <p>[Ihre Adresse]</p>
                <p>[PLZ Ort]</p>
                <p className="mt-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  E-Mail: [Ihre E-Mail]
                </p>
                <p>Telefon: [Ihre Telefonnummer]</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Der Verantwortliche entscheidet über die Zwecke und Mittel der Verarbeitung personenbezogener Daten.
              </p>
            </CardContent>
          </Card>

          {/* Erhebung und Speicherung personenbezogener Daten */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                2. Erhebung und Speicherung personenbezogener Daten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">2.1 Registrierung und Nutzerkonto</h3>
                <p className="mb-2">Bei der Registrierung erheben wir folgende Daten:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>E-Mail-Adresse (Pflichtfeld)</li>
                  <li>Passwort (verschlüsselt gespeichert)</li>
                  <li>Zeitpunkt der Registrierung</li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.2 Gespeicherte Analysen</h3>
                <p className="mb-2">Wenn Sie Analysen speichern, werden folgende Daten verarbeitet:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>URL der analysierten Website</li>
                  <li>Analyseergebnisse und Bewertungen</li>
                  <li>Manuell eingegebene Daten</li>
                  <li>Zeitstempel der Speicherung</li>
                  <li>Ihre Benutzer-ID (zur Zuordnung)</li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.3 KI-Nutzungsprotokolle</h3>
                <p className="mb-2">
                  Bei Nutzung von KI-gestützten Analysen protokollieren wir gem. EU AI Act:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>KI-Modell und Funktion</li>
                  <li>Eingabe- und Ausgabedaten</li>
                  <li>Zeitpunkt der Verarbeitung</li>
                  <li>Review-Status (manuell geprüft ja/nein)</li>
                  <li>Confidence Score</li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung gem. EU AI Act)
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.4 Audit-Logs</h3>
                <p className="mb-2">Zur Sicherheit und Nachvollziehbarkeit speichern wir:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Aktionen (erstellen, ändern, löschen)</li>
                  <li>Zeitstempel</li>
                  <li>IP-Adresse (anonymisiert nach 7 Tagen)</li>
                  <li>User Agent</li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an IT-Sicherheit)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weitergabe von Daten */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                3. Weitergabe von Daten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">3.1 Auftragsverarbeiter</h3>
                <p className="mb-2">
                  Wir setzen folgende Auftragsverarbeiter ein (Drittanbieter, die in unserem Auftrag Daten verarbeiten):
                </p>
                
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded">
                    <p className="font-semibold">Supabase Inc.</p>
                    <p className="text-sm">Zweck: Hosting, Datenbank, Authentifizierung</p>
                    <p className="text-sm">Standort: USA (EU-Standardvertragsklauseln)</p>
                    <p className="text-sm text-muted-foreground">
                      AVV vorhanden: Ja (siehe Supabase DPA)
                    </p>
                  </div>

                  <div className="bg-muted p-3 rounded">
                    <p className="font-semibold">Google LLC</p>
                    <p className="text-sm">Zweck: Gemini AI API für Analysen</p>
                    <p className="text-sm">Standort: USA (EU-Standardvertragsklauseln)</p>
                    <p className="text-sm text-muted-foreground">
                      AVV vorhanden: Ja (siehe Google Cloud Platform Terms)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.2 Keine Weitergabe an Dritte</h3>
                <p>
                  Ihre Daten werden nicht an Dritte außerhalb der genannten Auftragsverarbeiter weitergegeben, 
                  es sei denn, Sie willigen ausdrücklich ein oder wir sind gesetzlich dazu verpflichtet.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Betroffenenrechte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                4. Ihre Rechte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
              
              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold">Auskunftsrecht (Art. 15 DSGVO)</p>
                  <p className="text-sm">Sie können Auskunft über Ihre gespeicherten Daten verlangen.</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold">Berichtigungsrecht (Art. 16 DSGVO)</p>
                  <p className="text-sm">Sie können die Berichtigung unrichtiger Daten verlangen.</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold">Löschungsrecht (Art. 17 DSGVO)</p>
                  <p className="text-sm">
                    Sie können die Löschung Ihrer Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten 
                    bestehen.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold">Einschränkung der Verarbeitung (Art. 18 DSGVO)</p>
                  <p className="text-sm">Sie können die Einschränkung der Verarbeitung verlangen.</p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold">Datenportabilität (Art. 20 DSGVO)</p>
                  <p className="text-sm">
                    Sie können Ihre Daten in einem strukturierten, gängigen Format erhalten.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <p className="font-semibold">Widerspruchsrecht (Art. 21 DSGVO)</p>
                  <p className="text-sm">
                    Sie können der Verarbeitung Ihrer Daten aus Gründen, die sich aus Ihrer besonderen Situation 
                    ergeben, widersprechen.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="font-semibold mb-2">So machen Sie Ihre Rechte geltend:</p>
                <p className="text-sm">
                  Kontaktieren Sie uns per E-Mail an: <strong>[Ihre Datenschutz-E-Mail]</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Speicherdauer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                5. Speicherdauer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[200px]">Nutzerkonto:</span>
                  <span>Bis zur Löschung des Kontos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[200px]">Gespeicherte Analysen:</span>
                  <span>Standard: 365 Tage (konfigurierbar in Einstellungen)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[200px]">KI-Nutzungslogs:</span>
                  <span>2 Jahre (gem. EU AI Act Anforderungen)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[200px]">Audit-Logs:</span>
                  <span>730 Tage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[200px]">Anonymisierte IP:</span>
                  <span>Nach 7 Tagen</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                6. Cookies und lokale Speicherung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">6.1 Technisch notwendige Cookies</h3>
                <p className="mb-2">Wir verwenden folgende technisch notwendige Speichermechanismen:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><code>supabase.auth.token</code> - Authentifizierungs-Session (Local Storage)</li>
                  <li><code>cookie_consent</code> - Speicherung Ihrer Cookie-Einwilligung</li>
                </ul>
                <p className="text-sm mt-2">
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b, f DSGVO (technisch erforderlich)
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.2 Keine Tracking-Cookies</h3>
                <p>
                  Wir setzen derzeit keine Tracking-, Analyse- oder Marketing-Cookies ein. Sollte sich dies ändern, 
                  werden Sie vorab um Ihre Einwilligung gebeten.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Datensicherheit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                7. Datensicherheit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
                <li>Verschlüsselte Speicherung von Passwörtern (bcrypt)</li>
                <li>Row Level Security (RLS) in der Datenbank</li>
                <li>Regelmäßige Sicherheitsupdates</li>
                <li>Zugriffsbeschränkungen auf Mitarbeiterebene</li>
                <li>Audit-Logging aller kritischen Aktionen</li>
              </ul>
            </CardContent>
          </Card>

          {/* Beschwerderecht */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                8. Beschwerderecht bei der Aufsichtsbehörde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3">
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung 
                Ihrer personenbezogenen Daten zu beschweren.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2">Zuständige Aufsichtsbehörde (Deutschland):</p>
                <p>Der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)</p>
                <p className="text-sm mt-2">
                  Website: <a href="https://www.bfdi.bund.de" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                    www.bfdi.bund.de
                  </a>
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Für andere EU-Länder finden Sie die zuständige Behörde unter:{' '}
                <a href="https://edpb.europa.eu/about-edpb/board/members_en" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                  EDPB Members
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Änderungen */}
          <Card>
            <CardHeader>
              <CardTitle>9. Änderungen dieser Datenschutzerklärung</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen 
                rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen. 
                Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Zuletzt aktualisiert: {new Date().toLocaleDateString('de-DE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>
    </div>
  );
}
