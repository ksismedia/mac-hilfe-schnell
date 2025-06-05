// Popup Script - UI Logic für die Chrome Extension
console.log('SEO Analyzer Popup geladen');

// DOM-Elemente
const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');

// App-URLs (anpassbar) - Lovable URLs hinzugefügt
const APP_URLS = [
  'https://mac-hilfe-schnell.lovable.app',  // Ihre deployed Lovable App
  'http://localhost:3000',                   // Vite dev server
  'http://localhost:5173',                   // Standard Vite port
  'http://localhost:8080',                   // Alternative
  'https://your-app.lovable.app'            // Fallback
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
      console.log('Fehler beim Senden an bestehenden Tab, öffne neue App...');
    }
  }
  
  // 2. Öffne neue App-Instanz mit Daten in URL
  const encodedData = encodeURIComponent(JSON.stringify({
    source: 'extension',
    timestamp: Date.now(),
    data: websiteData
  }));
  
  // Versuche zuerst die deployed Lovable App
  const appUrl = `${APP_URLS[0]}?data=${encodedData}`;
  
  console.log('Öffne App unter:', appUrl);
  
  await chrome.tabs.create({ 
    url: appUrl,
    active: true
  });
  
  return { success: true, method: 'new-tab' };
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
    
    // Warte kurz und versuche dann das Content Script zu erreichen
    console.log('Sende Extraktions-Request an Content Script...');
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'extractData' 
      });
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Content Script antwortet nicht');
      }
      
      const websiteData = response.data;
      console.log('Website-Daten erhalten:', websiteData);
      
      showStatus('Sende Daten an Analyzer-App...', 'loading');
      
      // Sende Daten an die App
      const sendResult = await sendDataToApp(websiteData);
      
      if (sendResult.success) {
        showStatus(`✓ Analyse gestartet! (${sendResult.method === 'existing-tab' ? 'App aktualisiert' : 'App geöffnet'})`, 'success');
        
        // Schließe Popup nach 2 Sekunden
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        throw new Error('App konnte nicht erreicht werden');
      }
      
    } catch (connectionError) {
      console.log('Content Script nicht verfügbar, lade es neu...');
      
      // Versuche das Content Script zu injizieren
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Warte einen Moment und versuche es erneut
        setTimeout(async () => {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, { 
              action: 'extractData' 
            });
            
            if (response && response.success) {
              const websiteData = response.data;
              showStatus('Sende Daten an Analyzer-App...', 'loading');
              const sendResult = await sendDataToApp(websiteData);
              
              if (sendResult.success) {
                showStatus(`✓ Analyse gestartet! (${sendResult.method === 'existing-tab' ? 'App aktualisiert' : 'App geöffnet'})`, 'success');
                setTimeout(() => window.close(), 2000);
              }
            } else {
              throw new Error('Content Script funktioniert nicht');
            }
          } catch (retryError) {
            showStatus('❌ Fehler: Seite neu laden und erneut versuchen', 'error');
          }
        }, 1000);
        
      } catch (injectError) {
        showStatus('❌ Fehler: Bitte Seite neu laden und erneut versuchen', 'error');
      }
    }
    
  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
    showStatus(`❌ Fehler: ${error.message}`, 'error');
  } finally {
    setTimeout(() => {
      analyzeBtn.disabled = false;
    }, 2000);
  }
}

// Event Listeners
analyzeBtn.addEventListener('click', analyzeWebsite);

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  displayCurrentUrl();
  hideStatus();
});

// Keyboard-Shortcut (Enter)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !analyzeBtn.disabled) {
    analyzeWebsite();
  }
});
