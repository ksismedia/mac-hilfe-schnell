// Popup Script
console.log('SEO Analyzer Popup geladen');

const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');

function showStatus(message, type = 'loading') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
}

function hideStatus() {
  statusDiv.style.display = 'none';
}

async function displayCurrentUrl() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    currentUrlDiv.textContent = url.hostname;
  } catch (error) {
    currentUrlDiv.textContent = 'Unbekannte Seite';
  }
}

const SUPABASE_URL = 'https://dfzuijskqjbtpckzzemh.supabase.co/functions/v1/extension-data-bridge';

// NEU: Speichere Daten in Supabase (kein neuer Tab!)
async function storeDataInSupabase(websiteData) {
  try {
    const sessionId = crypto.randomUUID();
    console.log('📤 Speichere Daten in Supabase...');
    
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'store',
        sessionId: sessionId,
        data: websiteData
      })
    });
    
    if (!response.ok) {
      throw new Error('Speichern fehlgeschlagen');
    }
    
    console.log('✅ Daten gespeichert mit Session ID:', sessionId);
    return { success: true, sessionId };
    
  } catch (error) {
    console.error('❌ Fehler beim Speichern:', error);
    return { success: false, error: error.message };
  }
}

async function extractWebsiteData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url || !tab.url.startsWith('http')) {
    throw new Error('Diese Seite kann nicht analysiert werden');
  }
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
    
    if (response && response.success && response.data) {
      console.log('✅ Daten extrahiert');
      return response.data;
    }
    
    throw new Error('Keine Antwort');
    
  } catch (firstError) {
    console.log('⚠️ Injiziere Content Script...');
    
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });
      
      if (retryResponse && retryResponse.success && retryResponse.data) {
        console.log('✅ Daten nach Injection extrahiert');
        return retryResponse.data;
      }
      
      throw new Error('Content Script funktioniert nicht');
      
    } catch (secondError) {
      console.error('❌ Extraction fehlgeschlagen');
      throw new Error('Datenextraktion fehlgeschlagen');
    }
  }
}

async function analyzeWebsite() {
  console.log('🚀 Starte Analyse...');
  
  try {
    showStatus('Extrahiere Daten...', 'loading');
    analyzeBtn.disabled = true;
    
    const websiteData = await extractWebsiteData();
    showStatus('Speichere Daten...', 'loading');
    
    const result = await storeDataInSupabase(websiteData);
    
    if (result && result.success) {
      showStatus('✅ Daten gespeichert! Jetzt in der App "Daten laden" klicken.', 'success');
      // KEIN neuer Tab! User geht zur bereits geöffneten Analyse
    } else {
      showStatus('❌ Fehler beim Speichern', 'error');
    }
    
  } catch (error) {
    console.error('❌ Fehler:', error);
    showStatus('❌ Fehler: ' + error.message, 'error');
  } finally {
    setTimeout(() => analyzeBtn.disabled = false, 2000);
  }
}

analyzeBtn.addEventListener('click', analyzeWebsite);

document.addEventListener('DOMContentLoaded', () => {
  displayCurrentUrl();
  hideStatus();
  console.log('✅ Extension bereit');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !analyzeBtn.disabled) {
    analyzeWebsite();
  }
});
