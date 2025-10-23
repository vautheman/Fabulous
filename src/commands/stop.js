import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Arrête la musique et vide la file d\'attente'),

  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);

    // Vérifications
    if (!player) {
      return interaction.reply({
        content: '❌ Aucune musique en cours de lecture.',
        flags: 64, // ephemeral
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

    // Arrêt et déconnexion - Utiliser la bonne méthode
    player.queue.tracks = []; // Vider la queue
    player.queue.current = null; // Supprimer la piste actuelle
    await player.stopPlaying();
    await player.destroy();

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('⏹️ Lecture arrêtée et file d\'attente vidée')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};