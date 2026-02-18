import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { industryFocusAreas } from '@/data/industryFocusAreas';
import { Filter } from 'lucide-react';

interface IndustryFocusSelectorProps {
  industry: string;
  selectedFocusAreas: string[];
  onFocusAreasChange: (focusAreas: string[]) => void;
}

const IndustryFocusSelector: React.FC<IndustryFocusSelectorProps> = ({
  industry,
  selectedFocusAreas,
  onFocusAreasChange,
}) => {
  const focusAreas = industryFocusAreas[industry] || [];

  if (focusAreas.length === 0) return null;

  const handleToggle = (id: string) => {
    if (selectedFocusAreas.includes(id)) {
      onFocusAreasChange(selectedFocusAreas.filter(a => a !== id));
    } else {
      onFocusAreasChange([...selectedFocusAreas, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFocusAreas.length === focusAreas.length) {
      onFocusAreasChange([]);
    } else {
      onFocusAreasChange(focusAreas.map(a => a.id));
    }
  };

  return (
    <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Filter className="w-5 h-5 text-accent" />
          🎯 Branchen-Schwerpunkte für Keyword-Analyse
        </div>
        <button
          onClick={handleSelectAll}
          className="text-xs text-accent hover:text-accent/80 transition-colors underline"
        >
          {selectedFocusAreas.length === focusAreas.length ? 'Alle abwählen' : 'Alle auswählen'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Wählen Sie Teilbereiche aus, um die Keyword-Analyse auf diese Schwerpunkte zu fokussieren.
      </p>
      <div className="flex flex-wrap gap-3">
        {focusAreas.map((area) => (
          <label
            key={area.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
              selectedFocusAreas.includes(area.id)
                ? 'bg-accent/20 border border-accent/50 text-foreground font-medium'
                : 'bg-muted border border-border text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Checkbox
              checked={selectedFocusAreas.includes(area.id)}
              onCheckedChange={() => handleToggle(area.id)}
              className="h-3.5 w-3.5 border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            {area.label}
          </label>
        ))}
      </div>
      {selectedFocusAreas.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedFocusAreas.length} von {focusAreas.length} Schwerpunkt{selectedFocusAreas.length !== 1 ? 'en' : ''} ausgewählt
        </p>
      )}
    </div>
  );
};

export default IndustryFocusSelector;
