import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, MapPin, Globe, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ManualLocalSEOData, LocalSEODirectory } from '@/hooks/useManualData';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManualLocalSEOInputProps {
  initialData: ManualLocalSEOData | null;
  onDataChange: (data: ManualLocalSEOData) => void;
}

const ManualLocalSEOInput: React.FC<ManualLocalSEOInputProps> = ({ initialData, onDataChange }) => {
  const { reviewStatus, updateReviewStatus } = useAnalysisContext();
  
  console.log('💾 ManualLocalSEOInput - initialData received:', initialData);
  console.log('💾 ManualLocalSEOInput - directories in initialData:', initialData?.directories);
  
  const [formData, setFormData] = useState<ManualLocalSEOData>(
    initialData || {
      gmbClaimed: false,
      gmbVerified: false,
      gmbCompleteness: 50,
      gmbPhotos: 0,
      gmbPosts: 0,
      gmbLastUpdate: 'Nie',
      directories: [],
      napConsistencyScore: 75,
      napIssues: [],
      hasLocalBusinessSchema: false,
      hasOrganizationSchema: false,
      schemaTypes: [],
      localKeywordRankings: [],
      addressVisible: true,
      phoneVisible: true,
      openingHoursVisible: false,
      localContentScore: 50,
      overallScore: 60
    }
  );
  
  console.log('💾 ManualLocalSEOInput - formData after init:', formData);
  console.log('💾 ManualLocalSEOInput - directories in formData:', formData.directories);

  const [newDirectory, setNewDirectory] = useState<{ name: string; status: 'complete' | 'incomplete' | 'not-found' }>({ 
    name: '', 
    status: 'not-found' 
  });
  const [newKeyword, setNewKeyword] = useState<{ 
    keyword: string; 
    position: number; 
    searchVolume: 'high' | 'medium' | 'low';
    trend: 'up' | 'down' | 'stable' 
  }>({ 
    keyword: '', 
    position: 10, 
    searchVolume: 'medium',
    trend: 'stable' 
  });

  // Entferne das automatische Speichern bei jeder Änderung
  // Die Daten werden nur beim Klick auf "Speichern" übertragen

  const addDirectory = () => {
    if (newDirectory.name) {
      const newDir = {
        name: newDirectory.name,
        status: newDirectory.status,
        claimedByOwner: false,
        verified: false,
        completeness: 0
      };
      console.log('➕ Adding directory:', newDir);
      setFormData(prev => {
        const updated = {
          ...prev,
          directories: [...prev.directories, newDir]
        };
        console.log('➕ Updated formData directories:', updated.directories);
        return updated;
      });
      setNewDirectory({ name: '', status: 'not-found' });
    }
  };

  const removeDirectory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      directories: prev.directories.filter((_, i) => i !== index)
    }));
  };

  const updateDirectory = (index: number, updates: Partial<LocalSEODirectory>) => {
    setFormData(prev => ({
      ...prev,
      directories: prev.directories.map((dir, i) => 
        i === index ? { ...dir, ...updates } : dir
      )
    }));
  };

  const addKeyword = () => {
    if (newKeyword.keyword) {
      setFormData(prev => ({
        ...prev,
        localKeywordRankings: [...prev.localKeywordRankings, newKeyword]
      }));
      setNewKeyword({ keyword: '', position: 10, searchVolume: 'medium', trend: 'stable' });
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      localKeywordRankings: prev.localKeywordRankings.filter((_, i) => i !== index)
    }));
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Google My Business */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Google My Business
          </CardTitle>
          <CardDescription>
            Manuelle Eingabe Ihrer Google My Business Informationen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gmb-claimed">Beansprucht</Label>
              <Switch
                id="gmb-claimed"
                checked={formData.gmbClaimed}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, gmbClaimed: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gmb-verified">Verifiziert</Label>
              <Switch
                id="gmb-verified"
                checked={formData.gmbVerified}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, gmbVerified: checked }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vollständigkeit: {formData.gmbCompleteness}%</Label>
            <Slider
              value={[formData.gmbCompleteness]}
              onValueChange={([value]) => 
                setFormData(prev => ({ ...prev, gmbCompleteness: value }))
              }
              max={100}
              step={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gmb-photos">Anzahl Fotos</Label>
              <Input
                id="gmb-photos"
                type="number"
                value={formData.gmbPhotos}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, gmbPhotos: parseInt(e.target.value) || 0 }))
                }
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="gmb-posts">Posts (30 Tage)</Label>
              <Input
                id="gmb-posts"
                type="number"
                value={formData.gmbPosts}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, gmbPosts: parseInt(e.target.value) || 0 }))
                }
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="gmb-update">Letztes Update</Label>
              <Input
                id="gmb-update"
                value={formData.gmbLastUpdate}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, gmbLastUpdate: e.target.value }))
                }
                placeholder="z.B. vor 2 Wochen"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lokale Verzeichnisse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Lokale Verzeichnisse
          </CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Einträge in lokalen Verzeichnissen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verzeichnis hinzufügen */}
          <div className="flex gap-2">
            <Input
              placeholder="Verzeichnisname (z.B. Gelbe Seiten)"
              value={newDirectory.name}
              onChange={(e) => setNewDirectory(prev => ({ ...prev, name: e.target.value }))}
            />
            <Select
              value={newDirectory.status}
              onValueChange={(value: 'complete' | 'incomplete' | 'not-found') => 
                setNewDirectory(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complete">Vollständig</SelectItem>
                <SelectItem value="incomplete">Unvollständig</SelectItem>
                <SelectItem value="not-found">Nicht gefunden</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addDirectory} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Liste der Verzeichnisse */}
          <div className="space-y-2">
            {formData.directories.map((directory, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{directory.name}</span>
                    <Badge variant={
                      directory.status === 'complete' ? 'default' :
                      directory.status === 'incomplete' ? 'secondary' : 'destructive'
                    }>
                      {directory.status === 'complete' ? 'Vollständig' :
                       directory.status === 'incomplete' ? 'Unvollständig' : 'Nicht gefunden'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                      <Switch
                        checked={directory.claimedByOwner || false}
                        onCheckedChange={(checked) => 
                          updateDirectory(index, { claimedByOwner: checked })
                        }
                        className="scale-75"
                      />
                      <span className="text-muted-foreground">Beansprucht</span>
                    </label>
                    
                    <label className="flex items-center gap-1">
                      <Switch
                        checked={directory.verified || false}
                        onCheckedChange={(checked) => 
                          updateDirectory(index, { verified: checked })
                        }
                        className="scale-75"
                      />
                      <span className="text-muted-foreground">Verifiziert</span>
                    </label>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeDirectory(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lokale Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Lokale Keyword-Rankings
          </CardTitle>
          <CardDescription>
            Verfolgen Sie Ihre Rankings für lokale Keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Keyword hinzufügen */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Input
              placeholder="Keyword"
              className="md:col-span-2"
              value={newKeyword.keyword}
              onChange={(e) => setNewKeyword(prev => ({ ...prev, keyword: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Position"
              value={newKeyword.position}
              onChange={(e) => 
                setNewKeyword(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))
              }
              min="1"
              max="100"
            />
            <Select
              value={newKeyword.searchVolume}
              onValueChange={(value: 'high' | 'medium' | 'low') => 
                setNewKeyword(prev => ({ ...prev, searchVolume: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addKeyword} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Liste der Keywords */}
          <div className="space-y-2">
            {formData.localKeywordRankings.map((keyword, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{keyword.keyword}</span>
                    <Badge variant={
                      keyword.searchVolume === 'high' ? 'default' :
                      keyword.searchVolume === 'medium' ? 'secondary' : 'outline'
                    }>
                      {keyword.searchVolume === 'high' ? 'Hoch' :
                       keyword.searchVolume === 'medium' ? 'Mittel' : 'Niedrig'} Volumen
                    </Badge>
                    {getTrendIcon(keyword.trend)}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold">#{keyword.position}</div>
                    <div className="text-xs text-muted-foreground">Position</div>
                  </div>
                  
                  <Select
                    value={keyword.trend}
                    onValueChange={(value: 'up' | 'down' | 'stable') => 
                      setFormData(prev => ({
                        ...prev,
                        localKeywordRankings: prev.localKeywordRankings.map((kw, i) => 
                          i === index ? { ...kw, trend: value } : kw
                        )
                      }))
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up">Steigend</SelectItem>
                      <SelectItem value="stable">Stabil</SelectItem>
                      <SelectItem value="down">Fallend</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeKeyword(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Structured Data & On-Page */}
      <Card>
        <CardHeader>
          <CardTitle>Schema & On-Page Faktoren</CardTitle>
          <CardDescription>
            Strukturierte Daten und lokale On-Page Elemente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="schema-local">LocalBusiness Schema</Label>
              <Switch
                id="schema-local"
                checked={formData.hasLocalBusinessSchema}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, hasLocalBusinessSchema: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="schema-org">Organization Schema</Label>
              <Switch
                id="schema-org"
                checked={formData.hasOrganizationSchema}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, hasOrganizationSchema: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="address-visible">Adresse sichtbar</Label>
              <Switch
                id="address-visible"
                checked={formData.addressVisible}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, addressVisible: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="phone-visible">Telefon sichtbar</Label>
              <Switch
                id="phone-visible"
                checked={formData.phoneVisible}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, phoneVisible: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hours-visible">Öffnungszeiten sichtbar</Label>
              <Switch
                id="hours-visible"
                checked={formData.openingHoursVisible}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, openingHoursVisible: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>NAP Konsistenz-Score: {formData.napConsistencyScore}%</Label>
            <Slider
              value={[formData.napConsistencyScore]}
              onValueChange={([value]) => 
                setFormData(prev => ({ ...prev, napConsistencyScore: value }))
              }
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Lokaler Content Score: {formData.localContentScore}%</Label>
            <Slider
              value={[formData.localContentScore]}
              onValueChange={([value]) => 
                setFormData(prev => ({ ...prev, localContentScore: value }))
              }
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Gesamtscore (manuell): {formData.overallScore}%</Label>
            <Slider
              value={[formData.overallScore]}
              onValueChange={([value]) => 
                setFormData(prev => ({ ...prev, overallScore: value }))
              }
              max={100}
              step={5}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Notizen zur Local SEO..."
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
      
      <AIReviewCheckbox
        categoryName="Lokales SEO"
        isReviewed={reviewStatus['Lokales SEO']?.isReviewed || false}
        onReviewChange={(reviewed) => updateReviewStatus('Lokales SEO', reviewed)}
      />

      {/* Speichern Button */}
      <div className="flex justify-end gap-2 mt-6">
        <Button
          variant="default"
          onClick={() => {
            console.log('💾 Speichern button clicked, sending data:', formData);
            onDataChange(formData);
          }}
        >
          Speichern
        </Button>
      </div>
    </div>
  );
};

export default ManualLocalSEOInput;
