import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Allgemeine Geschäftsbedingungen (AGB)</h1>
          <Badge variant="outline" className="mb-4">
            Stand: {new Date().toLocaleDateString('de-DE')}
          </Badge>
          <p className="text-muted-foreground">
            Nutzungsbedingungen für das UNNA Website-Analyse-Tool
          </p>
        </div>

        {/* § 1 Geltungsbereich */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              § 1 Geltungsbereich und Anbieter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">1.1 Anwendungsbereich</h3>
              <p className="text-sm text-muted-foreground">
                Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung des UNNA Website-Analyse-Tools 
                (nachfolgend "Tool" oder "Dienst") zwischen dem Anbieter und dem Nutzer.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">1.2 Anbieter</h3>
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-semibold">[Ihr Firmenname]</p>
                <p>[Ihre Rechtsform]</p>
                <p>[Ihre Adresse]</p>
                <p className="mt-2">E-Mail: [Ihre E-Mail]</p>
                <p>Telefon: [Ihre Telefonnummer]</p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">1.3 Vertragsschluss</h3>
              <p className="text-sm text-muted-foreground">
                Der Vertrag kommt mit der Registrierung und Erstellung eines Nutzerkontos zustande. 
                Mit der Registrierung bestätigt der Nutzer, diese AGB gelesen und akzeptiert zu haben.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* § 2 Leistungsbeschreibung */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              § 2 Leistungsbeschreibung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">2.1 Funktionsumfang</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Das Tool bietet folgende Hauptfunktionen:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>SEO-Analyse von Websites (Meta-Tags, Keywords, Struktur)</li>
                <li>Performance-Analysen (Ladezeiten, Core Web Vitals)</li>
                <li>Compliance-Checks (DSGVO, Impressum, Barrierefreiheit)</li>
                <li>Wettbewerbsanalysen und Marktvergleiche</li>
                <li>KI-gestützte Bewertungen und Empfehlungen</li>
                <li>Export-Funktionen für Berichte (HTML, PDF)</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">2.2 Verfügbarkeit</h3>
              <p className="text-sm text-muted-foreground">
                Der Anbieter bemüht sich um eine hohe Verfügbarkeit des Dienstes. Eine Verfügbarkeit 
                von 100% kann technisch nicht garantiert werden. Wartungsarbeiten werden nach Möglichkeit 
                angekündigt.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">2.3 Weiterentwicklung</h3>
              <p className="text-sm text-muted-foreground">
                Der Anbieter behält sich vor, den Funktionsumfang des Tools zu erweitern, zu ändern 
                oder einzuschränken, sofern dies den Nutzer nicht unzumutbar benachteiligt.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* § 3 Nutzerkonto */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              § 3 Nutzerkonto und Pflichten des Nutzers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">3.1 Registrierung</h3>
              <p className="text-sm text-muted-foreground">
                Die Nutzung des Tools erfordert eine Registrierung mit einer gültigen E-Mail-Adresse. 
                Der Nutzer verpflichtet sich, wahrheitsgemäße Angaben zu machen.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">3.2 Zugangsdaten</h3>
              <p className="text-sm text-muted-foreground">
                Der Nutzer ist verpflichtet, seine Zugangsdaten (E-Mail und Passwort) geheim zu halten 
                und vor dem Zugriff Dritter zu schützen. Bei Verdacht auf Missbrauch ist der Anbieter 
                unverzüglich zu informieren.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">3.3 Verbotene Nutzung</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Der Nutzer verpflichtet sich, das Tool nicht zu folgenden Zwecken zu nutzen:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Analyse von Websites ohne Erlaubnis der jeweiligen Inhaber</li>
                <li>Verbreitung rechtswidriger oder schädlicher Inhalte</li>
                <li>Umgehung technischer Schutzmaßnahmen</li>
                <li>Überlastung der Infrastruktur (z.B. durch automatisierte Massenabfragen)</li>
                <li>Reverse Engineering oder Dekompilierung</li>
              </ul>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">3.4 Sperrung</h3>
              <p className="text-sm text-muted-foreground">
                Bei Verstößen gegen diese AGB behält sich der Anbieter vor, den Zugang zum Tool 
                vorübergehend oder dauerhaft zu sperren.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* § 4 Preise und Zahlung */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>§ 4 Preise und Zahlung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm font-semibold mb-2">ℹ️ Hinweis:</p>
              <p className="text-sm text-muted-foreground">
                Dieser Abschnitt ist anzupassen, wenn Sie kostenpflichtige Dienste anbieten. 
                Aktuell wird von einem kostenfreien oder testweisen Betrieb ausgegangen.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4.1 Kostenlose Nutzung</h3>
              <p className="text-sm text-muted-foreground">
                Die Nutzung des Tools ist derzeit kostenfrei. Der Anbieter behält sich vor, 
                zukünftig kostenpflichtige Funktionen oder Nutzungsmodelle einzuführen.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">4.2 Preisänderungen</h3>
              <p className="text-sm text-muted-foreground">
                Bei Einführung kostenpflichtiger Funktionen werden Nutzer mindestens 4 Wochen 
                im Voraus informiert. Bestehende Nutzer haben das Recht, den Vertrag vor 
                Inkrafttreten der Änderung zu kündigen.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* § 5 KI-gestützte Analysen */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              § 5 KI-gestützte Analysen und Haftungsbeschränkung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">5.1 Künstliche Intelligenz</h3>
              <p className="text-sm text-muted-foreground">
                Das Tool nutzt KI-gestützte Analysen (Google Gemini API). Diese Analysen werden 
                gem. EU AI Act manuell überprüft, bevor Berichte an Kunden weitergegeben werden dürfen.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">5.2 Keine Gewährleistung der Richtigkeit</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-sm">
                <p className="font-semibold mb-2">⚠️ Wichtiger Hinweis:</p>
                <p className="text-muted-foreground">
                  Die Analyseergebnisse dienen ausschließlich zu Informationszwecken und stellen 
                  keine rechtliche oder technische Beratung dar. Für kritische Entscheidungen sollten 
                  Fachleute (z.B. SEO-Experten, Rechtsanwälte, Datenschutzbeauftragte) hinzugezogen werden.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">5.3 Haftungsausschluss</h3>
              <p className="text-sm text-muted-foreground">
                Der Anbieter haftet nicht für:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                <li>Fehlerhafte oder unvollständige Analyseergebnisse</li>
                <li>Geschäftliche Entscheidungen auf Basis der Analysen</li>
                <li>Schäden durch Drittanbieter-Services (Google APIs, etc.)</li>
                <li>Datenverluste bei höherer Gewalt oder technischen Störungen</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Dies gilt nicht bei Vorsatz oder grober Fahrlässigkeit des Anbieters.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* § 6 Datenschutz */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>§ 6 Datenschutz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Der Schutz personenbezogener Daten hat höchste Priorität. Details zur Datenverarbeitung 
              finden Sie in unserer Datenschutzerklärung:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <a href="/privacy" className="text-primary underline font-semibold">
                → Zur Datenschutzerklärung
              </a>
            </div>
          </CardContent>
        </Card>

        {/* § 7 Laufzeit und Kündigung */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>§ 7 Laufzeit und Kündigung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">7.1 Vertragslaufzeit</h3>
              <p className="text-sm text-muted-foreground">
                Der Vertrag läuft auf unbestimmte Zeit und kann jederzeit von beiden Parteien 
                gekündigt werden.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">7.2 Ordentliche Kündigung</h3>
              <p className="text-sm text-muted-foreground">
                Der Nutzer kann sein Konto jederzeit ohne Einhaltung einer Frist in den Einstellungen 
                löschen. Der Anbieter kann mit einer Frist von 30 Tagen zum Monatsende kündigen.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">7.3 Außerordentliche Kündigung</h3>
              <p className="text-sm text-muted-foreground">
                Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. 
                Ein wichtiger Grund liegt insbesondere bei schwerwiegenden Verstößen gegen diese AGB vor.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">7.4 Datenlöschung nach Kündigung</h3>
              <p className="text-sm text-muted-foreground">
                Nach Beendigung des Vertrags werden alle personenbezogenen Daten des Nutzers gelöscht, 
                soweit keine gesetzlichen Aufbewahrungspflichten bestehen.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* § 8 Geistiges Eigentum */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>§ 8 Geistiges Eigentum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">8.1 Urheberrechte</h3>
              <p className="text-sm text-muted-foreground">
                Alle Rechte an der Software, Designs, Texten und sonstigen Inhalten des Tools 
                verbleiben beim Anbieter. Der Nutzer erhält ein einfaches, nicht übertragbares 
                Nutzungsrecht für die Dauer der Vertragslaufzeit.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">8.2 Exportierte Berichte</h3>
              <p className="text-sm text-muted-foreground">
                Der Nutzer erhält die Rechte an den von ihm erstellten und exportierten Berichten. 
                Bei Weitergabe an Dritte muss die Quelle (UNNA Tool) kenntlich gemacht werden.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* § 9 Schlussbestimmungen */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>§ 9 Schlussbestimmungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">9.1 Änderungen der AGB</h3>
              <p className="text-sm text-muted-foreground">
                Der Anbieter behält sich vor, diese AGB zu ändern. Änderungen werden dem Nutzer 
                mindestens 4 Wochen vor Inkrafttreten per E-Mail mitgeteilt. Widerspricht der Nutzer 
                nicht innerhalb von 4 Wochen, gelten die neuen AGB als akzeptiert.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">9.2 Anwendbares Recht</h3>
              <p className="text-sm text-muted-foreground">
                Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des 
                UN-Kaufrechts (CISG).
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">9.3 Gerichtsstand</h3>
              <p className="text-sm text-muted-foreground">
                Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, der Sitz 
                des Anbieters: [Ihr Gerichtsstand, z.B. München]
              </p>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">9.4 Salvatorische Klausel</h3>
              <p className="text-sm text-muted-foreground">
                Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die 
                Wirksamkeit der übrigen Bestimmungen hiervon unberührt.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm font-semibold mb-2">⚠️ Wichtig:</p>
          <p className="text-sm text-muted-foreground">
            Bitte ersetzen Sie alle Platzhalter in eckigen Klammern [...] mit Ihren tatsächlichen Daten. 
            Diese AGB sind ein Muster und müssen an Ihre individuellen Gegebenheiten angepasst werden. 
            Lassen Sie diese im Zweifelsfall von einem Rechtsanwalt prüfen.
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
