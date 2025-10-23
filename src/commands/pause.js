import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Met en pause ou reprend la musique'),

  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);

    // Vérifications
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

    // Toggle pause - Vérifier l'état avant
    if (player.paused) {
      // Reprendre la lecture
      await player.resume();
    } else {
      // Mettre en pause
      await player.pause();
    }

    const embed = new EmbedBuilder()
      .setColor(player.paused ? '#FFA500' : '#00FF00')
      .setDescription(player.paused ? '⏸️ Lecture mise en pause' : '▶️ Lecture reprise')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};