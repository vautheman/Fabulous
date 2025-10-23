import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { LavalinkManager } from 'lavalink-client';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Client Discord avec intents nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Configuration Lavalink Manager
client.lavalink = new LavalinkManager({
  nodes: [
    {
      authorization: process.env.LAVALINK_PASSWORD,
      host: process.env.LAVALINK_HOST,
      port: parseInt(process.env.LAVALINK_PORT),
      id: 'main-node',
    },
  ],
  sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
  client: {
    id: process.env.CLIENT_ID,
  },
  queueOptions: {
    maxPreviousTracks: 25,
  },
  playerOptions: {
    clientBasedPositionUpdateInterval: 150,
    defaultSearchPlatform: 'ytsearch',
    volumeDecrementer: 0.75,
    onDisconnect: {
      autoReconnect: true,
      destroyPlayer: false,
    },
    onEmptyQueue: {
      destroyAfterMs: 30_000,
    },
  },
});

// Chargement des commandes
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  
  if ('data' in command.default && 'execute' in command.default) {
    client.commands.set(command.default.data.name, command.default);
    console.log(`✅ Commande chargée: ${command.default.data.name}`);
  } else {
    console.warn(`⚠️  Commande incomplète: ${file}`);
  }
}

// Event: Bot prêt
client.once('clientReady', async () => {
  console.log(`🤖 Bot connecté: ${client.user.tag}`);
  
  // Initialisation Lavalink
  await client.lavalink.init({
    id: client.user.id,
    username: client.user.username,
  });
  
  console.log('🎵 Lavalink initialisé');
});

// Event: Raw pour Lavalink
client.on('raw', d => client.lavalink.sendRawData(d));

// Event: Interactions (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Commande non trouvée: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Erreur lors de l'exécution de ${interaction.commandName}:`, error);
    
    const errorMessage = { 
      content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Events Lavalink pour logging
client.lavalink.on('trackStart', (player, track) => {
  console.log(`▶️  Lecture démarrée: ${track.info.title} - ${track.info.author}`);
  console.log(`📊 Player état:`, {
    playing: player.playing,
    paused: player.paused,
    connected: player.connected,
    voiceChannelId: player.voiceChannelId
  });
});

client.lavalink.on('trackEnd', (player, track, reason) => {
  console.log(`⏹️  Terminé: ${track.info.title} (raison: ${reason})`);
});

client.lavalink.on('trackError', (player, track, error) => {
  console.error(`❌ Erreur de lecture:`, error);
});

client.lavalink.on('trackStuck', (player, track, thresholdMs) => {
  console.warn(`⚠️  Track bloquée après ${thresholdMs}ms`);
});

client.lavalink.on('queueEnd', (player) => {
  console.log(`📭 File d'attente vide pour ${player.guildId}`);
});

client.lavalink.on('playerCreate', (player) => {
  console.log(`🎮 Player créé pour ${player.guildId}`);
});

client.lavalink.on('playerDestroy', (player) => {
  console.log(`💀 Player détruit pour ${player.guildId}`);
});

// Gestion des erreurs
process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Connexion du bot
client.login(process.env.DISCORD_TOKEN);