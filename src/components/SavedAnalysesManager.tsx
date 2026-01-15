
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSavedAnalyses, SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { FolderOpen, Trash2, Download, Calendar, Globe, Upload, RotateCcw, AlertTriangle, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractAnalysisFromHTML, hasEmbeddedAnalysis } from '@/utils/htmlAnalysisEmbed';

interface SavedAnalysesManagerProps {
  onLoadAnalysis: (analysis: SavedAnalysis) => void;
}

// Industry names mapping
const industryNames: Record<string, string> = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro',
  'facility-management': 'Facility-Management & Gebäudereinigung',
  'holzverarbeitung': 'Holzverarbeitung',
  'baeckerei': 'Bäckerei',
  'blechbearbeitung': 'Blechbearbeitung'
};

const SavedAnalysesManager: React.FC<SavedAnalysesManagerProps> = ({ onLoadAnalysis }) => {
  const { 
    savedAnalyses, 
    trashedAnalyses, 
    deleteAnalysis, 
    restoreAnalysis, 
    permanentlyDeleteAnalysis, 
    emptyTrash, 
    exportAnalysis, 
    saveAnalysis 
  } = useSavedAnalyses();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilPermanentDeletion = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const permanentDeleteDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = permanentDeleteDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleLoadAnalysis = (analysis: SavedAnalysis) => {
    console.log('SavedAnalysesManager: Loading analysis:', analysis.name, 'ID:', analysis.id);
    onLoadAnalysis(analysis);
    setIsOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteAnalysis(id);
    toast({
      title: "In Papierkorb verschoben",
      description: `"${name}" wurde in den Papierkorb verschoben. Wiederherstellung innerhalb von 30 Tagen möglich.`,
    });
  };

  const handleRestore = async (id: string, name: string) => {
    await restoreAnalysis(id);
    toast({
      title: "Wiederhergestellt",
      description: `"${name}" wurde erfolgreich wiederhergestellt.`,
    });
    setActiveTab('active');
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    await permanentlyDeleteAnalysis(id);
    toast({
      title: "Endgültig gelöscht",
      description: `"${name}" wurde unwiderruflich gelöscht.`,
      variant: "destructive"
    });
  };

  const handleEmptyTrash = async () => {
    await emptyTrash();
    toast({
      title: "Papierkorb geleert",
      description: "Alle gelöschten Analysen wurden endgültig entfernt.",
      variant: "destructive"
    });
  };

  const triggerFileUpload = (acceptType: 'json' | 'html' = 'json') => {
    console.log(`Triggering file upload for ${acceptType}...`);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptType === 'json' ? '.json' : '.html,.htm';
    input.style.display = 'none';
    
    input.addEventListener('change', async (event) => {
      console.log('File input change event triggered');
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        console.log('No file selected');
        return;
      }
      
      if (acceptType === 'html') {
        await handleHTMLImport(file);
      } else {
        await handleFileUpload(file);
      }
    });
    
    // Add to DOM temporarily
    document.body.appendChild(input);
    input.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(input);
    }, 1000);
  };

  const handleHTMLImport = async (file: File) => {
    console.log('=== HTML IMPORT START ===');
    setIsImporting(true);

    try {
      if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
        throw new Error('Bitte wählen Sie eine HTML-Datei aus');
      }

      const htmlContent = await file.text();
      
      if (!htmlContent.trim()) {
        throw new Error('Die Datei ist leer');
      }

      // Check if HTML contains embedded analysis data
      if (!hasEmbeddedAnalysis(htmlContent)) {
        throw new Error('Diese HTML-Datei enthält keine eingebetteten Analysedaten. Nur UNNA-Reports ab dieser Version können importiert werden.');
      }

      // Extract the analysis data
      const extractedAnalysis = extractAnalysisFromHTML(htmlContent);
      
      if (!extractedAnalysis) {
        throw new Error('Die Analysedaten konnten nicht aus der HTML-Datei extrahiert werden.');
      }

      // Validate extracted data
      if (!extractedAnalysis.businessData?.url || !extractedAnalysis.businessData?.industry) {
        throw new Error('Die extrahierten Geschäftsdaten sind unvollständig.');
      }

      // Generate import name
      const importName = `${extractedAnalysis.name || 'HTML-Import'} (Importiert ${new Date().toLocaleTimeString()})`;

      // Save to database/localStorage
      const analysisId = await saveAnalysis(
        importName,
        extractedAnalysis.businessData,
        extractedAnalysis.realData,
        extractedAnalysis.manualData || {
          competitors: [],
          competitorServices: {},
          removedMissingServices: []
        }
      );

      // Create complete analysis structure for loading
      const newAnalysis: SavedAnalysis = {
        id: analysisId,
        name: importName,
        businessData: extractedAnalysis.businessData,
        realData: extractedAnalysis.realData,
        manualData: extractedAnalysis.manualData || {
          competitors: [],
          competitorServices: {},
          removedMissingServices: []
        },
        savedAt: new Date().toISOString()
      };

      onLoadAnalysis(newAnalysis);
      setIsOpen(false);

      toast({
        title: "✅ HTML-Import erfolgreich",
        description: `Die Analyse "${importName}" wurde aus der HTML-Datei wiederhergestellt.`,
      });

    } catch (error) {
      console.error('=== HTML IMPORT ERROR ===', error);
      
      let errorMessage = "Unbekannter Fehler beim HTML-Import";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "HTML-Import fehlgeschlagen",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log('=== FILE UPLOAD START ===');
    setIsImporting(true);

    try {
      if (!file.name.endsWith('.json')) {
        throw new Error('Bitte wählen Sie eine .json Datei aus');
      }

      const text = await file.text();
      
      if (!text.trim()) {
        throw new Error('Die Datei ist leer');
      }

      const importedAnalysis = JSON.parse(text) as SavedAnalysis;
      
      // Erweiterte Validierung
      const requiredFields = ['id', 'name', 'businessData', 'realData'];
      const missingFields = requiredFields.filter(field => !importedAnalysis[field as keyof SavedAnalysis]);
      
      if (missingFields.length > 0) {
        throw new Error(`Fehlende Felder in der JSON-Datei: ${missingFields.join(', ')}`);
      }

      if (!importedAnalysis.businessData.url || !importedAnalysis.businessData.industry) {
        throw new Error('Ungültige Geschäftsdaten in der JSON-Datei');
      }
      
      // Generiere neue ID für Import
      const importName = `${importedAnalysis.name} (Importiert ${new Date().toLocaleTimeString()})`;
      
      const analysisId = await saveAnalysis(
        importName,
        importedAnalysis.businessData,
        importedAnalysis.realData,
        importedAnalysis.manualData || {
          competitors: [],
          competitorServices: {},
          removedMissingServices: []
        }
      );

      // Erstelle die komplette Analyse-Struktur
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

      onLoadAnalysis(newAnalysis);
      setIsOpen(false);

      toast({
        title: "Import erfolgreich",
        description: `Analyse "${importName}" wurde erfolgreich importiert.`,
      });
      
    } catch (error) {
      console.error('=== IMPORT ERROR ===', error);
      
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

  const totalCount = savedAnalyses.length + trashedAnalyses.length;

  if (totalCount === 0) {
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
          <div className="text-center py-8 text-muted-foreground">
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
          {trashedAnalyses.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-destructive/10 text-destructive">
              {trashedAnalyses.length} im Papierkorb
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Gespeicherte Analysen verwalten</DialogTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => triggerFileUpload('html')}
                disabled={isImporting}
                title="HTML-Analyse zurückspielen"
              >
                <FileCode className="h-4 w-4 mr-2" />
                {isImporting ? 'Importiere...' : 'HTML Import'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => triggerFileUpload('json')}
                disabled={isImporting}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importiere...' : 'JSON Import'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Aktiv ({savedAnalyses.length})
            </TabsTrigger>
            <TabsTrigger value="trash" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Papierkorb ({trashedAnalyses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {savedAnalyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine aktiven Analysen.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedAnalyses.map((analysis) => (
                  <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{analysis.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <span>{analysis.businessData.url}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Gespeichert: {formatDate(analysis.savedAt)}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {industryNames[analysis.businessData.industry] || analysis.businessData.industry}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          <p>{analysis.businessData.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportAnalysis(analysis.id)}
                            title="Exportieren"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" title="In Papierkorb verschieben">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>In Papierkorb verschieben</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Möchten Sie die Analyse "{analysis.name}" in den Papierkorb verschieben? 
                                  Sie können sie innerhalb von 30 Tagen wiederherstellen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(analysis.id, analysis.name)}>
                                  In Papierkorb
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
            )}
          </TabsContent>

          <TabsContent value="trash" className="mt-4">
            {trashedAnalyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Der Papierkorb ist leer.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Analysen werden nach 30 Tagen automatisch endgültig gelöscht.</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Papierkorb leeren
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Papierkorb leeren</AlertDialogTitle>
                        <AlertDialogDescription>
                          Möchten Sie wirklich alle {trashedAnalyses.length} Analysen im Papierkorb endgültig löschen? 
                          Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEmptyTrash} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Endgültig löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="grid gap-4">
                  {trashedAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="hover:shadow-md transition-shadow border-destructive/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg text-muted-foreground">{analysis.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="h-4 w-4" />
                              <span>{analysis.businessData.url}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span>
                                Gelöscht: {formatDate(analysis.deletedAt!)} 
                                ({getDaysUntilPermanentDeletion(analysis.deletedAt!)} Tage bis zur endgültigen Löschung)
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-destructive/50 text-destructive">
                            Papierkorb
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(analysis.id, analysis.name)}
                            className="text-primary"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Wiederherstellen
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Endgültig löschen
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Endgültig löschen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Möchten Sie die Analyse "{analysis.name}" wirklich endgültig löschen? 
                                  Diese Aktion kann NICHT rückgängig gemacht werden.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handlePermanentDelete(analysis.id, analysis.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Endgültig löschen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SavedAnalysesManager;
