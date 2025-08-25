
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

// Verbesserte Lovable App-Öffnung
async function openLovableApp(websiteData = null) {
  console.log('Öffne Lovable App mit Daten:', websiteData);
  
  try {
    // Erstelle neuen Tab mit der Lovable App
    const newTab = await chrome.tabs.create({ 
      url: LOVABLE_APP_URL,
      active: true
    });
    
    console.log('Lovable Tab erstellt:', newTab.id);
    
    // Warte bis Tab geladen ist, dann sende Daten
    if (websiteData && newTab.id) {
      // Warte etwas länger damit die App vollständig geladen ist
      setTimeout(async () => {
        try {
          const extensionPayload = {
            type: 'EXTENSION_WEBSITE_DATA',
            source: 'seo-analyzer-extension',
            timestamp: Date.now(),
            data: websiteData
          };
          
          // Speichere Daten im localStorage des neuen Tabs
          await chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            func: (payload) => {
              console.log('Extension: Speichere Daten in localStorage:', payload);
              localStorage.setItem('seo_extension_data', JSON.stringify({
                data: payload.data,
                timestamp: payload.timestamp
              }));
              
              // Sende auch PostMessage
              window.postMessage(payload, '*');
            },
            args: [extensionPayload]
          });
          
          console.log('Daten erfolgreich übertragen für:', websiteData.url);
        } catch (error) {
          console.error('Fehler beim Datenübertrag:', error);
        }
      }, 3000);
    }
    
    return { success: true, tabId: newTab.id };
    
  } catch (error) {
    console.error('Fehler beim Öffnen der Lovable App:', error);
    throw new Error(`App konnte nicht geöffnet werden: ${error.message}`);
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
    
    if (response && response.success) {
      console.log('Website-Daten erfolgreich extrahiert:', response.data);
      return response.data;
    } else {
      throw new Error('Content Script antwortet nicht');
    }
    
  } catch (error) {
    console.log('Content Script nicht verfügbar, versuche Injection...');
    
    // Injiziere Content Script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    // Warte kurz und versuche erneut
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
    
    if (retryResponse && retryResponse.success) {
      console.log('Website-Daten nach Injection erfolgreich extrahiert:', retryResponse.data);
      return retryResponse.data;
    } else {
      throw new Error('Content Script funktioniert nicht');
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
    
    if (result.success) {
      if (websiteData && websiteData.url) {
        showStatus('✓ App geöffnet mit Website-Daten!', 'success');
      } else {
        showStatus('✓ App geöffnet (ohne Website-Daten)', 'success');
      }
      
      // Schließe Popup nach 2 Sekunden
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
