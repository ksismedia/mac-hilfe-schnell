
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSavedAnalyses, SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { Save, FolderOpen, Trash2, Download, Calendar, Globe } from 'lucide-react';

interface SavedAnalysesManagerProps {
  onLoadAnalysis: (analysis: SavedAnalysis) => void;
}

// Industry names mapping
const industryNames = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro'
};

const SavedAnalysesManager: React.FC<SavedAnalysesManagerProps> = ({ onLoadAnalysis }) => {
  const { savedAnalyses, deleteAnalysis, exportAnalysis } = useSavedAnalyses();
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLoadAnalysis = (analysis: SavedAnalysis) => {
    onLoadAnalysis(analysis);
    setIsOpen(false);
  };

  if (savedAnalyses.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            Gespeicherte Analysen
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gespeicherte Analysen</DialogTitle>
            <DialogDescription>
              Sie haben noch keine Analysen gespeichert.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Analysen gespeichert.</p>
            <p className="text-sm">Speichern Sie Ihre erste Analyse, um sie hier zu sehen.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-2" />
          Gespeicherte Analysen ({savedAnalyses.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gespeicherte Analysen verwalten</DialogTitle>
          <DialogDescription>
            Laden oder löschen Sie Ihre gespeicherten Analysen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {savedAnalyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{analysis.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4" />
                      <span>{analysis.businessData.url}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Gespeichert: {formatDate(analysis.savedAt)}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {industryNames[analysis.businessData.industry]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>{analysis.businessData.address}</p>
                    <p className="mt-1">
                      Manuelle Eingaben: {Object.values(analysis.manualData).filter(Boolean).length > 0 ? 'Ja' : 'Nein'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportAnalysis(analysis.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Analyse löschen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Möchten Sie die Analyse "{analysis.name}" wirklich löschen? 
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteAnalysis(analysis.id)}>
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={() => handleLoadAnalysis(analysis)}>
                      Laden
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavedAnalysesManager;
