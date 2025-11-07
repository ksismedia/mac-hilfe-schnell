import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Edit2, Save, Plus, Trash2 } from 'lucide-react';

interface OnlinePresenceItem {
  url: string;
  type: 'image' | 'video' | 'short';
  relevance: 'high' | 'medium' | 'low';
}

interface SimpleCounts {
  images: number;
  videos: number;
  shorts: number;
}

interface ManualOnlinePresenceInputProps {
  onUpdate: (data: { items: OnlinePresenceItem[]; overallScore: number; simpleCounts?: SimpleCounts }) => void;
  initialData?: { items: OnlinePresenceItem[]; overallScore?: number; simpleCounts?: SimpleCounts };
}

const ManualOnlinePresenceInput: React.FC<ManualOnlinePresenceInputProps> = ({ 
  onUpdate, 
  initialData 
}) => {
  const [items, setItems] = useState<OnlinePresenceItem[]>(initialData?.items || []);
  const [simpleCounts, setSimpleCounts] = useState<SimpleCounts>(
    initialData?.simpleCounts || { images: 0, videos: 0, shorts: 0 }
  );
  const [useSimpleInput, setUseSimpleInput] = useState(true);
  const [isEditing, setIsEditing] = useState(!initialData?.items?.length && !initialData?.simpleCounts);
  const [currentItem, setCurrentItem] = useState<OnlinePresenceItem>({
    url: '',
    type: 'image',
    relevance: 'high'
  });

  const calculateScore = (contentItems: OnlinePresenceItem[], counts?: SimpleCounts): number => {
    // Wenn einfache Eingabe verwendet wird
    if (counts && (counts.images > 0 || counts.videos > 0 || counts.shorts > 0)) {
      const totalCount = counts.images + counts.videos + counts.shorts;
      
      // Basis-Score: Content-Vielfalt (max 40 Punkte)
      let diversityScore = 0;
      if (counts.images > 0) diversityScore += 15;
      if (counts.videos > 0) diversityScore += 15;
      if (counts.shorts > 0) diversityScore += 10;
      
      // Content-Menge Score (max 30 Punkte)
      let quantityScore = 0;
      if (totalCount >= 20) quantityScore = 30;
      else if (totalCount >= 15) quantityScore = 25;
      else if (totalCount >= 10) quantityScore = 20;
      else if (totalCount >= 5) quantityScore = 15;
      else quantityScore = totalCount * 3;
      
      // Relevanz-Score (max 30 Punkte) - bei einfacher Eingabe angenommen als mittel
      const relevanceScore = Math.min(30, totalCount * 1.5);
      
      return Math.min(100, Math.round(diversityScore + quantityScore + relevanceScore));
    }
    
    // Detaillierte Eingabe (alte Logik)
    if (contentItems.length === 0) return 0;

    const imageCount = contentItems.filter(item => item.type === 'image').length;
    const videoCount = contentItems.filter(item => item.type === 'video').length;
    const shortCount = contentItems.filter(item => item.type === 'short').length;

    const highRelevanceCount = contentItems.filter(item => item.relevance === 'high').length;
    const mediumRelevanceCount = contentItems.filter(item => item.relevance === 'medium').length;
    const lowRelevanceCount = contentItems.filter(item => item.relevance === 'low').length;

    let diversityScore = 0;
    if (imageCount > 0) diversityScore += 15;
    if (videoCount > 0) diversityScore += 15;
    if (shortCount > 0) diversityScore += 10;

    const totalContent = contentItems.length;
    let quantityScore = 0;
    if (totalContent >= 20) quantityScore = 30;
    else if (totalContent >= 15) quantityScore = 25;
    else if (totalContent >= 10) quantityScore = 20;
    else if (totalContent >= 5) quantityScore = 15;
    else quantityScore = totalContent * 3;

    const relevanceScore = Math.min(30, 
      (highRelevanceCount * 2) + 
      (mediumRelevanceCount * 1) + 
      (lowRelevanceCount * 0.5)
    );

    const finalScore = Math.min(100, Math.round(diversityScore + quantityScore + relevanceScore));
    
    return finalScore;
  };

  const handleAddItem = () => {
    if (!currentItem.url.trim()) return;

    const newItems = [...items, { ...currentItem }];
    setItems(newItems);
    setCurrentItem({
      url: '',
      type: 'image',
      relevance: 'high'
    });
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSave = () => {
    const score = useSimpleInput 
      ? calculateScore([], simpleCounts)
      : calculateScore(items);
    
    onUpdate({
      items: useSimpleInput ? [] : items,
      overallScore: score,
      simpleCounts: useSimpleInput ? simpleCounts : undefined
    });
    setIsEditing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-warning';
    if (score >= 61) return 'text-success';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default'; // Gold
    if (score >= 61) return 'secondary'; // Grün
    return 'destructive'; // Rot
  };

  const overallScore = simpleCounts && (simpleCounts.images > 0 || simpleCounts.videos > 0 || simpleCounts.shorts > 0)
    ? calculateScore([], simpleCounts)
    : calculateScore(items);
  
  const totalCount = simpleCounts 
    ? simpleCounts.images + simpleCounts.videos + simpleCounts.shorts
    : items.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Online-Präsenz (Google-Suche)</CardTitle>
            <CardDescription>
              Erfassen Sie Bilder, Videos und Shorts, die bei Google-Suche nach Ihrer Firma erscheinen
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
            {isEditing ? 'Fertig' : 'Bearbeiten'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing && totalCount > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt-Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}%
                </p>
              </div>
              <Badge variant={getScoreBadge(overallScore)}>
                {overallScore >= 90 ? 'Exzellent' : overallScore >= 61 ? 'Gut' : 'Verbesserungsbedarf'}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Erfasste Inhalte: {totalCount}</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium">Bilder</p>
                  <p className="text-lg">
                    {simpleCounts && (simpleCounts.images > 0 || simpleCounts.videos > 0 || simpleCounts.shorts > 0)
                      ? simpleCounts.images
                      : items.filter(i => i.type === 'image').length}
                  </p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium">Videos</p>
                  <p className="text-lg">
                    {simpleCounts && (simpleCounts.images > 0 || simpleCounts.videos > 0 || simpleCounts.shorts > 0)
                      ? simpleCounts.videos
                      : items.filter(i => i.type === 'video').length}
                  </p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium">Shorts/Reels</p>
                  <p className="text-lg">
                    {simpleCounts && (simpleCounts.images > 0 || simpleCounts.videos > 0 || simpleCounts.shorts > 0)
                      ? simpleCounts.shorts
                      : items.filter(i => i.type === 'short').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Noch keine Inhalte erfasst</p>
            <p className="text-sm mt-2">Fügen Sie Google-Suchergebnisse hinzu</p>
          </div>
        ) : null}

        {isEditing && (
          <div className="space-y-4">
            {totalCount > 0 && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Aktueller Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}%
                  </p>
                </div>
                <Badge variant={getScoreBadge(overallScore)}>
                  {overallScore >= 90 ? 'Exzellent' : overallScore >= 61 ? 'Gut' : 'Verbesserungsbedarf'}
                </Badge>
              </div>
            )}

            {/* Umschalter zwischen einfacher und detaillierter Eingabe */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm font-medium">Eingabemodus:</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={useSimpleInput ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseSimpleInput(true)}
                >
                  Einfach (nur Anzahl)
                </Button>
                <Button
                  type="button"
                  variant={!useSimpleInput ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseSimpleInput(false)}
                >
                  Detailliert (mit URLs)
                </Button>
              </div>
            </div>

            {useSimpleInput ? (
              /* EINFACHE EINGABE - NUR ANZAHL */
              <div className="grid gap-4 p-4 border rounded-lg bg-green-50">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-green-900">
                    Schnelle Eingabe - Geben Sie einfach die Anzahl ein:
                  </h4>
                  <p className="text-xs text-green-700">
                    Zählen Sie, wie viele Bilder, Videos und Shorts bei der Google-Suche nach Ihrer Firma erscheinen.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="simple-images" className="flex items-center gap-2">
                      📷 Bilder
                    </Label>
                    <Input
                      id="simple-images"
                      type="number"
                      min="0"
                      value={simpleCounts.images}
                      onChange={(e) => setSimpleCounts({ 
                        ...simpleCounts, 
                        images: parseInt(e.target.value) || 0 
                      })}
                      placeholder="0"
                      className="text-center text-lg font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="simple-videos" className="flex items-center gap-2">
                      🎥 Videos
                    </Label>
                    <Input
                      id="simple-videos"
                      type="number"
                      min="0"
                      value={simpleCounts.videos}
                      onChange={(e) => setSimpleCounts({ 
                        ...simpleCounts, 
                        videos: parseInt(e.target.value) || 0 
                      })}
                      placeholder="0"
                      className="text-center text-lg font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="simple-shorts" className="flex items-center gap-2">
                      📱 Shorts/Reels
                    </Label>
                    <Input
                      id="simple-shorts"
                      type="number"
                      min="0"
                      value={simpleCounts.shorts}
                      onChange={(e) => setSimpleCounts({ 
                        ...simpleCounts, 
                        shorts: parseInt(e.target.value) || 0 
                      })}
                      placeholder="0"
                      className="text-center text-lg font-bold"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-green-200">
                  <p className="text-sm font-medium text-center">
                    Gesamt: <span className="text-2xl font-bold text-green-700">
                      {simpleCounts.images + simpleCounts.videos + simpleCounts.shorts}
                    </span> Inhalte
                  </p>
                </div>
              </div>
            ) : (
              /* DETAILLIERTE EINGABE - MIT URLS */
              <>
                <div className="grid gap-4 p-4 border rounded-lg">
                  <div className="grid gap-2">
                    <Label htmlFor="content-url">URL des Inhalts</Label>
                    <Input
                      id="content-url"
                      value={currentItem.url}
                      onChange={(e) => setCurrentItem({ ...currentItem, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="content-type">Typ</Label>
                      <select
                        id="content-type"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                        value={currentItem.type}
                        onChange={(e) => setCurrentItem({ ...currentItem, type: e.target.value as 'image' | 'video' | 'short' })}
                      >
                        <option value="image">Bild</option>
                        <option value="video">Video</option>
                        <option value="short">Short/Reel</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="content-relevance">Relevanz</Label>
                      <select
                        id="content-relevance"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                        value={currentItem.relevance}
                        onChange={(e) => setCurrentItem({ ...currentItem, relevance: e.target.value as 'high' | 'medium' | 'low' })}
                      >
                        <option value="high">Hoch (eigener Content)</option>
                        <option value="medium">Mittel (erwähnt)</option>
                        <option value="low">Niedrig (indirekt)</option>
                      </select>
                    </div>
                  </div>

                  <Button onClick={handleAddItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Inhalt hinzufügen
                  </Button>
                </div>

                {items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Erfasste Inhalte ({items.length})</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.url}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.type === 'image' ? '📷 Bild' : item.type === 'video' ? '🎥 Video' : '📱 Short'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.relevance === 'high' ? '⭐ Hoch' : item.relevance === 'medium' ? '⭐ Mittel' : '⭐ Niedrig'}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button onClick={handleSave} className="w-full" variant="default">
              <Save className="h-4 w-4 mr-2" />
              Speichern ({overallScore}%)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualOnlinePresenceInput;
