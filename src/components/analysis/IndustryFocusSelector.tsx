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
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Filter className="w-4 h-4 text-yellow-400" />
          Branchen-Schwerpunkte
        </div>
        <button
          onClick={handleSelectAll}
          className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          {selectedFocusAreas.length === focusAreas.length ? 'Alle abwählen' : 'Alle auswählen'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Wählen Sie Teilbereiche aus, um die Keyword-Analyse auf diese Schwerpunkte zu fokussieren.
      </p>
      <div className="flex flex-wrap gap-3">
        {focusAreas.map((area) => (
          <label
            key={area.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
              selectedFocusAreas.includes(area.id)
                ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300'
                : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Checkbox
              checked={selectedFocusAreas.includes(area.id)}
              onCheckedChange={() => handleToggle(area.id)}
              className="h-3.5 w-3.5 border-gray-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
            />
            {area.label}
          </label>
        ))}
      </div>
      {selectedFocusAreas.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          {selectedFocusAreas.length} von {focusAreas.length} Schwerpunkt{selectedFocusAreas.length !== 1 ? 'en' : ''} ausgewählt
        </p>
      )}
    </div>
  );
};

export default IndustryFocusSelector;
