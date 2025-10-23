import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Vide la file d\'attente sans arrêter la musique en cours'),

  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);

    if (!player) {
      return interaction.reply({
        content: '❌ Aucune musique en cours de lecture.',
        flags: 64,
      });
    }

    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel || voiceChannel.id !== player.voiceChannelId) {
      return interaction.reply({
        content: '❌ Vous devez être dans le même salon vocal que le bot!',
        flags: 64,
      });
    }

    const queueSize = player.queue.tracks.length;

    if (queueSize === 0) {
      return interaction.reply({
        content: '❌ La file d\'attente est déjà vide.',
        flags: 64,
      });
    }

    player.queue.tracks = []; // Vider la queue correctement

    const embed = new EmbedBuilder()
      .setColor('#FF9900')
      .setDescription(`🗑️ File d'attente vidée (**${queueSize}** piste${queueSize > 1 ? 's' : ''} supprimée${queueSize > 1 ? 's' : ''})`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};