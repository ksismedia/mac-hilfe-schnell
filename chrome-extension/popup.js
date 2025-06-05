
// Popup Script - UI Logic für die Chrome Extension
console.log('SEO Analyzer Popup geladen');

// DOM-Elemente
const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');

// Ihre deployed Lovable App URL
const LOVABLE_APP_URL = 'https://mac-hilfe-schnell.lovable.app';

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

// Öffnet Lovable App - vereinfacht und zuverlässiger
async function openLovableApp(websiteData = null) {
  console.log('Öffne Lovable App...');
  
  try {
    let targetUrl = LOVABLE_APP_URL;
    
    // Wenn Website-Daten vorhanden sind, füge sie als URL-Parameter hinzu
    if (websiteData) {
      const dataString = JSON.stringify({
        source: 'extension',
        timestamp: Date.now(),
        data: websiteData
      });
      const encodedData = encodeURIComponent(dataString);
      targetUrl = `${LOVABLE_APP_URL}?extensionData=${encodedData}`;
    }
    
    console.log('Öffne URL:', targetUrl);
    
    // Erstelle neuen Tab mit der Lovable App
    const newTab = await chrome.tabs.create({ 
      url: targetUrl,
      active: true
    });
    
    console.log('Lovable Tab erstellt:', newTab.id);
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
    
    if (retryResponse && retryResponse.success) {
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
      console.log('Website-Daten erfolgreich extrahiert:', websiteData);
    } catch (extractError) {
      console.log('Datenextraktion fehlgeschlagen:', extractError.message);
      // Fahre ohne Daten fort
    }
    
    showStatus('Öffne Lovable App...', 'loading');
    
    // Öffne Lovable App (mit oder ohne Daten)
    const result = await openLovableApp(websiteData);
    
    if (result.success) {
      if (websiteData) {
        showStatus('✓ App geöffnet mit Website-Daten!', 'success');
      } else {
        showStatus('✓ App geöffnet (ohne Datenextraktion)', 'success');
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
