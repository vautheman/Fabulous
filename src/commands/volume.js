import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ajuste le volume de la musique')
    .addIntegerOption(option =>
      option
        .setName('niveau')
        .setDescription('Volume entre 0 et 200')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(200)
    ),

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

    const volume = interaction.options.getInteger('niveau');
    await player.setVolume(volume);

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setDescription(`🔊 Volume ajusté à **${volume}%**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};