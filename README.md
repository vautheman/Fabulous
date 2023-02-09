![logo](https://github.com/vautheman/Fabulous/blob/main/.github/images/fabulous-bg.png?raw=true)

# 🤖 Fabulous (Discord Music Bot)

> Fabulous est un robot musical Discord construit avec TypeScript, discord.js et utilise le gestionnaire de commandes de [discordjs.guide](https://discordjs.guide)

## Éléments requis

1. Discord Bot Token **[Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**  
   1.1. Activez l'option "Message Content Intent" sur le portail des développeurs de Discord.
2. Approuvé sur Node.js 16.11.0

## 🚀 Pour commencer

```sh
git clone https://github.com/vautheman/Fabulous.git
cd Fabulous
npm install
```

Une fois l'installation terminée, suivez les instructions de configuration puis exécutez `npm run start` pour démarrer le bot.

## ⚙️ Configuration

Copiez ou Renommez `config.json.example` en `config.json` et remplissez les valeurs :

⚠️ **Note: Ne jamais communiquer ou partager publiquement votre jeton ou vos clés api** ⚠️

```json
{
  "TOKEN": "", // Votre Token Discord
  "MAX_PLAYLIST_SIZE": 10,
  "PREFIX": "/", // Prefix permettant d'exécuter les commandes discord
  "PRUNING": false,
  "LOCALE": "fr",
  "DEFAULT_VOLUME": 100,
  "STAY_TIME": 30
}
```

## 🐬 Configuration de Docker

Le fichier Dockerfile contient les informations suivante veillant au bon fonctionnement du bot. 

```shell
FROM node:16.14
WORKDIR /home/fabulous
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
```

Exécuter la commande suivante pour initialiser le container Docker

```shell
docker build . -t fabulous
```

Pour exécuter le container docker du bot Fabulous, taper la ligne suivante :

```shell
docker run -d --restart unless-stopped fabulous
```

> Note: --restart unless-stopped permet au container docker de démarrer automatiquement au redémarrage de la machine 

Pour arreter le container :

```shell
docker stop fabulous
```

Pour mettre à jour le container :

```shell
git pull
docker build . -t fabulous
```

## 📝 Fonctionnalités et commandes

> Note : Le préfixe par défaut est '/'.

- 🎶 Lire la musique de YouTube via url

`/play https://www.youtube.com/watch?v=GLvohMXgcBo`

- 🔎 Écouter de la musique depuis YouTube via une requête de recherche

`/play under the bridge red hot chili peppers`

- 🔎 Rechercher et sélectionner la musique à écouter

`/search Pearl Jam`

Répondez en indiquant le numéro de la chanson ou les numéros séparés par une virgule que vous souhaitez écouter.

Exemples: `1` ou `1,2,3`

- 📃 Lecture de listes de lecture youtube via url

`/playlist https://www.youtube.com/watch?v=YlUKcNNmywk&list=PL5RNCwK3GIO13SR_o57bGJCEmqFAwq82c`

- 🔎 Lecture de listes de lecture youtube via une requête de recherche

`/playlist linkin park meteora`

- Lecture en cours (!np)
- Système de file d'attente (!queue, !q)
- Boucle / Répétition (!loop)
- Aléatoire (!shuffle)
- Contrôle du volume (!volume, !v)
- Paroles (!lyrics, !ly)
- Pause (!pause)
- Reprise (!resume, !r)
- Sauter (!skip, !s)
- Passer à la chanson # dans la file d'attente (!skipto, !st)
- Déplacer un morceau dans la file d'attente (!move, !mv)
- Retirer le morceau # de la file d'attente (!remove, !rm)
- Afficher le ping vers l'API Discord (!ping)
- Afficher le temps de fonctionnement du bot (!uptime)
- Basculer l'élagage des messages du bot (!pruning)
- Aide (!help, !h)
- Gestionnaire de commandes de [discordjs.guide](https://discordjs.guide/)
- Contrôles des médias via Reactions

## 🌎 Langues

Les langues actuellement disponibles sont :

- Anglais (en)
- Arabe (ar)
- Portugais brésilien (pt_br)
- Tchèque (cs)
- Néerlandais (nl)
- Français (fr)
- Allemand (de)
- Grec (el)
- Indonésien (id)
- Italien (it)
- Japonais (ja)
- Coréen (ko)
- Minionais (mi)
- Persan (fa)
- polonais (pl)
- Russe (ru)
- Chinois simplifié (zh_cn)
- Mandarin de Singapour (zh_sg)
- Espagnol (es)
- Suédois (sv)
- Chinois traditionnel (zh_tw)
- Thaïlandais (th)
- Turc (tr)
- Ukrainien (uk)
- vietnamien (vi)
- Pour les langues, veuillez utiliser le format à deux lettres [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

<!-- 
## 🤝 Contributing

1. [Fork the repository](https://github.com/eritislami/evobot/fork)
2. Clone your fork: `git clone https://github.com/your-username/evobot.git`
3. Create your feature branch: `git checkout -b my-new-feature`
4. Stage changes `git add .`
5. Commit your changes: `cz` OR `npm run commit` do not use `git commit`
6. Push to the branch: `git push origin my-new-feature`
7. Submit a pull request -->
