
# Mac Setup für Mac Hilfe Schnell

## Voraussetzungen

1. **Node.js installieren:**
   ```bash
   # Option 1: Von der offiziellen Website
   # Besuchen Sie https://nodejs.org/ und laden Sie die LTS-Version herunter
   
   # Option 2: Mit Homebrew (empfohlen)
   brew install node
   ```

2. **Git installieren (falls noch nicht vorhanden):**
   ```bash
   # Mit Homebrew
   brew install git
   
   # Oder von https://git-scm.com/download/mac
   ```

## Projekt Setup

### 1. Projekt von GitHub klonen
```bash
# Navigieren Sie zu Ihrem gewünschten Ordner
cd ~/Documents

# Klonen Sie das Repository
git clone [IHR-GITHUB-REPOSITORY-URL]
cd [PROJEKT-ORDNER-NAME]
```

### 2. Startroutine ausführbar machen
```bash
# Machen Sie das Start-Script ausführbar
chmod +x start-mac.sh
```

### 3. Tool starten
```bash
# Einfach das Start-Script ausführen
./start-mac.sh
```

## Alternative: Manuelle Befehle

Falls Sie das Script nicht verwenden möchten:

```bash
# 1. Dependencies installieren
npm install

# 2. Entwicklungsserver starten
npm run dev

# 3. Browser öffnen
open http://localhost:8080
```

## Wichtige Hinweise

### Google API Key
- Das Tool benötigt einen Google API Key für Live-Analysen
- Erstellen Sie einen API Key in der Google Cloud Console
- Aktivieren Sie folgende APIs:
  - Google Places API
  - PageSpeed Insights API
  - Geocoding API

### Umgebungsvariablen (optional)
Falls Sie den API Key dauerhaft setzen möchten:

```bash
# Erstellen Sie eine .env Datei im Projektordner
echo "VITE_GOOGLE_API_KEY=IHR_API_KEY_HIER" > .env
```

## Troubleshooting

### Port bereits belegt
Falls Port 8080 bereits verwendet wird:
```bash
# Anderen Port verwenden
npm run dev -- --port 3000
```

### Permission Denied Fehler
```bash
# Script-Berechtigungen setzen
chmod +x start-mac.sh
```

### Node.js Version zu alt
```bash
# Node.js Version prüfen (sollte >= 16 sein)
node --version

# Aktualisieren mit Homebrew
brew upgrade node
```

## Nützliche Befehle

```bash
# Projekt Build erstellen
npm run build

# Build-Version lokal testen
npm run preview

# Dependencies aktualisieren
npm update

# Cache leeren
npm start -- --force
```

## Support

Bei Problemen:
1. Prüfen Sie die Konsole auf Fehlermeldungen
2. Stellen Sie sicher, dass alle Dependencies installiert sind
3. Kontrollieren Sie Ihre Node.js Version
4. Prüfen Sie Ihre Internetverbindung für API-Calls
