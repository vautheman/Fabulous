import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Chargement des commandes
for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  
  if ('data' in command.default && 'execute' in command.default) {
    commands.push(command.default.data.toJSON());
    console.log(`✅ Chargé: ${command.default.data.name}`);
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

try {
  console.log(`🔄 Déploiement de ${commands.length} commandes...`);

  // Pour tests: déploiement sur un serveur spécifique
  if (process.env.GUILD_ID) {
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log(`✅ ${data.length} commandes déployées sur le serveur de test`);
  } else {
    // Production: déploiement global
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log(`✅ ${data.length} commandes déployées globalement`);
  }
} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error);
}