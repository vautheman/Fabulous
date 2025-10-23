import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';

config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

try {
  console.log('🗑️ Suppression de toutes les commandes...');
  
  // Supprimer les commandes de guilde
  if (process.env.GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }
    );
    console.log('✅ Commandes de guilde supprimées');
  }
  
  // Supprimer les commandes globales
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: [] }
  );
  console.log('✅ Commandes globales supprimées');
  
} catch (error) {
  console.error('❌ Erreur:', error);
}