
// Popup Script - UI Logic für die Chrome Extension
console.log('SEO Analyzer Popup geladen');

// DOM-Elemente
const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');

// App-URLs (anpassbar)
const APP_URLS = [
  'http://localhost:8080',
  'https://localhost:3000',
  'https://your-app.lovable.app' // Ihre deployed App-URL
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
  
  const appUrl = `${APP_URLS[0]}/#/extension-data?data=${encodedData}`;
  
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
    
    // Extrahiere Daten von der Website
    console.log('Sende Extraktions-Request an Content Script...');
    const response = await chrome.tabs.sendMessage(tab.id, { 
      action: 'extractData' 
    });
    
    if (!response || !response.success) {
      throw new Error(response?.error || 'Fehler beim Extrahieren der Daten');
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
    
  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
    showStatus(`❌ Fehler: ${error.message}`, 'error');
  } finally {
    analyzeBtn.disabled = false;
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
