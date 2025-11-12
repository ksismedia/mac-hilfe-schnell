import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Phone, Mail, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

interface CompanyDataInputProps {
  companyName: string;
  currentPhone?: string;
  currentEmail?: string;
  onUpdate: (data: { phone: string; email: string }) => void;
}

const companyDataSchema = z.object({
  phone: z.string().trim().max(50, { message: "Telefonnummer darf maximal 50 Zeichen lang sein" }),
  email: z.string().trim().max(255, { message: "E-Mail darf maximal 255 Zeichen lang sein" })
    .refine((val) => {
      if (!val) return true; // Optional field
      return z.string().email().safeParse(val).success;
    }, { message: "Ungültige E-Mail-Adresse" })
});

export const CompanyDataInput: React.FC<CompanyDataInputProps> = ({
  companyName,
  currentPhone,
  currentEmail,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(currentPhone || '');
  const [email, setEmail] = useState(currentEmail || '');
  const [errors, setErrors] = useState<{ phone?: string; email?: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    setPhone(currentPhone || '');
    setEmail(currentEmail || '');
  }, [currentPhone, currentEmail]);

  const handleSave = () => {
    const validation = companyDataSchema.safeParse({ phone, email });
    
    if (!validation.success) {
      const fieldErrors: { phone?: string; email?: string } = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as 'phone' | 'email';
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: "Validierungsfehler",
        description: "Bitte überprüfen Sie Ihre Eingaben",
        variant: "destructive"
      });
      return;
    }

    setErrors({});
    onUpdate({ phone: phone.trim(), email: email.trim() });
    setIsEditing(false);
    toast({
      title: "Gespeichert",
      description: "Unternehmensdaten wurden aktualisiert"
    });
  };

  const handleCancel = () => {
    setPhone(currentPhone || '');
    setEmail(currentEmail || '');
    setErrors({});
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Unternehmensdaten
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </CardTitle>
          <CardDescription>
            Kontaktinformationen für {companyName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Telefon:</strong> {currentPhone || 'Nicht erfasst'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>E-Mail:</strong> {currentEmail || 'Nicht erfasst'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Unternehmensdaten bearbeiten
        </CardTitle>
        <CardDescription>
          Kontaktinformationen für {companyName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefonnummer
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 123 456789"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-Mail-Adresse
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kontakt@unternehmen.de"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
