
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Euro, TrendingUp, Calculator } from 'lucide-react';
import { getScoreTextDescription } from '@/utils/scoreTextUtils';

interface HourlyRateData {
  meisterRate: number;
  facharbeiterRate: number;
  azubiRate: number;
  helferRate: number;
  serviceRate: number;
  installationRate: number;
  // Regional rates for comparison
  regionalMeisterRate: number;
  regionalFacharbeiterRate: number;
  regionalAzubiRate: number;
  regionalHelferRate: number;
  regionalServiceRate: number;
  regionalInstallationRate: number;
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
  const [serviceRate, setServiceRate] = React.useState(data?.serviceRate?.toString() || '');
  const [installationRate, setInstallationRate] = React.useState(data?.installationRate?.toString() || '');
  
  // Regional rates
  const [regionalMeisterRate, setRegionalMeisterRate] = React.useState(data?.regionalMeisterRate?.toString() || '');
  const [regionalFacharbeiterRate, setRegionalFacharbeiterRate] = React.useState(data?.regionalFacharbeiterRate?.toString() || '');
  const [regionalAzubiRate, setRegionalAzubiRate] = React.useState(data?.regionalAzubiRate?.toString() || '');
  const [regionalHelferRate, setRegionalHelferRate] = React.useState(data?.regionalHelferRate?.toString() || '');
  const [regionalServiceRate, setRegionalServiceRate] = React.useState(data?.regionalServiceRate?.toString() || '');
  const [regionalInstallationRate, setRegionalInstallationRate] = React.useState(data?.regionalInstallationRate?.toString() || '');

  const handleSave = () => {
    const meisterRateNum = parseFloat(meisterRate) || 0;
    const facharbeiterRateNum = parseFloat(facharbeiterRate) || 0;
    const azubiRateNum = parseFloat(azubiRate) || 0;
    const helferRateNum = parseFloat(helferRate) || 0;
    const serviceRateNum = parseFloat(serviceRate) || 0;
    const installationRateNum = parseFloat(installationRate) || 0;
    
    const regionalMeisterRateNum = parseFloat(regionalMeisterRate) || 0;
    const regionalFacharbeiterRateNum = parseFloat(regionalFacharbeiterRate) || 0;
    const regionalAzubiRateNum = parseFloat(regionalAzubiRate) || 0;
    const regionalHelferRateNum = parseFloat(regionalHelferRate) || 0;
    const regionalServiceRateNum = parseFloat(regionalServiceRate) || 0;
    const regionalInstallationRateNum = parseFloat(regionalInstallationRate) || 0;
    
    onDataChange({
      meisterRate: meisterRateNum,
      facharbeiterRate: facharbeiterRateNum,
      azubiRate: azubiRateNum,
      helferRate: helferRateNum,
      serviceRate: serviceRateNum,
      installationRate: installationRateNum,
      regionalMeisterRate: regionalMeisterRateNum,
      regionalFacharbeiterRate: regionalFacharbeiterRateNum,
      regionalAzubiRate: regionalAzubiRateNum,
      regionalHelferRate: regionalHelferRateNum,
      regionalServiceRate: regionalServiceRateNum,
      regionalInstallationRate: regionalInstallationRateNum
    });
  };

  const calculateComparisonScore = () => {
    const companyRates = [meisterRate, facharbeiterRate, azubiRate, helferRate, serviceRate, installationRate]
      .map(rate => parseFloat(rate) || 0).filter(rate => rate > 0);
    const regionalRates = [regionalMeisterRate, regionalFacharbeiterRate, regionalAzubiRate, regionalHelferRate, regionalServiceRate, regionalInstallationRate]
      .map(rate => parseFloat(rate) || 0).filter(rate => rate > 0);
    
    if (companyRates.length === 0 || regionalRates.length === 0) return null;
    
    const companyAvg = companyRates.reduce((sum, rate) => sum + rate, 0) / companyRates.length;
    const regionalAvg = regionalRates.reduce((sum, rate) => sum + rate, 0) / regionalRates.length;
    
    // Score calculation with more realistic thresholds
    const ratio = companyAvg / regionalAvg;
    const percentDiff = ((ratio - 1) * 100);
    
    let score;
    let positioning;
    
    // More forgiving scoring system
    if (ratio >= 0.85 && ratio <= 1.15) {
      // Within ±15% = excellent (85-100 points)
      score = 100 - Math.abs(percentDiff) * 1.5;
      positioning = 'marktkonform';
    } else if (ratio >= 0.7 && ratio < 0.85) {
      // 15-30% below = okay (60-85 points)
      score = 85 - ((0.85 - ratio) * 166);
      positioning = 'günstig-positioniert';
    } else if (ratio > 1.15 && ratio <= 1.3) {
      // 15-30% above = okay (60-85 points)
      score = 85 - ((ratio - 1.15) * 166);
      positioning = 'premium-positioniert';
    } else if (ratio < 0.7) {
      // More than 30% below = needs attention (40-60 points)
      score = Math.max(40, 60 - ((0.7 - ratio) * 100));
      positioning = 'deutlich-unter-markt';
    } else {
      // More than 30% above = may impact competitiveness (40-60 points)
      score = Math.max(40, 60 - ((ratio - 1.3) * 100));
      positioning = 'deutlich-über-markt';
    }
    
    return {
      score: Math.round(Math.max(40, Math.min(100, score))),
      companyAvg,
      regionalAvg,
      ratio,
      percentDiff: percentDiff.toFixed(1),
      positioning
    };
  };

  const comparisonResult = calculateComparisonScore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Stundensatz-Analyse & Wettbewerbsvergleich
        </CardTitle>
        <CardDescription>
          Vergleichen Sie Ihren Stundensatz mit dem regionalen Durchschnitt und erhalten Sie eine Bewertung Ihrer Preispositionierung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Rates Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            🏢 Ihre Stundensätze
          </h4>
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

            <div className="space-y-2">
              <Label htmlFor="serviceRate">Stundensatz Service (€)</Label>
              <Input
                id="serviceRate"
                type="number"
                step="0.01"
                placeholder="95.00"
                value={serviceRate}
                onChange={(e) => setServiceRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installationRate">Stundensatz Installation (€)</Label>
              <Input
                id="installationRate"
                type="number"
                step="0.01"
                placeholder="75.00"
                value={installationRate}
                onChange={(e) => setInstallationRate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Regional Rates Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            📍 Regional üblicher Stundensatz
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regionalMeisterRate">Regional Meister (€)</Label>
              <Input
                id="regionalMeisterRate"
                type="number"
                step="0.01"
                placeholder="80.00"
                value={regionalMeisterRate}
                onChange={(e) => setRegionalMeisterRate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="regionalFacharbeiterRate">Regional Facharbeiter (€)</Label>
              <Input
                id="regionalFacharbeiterRate"
                type="number"
                step="0.01"
                placeholder="60.00"
                value={regionalFacharbeiterRate}
                onChange={(e) => setRegionalFacharbeiterRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionalAzubiRate">Regional Azubi (€)</Label>
              <Input
                id="regionalAzubiRate"
                type="number"
                step="0.01"
                placeholder="22.00"
                value={regionalAzubiRate}
                onChange={(e) => setRegionalAzubiRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionalHelferRate">Regional Helfer (€)</Label>
              <Input
                id="regionalHelferRate"
                type="number"
                step="0.01"
                placeholder="30.00"
                value={regionalHelferRate}
                onChange={(e) => setRegionalHelferRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionalServiceRate">Regional Service (€)</Label>
              <Input
                id="regionalServiceRate"
                type="number"
                step="0.01"
                placeholder="90.00"
                value={regionalServiceRate}
                onChange={(e) => setRegionalServiceRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regionalInstallationRate">Regional Installation (€)</Label>
              <Input
                id="regionalInstallationRate"
                type="number"
                step="0.01"
                placeholder="70.00"
                value={regionalInstallationRate}
                onChange={(e) => setRegionalInstallationRate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-lg">Wettbewerbsanalyse</span>
              </div>
              <Badge variant={comparisonResult.score >= 85 ? "secondary" : comparisonResult.score >= 70 ? "default" : "destructive"}>
                Score: {comparisonResult.score}/100
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Ihr Durchschnittssatz</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{comparisonResult.companyAvg.toFixed(2)}€/h</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Regionaler Durchschnitt</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{comparisonResult.regionalAvg.toFixed(2)}€/h</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Preisdifferenz</span>
                <span className={`text-lg font-bold ${
                  Math.abs(parseFloat(comparisonResult.percentDiff)) <= 15 ? 'text-green-600 dark:text-green-400' : 
                  Math.abs(parseFloat(comparisonResult.percentDiff)) <= 25 ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-orange-600 dark:text-orange-400'
                }`}>
                  {parseFloat(comparisonResult.percentDiff) > 0 ? '+' : ''}{comparisonResult.percentDiff}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {
                  comparisonResult.positioning === 'marktkonform' ? '✓ Ihre Preise liegen im marktüblichen Bereich (±15%)' :
                  comparisonResult.positioning === 'günstig-positioniert' ? '↓ Ihre Preise liegen moderat unter dem Durchschnitt' :
                  comparisonResult.positioning === 'premium-positioniert' ? '↑ Ihre Preise liegen im Premium-Segment' :
                  comparisonResult.positioning === 'deutlich-unter-markt' ? '⚠ Ihre Preise liegen deutlich unter dem Markt' :
                  '⚠ Ihre Preise liegen deutlich über dem Markt'
                }
              </p>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium mb-2">💡 Empfehlung</p>
              <p className="text-sm">
                {
                  comparisonResult.score >= 85 ? 
                    'Ihre Preisstrategie ist gut positioniert. Sie liegen nahe am regionalen Durchschnitt und sind damit wettbewerbsfähig.' :
                  comparisonResult.score >= 70 ? 
                    'Ihre Preise weichen moderat ab. Prüfen Sie, ob dies Ihrer gewünschten Marktstrategie entspricht.' :
                  comparisonResult.ratio < 0.85 ?
                    'Ihre Preise liegen deutlich unter dem Markt. Prüfen Sie, ob Sie Potenzial für Preiserhöhungen haben.' :
                    'Ihre Preise liegen im Premium-Bereich. Stellen Sie sicher, dass Ihre Leistung dies rechtfertigt.'
                }
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          <TrendingUp className="h-4 w-4 mr-2" />
          Stundensatz-Analyse speichern
        </Button>
      </CardContent>
    </Card>
  );
};

export default HourlyRateInput;
