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
RUN npm ci --only=production

# Copie du code source
COPY . .

# Téléchargement de Lavalink
RUN mkdir -p lavalink && \
    cd lavalink && \
    wget -q https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar

# Copie de la configuration Lavalink
COPY application.yml lavalink/

# Création du script de démarrage
COPY start.sh /app
RUN chmod +x /app/start.sh

# Création du dossier logs
RUN mkdir -p /app/lavalink/logs

RUN apk add --no-cache curl

EXPOSE 2333

HEALTHCHECK --interval=10s --timeout=5s --retries=3 CMD curl -s -f -H "Authorization: youshallnotpass" http://localhost:2333/version > /dev/null || exit 1

CMD ["/app/start.sh"]