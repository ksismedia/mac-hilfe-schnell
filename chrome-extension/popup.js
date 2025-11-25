
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

// EINFACHSTE LÖSUNG - Daten als URL Parameter
async function openLovableApp(websiteData = null) {
  console.log('Öffne Lovable App:', websiteData ? 'mit Daten' : 'ohne Daten');
  
  try {
    let targetUrl = LOVABLE_APP_URL;
    
    // Wenn wir Daten haben, kodiere sie als URL Parameter
    if (websiteData && websiteData.url) {
      console.log('📦 Kodiere Website-Daten...');
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

    return { success: true };
    
  } catch (error) {
    console.error('❌ Fehler:', error);
    throw new Error(`Fehler: ${error.message}`);
  }
}

// Website-Daten extrahieren
async function extractWebsiteData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.startsWith('http')) {
    throw new Error('Diese Seite kann nicht analysiert werden');
  }
  
  try {
    // Versuche Content Script zu kontaktieren
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
    
    if (response?.success && response?.data) {
      console.log('Website-Daten erfolgreich extrahiert:', response.data);
      return response.data;
    }
    
    throw new Error('Content Script antwortet nicht korrekt');
    
  } catch (error) {
    console.log('Content Script nicht verfügbar, versuche Injection...', error.message);
    
    try {
      // Injiziere Content Script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Warte kurz und versuche erneut
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
      
      if (retryResponse?.success && retryResponse?.data) {
        console.log('Website-Daten nach Injection erfolgreich extrahiert:', retryResponse.data);
        return retryResponse.data;
      }
      
      throw new Error('Content Script funktioniert nicht korrekt');
      
    } catch (injectionError) {
      console.error('Injection fehlgeschlagen:', injectionError);
      throw new Error('Content Script konnte nicht geladen werden');
    }
  }
}

// Hauptfunktion für Website-Analyse
async function analyzeWebsite() {
  console.log('Starte Website-Analyse...');
  
  try {
    showStatus('Extrahiere Website-Daten...', 'loading');
    analyzeBtn.disabled = true;
    
    // Extrahiere Website-Daten
    let websiteData = null;
    try {
      websiteData = await extractWebsiteData();
      console.log('Website-Daten erfolgreich extrahiert für:', websiteData?.url);
      
      if (websiteData && websiteData.url) {
        showStatus('✓ Daten extrahiert! Öffne App...', 'loading');
      }
    } catch (extractError) {
      console.log('Datenextraktion fehlgeschlagen:', extractError.message);
      showStatus('⚠️ Keine Daten extrahiert, öffne App...', 'loading');
    }
    
    // Öffne Lovable App (mit oder ohne Daten)
    const result = await openLovableApp(websiteData);
    
    if (result?.success) {
      if (websiteData?.url) {
        showStatus('✓ Daten an App übertragen!', 'success');
      } else {
        showStatus('✓ App geöffnet', 'success');
      }
      
      // Schließe Popup nach 2 Sekunden
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      showStatus('✓ App geöffnet', 'success');
      setTimeout(() => {
        window.close();
      }, 2000);
    }
    
  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
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
  console.log('Extension Popup initialisiert');
});

// Keyboard-Shortcut (Enter)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !analyzeBtn.disabled) {
    analyzeWebsite();
  }
});
