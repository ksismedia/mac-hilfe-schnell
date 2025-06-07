
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface CompetitorServicesInputProps {
  competitorName: string;
  currentServices: string[];
  onServicesChange: (services: string[]) => void;
}

const CompetitorServicesInput: React.FC<CompetitorServicesInputProps> = ({
  competitorName,
  currentServices,
  onServicesChange
}) => {
  const [newService, setNewService] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const addService = () => {
    if (newService.trim() && !currentServices.includes(newService.trim())) {
      const updatedServices = [...currentServices, newService.trim()];
      onServicesChange(updatedServices);
      setNewService('');
    }
  };

  const removeService = (serviceToRemove: string) => {
    const updatedServices = currentServices.filter(service => service !== serviceToRemove);
    onServicesChange(updatedServices);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addService();
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Leistungen:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 px-2"
        >
          <Plus className="h-3 w-3" />
          Hinzufügen
        </Button>
      </div>

      {currentServices.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {currentServices.map((service, index) => (
            <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
              {service}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={() => removeService(service)}
              />
            </Badge>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Neue Leistung eingeben..."
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm h-8"
          />
          <Button 
            onClick={addService} 
            size="sm"
            disabled={!newService.trim()}
            className="h-8"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CompetitorServicesInput;
