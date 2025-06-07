
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { ManualCompetitor } from '@/hooks/useManualData';

interface ManualCompetitorInputProps {
  onAddCompetitor: (competitor: ManualCompetitor) => void;
}

const ManualCompetitorInput: React.FC<ManualCompetitorInputProps> = ({ onAddCompetitor }) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('');
  const [reviews, setReviews] = useState('');
  const [distance, setDistance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const competitor: ManualCompetitor = {
      name: name.trim(),
      rating: parseFloat(rating) || 4.0,
      reviews: parseInt(reviews) || 0,
      distance: distance.trim() || '< 10 km'
    };
    
    onAddCompetitor(competitor);
    
    // Reset form
    setName('');
    setRating('');
    setReviews('');
    setDistance('');
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Konkurrenten manuell hinzufügen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="competitor-name" className="text-xs">Firmenname *</Label>
              <Input
                id="competitor-name"
                placeholder="z.B. Sanitär Müller GmbH"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm"
                required
              />
            </div>
            <div>
              <Label htmlFor="competitor-distance" className="text-xs">Entfernung</Label>
              <Input
                id="competitor-distance"
                placeholder="z.B. 2.5 km"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="competitor-rating" className="text-xs">Bewertung (1-5)</Label>
              <Input
                id="competitor-rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                placeholder="4.2"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="competitor-reviews" className="text-xs">Anzahl Bewertungen</Label>
              <Input
                id="competitor-reviews"
                type="number"
                min="0"
                placeholder="25"
                value={reviews}
                onChange={(e) => setReviews(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          
          <Button type="submit" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Konkurrent hinzufügen
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualCompetitorInput;
