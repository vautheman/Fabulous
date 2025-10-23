# 🎵 Discord Music Bot

Bot Discord de musique professionnel utilisant Lavalink et yt-dlp pour une qualité audio optimale.

## 🚀 Fonctionnalités

- ✅ Lecture de musique depuis YouTube (liens et recherche)
- ✅ File d'attente complète avec gestion des playlists
- ✅ Commandes play, pause, stop, skip, queue, nowplaying
- ✅ Embeds riches avec informations détaillées
- ✅ Support de yt-dlp via Lavalink pour contourner les restrictions YouTube
- ✅ Optimisé pour Raspberry Pi et Coolify
- ✅ Reconnexion automatique en cas de déconnexion

## 📋 Prérequis

- **Node.js 20 LTS** (recommandé pour stabilité)
- **Java 17+** (pour Lavalink)
- **Un token Discord Bot** avec les intents nécessaires
- **yt-dlp** installé sur le système

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd discord-music-bot
```

### 2. Installer les dépendances Node.js

```bash
npm install
```

### 3. Installer et configurer Lavalink

#### Télécharger Lavalink

```bash
mkdir lavalink
cd lavalink
wget https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar
```

#### Installer yt-dlp

**Sur Ubuntu/Debian/Raspberry Pi OS:**
```bash
sudo apt update
sudo apt install python3-pip
sudo pip3 install yt-dlp
```

**Vérifier l'installation:**
```bash
yt-dlp --version
```

#### Copier la configuration Lavalink

Copiez le fichier `application.yml` dans le dossier `lavalink/`

### 4. Configuration du bot

Créez un fichier `.env` à la racine du projet:

```bash
cp .env.example .env
```

Modifiez `.env` avec vos informations:

```env
DISCORD_TOKEN=votre_token_ici
CLIENT_ID=votre_client_id_ici
GUILD_ID=votre_guild_id_pour_test (optionnel)

LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```

### 5. Créer l'application Discord

1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Dans "Bot", créez un bot et copiez le token
4. Activez les intents: **Server Members Intent** et **Message Content Intent**
5. Dans "OAuth2 > URL Generator":
   - Sélectionnez `bot` et `applications.commands`
   - Permissions: `Connect`, `Speak`, `Use Voice Activity`, `Send Messages`, `Embed Links`
6. Utilisez l'URL générée pour inviter le bot

## 🎮 Démarrage

### Démarrer Lavalink

Dans un terminal séparé:

```bash
cd lavalink
java -jar Lavalink.jar
```

Attendez le message "Lavalink is ready to accept connections"

### Déployer les commandes slash

```bash
npm run deploy
```

### Démarrer le bot

```bash
npm start
```

Ou en mode développement avec auto-reload:

```bash
npm run dev
```

## 📝 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `/play <query>` | Joue une chanson (lien YouTube ou recherche) |
| `/pause` | Met en pause ou reprend la lecture |
| `/stop` | Arrête la musique et vide la file d'attente |
| `/skip` | Passe à la musique suivante |
| `/queue` | Affiche la file d'attente |
| `/nowplaying` | Affiche la musique en cours |

## 🐳 Déploiement sur Coolify (Raspberry Pi)

**[📖 Guide complet de déploiement →](DEPLOYMENT.md)**

Le bot peut être facilement déployé sur Coolify avec :
- ✅ Auto-déploiement à chaque push GitHub
- ✅ Mises à jour automatiques de Lavalink et yt-dlp
- ✅ Monitoring intégré
- ✅ Logs en temps réel

### Déploiement rapide

1. Push sur GitHub
2. Créer une app dans Coolify depuis votre dépôt
3. Ajouter les variables d'environnement
4. Déployer !

Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour les instructions détaillées.

## ⚡ Optimisation pour Raspberry Pi

### Option 1: Avec Docker (recommandé)

Créez un `Dockerfile`:

```dockerfile
FROM node:20-alpine

RUN apk add --no-cache python3 py3-pip openjdk17-jre wget

WORKDIR /app

# Installation yt-dlp
RUN pip3 install yt-dlp --break-system-packages

# Copie des fichiers
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Téléchargement Lavalink
RUN mkdir -p lavalink && \
    cd lavalink && \
    wget -q https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar

# Script de démarrage
RUN echo '#!/bin/sh\njava -jar /app/lavalink/Lavalink.jar &\nsleep 10\nnode src/index.js' > /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 2333

CMD ["/app/start.sh"]
```

Créez un `docker-compose.yml`:

```yaml
version: '3.8'

services:
  music-bot:
    build: .
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./logs:/app/lavalink/logs
    ports:
      - "2333:2333"
```

### Option 2: Installation directe

Sur votre Raspberry Pi:

```bash
# Installation Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installation Java 17
sudo apt install -y openjdk-17-jre

# Installation yt-dlp
sudo pip3 install yt-dlp

# Installation du bot
git clone <votre-repo>
cd discord-music-bot
npm install

# Lancer avec PM2 pour persistence
npm install -g pm2

# Démarrer Lavalink en arrière-plan
cd lavalink
pm2 start "java -jar Lavalink.jar" --name lavalink

# Démarrer le bot
cd ..
pm2 start src/index.js --name discord-music-bot

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

## 🔧 Configuration Coolify

1. Dans Coolify, créez une nouvelle application
2. Sélectionnez "Docker Compose" ou "Dockerfile"
3. Configurez les variables d'environnement
4. Déployez

## ⚡ Optimisation pour Raspberry Pi

### Limiter l'utilisation mémoire de Lavalink

Modifiez le démarrage de Lavalink:

```bash
java -Xmx512M -Xms256M -jar Lavalink.jar
```

### Configuration allégée dans application.yml

```yaml
lavalink:
  server:
    bufferDurationMs: 200
    frameBufferDurationMs: 3000
    youtubePlaylistLoadLimit: 3
```

## 🐛 Dépannage

### Lavalink ne se connecte pas

- Vérifiez que Java 17+ est installé: `java -version`
- Vérifiez que le port 2333 n'est pas utilisé: `netstat -tuln | grep 2333`
- Vérifiez les logs Lavalink dans `lavalink/logs/`

### Erreur "No results found"

- Vérifiez que yt-dlp est installé: `yt-dlp --version`
- Mettez à jour yt-dlp: `pip3 install -U yt-dlp`
- Vérifiez la configuration du plugin YouTube dans `application.yml`

### Le bot ne répond pas

- Vérifiez que les commandes sont déployées: `npm run deploy`
- Vérifiez les permissions du bot sur Discord
- Vérifiez les logs: `pm2 logs discord-music-bot`

### Problèmes de performance sur Raspberry Pi

- Réduisez la mémoire allouée à Lavalink
- Limitez le nombre de pistes en cache
- Utilisez un SSD plutôt qu'une carte SD

## 📊 Monitoring

Avec PM2:

```bash
pm2 status
pm2 monit
pm2 logs discord-music-bot
pm2 logs lavalink
```

## 🔄 Mise à jour

```bash
git pull
npm install
pm2 restart all
```

## 📝 Structure du projet

```
discord-music-bot/
├── src/
│   ├── commands/          # Commandes slash
│   │   ├── play.js
│   │   ├── pause.js
│   │   ├── stop.js
│   │   ├── skip.js
│   │   ├── queue.js
│   │   └── nowplaying.js
│   ├── index.js           # Point d'entrée
│   └── deploy-commands.js # Déploiement des commandes
├── lavalink/
│   ├── Lavalink.jar
│   └── application.yml
├── .env                   # Configuration (à créer)
├── .env.example
├── package.json
└── README.md
```

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 🔗 Liens utiles

- [Documentation Discord.js](https://discord.js.org/)
- [Documentation Lavalink](https://lavalink.dev/)
- [lavalink-client](https://lavalink.eu/docs/lavalink-client)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)

## ⚠️ Notes importantes

- **YouTube Restrictions**: Le plugin YouTube de Lavalink utilise plusieurs clients pour contourner les restrictions. Si vous rencontrez des problèmes, mettez à jour yt-dlp.
- **Rate Limiting**: YouTube peut limiter les requêtes. Le bot est configuré pour gérer ces limitations automatiquement.
- **Performances**: Sur Raspberry Pi, limitez le nombre de serveurs Discord où le bot est présent pour de meilleures performances.