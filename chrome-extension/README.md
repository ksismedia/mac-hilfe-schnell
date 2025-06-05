
# SEO Website Analyzer - Chrome Extension

Diese Chrome Extension ermöglicht es, Websites direkt im Browser zu analysieren und die Daten an die SEO Analyzer App zu senden.

## Installation (Entwicklermodus)

1. **Chrome öffnen** und zu `chrome://extensions/` navigieren
2. **Entwicklermodus aktivieren** (Toggle oben rechts)
3. **"Entpackte Erweiterung laden"** klicken
4. **Ordner auswählen**: Wählen Sie den `chrome-extension` Ordner aus
5. **Extension ist installiert** - Icon erscheint in der Toolbar

## Nutzung

1. **Website öffnen** die Sie analysieren möchten
2. **Extension-Icon klicken** (Lupen-Symbol in Chrome-Toolbar)
3. **"Website analysieren" klicken**
4. **SEO Analyzer App öffnet sich** automatisch mit den Daten

## Features

- ✅ **Vollständige SEO-Datenextraktion** ohne CORS-Probleme
- ✅ **Title-Tags & Meta-Descriptions** direkt erfassen
- ✅ **Überschriften-Struktur** (H1-H6) analysieren
- ✅ **Alt-Tags für Bilder** prüfen
- ✅ **Kontaktinformationen** automatisch finden
- ✅ **Impressum & Datenschutz** erkennen
- ✅ **Links** (intern/extern) analysieren
- ✅ **Automatische App-Integration**

## Technische Details

- **manifest.json**: Extension-Konfiguration (V3)
- **content.js**: Läuft auf Websites und extrahiert Daten
- **popup.html/js**: Benutzeroberfläche der Extension
- **PostMessage API**: Kommunikation mit der Analyzer-App

## Vorteile gegenüber API-Lösungen

| Feature | Chrome Extension | API-Services |
|---------|------------------|--------------|
| CORS-Probleme | ❌ Keine | ✅ Häufig |
| Kosten | ❌ Kostenlos | 💰 $20-200/Monat |
| Vollständige Daten | ✅ 100% | ⚠️ Begrenzt |
| Installation | ⚠️ Einmalig | ❌ Keine |
| Offline-Nutzung | ✅ Ja | ❌ Nein |

## Entwicklung & Anpassung

Die Extension kann einfach angepasst werden:

- **Neue Datenfelder** in `content.js` hinzufügen
- **UI-Styling** in `popup.html` ändern
- **App-URLs** in `popup.js` konfigurieren

## Publish (Optional)

Für produktive Nutzung kann die Extension im Chrome Web Store veröffentlicht werden.
