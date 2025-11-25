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

// EINFACHSTE LÖSUNG: Öffne IMMER neuen Tab (kein Update von existierenden)
async function openLovableApp(websiteData) {
  console.log('📱 Öffne neuen Tab...');
  
  try {
    let targetUrl = LOVABLE_APP_URL;
    
    // Kodiere Daten als URL Parameter wenn vorhanden
    if (websiteData && websiteData.url) {
      console.log('📦 Kodiere Website-Daten für:', websiteData.url);
      const encodedData = btoa(JSON.stringify(websiteData));
      targetUrl = `${LOVABLE_APP_URL}?extData=${encodedData}`;
      console.log('✅ Daten kodiert');
    }

    // IMMER neuen Tab erstellen (kein Update!)
    await chrome.tabs.create({ 
      url: targetUrl,
      active: true
    });
    
    console.log('✅ Neuer Tab erstellt');
    return { success: true, hasData: !!(websiteData && websiteData.url) };
    
  } catch (error) {
    console.error('❌ Fehler:', error);
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
      
      // Warte für Injection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('📡 Versuche erneut...');
      const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
      
      if (retryResponse && retryResponse.success && retryResponse.data) {
        console.log('✅ Daten nach Injection extrahiert:', retryResponse.data.url);
        return retryResponse.data;
      }
      
      throw new Error('Content Script funktioniert nicht');
      
    } catch (secondError) {
      console.error('❌ Alle Versuche fehlgeschlagen');
      throw new Error('Datenextraktion fehlgeschlagen');
    }
  }
}

// Hauptfunktion für Website-Analyse
async function analyzeWebsite() {
  console.log('🚀 Starte Analyse...');
  
  try {
    showStatus('Extrahiere Website-Daten...', 'loading');
    analyzeBtn.disabled = true;
    
    // Extrahiere Website-Daten
    let websiteData = null;
    try {
      websiteData = await extractWebsiteData();
      console.log('✅ Daten extrahiert');
      showStatus('✓ Daten extrahiert! Öffne App...', 'loading');
    } catch (extractError) {
      console.log('⚠️ Keine Daten verfügbar');
      showStatus('⚠️ Öffne App ohne Daten...', 'loading');
    }
    
    // Öffne App
    const result = await openLovableApp(websiteData);
    
    if (result && result.success) {
      if (result.hasData) {
        showStatus('✅ Daten übertragen!', 'success');
      } else {
        showStatus('✅ App geöffnet', 'success');
      }
      
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      showStatus(`❌ Fehler: ${result && result.error ? result.error : 'Unbekannt'}`, 'error');
    }
    
  } catch (error) {
    console.error('❌ Fehler:', error);
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
  console.log('✅ Extension bereit');
});

// Keyboard-Shortcut (Enter)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !analyzeBtn.disabled) {
    analyzeWebsite();
  }
});
