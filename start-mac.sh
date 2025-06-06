
#!/bin/bash

# Mac Hilfe Schnell - Startroutine
# Dieses Script startet das Analyse-Tool lokal auf Ihrem Mac

echo "🚀 Mac Hilfe Schnell - Startroutine"
echo "=================================="

# Prüfe ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert!"
    echo "Bitte installieren Sie Node.js von: https://nodejs.org/"
    echo "Oder verwenden Sie Homebrew: brew install node"
    exit 1
fi

# Prüfe ob npm installiert ist
if ! command -v npm &> /dev/null; then
    echo "❌ npm ist nicht installiert!"
    echo "npm wird normalerweise mit Node.js mitgeliefert."
    exit 1
fi

echo "✅ Node.js Version: $(node --version)"
echo "✅ npm Version: $(npm --version)"
echo ""

# Prüfe ob package.json existiert
if [ ! -f "package.json" ]; then
    echo "❌ package.json nicht gefunden!"
    echo "Stellen Sie sicher, dass Sie im richtigen Projektordner sind."
    exit 1
fi

echo "📦 Installiere Dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Installieren der Dependencies!"
    exit 1
fi

echo "✅ Dependencies erfolgreich installiert"
echo ""

echo "🌟 Starte Entwicklungsserver..."
echo "Das Tool wird unter http://localhost:8080 verfügbar sein"
echo ""
echo "Drücken Sie Ctrl+C zum Beenden"
echo ""

# Öffne Browser nach 3 Sekunden
(sleep 3 && open http://localhost:8080) &

# Starte den Entwicklungsserver
npm run dev
