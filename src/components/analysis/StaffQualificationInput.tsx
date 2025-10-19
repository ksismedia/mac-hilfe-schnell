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
  office_workers: number;
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
  
  // Neue Felder für Schulungen und Zertifikate
  annual_training_hours_per_employee: number;
  employee_certifications: Array<{
    name: string;
    employees_certified: number;
    renewal_interval?: string;
  }>;
}

interface StaffQualificationInputProps {
  businessData: {
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
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
  ],
  'facility-management': [
    'Gebäudetechnik-Spezialist',
    'Facility Management Zertifikat',
    'Energiemanagement ISO 50001',
    'Sicherheitstechnik',
    'Reinigungsdienstleister Qualifikation',
    'Wartung technischer Anlagen'
  ]
};

export function StaffQualificationInput({ businessData, data, onUpdate }: StaffQualificationInputProps) {
  const [isEditing, setIsEditing] = useState(!data);
  
  const [formData, setFormData] = useState<StaffQualificationData>(data || {
    totalEmployees: 0,
    apprentices: 0,
    skilled_workers: 0,
    masters: 0,
    office_workers: 0,
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
    annual_training_hours_per_employee: 0,
    employee_certifications: [],
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
    const masters = data.masters || 0;
    const skilledWorkers = data.skilled_workers || 0;
    const officeWorkers = data.office_workers || 0;
    
    // Meister-Quote (35% der Bewertung) - Progressives Bewertungssystem
    const masterRatio = masters / totalEmployees;
    let masterScore = 0;
    if (masterRatio >= 0.2) {
      masterScore = 35; // Volle Punkte ab 20% Meister
    } else if (masterRatio >= 0.1) {
      masterScore = (masterRatio - 0.1) * (35 / 0.1); // Linear zwischen 10% und 20%
    } else if (masterRatio > 0) {
      masterScore = masterRatio * (35 / 0.1) * 0.5; // Reduzierte Punkte unter 10%
    }
    
    // Bonus für sehr hohe Meisterquote
    if (masterRatio >= 0.4) {
      masterScore += 5; // Extra 5 Punkte für >40% Meister
    }
    score += Math.min(masterScore, 40); // Maximal 40 Punkte für Meister
    
    // Facharbeiter-Quote + Bürokräfte (25% der Bewertung)
    const totalQualifiedWorkers = skilledWorkers + officeWorkers;
    const qualifiedWorkerRatio = totalQualifiedWorkers / totalEmployees;
    let skilledScore = 0;
    if (qualifiedWorkerRatio >= 0.3) {
      skilledScore = 25; // Volle Punkte ab 30% qualifizierte Arbeiter
    } else if (qualifiedWorkerRatio >= 0.15) {
      skilledScore = (qualifiedWorkerRatio - 0.15) * (25 / 0.15); // Linear zwischen 15% und 30%
    } else if (qualifiedWorkerRatio > 0) {
      skilledScore = qualifiedWorkerRatio * (25 / 0.15) * 0.6; // Reduzierte Punkte unter 15%
    }
    
    // Bonus für sehr hohe Qualifiziertenquote
    if (qualifiedWorkerRatio >= 0.6) {
      skilledScore += 5; // Extra 5 Punkte für >60% qualifizierte Arbeiter
    }
    score += Math.min(skilledScore, 30); // Maximal 30 Punkte für qualifizierte Arbeiter
    
    // Kombinationsbonus für hohe Gesamt-Qualifikationsquote
    const totalQualifiedRatio = (masters + skilledWorkers + officeWorkers) / totalEmployees;
    if (totalQualifiedRatio >= 0.8) {
      score += 10; // Bonus für >80% qualifizierte Mitarbeiter
    } else if (totalQualifiedRatio >= 0.6) {
      score += 5; // Bonus für >60% qualifizierte Mitarbeiter
    }
    
    // Zertifizierungen (20% der Bewertung)
    let certificationPoints = 0;
    if (data.certifications?.welding_certificates) certificationPoints += 1;
    if (data.certifications?.safety_training) certificationPoints += 1;
    if (data.certifications?.first_aid) certificationPoints += 1;
    if (data.certifications?.digital_skills) certificationPoints += 1;
    if (data.certifications?.instructor_qualification) certificationPoints += 1;
    if (data.certifications?.business_qualification) certificationPoints += 1;
    score += (certificationPoints / 6) * 20;
    
    // Branchenspezifische Qualifikationen (15% der Bewertung)
    const industrySpecificCount = data.industry_specific?.length || 0;
    score += (industrySpecificCount / 6) * 15;
    
    // Schulungsstunden (10% der Bewertung)
    const trainingHours = data.annual_training_hours_per_employee || 0;
    if (trainingHours >= 40) score += 10;
    else if (trainingHours >= 24) score += 7;
    else if (trainingHours >= 16) score += 5;
    else if (trainingHours >= 8) score += 3;
    
    // Mitarbeiterzertifikate (10% der Bewertung)
    const certifications = data.employee_certifications || [];
    const certCount = certifications.length;
    if (certCount >= 5) score += 10;
    else score += (certCount / 5) * 10;
    
    return Math.min(Math.round(score), 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-400';
    if (score >= 61) return 'text-green-400';
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-yellow-400">{data.masters}</div>
                <div className="text-sm text-gray-300">Meister</div>
              </div>
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-green-400">{data.skilled_workers}</div>
                <div className="text-sm text-gray-300">Gesellen</div>
              </div>
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-lg font-bold text-purple-400">{data.office_workers}</div>
                <div className="text-sm text-gray-300">Bürokräfte</div>
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

          {/* Schulungen und Zertifikate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300">Schulungsstunden/Mitarbeiter/Jahr</div>
              <div className="text-lg font-bold text-white">{data.annual_training_hours_per_employee || 0} Stunden</div>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300">Mitarbeiterzertifikate</div>
              <div className="text-lg font-bold text-white">{data.employee_certifications?.length || 0} Zertifikate</div>
            </div>
          </div>

          {/* Mitarbeiterzertifikate Details */}
          {data.employee_certifications && data.employee_certifications.length > 0 && (
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Mitarbeiterzertifikate
              </h4>
              <div className="space-y-2">
                {data.employee_certifications.map((cert, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white">{cert.name}</div>
                        <div className="text-sm text-gray-300">
                          {cert.employees_certified} Mitarbeiter zertifiziert
                        </div>
                      </div>
                      {cert.renewal_interval && (
                        <Badge variant="outline" className="text-xs">
                          Alle {cert.renewal_interval}
                        </Badge>
                      )}
                    </div>
                  </div>
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
                <Label htmlFor="office_workers" className="text-gray-200">Bürokräfte</Label>
                <Input
                  id="office_workers"
                  type="number"
                  min="0"
                  value={formData.office_workers}
                  onChange={(e) => setFormData(prev => ({ ...prev, office_workers: parseInt(e.target.value) || 0 }))}
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
              {(industrySpecificQualifications[businessData.industry] || []).map((qualification) => (
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

          {/* Schulungen und Mitarbeiterzertifikate */}
          <div>
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Schulungen und Mitarbeiterzertifikate
            </h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="annual_training_hours" className="text-gray-200">
                  Jährliche Schulungsstunden pro Mitarbeiter
                </Label>
                <Input
                  id="annual_training_hours"
                  type="number"
                  min="0"
                  value={formData.annual_training_hours_per_employee}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    annual_training_hours_per_employee: parseInt(e.target.value) || 0 
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="z.B. 24"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Durchschnittliche Schulungsstunden pro Mitarbeiter im Jahr
                </p>
              </div>

              <div>
                <Label className="text-gray-200 mb-2 block">Mitarbeiterzertifikate</Label>
                <div className="space-y-3">
                  {formData.employee_certifications.map((cert, index) => (
                    <div key={index} className="flex gap-2 items-start bg-gray-700 p-3 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Zertifikatsname"
                          value={cert.name}
                          onChange={(e) => {
                            const newCerts = [...formData.employee_certifications];
                            newCerts[index].name = e.target.value;
                            setFormData(prev => ({ ...prev, employee_certifications: newCerts }));
                          }}
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Anzahl zertifiziert"
                            value={cert.employees_certified}
                            onChange={(e) => {
                              const newCerts = [...formData.employee_certifications];
                              newCerts[index].employees_certified = parseInt(e.target.value) || 0;
                              setFormData(prev => ({ ...prev, employee_certifications: newCerts }));
                            }}
                            className="bg-gray-600 border-gray-500 text-white"
                          />
                          <Input
                            placeholder="Erneuerung (z.B. 2 Jahre)"
                            value={cert.renewal_interval || ''}
                            onChange={(e) => {
                              const newCerts = [...formData.employee_certifications];
                              newCerts[index].renewal_interval = e.target.value;
                              setFormData(prev => ({ ...prev, employee_certifications: newCerts }));
                            }}
                            className="bg-gray-600 border-gray-500 text-white"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newCerts = formData.employee_certifications.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, employee_certifications: newCerts }));
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        employee_certifications: [
                          ...prev.employee_certifications,
                          { name: '', employees_certified: 0, renewal_interval: '' }
                        ]
                      }));
                    }}
                    className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    + Zertifikat hinzufügen
                  </Button>
                </div>
              </div>
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