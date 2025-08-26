
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSavedAnalyses, SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { Save, FolderOpen, Trash2, Download, Calendar, Globe, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

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
  'planungsbuero': 'Planungsbüro',
  'facility-management': 'Facility-Management & Gebäudereinigung'
};

const SavedAnalysesManager: React.FC<SavedAnalysesManagerProps> = ({ onLoadAnalysis }) => {
  const { savedAnalyses, deleteAnalysis, exportAnalysis, saveAnalysis } = useSavedAnalyses();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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

  const triggerFileUpload = () => {
    console.log('Triggering file upload...');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.addEventListener('change', async (event) => {
      console.log('File input change event triggered');
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        console.log('No file selected');
        return;
      }
      
      await handleFileUpload(file);
    });
    
    // Add to DOM temporarily
    document.body.appendChild(input);
    input.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(input);
    }, 1000);
  };

  const handleFileUpload = async (file: File) => {
    console.log('=== FILE UPLOAD START ===');
    console.log('File:', file);
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    
    setIsImporting(true);

    try {
      if (!file.name.endsWith('.json')) {
        throw new Error('Bitte wählen Sie eine .json Datei aus');
      }

      console.log('Reading file...');
      const text = await file.text();
      console.log('File content length:', text.length);
      console.log('File content preview:', text.substring(0, 200));
      
      if (!text.trim()) {
        throw new Error('Die Datei ist leer');
      }

      console.log('Parsing JSON...');
      const importedAnalysis = JSON.parse(text) as SavedAnalysis;
      console.log('Parsed analysis:', importedAnalysis);
      
      // Erweiterte Validierung
      const requiredFields = ['id', 'name', 'businessData', 'realData'];
      const missingFields = requiredFields.filter(field => !importedAnalysis[field as keyof SavedAnalysis]);
      
      if (missingFields.length > 0) {
        throw new Error(`Fehlende Felder in der JSON-Datei: ${missingFields.join(', ')}`);
      }

      if (!importedAnalysis.businessData.url || !importedAnalysis.businessData.industry) {
        throw new Error('Ungültige Geschäftsdaten in der JSON-Datei');
      }

      console.log('Validation passed, saving analysis...');
      
      // Generiere neue ID für Import
      const importName = `${importedAnalysis.name} (Importiert ${new Date().toLocaleTimeString()})`;
      
      const analysisId = saveAnalysis(
        importName,
        importedAnalysis.businessData,
        importedAnalysis.realData,
        importedAnalysis.manualData || {
          competitors: [],
          competitorServices: {},
          removedMissingServices: []
        }
      );

      console.log('Analysis saved with ID:', analysisId);

      // Sofort nach dem Import laden
      const newAnalysis = {
        id: analysisId,
        name: importName,
        businessData: importedAnalysis.businessData,
        realData: importedAnalysis.realData,
        manualData: importedAnalysis.manualData || {
          competitors: [],
          competitorServices: {},
          removedMissingServices: []
        },
        savedAt: new Date().toISOString()
      };

      // Sofort die importierte Analyse laden
      onLoadAnalysis(newAnalysis);
      setIsOpen(false);

      toast({
        title: "Import erfolgreich",
        description: `Analyse "${importName}" wurde erfolgreich importiert.`,
      });

      console.log('=== IMPORT COMPLETED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('=== IMPORT ERROR ===');
      console.error('Error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      let errorMessage = "Unbekannter Fehler beim Import";
      
      if (error instanceof SyntaxError) {
        errorMessage = "Die Datei enthält ungültiges JSON-Format. Überprüfen Sie die Datei-Struktur.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Import fehlgeschlagen",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
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
          <div className="flex items-center justify-between">
            <DialogTitle>Gespeicherte Analysen verwalten</DialogTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={triggerFileUpload}
              disabled={isImporting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importiere...' : 'JSON Import'}
            </Button>
          </div>
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
