import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Affiche la musique en cours de lecture'),

  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);

    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ Aucune musique en cours de lecture.',
        flags: 64,
      });
    }

    const track = player.queue.current;
    const position = player.position;
    const duration = track.info.duration;

    // Barre de progression
    const progressBar = createProgressBar(position, duration);

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('🎵 En cours de lecture')
      .setDescription(`[${track.info.title}](${track.info.uri})`)
      .addFields(
        { name: 'Artiste', value: track.info.author || 'Inconnu', inline: true },
        { name: 'Durée', value: formatDuration(duration), inline: true },
        { name: 'Demandé par', value: `<@${track.requester.id}>`, inline: true },
        { name: 'Progression', value: `${progressBar}\n${formatDuration(position)} / ${formatDuration(duration)}` }
      )
      .setThumbnail(track.info.artworkUrl || null)
      .setFooter({ text: player.paused ? 'En pause' : 'Lecture en cours' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function createProgressBar(current, total, length = 20) {
  const progress = Math.floor((current / total) * length);
  const emptyProgress = length - progress;
  
  const progressBar = '▬'.repeat(progress) + '🔘' + '▬'.repeat(emptyProgress);
  return progressBar;
}