import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { SafeBrowsingService, SafeBrowsingResult } from '@/services/SafeBrowsingService';
import { Progress } from '@/components/ui/progress';

interface SecurityCheckProps {
  url: string;
  onDataLoaded?: (result: SafeBrowsingResult) => void;
}

export const SecurityCheck = ({ url, onDataLoaded }: SecurityCheckProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafeBrowsingResult | null>(null);

  useEffect(() => {
    if (url) {
      checkSecurity();
    }
  }, [url]);

  const checkSecurity = async () => {
    setLoading(true);
    try {
      const data = await SafeBrowsingService.checkUrl(url);
      setResult(data);
      if (onDataLoaded) {
        onDataLoaded(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const status = result ? SafeBrowsingService.getSecurityStatusMessage(result) : null;
  const score = result ? SafeBrowsingService.calculateSecurityScore(result) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIcon = () => {
    if (loading) return <RefreshCw className="h-5 w-5 animate-spin" />;
    if (!result || result.error) return <Shield className="h-5 w-5" />;
    if (result.isSafe) return <ShieldCheck className="h-5 w-5 text-green-600" />;
    return <ShieldAlert className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle>Sicherheitsüberprüfung</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSecurity}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>
        <CardDescription>
          Überprüfung mit Google Safe Browsing API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !result && (
          <div className="text-center py-8 text-muted-foreground">
            Überprüfe Website-Sicherheit...
          </div>
        )}

        {result && (
          <>
            {/* Overall Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sicherheitsbewertung</span>
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                  {score}/100
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>

            {/* Status Alert */}
            {status && (
              <Alert variant={status.severity === 'error' ? 'destructive' : 'default'}>
                <AlertTitle className="flex items-center gap-2">
                  {status.severity === 'error' && <AlertTriangle className="h-4 w-4" />}
                  {status.title}
                </AlertTitle>
                <AlertDescription>{status.description}</AlertDescription>
              </Alert>
            )}

            {/* Threat Details */}
            {result.threats && result.threats.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Erkannte Bedrohungen:</h4>
                <div className="space-y-2">
                  {result.threats.map((threat, index) => (
                    <div
                      key={index}
                      className="p-3 border border-red-200 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="destructive">{threat.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {threat.platform}
                        </span>
                      </div>
                      <p className="text-sm text-red-800">{threat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safe Status Details */}
            {result.isSafe && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">
                      Website ist sicher
                    </h4>
                    <p className="text-sm text-green-800">
                      Diese Website wurde von Google Safe Browsing überprüft und es
                      wurden keine bekannten Sicherheitsbedrohungen gefunden.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Check Info */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Letzte Überprüfung: {new Date(result.checkedAt).toLocaleString('de-DE')}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
