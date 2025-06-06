
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

interface CompetitorServicesInputProps {
  competitorName: string;
  existingServices: string[];
  onServicesChange: (services: string[]) => void;
}

const CompetitorServicesInput: React.FC<CompetitorServicesInputProps> = ({
  competitorName,
  existingServices,
  onServicesChange
}) => {
  const [newService, setNewService] = useState('');
  const [services, setServices] = useState<string[]>(existingServices);

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      const updatedServices = [...services, newService.trim()];
      setServices(updatedServices);
      onServicesChange(updatedServices);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    onServicesChange(updatedServices);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addService();
    }
  };

  return (
    <Card className="mt-3">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Leistungen von {competitorName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="z.B. Heizungsinstallation, Badmodernisierung..."
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-sm"
            />
            <Button onClick={addService} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {services.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {services.map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                  <button
                    onClick={() => removeService(index)}
                    className="ml-2 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {services.length === 0 && (
            <p className="text-xs text-gray-500">
              Keine Leistungen eingetragen. Fügen Sie die öffentlich sichtbaren Leistungen hinzu.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorServicesInput;
