import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue une chanson depuis YouTube')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('Lien YouTube ou recherche')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const query = interaction.options.getString('query', true); // true = required
    
    if (!query || query.trim() === '') {
      return interaction.editReply({
        content: '❌ Vous devez fournir un lien ou une recherche!',
        ephemeral: true,
      });
    }

    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    // Vérifications
    if (!voiceChannel) {
      return interaction.editReply({
        content: '❌ Vous devez être dans un salon vocal!',
        flags: 64,
      });
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return interaction.editReply({
        content: '❌ Je n\'ai pas les permissions pour rejoindre ou parler dans ce salon!',
        flags: 64,
      });
    }

    // Récupération ou création du player
    let player = interaction.client.lavalink.getPlayer(interaction.guildId);
    
    if (!player) {
      player = interaction.client.lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: voiceChannel.id,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: 100,
      });
    }

    // Connexion au salon vocal si nécessaire
    if (!player.connected) {
      console.log(`🔌 Connexion au salon vocal ${voiceChannel.id}...`);
      await player.connect();
      console.log(`✅ Connecté au salon vocal`);
    }

    try {
      // Log pour débogage
      console.log(`🔍 Recherche: "${query}"`);
      
      // Déterminer la source - Utiliser 'ytsearch' pour tout
      const searchQuery = query.startsWith('http') ? query : `ytsearch:${query}`;
      
      // Recherche de la musique
      const res = await player.search(
        {
          query: searchQuery,
        },
        interaction.user
      );
      
      console.log(`📊 Résultat de recherche:`, { 
        loadType: res?.loadType, 
        tracksFound: res?.tracks?.length || 0,
        hasException: !!res?.exception 
      });

      if (!res || !res.tracks || res.tracks.length === 0) {
        console.error('Aucun résultat de recherche:', { query, loadType: res?.loadType, exception: res?.exception });
        
        let errorMsg = '❌ Aucun résultat trouvé pour votre recherche.';
        
        if (res?.exception) {
          errorMsg += `\n**Erreur:** ${res.exception.message}`;
          console.error('Exception Lavalink:', res.exception);
        }
        
        return interaction.editReply(errorMsg);
      }

      // Ajout à la queue
      if (res.loadType === 'playlist') {
        await player.queue.add(res.tracks);
        
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('📝 Playlist ajoutée')
          .setDescription(`**${res.playlist.name}**\n${res.tracks.length} pistes ajoutées`)
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        const track = res.tracks[0];
        await player.queue.add(track);

        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle(player.playing ? '📝 Ajouté à la file' : '▶️ Lecture en cours')
          .setDescription(`[${track.info.title}](${track.info.uri})`)
          .addFields(
            { name: 'Artiste', value: track.info.author || 'Inconnu', inline: true },
            { name: 'Durée', value: formatDuration(track.info.duration), inline: true },
            { name: 'Position', value: `${player.queue.tracks.length}`, inline: true }
          )
          .setThumbnail(track.info.artworkUrl || null)
          .setFooter({ text: `Demandé par ${interaction.user.tag}` })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }

      // Démarrer la lecture si rien ne joue
      if (!player.playing && !player.paused) {
        console.log(`🎵 Démarrage de la lecture...`);
        await player.play();
        console.log(`✅ Lecture démarrée - État:`, {
          playing: player.playing,
          paused: player.paused,
          volume: player.volume,
          position: player.position
        });
      }

    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      console.error('Stack trace complet:', error.stack);
      
      let errorMessage = '❌ Une erreur est survenue lors de la recherche de la musique.';
      
      if (error.message) {
        errorMessage += `\n**Détails:** ${error.message}`;
      }
      
      return interaction.editReply(errorMessage);
    }
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