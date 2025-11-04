import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Shield, FileText, Database, AlertTriangle } from 'lucide-react';

const CONSENT_VERSION = '1.0.0';

interface ComplianceDisclaimerProps {
  onAccept: () => void;
}

export const ComplianceDisclaimer = ({ onAccept }: ComplianceDisclaimerProps) => {
  const [open, setOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataProcessing, setAcceptedDataProcessing] = useState(false);
  const [acceptedAuditLogging, setAcceptedAuditLogging] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_consent')
      .select('*')
      .eq('user_id', user.id)
      .eq('consent_version', CONSENT_VERSION);

    if (!data || data.length < 3) {
      setOpen(true);
    } else {
      onAccept();
    }
  };

  const handleAccept = async () => {
    if (!acceptedTerms || !acceptedDataProcessing || !acceptedAuditLogging) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const consents = [
      { consent_type: 'terms_of_use', user_id: user.id, consent_version: CONSENT_VERSION },
      { consent_type: 'data_processing', user_id: user.id, consent_version: CONSENT_VERSION },
      { consent_type: 'audit_logging', user_id: user.id, consent_version: CONSENT_VERSION }
    ];

    for (const consent of consents) {
      await supabase.from('user_consent').upsert(consent);
    }

    setOpen(false);
    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Nutzungshinweis - Betriebsinterne Anwendung
          </DialogTitle>
          <DialogDescription>
            Bitte lesen Sie die folgenden Hinweise sorgfältig durch und bestätigen Sie diese.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Terms of Use */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Nutzungsbedingungen
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Diese Anwendung ist ausschließlich für die <strong>betriebsinterne Nutzung</strong> bestimmt.</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Alle Analysen und Daten dienen ausschließlich geschäftlichen Zwecken</li>
                  <li>Die Weitergabe von Zugangsdaten ist nicht gestattet</li>
                  <li>Analysen externer Websites müssen datenschutzkonform erfolgen</li>
                  <li>Die Nutzung erfolgt auf eigene Verantwortung</li>
                </ul>
              </div>
            </div>

            {/* Data Processing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Database className="h-5 w-5 text-primary" />
                Datenverarbeitung
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Folgende Daten werden verarbeitet:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong>Benutzerdaten:</strong> E-Mail-Adresse, Login-Zeitpunkte</li>
                  <li><strong>Analysedaten:</strong> URLs, Firmendaten, Bewertungen, Analysergebnisse</li>
                  <li><strong>Technische Daten:</strong> IP-Adresse, Browser-Informationen</li>
                  <li><strong>AI-Nutzung:</strong> Eingaben und Ergebnisse von AI-Analysen werden protokolliert</li>
                </ul>
                <p className="pt-2">Die Daten werden auf verschlüsselten Servern (Supabase) gespeichert und nach <strong>12 Monaten automatisch gelöscht</strong>.</p>
              </div>
            </div>

            {/* Audit Logging */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Aktivitätsprotokollierung
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Zur Nachvollziehbarkeit und Compliance werden alle Aktivitäten protokolliert:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Erstellung, Bearbeitung und Löschung von Analysen</li>
                  <li>Export von Berichten</li>
                  <li>AI-Nutzung und generierte Inhalte</li>
                  <li>Zeitstempel und Benutzeridentität</li>
                </ul>
                <p className="pt-2 font-semibold">Diese Protokolle dienen der Sicherheit und werden für 2 Jahre aufbewahrt.</p>
              </div>
            </div>

            {/* AI Act Compliance */}
            <div className="space-y-3 border-t pt-4">
              <div className="font-semibold text-foreground">AI-Act Konformität</div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Diese Anwendung nutzt AI-Technologien zur Analyse und Bewertung:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>AI-generierte Inhalte sind als solche gekennzeichnet</li>
                  <li>Alle AI-Bewertungen erfordern eine manuelle Überprüfung</li>
                  <li>AI-Entscheidungen sind nachvollziehbar protokolliert</li>
                  <li>Finale Entscheidungen liegen beim Menschen (Human-in-the-Loop)</li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              Ich habe die <strong>Nutzungsbedingungen</strong> gelesen und akzeptiere diese.
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="data" 
              checked={acceptedDataProcessing}
              onCheckedChange={(checked) => setAcceptedDataProcessing(checked as boolean)}
            />
            <Label htmlFor="data" className="text-sm leading-relaxed cursor-pointer">
              Ich bin über die <strong>Datenverarbeitung</strong> informiert und stimme dieser zu.
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="audit" 
              checked={acceptedAuditLogging}
              onCheckedChange={(checked) => setAcceptedAuditLogging(checked as boolean)}
            />
            <Label htmlFor="audit" className="text-sm leading-relaxed cursor-pointer">
              Ich verstehe, dass meine Aktivitäten <strong>protokolliert</strong> werden.
            </Label>
          </div>

          <Button 
            onClick={handleAccept}
            disabled={!acceptedTerms || !acceptedDataProcessing || !acceptedAuditLogging}
            className="w-full"
          >
            Alle Hinweise akzeptieren und fortfahren
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
