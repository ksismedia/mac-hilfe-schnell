
// Popup Script - UI Logic für die Chrome Extension
console.log('SEO Analyzer Popup geladen');

// DOM-Elemente
const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');

// App-URLs (anpassbar) - Ihre deployed Lovable App URL
const APP_URLS = [
  'https://mac-hilfe-schnell.lovable.app',  // Ihre deployed Lovable App - HAUPT-URL
  'http://localhost:3000',                   // Lokale Entwicklung
  'http://localhost:5173'                    // Vite dev server
];

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

// Prüft ob die App geöffnet ist
async function findAppTab() {
  for (const appUrl of APP_URLS) {
    try {
      const tabs = await chrome.tabs.query({ url: `${appUrl}/*` });
      if (tabs.length > 0) {
        console.log(`App-Tab gefunden unter: ${appUrl}`);
        return tabs[0];
      }
    } catch (error) {
      console.log(`App nicht gefunden unter: ${appUrl}`);
    }
  }
  return null;
}

// Sendet Daten an die App
async function sendDataToApp(websiteData) {
  console.log('Starte Datenübertragung zur App...');
  
  // 1. Versuche an bereits geöffnete App zu senden
  const appTab = await findAppTab();
  
  if (appTab) {
    console.log('App-Tab gefunden, sende Daten...');
    
    try {
      // Sende direkt an den App-Tab
      await chrome.tabs.sendMessage(appTab.id, {
        type: 'EXTENSION_WEBSITE_DATA',
        source: 'seo-analyzer-extension',
        data: websiteData
      });
      
      // Wechsle zur App
      await chrome.tabs.update(appTab.id, { active: true });
      await chrome.windows.update(appTab.windowId, { focused: true });
      
      return { success: true, method: 'existing-tab' };
    } catch (error) {
      console.log('Fehler beim Senden an bestehenden Tab:', error);
    }
  }
  
  // 2. Öffne neue App-Instanz mit Daten in URL
  const encodedData = encodeURIComponent(JSON.stringify({
    source: 'extension',
    timestamp: Date.now(),
    data: websiteData
  }));
  
  // Verwende die Haupt-App-URL
  const appUrl = `${APP_URLS[0]}?data=${encodedData}`;
  
  console.log('Öffne neue App-Instanz unter:', appUrl);
  
  try {
    const newTab = await chrome.tabs.create({ 
      url: appUrl,
      active: true
    });
    
    console.log('Neue App-Tab erstellt:', newTab.id);
    return { success: true, method: 'new-tab' };
  } catch (error) {
    console.error('Fehler beim Öffnen der neuen App-Tab:', error);
    throw new Error('App konnte nicht geöffnet werden');
  }
}

// Hauptfunktion für Website-Analyse
async function analyzeWebsite() {
  try {
    showStatus('Extrahiere Website-Daten...', 'loading');
    analyzeBtn.disabled = true;
    
    // Aktuelle Tab-Informationen
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.startsWith('http')) {
      throw new Error('Diese Seite kann nicht analysiert werden');
    }
    
    console.log('Analysiere Website:', tab.url);
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'extractData' 
      });
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Content Script antwortet nicht');
      }
      
      const websiteData = response.data;
      console.log('Website-Daten erfolgreich extrahiert');
      
      showStatus('Öffne Analyzer-App...', 'loading');
      
      // Sende Daten an die App
      const sendResult = await sendDataToApp(websiteData);
      
      if (sendResult.success) {
        showStatus(`✓ App geöffnet! (${sendResult.method === 'existing-tab' ? 'Tab aktualisiert' : 'Neue Tab erstellt'})`, 'success');
        
        // Schließe Popup nach 3 Sekunden
        setTimeout(() => {
          window.close();
        }, 3000);
      }
      
    } catch (connectionError) {
      console.log('Content Script nicht verfügbar, versuche Injection...');
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        showStatus('Content Script geladen, versuche erneut...', 'loading');
        
        // Warte und versuche erneut
        setTimeout(async () => {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, { 
              action: 'extractData' 
            });
            
            if (response && response.success) {
              const websiteData = response.data;
              showStatus('Öffne Analyzer-App...', 'loading');
              const sendResult = await sendDataToApp(websiteData);
              
              if (sendResult.success) {
                showStatus(`✓ App geöffnet!`, 'success');
                setTimeout(() => window.close(), 3000);
              }
            } else {
              throw new Error('Content Script funktioniert nicht richtig');
            }
          } catch (retryError) {
            showStatus('❌ Fehler: Bitte Seite neu laden und erneut versuchen', 'error');
          }
        }, 1500);
        
      } catch (injectError) {
        console.error('Script Injection fehlgeschlagen:', injectError);
        showStatus('❌ Fehler: Bitte Seite neu laden und erneut versuchen', 'error');
      }
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
