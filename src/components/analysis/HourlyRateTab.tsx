import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Euro, AlertTriangle } from 'lucide-react';
import HourlyRateInput from './HourlyRateInput';
import { useManualData, HourlyRateData } from '@/hooks/useManualData';

interface HourlyRateTabProps {
  hourlyRateData: HourlyRateData | null;
  updateHourlyRateData: (data: HourlyRateData | null) => void;
}

const HourlyRateTab: React.FC<HourlyRateTabProps> = ({ hourlyRateData, updateHourlyRateData }) => {

  const handleDataChange = (data: HourlyRateData) => {
    updateHourlyRateData(data);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Wichtig:</strong> Bewertungen und Reports werden nur generiert, wenn ein Stundensatz eingegeben wird. 
          Dies ermöglicht eine realistische Kostenkalkulation für Verbesserungsmaßnahmen.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Stundensatz-Konfiguration
          </CardTitle>
          <CardDescription>
            Geben Sie Ihren Stundensatz für die Kalkulation und Bewertung ein. 
            Diese Daten werden für die Kostenanalyse in den Reports verwendet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HourlyRateInput 
            data={hourlyRateData || undefined}
            onDataChange={handleDataChange}
          />
          
          {hourlyRateData && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Euro className="h-4 w-4" />
                <span className="font-semibold">Stundensatz konfiguriert</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Ihr Stundensatz von {hourlyRateData.ownRate}€/h wurde gespeichert. 
                Reports und Bewertungen können jetzt vollständig generiert werden.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HourlyRateTab;