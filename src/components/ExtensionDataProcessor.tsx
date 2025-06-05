
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Globe, Zap, ArrowRight } from 'lucide-react';

interface ExtensionWebsiteData {
  url: string;
  domain: string;
  title: string;
  seo: {
    titleTag: string;
    metaDescription: string;
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
    };
    altTags: {
      total: number;
      withAlt: number;
    };
  };
  content: {
    fullText: string;
    wordCount: number;
  };
  technical: {
    hasImprint: boolean;
    hasPrivacyPolicy: boolean;
    hasContactForm: boolean;
  };
  contact: {
    phone: string[];
    email: string[];
    address: string[];
  };
  extractedAt: string;
}

interface ExtensionDataProcessorProps {
  extensionData: ExtensionWebsiteData;
  onProcessData: (businessData: any) => void;
  onDiscard: () => void;
}

const ExtensionDataProcessor: React.FC<ExtensionDataProcessorProps> = ({
  extensionData,
  onProcessData,
  onDiscard
}) => {
  const handleProcessExtensionData = () => {
    // Konvertiere Extension-Daten in BusinessData-Format
    const businessData = {
      address: extensionData.contact.address[0] || `${extensionData.domain} (aus Extension)`,
      url: extensionData.url,
      industry: 'shk' as const, // Default, Nutzer kann später ändern
      
      // Zusätzliche Extension-Daten für die Analyse
      extensionData: {
        realSeoData: {
          titleTag: extensionData.seo.titleTag,
          metaDescription: extensionData.seo.metaDescription,
          headings: extensionData.seo.headings,
          altTags: extensionData.seo.altTags,
          fullContent: extensionData.content.fullText
        },
        contactInfo: extensionData.contact,
        technicalInfo: extensionData.technical,
        wordCount: extensionData.content.wordCount,
        extractedAt: extensionData.extractedAt
      }
    };
    
    console.log('Verarbeite Extension-Daten:', businessData);
    onProcessData(businessData);
  };

  const extractedDate = new Date(extensionData.extractedAt).toLocaleString('de-DE');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-green-600" />
              Website-Daten von Chrome Extension erhalten!
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Live-Daten
              </Badge>
            </CardTitle>
            <CardDescription>
              Vollständige SEO-Daten wurden direkt von der Website extrahiert - keine CORS-Probleme!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Extrahierte Website</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>URL:</strong> {extensionData.url}</p>
                  <p><strong>Domain:</strong> {extensionData.domain}</p>
                  <p><strong>Title:</strong> {extensionData.seo.titleTag}</p>
                  <p><strong>Extrahiert am:</strong> {extractedDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">SEO-Daten</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>H1-Tags:</span>
                      <Badge variant="outline">{extensionData.seo.headings.h1.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>H2-Tags:</span>
                      <Badge variant="outline">{extensionData.seo.headings.h2.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Bilder:</span>
                      <Badge variant="outline">{extensionData.seo.altTags.total}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Mit Alt-Tags:</span>
                      <Badge variant={extensionData.seo.altTags.withAlt > 0 ? "default" : "destructive"}>
                        {extensionData.seo.altTags.withAlt}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Wörter:</span>
                      <Badge variant="outline">{extensionData.content.wordCount.toLocaleString()}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Meta-Description:</span>
                      <Badge variant={extensionData.seo.metaDescription.length > 10 ? "default" : "destructive"}>
                        {extensionData.seo.metaDescription.length > 10 ? "✓" : "✗"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Technisch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Impressum:</span>
                      <Badge variant={extensionData.technical.hasImprint ? "default" : "destructive"}>
                        {extensionData.technical.hasImprint ? "✓" : "✗"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Datenschutz:</span>
                      <Badge variant={extensionData.technical.hasPrivacyPolicy ? "default" : "destructive"}>
                        {extensionData.technical.hasPrivacyPolicy ? "✓" : "✗"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Kontaktformular:</span>
                      <Badge variant={extensionData.technical.hasContactForm ? "default" : "destructive"}>
                        {extensionData.technical.hasContactForm ? "✓" : "✗"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Kontaktinformationen */}
              {(extensionData.contact.phone.length > 0 || 
                extensionData.contact.email.length > 0 || 
                extensionData.contact.address.length > 0) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Gefundene Kontaktdaten:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {extensionData.contact.phone.length > 0 && (
                      <div>
                        <strong>Telefon:</strong>
                        <ul className="list-disc list-inside text-blue-700">
                          {extensionData.contact.phone.slice(0, 2).map((phone, i) => (
                            <li key={i}>{phone}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {extensionData.contact.email.length > 0 && (
                      <div>
                        <strong>E-Mail:</strong>
                        <ul className="list-disc list-inside text-blue-700">
                          {extensionData.contact.email.slice(0, 2).map((email, i) => (
                            <li key={i}>{email}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {extensionData.contact.address.length > 0 && (
                      <div>
                        <strong>Adresse:</strong>
                        <ul className="list-disc list-inside text-blue-700">
                          {extensionData.contact.address.slice(0, 2).map((address, i) => (
                            <li key={i}>{address}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleProcessExtensionData}
                  className="flex-1"
                  size="lg"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Analyse mit diesen Daten starten
                </Button>
                <Button 
                  variant="outline"
                  onClick={onDiscard}
                  size="lg"
                >
                  Daten verwerfen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExtensionDataProcessor;
