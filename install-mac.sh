
#!/bin/bash

# Mac Hilfe Schnell - Installations-Script
# Komplette Installation mit allen Abhängigkeiten

echo "🛠️  Mac Hilfe Schnell - Installation"
echo "==================================="

# Prüfe ob Homebrew installiert ist
if ! command -v brew &> /dev/null; then
    echo "📦 Installiere Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew bereits installiert"
fi

# Installiere Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installiere Node.js..."
    brew install node
else
    echo "✅ Node.js bereits installiert: $(node --version)"
fi

# Installiere Git
if ! command -v git &> /dev/null; then
    echo "📦 Installiere Git..."
    brew install git
else
    echo "✅ Git bereits installiert: $(git --version)"
fi

echo ""
echo "🎉 Installation abgeschlossen!"
echo ""
echo "Nächste Schritte:"
echo "1. Klonen Sie das Projekt: git clone [REPOSITORY-URL]"
echo "2. Wechseln Sie in den Projektordner: cd [PROJEKT-NAME]"
echo "3. Starten Sie das Tool: ./start-mac.sh"
echo ""
echo "Oder führen Sie beide Scripts nacheinander aus:"
echo "./install-mac.sh && ./start-mac.sh"
