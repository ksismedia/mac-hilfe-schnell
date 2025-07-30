import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, Award, BookOpen, Shield } from 'lucide-react';

export interface StaffQualificationData {
  // Grundqualifikationen
  totalEmployees: number;
  apprentices: number;
  skilled_workers: number;
  masters: number;
  unskilled_workers: number;
  
  // Zertifizierungen
  certifications: {
    welding_certificates: boolean;
    safety_training: boolean;
    first_aid: boolean;
    digital_skills: boolean;
    instructor_qualification: boolean;
    business_qualification: boolean;
  };
  
  // Branchenspezifische Qualifikationen
  industry_specific: string[];
  
  // Spezialisierungen
  specializations: string;
  
  // Weiterbildungsbudget
  training_budget_per_year: number;
  
  // Durchschnittliche Berufserfahrung
  average_experience_years: number;
}

interface StaffQualificationInputProps {
  businessData: {
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  data: StaffQualificationData | null;
  onUpdate: (data: StaffQualificationData | null) => void;
}

const industrySpecificQualifications = {
  shk: [
    'Gas-Installation Sachkundenachweis',
    'Trinkwasser-Installation',
    'Solartechnik-Zertifikat',
    'Wärmepumpen-Fachbetrieb',
    'Kältemittel-Sachkunde',
    'Brennwert-Technik'
  ],
  elektriker: [
    'PV-Anlagen Fachkraft',
    'E-Mobilität Ladeinfrastruktur',
    'Smart Home Spezialist',
    'Elektrofachkraft für festgelegte Tätigkeiten',
    'Messungen nach DGUV V3',
    'Blitzschutz-Fachkraft'
  ],
  maler: [
    'Denkmalpflege-Qualifikation',
    'WDVS-Fachverarbeiter',
    'Lackiertechnik Spezialist',
    'Fassadensanierung',
    'Schimmelsanierung',
    'Brandschutzanstriche'
  ],
  dachdecker: [
    'Solar-Dachdecker Zertifikat',
    'Gründach-Fachbetrieb',
    'Absturzsicherung',
    'Energieberatung Dach',
    'Steildach-Spezialist',
    'Flachdach-Abdichtung'
  ],
  stukateur: [
    'Trockenbau-Fachverarbeiter',
    'WDVS-Verarbeitung',
    'Brandschutz-Systeme',
    'Akustikbau',
    'Restaurierung historischer Putze',
    'Lehmputz-Spezialist'
  ],
  planungsbuero: [
    'TGA-Planer VDI 6023',
    'Energieberater Gebäude',
    'BIM-Koordinator',
    'HOAI-Zertifizierung',
    'Passivhaus-Planer',
    'BAFA-Energieberater'
  ]
};

export function StaffQualificationInput({ businessData, data, onUpdate }: StaffQualificationInputProps) {
  const [isEditing, setIsEditing] = useState(!data);
  
  const [formData, setFormData] = useState<StaffQualificationData>(data || {
    totalEmployees: 0,
    apprentices: 0,
    skilled_workers: 0,
    masters: 0,
    unskilled_workers: 0,
    certifications: {
      welding_certificates: false,
      safety_training: false,
      first_aid: false,
      digital_skills: false,
      instructor_qualification: false,
      business_qualification: false,
    },
    industry_specific: [],
    specializations: '',
    training_budget_per_year: 0,
    average_experience_years: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleIndustrySpecificChange = (qualification: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      industry_specific: checked 
        ? [...prev.industry_specific, qualification]
        : prev.industry_specific.filter(q => q !== qualification)
    }));
  };

  const calculateQualificationScore = () => {
    if (!data) return 0;
    
    let score = 0;
    const totalEmployees = data.totalEmployees || 1;
    
    // Qualifikationsgrad (40% der Bewertung)
    const qualifiedStaff = data.skilled_workers + data.masters;
    const qualificationRatio = qualifiedStaff / totalEmployees;
    score += qualificationRatio * 40;
    
    // Meister-Quote (20% der Bewertung)
    const masterRatio = data.masters / totalEmployees;
    score += masterRatio * 20;
    
    // Zertifizierungen (25% der Bewertung)
    const certCount = Object.values(data.certifications).filter(Boolean).length;
    score += (certCount / 6) * 25;
    
    // Branchenspezifische Qualifikationen (15% der Bewertung)
    const industrySpecificCount = data.industry_specific.length;
    const maxIndustrySpecific = industrySpecificQualifications[businessData.industry].length;
    score += (industrySpecificCount / maxIndustrySpecific) * 15;
    
    return Math.round(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-yellow-400';
    if (score >= 60) return 'text-green-400';
    return 'text-red-400';
  };

  if (!isEditing && data) {
    const score = calculateQualificationScore();
    
    return (
      <Card className="bg-gray-800 border-yellow-400/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-400" />
              <CardTitle className="text-yellow-400">Mitarbeiterqualifizierung</CardTitle>
              <Badge className={`${getScoreColor(score)} bg-transparent border-current`}>
                Score: {score}/100
              </Badge>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              Bearbeiten
            </Button>
          </div>
          <CardDescription className="text-gray-300">
            Übersicht über Qualifikationen und Zertifizierungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mitarbeiterübersicht */}
          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mitarbeiterstruktur ({data.totalEmployees} Gesamt)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-yellow-400">{data.masters}</div>
                <div className="text-sm text-gray-300">Meister</div>
              </div>
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-green-400">{data.skilled_workers}</div>
                <div className="text-sm text-gray-300">Gesellen</div>
              </div>
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-blue-400">{data.apprentices}</div>
                <div className="text-sm text-gray-300">Azubis</div>
              </div>
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-gray-400">{data.unskilled_workers}</div>
                <div className="text-sm text-gray-300">Ungelernte</div>
              </div>
            </div>
          </div>

          {/* Zertifizierungen */}
          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Zertifizierungen
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.certifications)
                .filter(([, value]) => value)
                .map(([key]) => (
                  <Badge key={key} variant="secondary" className="bg-green-900 text-green-200">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Branchenspezifische Qualifikationen */}
          {data.industry_specific.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Branchenspezifische Qualifikationen
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.industry_specific.map((qual, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-900 text-blue-200">
                    {qual}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Zusätzliche Infos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300">Durchschnittliche Berufserfahrung</div>
              <div className="text-lg font-bold text-white">{data.average_experience_years} Jahre</div>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300">Weiterbildungsbudget/Jahr</div>
              <div className="text-lg font-bold text-white">{data.training_budget_per_year.toLocaleString()} €</div>
            </div>
          </div>

          {data.specializations && (
            <div>
              <h4 className="font-semibold text-white mb-2">Spezialisierungen</h4>
              <p className="text-gray-300 bg-gray-700 p-3 rounded-lg">{data.specializations}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-yellow-400/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <Users className="h-5 w-5" />
          Mitarbeiterqualifizierung erfassen
        </CardTitle>
        <CardDescription className="text-gray-300">
          Geben Sie Details zu Qualifikationen und Zertifizierungen Ihres Teams ein
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grunddaten */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mitarbeiterstruktur
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="totalEmployees" className="text-gray-200">Gesamtanzahl Mitarbeiter</Label>
                <Input
                  id="totalEmployees"
                  type="number"
                  min="0"
                  value={formData.totalEmployees}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalEmployees: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="masters" className="text-gray-200">Meister</Label>
                <Input
                  id="masters"
                  type="number"
                  min="0"
                  value={formData.masters}
                  onChange={(e) => setFormData(prev => ({ ...prev, masters: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="skilled_workers" className="text-gray-200">Gesellen/Facharbeiter</Label>
                <Input
                  id="skilled_workers"
                  type="number"
                  min="0"
                  value={formData.skilled_workers}
                  onChange={(e) => setFormData(prev => ({ ...prev, skilled_workers: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="apprentices" className="text-gray-200">Auszubildende</Label>
                <Input
                  id="apprentices"
                  type="number"
                  min="0"
                  value={formData.apprentices}
                  onChange={(e) => setFormData(prev => ({ ...prev, apprentices: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="unskilled_workers" className="text-gray-200">Ungelernte Hilfskräfte</Label>
                <Input
                  id="unskilled_workers"
                  type="number"
                  min="0"
                  value={formData.unskilled_workers}
                  onChange={(e) => setFormData(prev => ({ ...prev, unskilled_workers: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="average_experience_years" className="text-gray-200">Ø Berufserfahrung (Jahre)</Label>
                <Input
                  id="average_experience_years"
                  type="number"
                  min="0"
                  value={formData.average_experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, average_experience_years: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Zertifizierungen */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Allgemeine Zertifizierungen
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.certifications).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        certifications: { ...prev.certifications, [key]: checked as boolean }
                      }))
                    }
                    className="border-gray-400 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                  />
                  <Label htmlFor={key} className="text-gray-200 cursor-pointer">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Branchenspezifische Qualifikationen */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Branchenspezifische Qualifikationen
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {industrySpecificQualifications[businessData.industry].map((qualification) => (
                <div key={qualification} className="flex items-center space-x-2">
                  <Checkbox
                    id={qualification}
                    checked={formData.industry_specific.includes(qualification)}
                    onCheckedChange={(checked) => handleIndustrySpecificChange(qualification, checked as boolean)}
                    className="border-gray-400 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                  />
                  <Label htmlFor={qualification} className="text-gray-200 cursor-pointer text-sm">
                    {qualification}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Zusätzliche Informationen */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Zusätzliche Informationen
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="training_budget_per_year" className="text-gray-200">Weiterbildungsbudget pro Jahr (€)</Label>
                <Input
                  id="training_budget_per_year"
                  type="number"
                  min="0"
                  value={formData.training_budget_per_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, training_budget_per_year: parseInt(e.target.value) || 0 }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="specializations" className="text-gray-200">Besondere Spezialisierungen</Label>
                <Textarea
                  id="specializations"
                  value={formData.specializations}
                  onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                  placeholder="z.B. Passivhaus-Spezialist, Altbausanierung, Smart-Home-Integration..."
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {data && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Abbrechen
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            >
              Speichern
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}