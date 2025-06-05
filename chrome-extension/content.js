
// Content Script - Läuft auf jeder Website und extrahiert SEO-relevante Daten
console.log('SEO Analyzer Content Script geladen');

function extractWebsiteData() {
  console.log('Extrahiere Website-Daten...');
  
  const data = {
    // Basis-Informationen
    url: window.location.href,
    domain: window.location.hostname,
    title: document.title || '',
    
    // SEO Meta-Daten
    seo: {
      titleTag: document.title || 'Kein Title-Tag gefunden',
      metaDescription: document.querySelector('meta[name="description"]')?.content || 
                      document.querySelector('meta[property="og:description"]')?.content || 
                      'Keine Meta-Description gefunden',
      metaKeywords: document.querySelector('meta[name="keywords"]')?.content || '',
      
      // Überschriften-Struktur
      headings: {
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()).filter(text => text),
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()).filter(text => text),
        h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim()).filter(text => text)
      },
      
      // Alt-Tags für Bilder
      altTags: {
        total: document.querySelectorAll('img').length,
        withAlt: document.querySelectorAll('img[alt]:not([alt=""])').length,
        images: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt || '',
          hasAlt: img.alt && img.alt.trim().length > 0
        }))
      }
    },
    
    // Content-Analyse
    content: {
      fullText: document.body.textContent || '',
      wordCount: (document.body.textContent || '').split(/\s+/).filter(word => word.length > 0).length,
      
      // Links
      links: {
        internal: Array.from(document.querySelectorAll('a[href]'))
          .filter(link => link.href.includes(window.location.hostname))
          .map(link => ({
            href: link.href,
            text: link.textContent.trim(),
            title: link.title || ''
          })),
        external: Array.from(document.querySelectorAll('a[href]'))
          .filter(link => !link.href.includes(window.location.hostname) && link.href.startsWith('http'))
          .map(link => ({
            href: link.href,
            text: link.textContent.trim(),
            title: link.title || ''
          }))
      }
    },
    
    // Technische Daten
    technical: {
      hasImprint: document.body.textContent.toLowerCase().includes('impressum') ||
                 Array.from(document.querySelectorAll('a')).some(link => 
                   link.textContent.toLowerCase().includes('impressum') || 
                   link.href.toLowerCase().includes('impressum')
                 ),
      hasPrivacyPolicy: document.body.textContent.toLowerCase().includes('datenschutz') ||
                       Array.from(document.querySelectorAll('a')).some(link => 
                         link.textContent.toLowerCase().includes('datenschutz') || 
                         link.href.toLowerCase().includes('datenschutz')
                       ),
      hasContactForm: document.querySelectorAll('form').length > 0,
      
      // Strukturierte Daten
      structuredData: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch (e) {
            return null;
          }
        }).filter(data => data !== null)
    },
    
    // Performance-Indikatoren
    performance: {
      imageCount: document.querySelectorAll('img').length,
      scriptCount: document.querySelectorAll('script').length,
      cssCount: document.querySelectorAll('link[rel="stylesheet"]').length,
      resourcesWithoutAlt: document.querySelectorAll('img:not([alt])').length
    },
    
    // Kontakt-Informationen suchen
    contact: {
      phone: extractPhoneNumbers(),
      email: extractEmailAddresses(),
      address: extractAddresses()
    },
    
    // Zeitstempel
    extractedAt: new Date().toISOString()
  };
  
  console.log('Website-Daten extrahiert:', data);
  return data;
}

function extractPhoneNumbers() {
  const text = document.body.textContent;
  const phoneRegex = /(?:\+49|0)[1-9]\d{1,4}[\s\-]?\d{1,8}[\s\-]?\d{1,8}/g;
  const matches = text.match(phoneRegex) || [];
  return [...new Set(matches)]; // Duplikate entfernen
}

function extractEmailAddresses() {
  const text = document.body.textContent;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return [...new Set(matches)]; // Duplikate entfernen
}

function extractAddresses() {
  const text = document.body.textContent;
  // Einfache deutsche Adresserkennung
  const addressRegex = /\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?/g;
  const matches = text.match(addressRegex) || [];
  return [...new Set(matches)]; // Duplikate entfernen
}

// Message Listener für Kommunikation mit der Extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message erhalten:', request);
  
  if (request.action === 'extractData') {
    try {
      const websiteData = extractWebsiteData();
      console.log('Sende Website-Daten zurück:', websiteData);
      sendResponse({ success: true, data: websiteData });
    } catch (error) {
      console.error('Fehler beim Extrahieren der Daten:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  return true; // Wichtig für asynchrone Antworten
});

// Initial-Check ob auf einer analysierbaren Seite
if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
  console.log('SEO Analyzer bereit für:', window.location.href);
}
