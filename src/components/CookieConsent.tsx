import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const CONSENT_KEY = 'cookie_consent';
const CONSENT_DATE_KEY = 'cookie_consent_date';

interface CookieSettings {
  necessary: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    const consentDate = localStorage.getItem(CONSENT_DATE_KEY);
    
    // Check if consent is older than 6 months
    if (consentDate) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const savedDate = new Date(consentDate);
      
      if (savedDate < sixMonthsAgo) {
        // Consent expired, show banner again
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(CONSENT_DATE_KEY);
        setShowBanner(true);
        return;
      }
    }
    
    if (!consent) {
      // Small delay to not show banner immediately on page load
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      try {
        const savedSettings = JSON.parse(consent);
        setSettings(savedSettings);
      } catch (e) {
        console.error('Error parsing cookie consent:', e);
      }
    }
  }, []);

  const saveConsent = (newSettings: CookieSettings) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newSettings));
    localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    setSettings(newSettings);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessaryOnly = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustomSettings = () => {
    saveConsent(settings);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      
      <Card className="fixed bottom-0 left-0 right-0 z-50 m-4 md:bottom-4 md:left-4 md:right-auto md:max-w-md shadow-2xl border-2">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0" />
              <h3 className="font-bold text-lg">Cookie-Einstellungen</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={acceptNecessaryOnly}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Wir verwenden Cookies und ähnliche Technologien, um Ihnen die bestmögliche Nutzererfahrung zu bieten. 
              Einige davon sind technisch notwendig, andere helfen uns, diese Website zu verbessern.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <p className="text-sm font-semibold mb-1">🔒 Ihre Privatsphäre ist wichtig</p>
              <p className="text-xs text-muted-foreground">
                Wir setzen derzeit nur technisch notwendige Cookies ein. Keine Tracking- oder Marketing-Cookies.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={acceptAll} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Alle akzeptieren
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={acceptNecessaryOnly} variant="outline" className="w-full">
                Nur Notwendige
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Anpassen
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Weitere Informationen finden Sie in unserer{' '}
              <Link to="/privacy" className="text-primary underline hover:no-underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>
        </div>
      </Card>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cookie-Einstellungen anpassen
            </DialogTitle>
            <DialogDescription>
              Wählen Sie, welche Kategorien von Cookies Sie zulassen möchten. 
              Technisch notwendige Cookies können nicht deaktiviert werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Notwendige Cookies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="necessary" className="font-semibold">
                    Technisch notwendig
                  </Label>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    Immer aktiv
                  </span>
                </div>
                <Switch
                  id="necessary"
                  checked={true}
                  disabled={true}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Diese Cookies sind für die Basisfunktionalität der Website erforderlich und können nicht 
                deaktiviert werden. Sie speichern z.B. Ihre Anmeldung und Cookie-Einstellungen.
              </p>
              <div className="bg-muted p-3 rounded text-xs space-y-1">
                <p className="font-semibold">Verwendete Cookies:</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li><code>supabase.auth.token</code> - Authentifizierung (Session Storage)</li>
                  <li><code>cookie_consent</code> - Cookie-Einwilligung (Local Storage)</li>
                </ul>
              </div>
            </div>

            {/* Funktionale Cookies */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="functional" className="font-semibold">
                  Funktional
                </Label>
                <Switch
                  id="functional"
                  checked={settings.functional}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, functional: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Diese Cookies ermöglichen erweiterte Funktionen wie gespeicherte Analysen und Benutzereinstellungen.
              </p>
              <div className="bg-muted p-3 rounded text-xs">
                <p className="font-semibold mb-1">Beispiele:</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Gespeicherte Filter- und Sortiereinstellungen</li>
                  <li>Bevorzugte Ansichtsmodi</li>
                </ul>
              </div>
            </div>

            {/* Analytische Cookies */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics" className="font-semibold">
                  Analytisch
                </Label>
                <Switch
                  id="analytics"
                  checked={settings.analytics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, analytics: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, 
                indem Informationen anonym gesammelt und gemeldet werden.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-xs">
                <p className="font-semibold">ℹ️ Derzeit nicht aktiv</p>
                <p className="text-muted-foreground">
                  Wir verwenden aktuell keine Analytics-Cookies. Diese Option ist für zukünftige Verwendung vorgesehen.
                </p>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing" className="font-semibold">
                  Marketing
                </Label>
                <Switch
                  id="marketing"
                  checked={settings.marketing}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Marketing-Cookies werden verwendet, um Besuchern auf Webseiten zu folgen und 
                personalisierte Werbung anzuzeigen.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-xs">
                <p className="font-semibold">ℹ️ Derzeit nicht aktiv</p>
                <p className="text-muted-foreground">
                  Wir verwenden aktuell keine Marketing-Cookies. Diese Option ist für zukünftige Verwendung vorgesehen.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={saveCustomSettings} className="flex-1">
              Einstellungen speichern
            </Button>
            <Button onClick={acceptNecessaryOnly} variant="outline">
              Alle ablehnen
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Sie können Ihre Cookie-Einstellungen jederzeit in der{' '}
            <Link to="/privacy" className="text-primary underline" onClick={() => setShowSettings(false)}>
              Datenschutzerklärung
            </Link>{' '}
            ändern.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
