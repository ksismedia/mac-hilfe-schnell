
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Star } from 'lucide-react';
import { ManualCompetitor } from '@/hooks/useManualData';

interface ManualCompetitorInputProps {
  competitors: ManualCompetitor[];
  onCompetitorsChange: (competitors: ManualCompetitor[]) => void;
}

const ManualCompetitorInput: React.FC<ManualCompetitorInputProps> = ({
  competitors,
  onCompetitorsChange
}) => {
  const [newCompetitor, setNewCompetitor] = useState<Partial<ManualCompetitor>>({
    name: '',
    rating: 4.0,
    reviews: 0,
    distance: '',
    services: []
  });
  const [servicesInput, setServicesInput] = useState('');

  const addCompetitor = () => {
    console.log('DEBUG: addCompetitor called', { newCompetitor, servicesInput });
    
    try {
      if (!newCompetitor.name || !newCompetitor.distance) {
        console.log('DEBUG: Missing required fields');
        return;
      }

      const rating = typeof newCompetitor.rating === 'number' ? newCompetitor.rating : parseFloat(String(newCompetitor.rating)) || 4.0;
      const reviews = typeof newCompetitor.reviews === 'number' ? newCompetitor.reviews : parseInt(String(newCompetitor.reviews)) || 0;
      
      console.log('DEBUG: Parsed values', { rating, reviews });
      
      if (isNaN(rating) || rating < 1 || rating > 5) {
        console.error('Invalid rating value:', rating, 'from:', newCompetitor.rating);
        return;
      }
      
      if (isNaN(reviews) || reviews < 0) {
        console.error('Invalid reviews value:', reviews, 'from:', newCompetitor.reviews);
        return;
      }
      
      const competitor: ManualCompetitor = {
        name: String(newCompetitor.name).trim(),
        rating: rating,
        reviews: reviews,
        distance: String(newCompetitor.distance).trim(),
        services: servicesInput ? servicesInput.split(',').map(s => s.trim()).filter(s => s.length > 0) : []
      };
      
      console.log('DEBUG: Created competitor object', competitor);
      console.log('DEBUG: Current competitors before update', competitors);
      
      const newCompetitors = [...competitors, competitor];
      console.log('DEBUG: New competitors array', newCompetitors);
      
      onCompetitorsChange(newCompetitors);
      
      // Reset form
      setNewCompetitor({
        name: '',
        rating: 4.0,
        reviews: 0,
        distance: '',
        services: []
      });
      setServicesInput('');
      
    } catch (error) {
      console.error('Error adding competitor:', error);
    }
  };

  const removeCompetitor = (index: number) => {
    const updated = competitors.filter((_, i) => i !== index);
    onCompetitorsChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manuelle Konkurrenten-Eingabe</CardTitle>
        <CardDescription>
          Fügen Sie bekannte lokale Konkurrenten hinzu, wenn die automatische Suche nicht ausreichend ist
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bestehende Konkurrenten */}
        {competitors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Hinzugefügte Konkurrenten ({competitors.length})</h4>
            {competitors.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{competitor.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm">{competitor.rating}</span>
                      <span className="text-xs text-gray-500">({competitor.reviews} Bewertungen)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{competitor.distance}</span>
                    {competitor.services && competitor.services.length > 0 && (
                      <div className="flex gap-1">
                        {competitor.services.slice(0, 2).map((service, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {competitor.services.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{competitor.services.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCompetitor(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Neuen Konkurrenten hinzufügen */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium">Neuen Konkurrenten hinzufügen</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="comp-name">Firmenname *</Label>
              <Input
                id="comp-name"
                value={newCompetitor.name || ''}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Mustermann GmbH"
              />
            </div>
            
            <div>
              <Label htmlFor="comp-distance">Entfernung *</Label>
              <Input
                id="comp-distance"
                value={newCompetitor.distance || ''}
                onChange={(e) => setNewCompetitor(prev => ({ ...prev, distance: e.target.value }))}
                placeholder="z.B. 2,5 km"
              />
            </div>
            
            <div>
              <Label htmlFor="comp-rating">Bewertung (1-5) *</Label>
              <Input
                id="comp-rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={newCompetitor.rating || 4.0}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = parseFloat(value);
                  if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
                    setNewCompetitor(prev => ({ ...prev, rating: parsed }));
                  } else if (value === '') {
                    setNewCompetitor(prev => ({ ...prev, rating: 4.0 }));
                  }
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="comp-reviews">Anzahl Bewertungen</Label>
              <Input
                id="comp-reviews"
                type="number"
                min="0"
                value={newCompetitor.reviews || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = parseInt(value);
                  if (!isNaN(parsed) && parsed >= 0) {
                    setNewCompetitor(prev => ({ ...prev, reviews: parsed }));
                  } else if (value === '') {
                    setNewCompetitor(prev => ({ ...prev, reviews: 0 }));
                  }
                }}
                placeholder="z.B. 25"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="comp-services">Leistungen (optional)</Label>
            <Textarea
              id="comp-services"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              placeholder="Komma-getrennt, z.B. Heizung, Sanitär, Klimatechnik"
              className="h-20"
            />
          </div>
          
          <Button onClick={addCompetitor} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Konkurrenten hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualCompetitorInput;
