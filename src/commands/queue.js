import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Affiche la file d\'attente actuelle'),

  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);

    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ Aucune musique en cours de lecture.',
        flags: 64,
      });
    }

    const current = player.queue.current;
    const queue = player.queue.tracks;

    // Construction de l'embed
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('🎵 File d\'attente')
      .setThumbnail(current.info.artworkUrl || null)
      .addFields({
        name: '▶️ En cours de lecture',
        value: `[${current.info.title}](${current.info.uri})\n` +
               `**Artiste:** ${current.info.author}\n` +
               `**Durée:** ${formatDuration(current.info.duration)}\n` +
               `**Demandé par:** <@${current.requester.id}>`,
      });

    // Ajout des prochaines pistes (maximum 10)
    if (queue.length > 0) {
      const upcoming = queue.slice(0, 10).map((track, index) => 
        `**${index + 1}.** [${track.info.title}](${track.info.uri}) - ${formatDuration(track.info.duration)}`
      ).join('\n');

      embed.addFields({
        name: `📝 À venir (${queue.length} piste${queue.length > 1 ? 's' : ''})`,
        value: upcoming + (queue.length > 10 ? `\n*... et ${queue.length - 10} autre(s)*` : ''),
      });
    } else {
      embed.addFields({
        name: '📝 À venir',
        value: '*File d\'attente vide*',
      });
    }

    // Durée totale
    const totalDuration = queue.reduce((acc, track) => acc + track.info.duration, current.info.duration);
    embed.setFooter({ text: `Durée totale: ${formatDuration(totalDuration)}` });
    embed.setTimestamp();

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