#!/bin/bash
set -e

echo "🔍 Versions:"
echo "  Node: $(node --version)"
echo "  Java: $(java -version 2>&1 | head -n 1)"
echo "  yt-dlp: $(yt-dlp --version)"

# Mise à jour de yt-dlp au démarrage
echo "📦 Mise à jour de yt-dlp..."
pip3 install --upgrade --break-system-packages yt-dlp 2>/dev/null || true

# Fonction de nettoyage pour arrêt propre
cleanup() {
    echo "🛑 Arrêt des services..."
    kill -TERM $LAVALINK_PID $BOT_PID 2>/dev/null || true
    wait $LAVALINK_PID $BOT_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Démarrage de Lavalink
echo "🚀 Démarrage de Lavalink..."
cd /app/lavalink
java -Xmx512M -Xms256M -jar Lavalink.jar &
LAVALINK_PID=$!
cd /app

# Attendre que Lavalink soit prêt (max 60 secondes)
echo "⏳ Attente de Lavalink..."
for i in {1..60}; do
    if curl -sf http://localhost:2333 >/dev/null 2>&1; then
        echo "✅ Lavalink prêt!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Timeout: Lavalink n'a pas démarré"
        kill $LAVALINK_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Démarrage du bot Discord
echo "🤖 Démarrage du bot..."
node src/index.js &
BOT_PID=$!

echo "✅ Services démarrés"
echo "  Lavalink PID: $LAVALINK_PID"
echo "  Bot PID: $BOT_PID"

# Attendre que les processus se terminent
wait $BOT_PID $LAVALINK_PID