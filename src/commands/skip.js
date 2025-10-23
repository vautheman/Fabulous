import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Passe à la musique suivante'),

  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);

    if (!player || !player.queue.current) {
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

    if (player.queue.tracks.length === 0) {
      return interaction.reply({
        content: '❌ Aucune musique suivante dans la file d\'attente.',
        flags: 64,
      });
    }

    const skipped = player.queue.current;
    await player.skip();

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setDescription(`⏭️ Musique passée: **${skipped.info.title}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};