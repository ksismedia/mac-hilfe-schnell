
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

// Vereinfachte Methode - speichert Daten direkt in localStorage
async function openLovableApp(websiteData = null) {
  console.log('Öffne Lovable App:', websiteData ? 'mit Daten' : 'ohne Daten');
  
  try {
    // Suche nach bereits geöffneten Lovable-Tabs
    const existingTabs = await chrome.tabs.query({});
    const lovableTabs = existingTabs.filter(tab => 
      tab.url && tab.url.includes('lovable.app')
    );

    let targetTab = null;

    if (lovableTabs.length > 0) {
      // Verwende existierenden Tab
      targetTab = lovableTabs[0];
      console.log('✓ Existierender Lovable-Tab gefunden:', targetTab.id);
      await chrome.tabs.update(targetTab.id, { active: true });
      await chrome.windows.update(targetTab.windowId, { focused: true });
    } else {
      // Erstelle neuen Tab
      targetTab = await chrome.tabs.create({ 
        url: LOVABLE_APP_URL,
        active: true
      });
      console.log('✓ Neuer Lovable-Tab erstellt:', targetTab.id);
    }

    // Wenn wir Daten haben, speichere sie direkt im Tab
    if (websiteData && websiteData.url && targetTab.id) {
      const waitTime = lovableTabs.length > 0 ? 500 : 3000;
      
      setTimeout(async () => {
        try {
          console.log('📤 Übertrage Daten an Tab:', websiteData.url);
          
          await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            func: (data) => {
              // Speichere direkt in localStorage mit Timestamp
              const payload = {
                data: data,
                timestamp: Date.now()
              };
              localStorage.setItem('extensionWebsiteData', JSON.stringify(payload));
              
              // Trigger Event für sofortige Verarbeitung
              window.dispatchEvent(new CustomEvent('extensionDataReceived', { 
                detail: payload 
              }));
              
              console.log('✅ Extension-Daten gespeichert:', data.url);
            },
            args: [websiteData]
          });
          
          console.log('✅ Daten erfolgreich übertragen');
        } catch (error) {
          console.error('❌ Fehler beim Datenübertrag:', error);
        }
      }, waitTime);
    }

    return { success: true };
    
  } catch (error) {
    console.error('❌ Fehler in openLovableApp:', error);
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
        showStatus('✓ Daten an App übertragen!', 'success');
      } else {
        showStatus('✓ App geöffnet', 'success');
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
