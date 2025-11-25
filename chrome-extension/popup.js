// Popup Script
console.log('SEO Analyzer Popup geladen');

const analyzeBtn = document.getElementById('analyzeBtn');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');

const LOVABLE_APP_URL = 'https://id-preview--25bfc271-cf93-4b75-85b5-47a649c1832b.lovable.app';

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

// FINALE LÖSUNG: Nur wichtige Meta-Daten via URL (nicht kompletten Content)
async function openLovableApp(websiteData) {
  console.log('Öffne App...');
  
  try {
    let targetUrl = LOVABLE_APP_URL;
    
    if (websiteData && websiteData.url) {
      // NUR WICHTIGE DATEN (URL ist sonst zu lang!)
      const compactData = {
        url: websiteData.url,
        domain: websiteData.domain,
        title: websiteData.title,
        seo: {
          titleTag: websiteData.seo?.titleTag || '',
          metaDescription: websiteData.seo?.metaDescription || '',
          h1: websiteData.seo?.headings?.h1 || []
        }
      };
      
      const jsonString = JSON.stringify(compactData);
      const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
      targetUrl = `${LOVABLE_APP_URL}?extData=${encodedData}`;
      console.log('✅ Meta-Daten kodiert');
      
      // SPEICHERE KOMPLETTE DATEN IN LOCALSTORAGE
      localStorage.setItem('fullExtensionData', JSON.stringify({
        data: websiteData,
        timestamp: Date.now()
      }));
      console.log('✅ Komplette Daten in localStorage gespeichert');
    }

    await chrome.tabs.create({ 
      url: targetUrl,
      active: true
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Fehler:', error);
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
    
    let websiteData = null;
    try {
      websiteData = await extractWebsiteData();
      showStatus('✓ Daten extrahiert! Öffne App...', 'loading');
    } catch (extractError) {
      console.log('⚠️ Keine Daten');
      showStatus('⚠️ Öffne App...', 'loading');
    }
    
    const result = await openLovableApp(websiteData);
    
    if (result && result.success) {
      showStatus('✅ Erfolgreich!', 'success');
      setTimeout(() => window.close(), 1500);
    } else {
      showStatus('❌ Fehler', 'error');
    }
    
  } catch (error) {
    console.error('❌ Fehler:', error);
    showStatus('❌ Fehler: ' + error.message, 'error');
  } finally {
    setTimeout(() => analyzeBtn.disabled = false, 3000);
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
