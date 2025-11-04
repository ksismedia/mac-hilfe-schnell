import { Link } from 'react-router-dom';
import { Shield, FileText, Scale } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Firmeninfo */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg mb-3">UNNA Analyse-Tool</h3>
            <p className="text-sm text-muted-foreground">
              Professionelle Website-Analysen für Handwerksbetriebe und KMUs. 
              KI-gestützt und DSGVO-konform.
            </p>
          </div>

          {/* Rechtliches */}
          <div className="space-y-2">
            <h3 className="font-semibold mb-3">Rechtliches</h3>
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/privacy" 
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
              >
                <Shield className="h-4 w-4" />
                Datenschutzerklärung
              </Link>
              <Link 
                to="/imprint" 
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
              >
                <Scale className="h-4 w-4" />
                Impressum
              </Link>
              <Link 
                to="/compliance" 
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Compliance-Dokumentation
              </Link>
            </nav>
          </div>

          {/* Compliance Badges */}
          <div className="space-y-2">
            <h3 className="font-semibold mb-3">Compliance</h3>
            <div className="flex flex-wrap gap-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                DSGVO-konform
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                EU AI Act
              </div>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                SSL-gesichert
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Alle AI-generierten Inhalte unterliegen manueller Überprüfung gemäß EU AI Act.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {currentYear} UNNA Analyse-Tool. Alle Rechte vorbehalten.</p>
          <p className="mt-2 text-xs">
            Hosted in der EU • Powered by Supabase • KI-gestützte Analysen mit menschlicher Überprüfung
          </p>
        </div>
      </div>
    </footer>
  );
};
