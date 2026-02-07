import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Globe, Building2, ExternalLink, Info } from 'lucide-react';
import { getNationalProvidersByIndustry, hasNationalProviders, NationalProvider } from '@/data/nationalProviders';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NationalProvidersSectionProps {
  industry: string;
  showNationalProviders: boolean;
  onToggleNationalProviders: (show: boolean) => void;
}

const NationalProvidersSection: React.FC<NationalProvidersSectionProps> = ({
  industry,
  showNationalProviders,
  onToggleNationalProviders
}) => {
  const providers = getNationalProvidersByIndustry(industry);
  
  // Keine Anzeige wenn keine Anbieter für die Branche vorhanden
  if (!hasNationalProviders(industry)) {
    return null;
  }

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-indigo-700">
            Überregionale Großanbieter
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-national-providers"
              checked={showNationalProviders}
              onCheckedChange={(checked) => onToggleNationalProviders(checked === true)}
            />
            <Label 
              htmlFor="show-national-providers" 
              className="text-sm font-medium cursor-pointer"
            >
              Im Report anzeigen
            </Label>
          </div>
        </div>
        <CardDescription>
          Bundesweite Anbieter zum Leistungsvergleich (fließen nicht in die Bewertung ein)
        </CardDescription>
      </CardHeader>
      
      {showNationalProviders && (
        <CardContent className="space-y-4">
          <Alert className="bg-indigo-50 border-indigo-200">
            <Info className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-indigo-800">
              Diese Anbieter dienen nur als Referenz für den Leistungsvergleich. 
              Sie werden <strong>nicht</strong> in die Wettbewerbsbewertung einbezogen, 
              da sie überregional agieren und keine direkten lokalen Konkurrenten sind.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {providers.map((provider, index) => (
              <ProviderCard key={index} provider={provider} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

interface ProviderCardProps {
  provider: NationalProvider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  return (
    <div className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-indigo-900">{provider.name}</span>
            <a 
              href={`https://${provider.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-sm text-indigo-700 mt-1">{provider.description}</p>
        </div>
        <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300">
          {provider.coverage}
        </Badge>
      </div>
      
      <div>
        <span className="text-sm font-medium text-indigo-800 mb-2 block">
          Leistungen ({provider.services.length}):
        </span>
        <div className="flex flex-wrap gap-1">
          {provider.services.map((service, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className="text-xs bg-white text-indigo-700 border-indigo-200"
            >
              {service}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NationalProvidersSection;
