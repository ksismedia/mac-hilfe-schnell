import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, User, Shield, Database, Bell } from 'lucide-react';
import { AccountDeletion } from '@/components/AccountDeletion';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p>Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Einstellungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihr Konto und Ihre Datenschutz-Einstellungen
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Kontoinformationen
            </CardTitle>
            <CardDescription>
              Ihre registrierten Kontodaten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">E-Mail-Adresse:</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Benutzer-ID:</span>
                  <span className="text-sm text-muted-foreground font-mono">{user.id}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Registriert seit:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Letzter Login:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(user.last_sign_in_at).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Datenschutz-Einstellungen */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Datenschutz & Compliance
            </CardTitle>
            <CardDescription>
              Übersicht Ihrer Datenschutzrechte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Database className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Datenauskunft (Art. 15 DSGVO)</h4>
                  <p className="text-sm text-muted-foreground">
                    Sie haben das Recht, Auskunft über Ihre gespeicherten Daten zu erhalten.
                  </p>
                  <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">
                    Alle Ihre Analysen sind in "Gespeicherte Analysen" einsehbar
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Datenportabilität (Art. 20 DSGVO)</h4>
                  <p className="text-sm text-muted-foreground">
                    Sie können Ihre Analysen jederzeit als HTML oder PDF exportieren.
                  </p>
                  <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700">
                    Export-Funktionen in der Analyse-Ansicht verfügbar
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">Datenverarbeitung</h4>
                  <p className="text-sm text-muted-foreground">
                    Details zur Verarbeitung finden Sie in unserer Datenschutzerklärung und 
                    im Verarbeitungsverzeichnis.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <a href="/privacy" className="inline-block">
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                        Datenschutzerklärung
                      </Badge>
                    </a>
                    <a href="/processing-register" className="inline-block">
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                        Verarbeitungsverzeichnis
                      </Badge>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Speicherfristen
            </CardTitle>
            <CardDescription>
              Automatische Löschung Ihrer Daten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Gespeicherte Analysen:</span>
                <Badge>365 Tage</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">KI-Nutzungslogs:</span>
                <Badge>730 Tage (2 Jahre)</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Audit-Logs:</span>
                <Badge>730 Tage (2 Jahre)</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Nach Ablauf dieser Fristen werden Ihre Daten automatisch gelöscht (gem. DSGVO).
            </p>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <AccountDeletion />

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Bei Fragen zu Ihren Daten kontaktieren Sie uns:{' '}
            <a href="mailto:[Ihre-E-Mail]" className="text-primary underline">
              [Ihre-E-Mail]
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
