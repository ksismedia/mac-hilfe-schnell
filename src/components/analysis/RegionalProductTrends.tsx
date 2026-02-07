import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Loader2, RefreshCw, Info, ExternalLink, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductTrend {
  trend: string;
  description: string;
  relevance: 'high' | 'medium' | 'low';
  source?: string;
}

interface TrendResponse {
  trends: ProductTrend[];
  summary: string;
  generatedAt: string;
  region: string;
  industry: string;
}

interface RegionalProductTrendsProps {
  industry: string;
  region: string;
  companyName?: string;
  showInReport: boolean;
  onToggleShowInReport: (show: boolean) => void;
  onTrendsLoaded?: (trends: TrendResponse | null) => void;
}

const RegionalProductTrends: React.FC<RegionalProductTrendsProps> = ({
  industry,
  region,
  companyName,
  showInReport,
  onToggleShowInReport,
  onTrendsLoaded,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [trends, setTrends] = useState<TrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrends = async () => {
    if (!industry || !region) {
      toast({
        title: 'Fehlende Daten',
        description: 'Branche und Region sind erforderlich.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching regional trends for:', { industry, region });
      
      const { data, error: fnError } = await supabase.functions.invoke('regional-product-trends', {
        body: { industry, region, companyName },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Received trends:', data);
      setTrends(data);
      onTrendsLoaded?.(data);
      
      toast({
        title: 'Trends geladen',
        description: `${data.trends.length} Produkttrends für ${region} gefunden.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      console.error('Error fetching trends:', err);
      setError(message);
      toast({
        title: 'Fehler',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRelevanceBadge = (relevance: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    const labels = {
      high: 'Hohe Relevanz',
      medium: 'Mittlere Relevanz',
      low: 'Geringe Relevanz',
    };
    return (
      <Badge variant="outline" className={styles[relevance]}>
        {labels[relevance]}
      </Badge>
    );
  };

  // Extract city/region from address
  const displayRegion = region.split(',')[0] || region;

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-700">
            Regionale Produkttrends
          </CardTitle>
          <div className="flex items-center gap-4">
            {trends && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-trends-report"
                  checked={showInReport}
                  onCheckedChange={(checked) => onToggleShowInReport(checked === true)}
                />
                <Label htmlFor="show-trends-report" className="text-sm font-medium cursor-pointer">
                  Im Report anzeigen
                </Label>
              </div>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Aktuelle Markttrends für {displayRegion} in der {industry}-Branche
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!trends && !isLoading && (
          <Alert className="bg-purple-50 border-purple-200">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              Klicken Sie auf "Trends abrufen", um aktuelle Produkttrends und 
              Marktentwicklungen für Ihre Region zu analysieren. Die Daten werden 
              über die Perplexity AI abgerufen.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={fetchTrends} 
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analysiere...
              </>
            ) : trends ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Trends aktualisieren
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Trends abrufen
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {trends && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">Zusammenfassung</h4>
              <p className="text-sm text-purple-800">{trends.summary}</p>
              <p className="text-xs text-purple-600 mt-2">
                Aktualisiert: {new Date(trends.generatedAt).toLocaleString('de-DE')}
              </p>
            </div>

            {/* Individual Trends */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Identifizierte Trends ({trends.trends.length})</h4>
              {trends.trends.map((trend, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-purple-100 rounded-lg bg-white hover:bg-purple-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="font-semibold text-purple-900">{trend.trend}</h5>
                    {getRelevanceBadge(trend.relevance)}
                  </div>
                  <p className="text-sm text-gray-700">{trend.description}</p>
                  {trend.source && (
                    <a 
                      href={trend.source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-purple-600 hover:text-purple-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Quelle
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalProductTrends;
