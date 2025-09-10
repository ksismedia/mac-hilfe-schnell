
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, Calculator } from 'lucide-react';

interface HourlyRateData {
  meisterRate: number;
  facharbeiterRate: number;
  azubiRate: number;
  helferRate: number;
}

interface HourlyRateInputProps {
  data?: HourlyRateData;
  onDataChange: (data: HourlyRateData) => void;
}

const HourlyRateInput: React.FC<HourlyRateInputProps> = ({ data, onDataChange }) => {
  const [meisterRate, setMeisterRate] = React.useState(data?.meisterRate?.toString() || '');
  const [facharbeiterRate, setFacharbeiterRate] = React.useState(data?.facharbeiterRate?.toString() || '');
  const [azubiRate, setAzubiRate] = React.useState(data?.azubiRate?.toString() || '');
  const [helferRate, setHelferRate] = React.useState(data?.helferRate?.toString() || '');

  const handleSave = () => {
    const meisterRateNum = parseFloat(meisterRate) || 0;
    const facharbeiterRateNum = parseFloat(facharbeiterRate) || 0;
    const azubiRateNum = parseFloat(azubiRate) || 0;
    const helferRateNum = parseFloat(helferRate) || 0;
    
    onDataChange({
      meisterRate: meisterRateNum,
      facharbeiterRate: facharbeiterRateNum,
      azubiRate: azubiRateNum,
      helferRate: helferRateNum
    });
  };

  const calculateAverageRate = () => {
    const rates = [
      parseFloat(meisterRate) || 0,
      parseFloat(facharbeiterRate) || 0,
      parseFloat(azubiRate) || 0,
      parseFloat(helferRate) || 0
    ].filter(rate => rate > 0);
    
    if (rates.length === 0) return 0;
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  };

  const averageRate = calculateAverageRate();

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
            <Label htmlFor="meisterRate">Stundensatz Meister (€)</Label>
            <Input
              id="meisterRate"
              type="number"
              step="0.01"
              placeholder="85.00"
              value={meisterRate}
              onChange={(e) => setMeisterRate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facharbeiterRate">Stundensatz Facharbeiter (€)</Label>
            <Input
              id="facharbeiterRate"
              type="number"
              step="0.01"
              placeholder="65.00"
              value={facharbeiterRate}
              onChange={(e) => setFacharbeiterRate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="azubiRate">Stundensatz Azubi (€)</Label>
            <Input
              id="azubiRate"
              type="number"
              step="0.01"
              placeholder="25.00"
              value={azubiRate}
              onChange={(e) => setAzubiRate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="helferRate">Stundensatz Helfer (€)</Label>
            <Input
              id="helferRate"
              type="number"
              step="0.01"
              placeholder="35.00"
              value={helferRate}
              onChange={(e) => setHelferRate(e.target.value)}
            />
          </div>
        </div>

        {averageRate > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Stundensatz-Übersicht</span>
            </div>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                <strong>Durchschnittlicher Stundensatz:</strong>{' '}
                <Badge variant="default">
                  {averageRate.toFixed(2)} €
                </Badge>
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {parseFloat(meisterRate) > 0 && (
                  <p><span className="font-medium">Meister:</span> {meisterRate} €</p>
                )}
                {parseFloat(facharbeiterRate) > 0 && (
                  <p><span className="font-medium">Facharbeiter:</span> {facharbeiterRate} €</p>
                )}
                {parseFloat(azubiRate) > 0 && (
                  <p><span className="font-medium">Azubi:</span> {azubiRate} €</p>
                )}
                {parseFloat(helferRate) > 0 && (
                  <p><span className="font-medium">Helfer:</span> {helferRate} €</p>
                )}
              </div>
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
