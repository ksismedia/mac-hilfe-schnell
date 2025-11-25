// Popup Script - UI Logic für die Chrome Extension
console.log('SEO Analyzer Popup geladen');

// DOM-Elemente
const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');

// Ihre deployed Lovable App URL
const LOVABLE_APP_URL = 'https://id-preview--25bfc271-cf93-4b75-85b5-47a649c1832b.lovable.app';

// Status-Funktionen
function showStatus(message, type = 'loading') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
}

function hideStatus() {
  statusDiv.style.display = 'none';
}

// Aktuelle URL anzeigen
async function displayCurrentUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    currentUrlDiv.textContent = url.hostname;
  } catch (error) {
    currentUrlDiv.textContent = 'Unbekannte Seite';
  }
}

// Lovable App öffnen mit Daten als URL Parameter
async function openLovableApp(websiteData) {
  console.log('📱 Öffne Lovable App...');
  
  try {
    let targetUrl = LOVABLE_APP_URL;
    
    // Kodiere Daten als URL Parameter wenn vorhanden
    if (websiteData && websiteData.url) {
      console.log('📦 Kodiere Website-Daten für:', websiteData.url);
      const encodedData = btoa(JSON.stringify(websiteData));
      targetUrl = `${LOVABLE_APP_URL}?extData=${encodedData}`;
      console.log('✅ Daten kodiert, Länge:', encodedData.length);
    }

    // Suche nach bereits geöffneten Lovable-Tabs
    const existingTabs = await chrome.tabs.query({});
    const lovableTabs = existingTabs.filter(tab => 
      tab.url && tab.url.includes('lovable.app')
    );

    if (lovableTabs.length > 0) {
      // Update existierenden Tab
      const targetTab = lovableTabs[0];
      await chrome.tabs.update(targetTab.id, { 
        url: targetUrl,
        active: true 
      });
      await chrome.windows.update(targetTab.windowId, { focused: true });
      console.log('✅ Existierender Tab aktualisiert');
    } else {
      // Erstelle neuen Tab
      await chrome.tabs.create({ 
        url: targetUrl,
        active: true
      });
      console.log('✅ Neuer Tab erstellt');
    }

    return { success: true, hasData: !!(websiteData && websiteData.url) };
    
  } catch (error) {
    console.error('❌ Fehler beim Öffnen der App:', error);
    return { success: false, error: error.message };
  }
}

// Website-Daten vom Content Script extrahieren
async function extractWebsiteData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url || !tab.url.startsWith('http')) {
    throw new Error('Diese Seite kann nicht analysiert werden');
  }
  
  try {
    // Versuch 1: Content Script direkt kontaktieren
    console.log('📡 Kontaktiere Content Script...');
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
    
    if (response && response.success && response.data) {
      console.log('✅ Daten erfolgreich extrahiert:', response.data.url);
      return response.data;
    }
    
    throw new Error('Content Script antwortet nicht korrekt');
    
  } catch (firstError) {
    console.log('⚠️ Content Script nicht verfügbar, injiziere neu...');
    
    try {
      // Versuch 2: Content Script injizieren
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Warte etwas länger für Injection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('📡 Versuche erneut nach Injection...');
      const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
      
      if (retryResponse && retryResponse.success && retryResponse.data) {
        console.log('✅ Daten nach Injection erfolgreich extrahiert:', retryResponse.data.url);
        return retryResponse.data;
      }
      
      throw new Error('Content Script funktioniert nicht korrekt');
      
    } catch (secondError) {
      console.error('❌ Alle Versuche fehlgeschlagen:', secondError);
      throw new Error('Datenextraktion fehlgeschlagen');
    }
  }
}

// Hauptfunktion für Website-Analyse
async function analyzeWebsite() {
  console.log('🚀 Starte Website-Analyse...');
  
  try {
    showStatus('Extrahiere Website-Daten...', 'loading');
    analyzeBtn.disabled = true;
    
    // Extrahiere Website-Daten
    let websiteData = null;
    try {
      websiteData = await extractWebsiteData();
      console.log('✅ Website-Daten erfolgreich extrahiert');
      showStatus('✓ Daten extrahiert! Öffne App...', 'loading');
    } catch (extractError) {
      console.log('⚠️ Datenextraktion fehlgeschlagen:', extractError.message);
      showStatus('⚠️ Öffne App ohne Daten...', 'loading');
      // Weiter ohne Daten
    }
    
    // Öffne Lovable App (mit oder ohne Daten)
    const result = await openLovableApp(websiteData);
    
    if (result && result.success) {
      if (result.hasData) {
        showStatus('✅ Daten erfolgreich übertragen!', 'success');
      } else {
        showStatus('✅ App geöffnet', 'success');
      }
      
      // Schließe Popup nach 2 Sekunden
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      showStatus(`❌ Fehler: ${result && result.error ? result.error : 'Unbekannter Fehler'}`, 'error');
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der Analyse:', error);
    showStatus(`❌ Fehler: ${error.message}`, 'error');
  } finally {
    setTimeout(() => {
      analyzeBtn.disabled = false;
    }, 3000);
  }
}

// Event Listeners
analyzeBtn.addEventListener('click', analyzeWebsite);

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  displayCurrentUrl();
  hideStatus();
  console.log('✅ Extension Popup initialisiert');
});

// Keyboard-Shortcut (Enter)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !analyzeBtn.disabled) {
    analyzeWebsite();
  }
});
