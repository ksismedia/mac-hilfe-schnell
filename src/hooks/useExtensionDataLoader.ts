import { useState } from 'react';
import { toast } from 'sonner';

const SUPABASE_URL = 'https://dfzuijskqjbtpckzzemh.supabase.co/functions/v1/extension-data-bridge';

export const useExtensionDataLoader = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadLatestExtensionData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retrieve-latest'
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Fehler beim Laden der Daten');
      }

      toast.success('Extension-Daten erfolgreich geladen!');
      return result.data;

    } catch (error) {
      console.error('Fehler beim Laden der Extension-Daten:', error);
      toast.error('Keine aktuellen Extension-Daten gefunden. Bitte Extension erneut ausführen.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { loadLatestExtensionData, isLoading };
};
