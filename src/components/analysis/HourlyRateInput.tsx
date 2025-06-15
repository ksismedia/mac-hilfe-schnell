
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, Calculator } from 'lucide-react';

interface HourlyRateData {
  ownRate: number;
  regionAverage: number;
}

interface HourlyRateInputProps {
  data?: HourlyRateData;
  onDataChange: (data: HourlyRateData) => void;
}

const HourlyRateInput: React.FC<HourlyRateInputProps> = ({ data, onDataChange }) => {
  const [ownRate, setOwnRate] = React.useState(data?.ownRate?.toString() || '');
  const [regionAverage, setRegionAverage] = React.useState(data?.regionAverage?.toString() || '');

  const handleSave = () => {
    const ownRateNum = parseFloat(ownRate) || 0;
    const regionAverageNum = parseFloat(regionAverage) || 0;
    
    onDataChange({
      ownRate: ownRateNum,
      regionAverage: regionAverageNum
    });
  };

  const calculateComparison = () => {
    const own = parseFloat(ownRate) || 0;
    const avg = parseFloat(regionAverage) || 0;
    if (avg === 0) return null;
    
    const difference = ((own - avg) / avg) * 100;
    return difference;
  };

  const comparison = calculateComparison();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Stundensatz-Analyse
        </CardTitle>
        <CardDescription>
          Vergleichen Sie Ihren Stundensatz mit dem regionalen Durchschnitt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownRate">Ihr Stundensatz (€)</Label>
            <Input
              id="ownRate"
              type="number"
              step="0.01"
              placeholder="75.00"
              value={ownRate}
              onChange={(e) => setOwnRate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="regionAverage">Regionaler Durchschnitt (€)</Label>
            <Input
              id="regionAverage"
              type="number"
              step="0.01"
              placeholder="65.00"
              value={regionAverage}
              onChange={(e) => setRegionAverage(e.target.value)}
            />
          </div>
        </div>

        {comparison !== null && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Vergleichsanalyse</span>
            </div>
            <div className="text-sm text-blue-700">
              <p>
                Ihr Stundensatz liegt{' '}
                <Badge variant={comparison > 0 ? "default" : comparison < -10 ? "destructive" : "secondary"}>
                  {comparison > 0 ? '+' : ''}{comparison.toFixed(1)}%
                </Badge>{' '}
                {comparison > 0 ? 'über' : 'unter'} dem regionalen Durchschnitt
              </p>
              {comparison > 15 && (
                <p className="mt-1 text-amber-700">
                  ⚠️ Möglicherweise zu hoch - könnte Kunden abschrecken
                </p>
              )}
              {comparison < -15 && (
                <p className="mt-1 text-red-700">
                  ⚠️ Deutlich unter Durchschnitt - Preissteigerung prüfen
                </p>
              )}
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          <TrendingUp className="h-4 w-4 mr-2" />
          Stundensatz-Daten speichern
        </Button>
      </CardContent>
    </Card>
  );
};

export default HourlyRateInput;
