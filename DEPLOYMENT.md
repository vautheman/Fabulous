# 🚀 Déploiement sur Coolify (Raspberry Pi)

## 📋 Prérequis

- Raspberry Pi 4 (4GB RAM minimum recommandé)
- Coolify installé et fonctionnel
- Compte GitHub
- Token Discord Bot

## 🔧 Étape 1 : Préparer le dépôt GitHub

### 1.1 Créer un nouveau dépôt

```bash
# Depuis votre machine locale
cd fabulous-2.0

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Faire le premier commit
git commit -m "Initial commit - Discord Music Bot"

# Ajouter le remote GitHub (remplacer par votre URL)
git remote add origin https://github.com/votre-username/discord-music-bot.git

# Pousser sur GitHub
git branch -M main
git push -u origin main
```

### 1.2 Vérifier que .gitignore fonctionne

Assurez-vous que le fichier `.env` n'est PAS dans le dépôt :
```bash
git status
# Ne devrait PAS montrer .env
```

## 🐳 Étape 2 : Configuration Coolify

### 2.1 Créer une nouvelle application

1. Connectez-vous à votre Coolify : `http://votre-raspberry-pi:8000`
2. Cliquez sur **"+ New Resource"**
3. Sélectionnez **"Public Repository"**
4. Entrez l'URL de votre dépôt GitHub

### 2.2 Configuration du build

Dans les paramètres de l'application Coolify :

**Build Pack** : Dockerfile
**Dockerfile Location** : `./Dockerfile`
**Docker Compose** : Non (on utilise le Dockerfile simple)

### 2.3 Variables d'environnement

Dans l'onglet **"Environment Variables"**, ajoutez :

```env
DISCORD_TOKEN=votre_token_discord_ici
CLIENT_ID=votre_client_id_ici
GUILD_ID=votre_guild_id_optionnel
LAVALINK_PASSWORD=un_mot_de_passe_securise
```

**Important** : Cochez "Build Time" ET "Runtime" pour toutes les variables.

### 2.4 Configuration des ressources

**Pour Raspberry Pi 4 (4GB)** :
- **Memory Limit** : 1024 MB
- **Memory Reservation** : 256 MB
- **CPU Limit** : 2 cores

**Pour Raspberry Pi 4 (8GB)** :
- **Memory Limit** : 2048 MB
- **Memory Reservation** : 512 MB
- **CPU Limit** : 3 cores

### 2.5 Volumes persistants (Optionnel)

Si vous voulez garder les logs :

1. Dans **"Storage"** → **"Add Volume"**
2. Source : `/app/lavalink/logs`
3. Destination : `/var/lib/coolify/logs/music-bot`

## 🚀 Étape 3 : Déploiement

### 3.1 Premier déploiement

1. Cliquez sur **"Deploy"**
2. Attendez le build (5-10 minutes sur Raspberry Pi)
3. Surveillez les logs en temps réel

### 3.2 Vérifier les logs

Dans Coolify, onglet **"Logs"** :

Vous devriez voir :
```
🔍 Versions installées:
  - Node: v20.x.x
  - Java: openjdk 17.x.x
  - yt-dlp: 2025.xx.xx
📦 Mise à jour de yt-dlp...
🚀 Démarrage de Lavalink...
⏳ Attente de Lavalink...
✅ Lavalink est prêt!
🤖 Démarrage du bot Discord...
✅ Tous les services sont démarrés
```

## 🔄 Étape 4 : Mises à jour automatiques

### 4.1 Activer les auto-deployments dans Coolify

1. Dans les paramètres de l'app → **"General"**
2. Activez **"Auto Deploy on Git Push"**
3. Coolify générera un webhook

### 4.2 Configurer le webhook GitHub

1. Sur GitHub, allez dans **Settings** → **Webhooks** → **Add webhook**
2. Collez l'URL du webhook Coolify
3. Content type : `application/json`
4. Événements : **Just the push event**
5. Activez le webhook

Maintenant, chaque `git push` redéploiera automatiquement !

### 4.3 Mises à jour de Lavalink et yt-dlp

Les mises à jour se font automatiquement à chaque rebuild :
- **yt-dlp** : Mis à jour au démarrage du container
- **Lavalink** : Télécharge la dernière version au build
- **Plugins** : Téléchargés automatiquement par Lavalink

**Pour forcer une mise à jour :**
```bash
git commit --allow-empty -m "Force rebuild"
git push
```

Ou dans Coolify : **"Redeploy"** → **"Force Rebuild"**

## 📊 Étape 5 : Monitoring

### 5.1 Vérifier l'état

Dans Coolify :
- **Status** : Devrait être vert ✅
- **CPU/RAM** : Surveillez l'utilisation
- **Logs** : Vérifiez les erreurs

### 5.2 Commandes utiles

**Redémarrer le bot :**
```bash
# Dans Coolify : Restart Application
```

**Voir les logs en direct :**
```bash
# Dans Coolify : Logs → Enable Real-time
```

**Accéder au terminal :**
```bash
# Dans Coolify : Console
# Puis :
yt-dlp --version
ps aux | grep java
```

## 🐛 Dépannage

### Le bot ne démarre pas

1. Vérifiez les logs dans Coolify
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que le Raspberry Pi a assez de RAM libre

### Lavalink timeout

Si vous voyez "Timeout: Lavalink n'a pas démarré" :
- Augmentez la RAM allouée
- Vérifiez que le port 2333 n'est pas bloqué
- Redéployez avec "Force Rebuild"

### Out of Memory sur Raspberry Pi

Modifiez le Dockerfile, ligne Java :
```dockerfile
java -Xmx256M -Xms128M -jar Lavalink.jar
```

Puis redéployez.

### Mises à jour ne se déclenchent pas

Vérifiez :
1. Le webhook GitHub est actif
2. L'option "Auto Deploy" est activée dans Coolify
3. Les logs du webhook sur GitHub (Settings → Webhooks → Recent Deliveries)

## 🔒 Sécurité

### Variables sensibles

- ✅ Ne JAMAIS commiter le fichier `.env`
- ✅ Utilisez des mots de passe forts pour `LAVALINK_PASSWORD`
- ✅ Activez l'authentification 2FA sur GitHub
- ✅ Gardez votre Coolify à jour

### Firewall Raspberry Pi

Si vous exposez des ports :
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8000/tcp  # Coolify (si accès externe)
sudo ufw enable
```

## 📈 Optimisation Raspberry Pi

### Swap (si <4GB RAM)

```bash
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Modifier : CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### Limiter les logs

Dans Coolify, configurez la rotation des logs :
- **Max Log Size** : 50MB
- **Max Log Files** : 3

## 🎉 C'est terminé !

Votre bot Discord est maintenant :
- ✅ Déployé sur Coolify
- ✅ Auto-redéployé à chaque push GitHub
- ✅ Avec yt-dlp et Lavalink auto-mis à jour
- ✅ Monitoré en temps réel

**Commandes Discord disponibles :**
```
/play <lien ou recherche>
/pause
/stop
/skip
/queue
/nowplaying
/volume <0-200>
/clear
```

Profitez de votre bot ! 🎵