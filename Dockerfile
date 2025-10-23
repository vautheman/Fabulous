FROM node:20-alpine

# Installation des dépendances système
RUN apk add --no-cache \
    python3 \
    py3-pip \
    openjdk17-jre \
    wget \
    bash

WORKDIR /app

# Installation de yt-dlp
RUN pip3 install yt-dlp --break-system-packages

# Copie et installation des dépendances Node.js
COPY package*.json ./
# RUN npm ci --only=production

# Copie du code source
COPY . .

# Téléchargement de Lavalink
RUN cd lavalink && \
    wget -q https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar

# Copie de la configuration Lavalink
# COPY application.yml lavalink/

# Création du script de démarrage
RUN echo '#!/bin/bash\n\
echo "🚀 Démarrage de Lavalink..."\n\
java -Xmx512M -Xms256M -jar /app/lavalink/Lavalink.jar &\n\
LAVALINK_PID=$!\n\
\n\
echo "⏳ Attente de Lavalink (30s)..."\n\
sleep 30\n\
\n\
echo "🤖 Démarrage du bot Discord..."\n\
node src/index.js &\n\
BOT_PID=$!\n\
\n\
# Gestion des signaux pour arrêt propre\n\
trap "echo \"Arrêt en cours...\"; kill $BOT_PID $LAVALINK_PID; exit" SIGTERM SIGINT\n\
\n\
# Attendre les processus\n\
wait'

# Création du dossier logs
RUN mkdir -p /app/lavalink/logs

EXPOSE 2333

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:2333', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm run start"]