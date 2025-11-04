import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Phone, FileText, Scale } from 'lucide-react';

export default function Imprint() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Impressum</h1>
          <p className="text-muted-foreground">
            Angaben gemäß § 5 TMG (Telemediengesetz)
          </p>
        </div>

        <div className="space-y-6">
          {/* Anbieter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Anbieter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-lg">[Ihr Firmenname]</p>
                <p>[Rechtsform, z.B. GmbH, UG, Einzelunternehmen]</p>
              </div>
              
              <div>
                <p className="font-semibold mt-4">Geschäftsadresse:</p>
                <p>[Straße Hausnummer]</p>
                <p>[PLZ Ort]</p>
                <p>[Land]</p>
              </div>

              <div className="pt-3 border-t">
                <p className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  <strong>E-Mail:</strong> [ihre-email@example.com]
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <strong>Telefon:</strong> [+49 xxx xxxxxxx]
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vertretungsberechtigte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vertretungsberechtigte Person(en)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>[Name der Geschäftsführung/Inhaber]</p>
              <p className="text-sm text-muted-foreground mt-2">
                (z.B. "Geschäftsführer: Max Mustermann" oder "Inhaber: Maria Musterfrau")
              </p>
            </CardContent>
          </Card>

          {/* Registereintrag */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Registereintrag
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-semibold">Handelsregister:</p>
                <p>[z.B. Amtsgericht München]</p>
                <p>Registernummer: [z.B. HRB 123456]</p>
              </div>

              <div className="pt-3 border-t">
                <p className="font-semibold">Umsatzsteuer-ID:</p>
                <p>USt-IdNr. gemäß § 27a UStG: [DE123456789]</p>
              </div>

              <div className="pt-3 border-t">
                <p className="font-semibold">Wirtschafts-Identifikationsnummer:</p>
                <p>[Optional: DE123456789012]</p>
              </div>
            </CardContent>
          </Card>

          {/* Aufsichtsbehörde (falls zutreffend) */}
          <Card>
            <CardHeader>
              <CardTitle>Zuständige Aufsichtsbehörde</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                [Falls Sie einer berufsständischen Kammer angehören oder eine behördliche Zulassung benötigen:]
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold">[Name der Behörde/Kammer]</p>
                <p>[Adresse]</p>
                <p className="mt-2">Website: [Link zur Behörde]</p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Entfernen Sie diesen Abschnitt, falls keine Aufsichtsbehörde zuständig ist.
              </p>
            </CardContent>
          </Card>

          {/* Berufsbezeichnung (falls zutreffend) */}
          <Card>
            <CardHeader>
              <CardTitle>Berufsbezeichnung und berufsrechtliche Regelungen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                [Nur ausfüllen, wenn Sie einen reglementierten Beruf ausüben:]
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Berufsbezeichnung: [z.B. Rechtsanwalt, Steuerberater]</li>
                <li>Verliehen in: [Land]</li>
                <li>Zuständige Kammer: [Name der Kammer]</li>
                <li>Berufsrechtliche Regelungen: [z.B. Bundesrechtsanwaltsordnung]</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Entfernen Sie diesen Abschnitt, falls nicht zutreffend.
              </p>
            </CardContent>
          </Card>

          {/* Haftungsausschluss */}
          <Card>
            <CardHeader>
              <CardTitle>Haftungsausschluss</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Haftung für Inhalte</h3>
                <p className="text-sm">
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                  nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter 
                  jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder 
                  nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Haftung für Links</h3>
                <p className="text-sm">
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
                  Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
                  verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Urheberrecht</h3>
                <p className="text-sm">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem 
                  deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
                  außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors 
                  bzw. Erstellers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Streitschlichtung */}
          <Card>
            <CardHeader>
              <CardTitle>Verbraucherstreitbeilegung / Universalschlichtungsstelle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
              <p className="text-sm text-muted-foreground">
                (Passen Sie dies an, falls Sie an einem Streitschlichtungsverfahren teilnehmen möchten)
              </p>
            </CardContent>
          </Card>

          {/* Online Dispute Resolution */}
          <Card>
            <CardHeader>
              <CardTitle>EU-Streitschlichtung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              </p>
              <a 
                href="https://ec.europa.eu/consumers/odr" 
                className="text-primary underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              <p className="text-sm mt-2">
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm font-semibold mb-2">⚠️ Wichtig:</p>
          <p className="text-sm">
            Bitte ersetzen Sie alle Platzhalter in eckigen Klammern [...] mit Ihren tatsächlichen Daten. 
            Dieses Impressum ist ein Muster und muss an Ihre individuellen Gegebenheiten angepasst werden. 
            Lassen Sie es im Zweifelsfall von einem Rechtsanwalt prüfen.
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
