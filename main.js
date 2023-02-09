//Modules
const ScrapeYt = require("scrape-yt");
const spotify = require("spotify-url-info")
const Discord = require("discord.js");
const YTDL = require("discord-ytdl-core");
const { createWriteStream } = require("fs");

//Config file
const Config = require('./config/bot.json');

//New discord.js client
const Client = new Discord.Client();

//Event ready
Client.on("ready", () => {
    //If the bot is ready it returns a message in the console
    console.log("I'm ready !");
});

Client.on("message", async message => {

    //Do not detect bots
    if (message.author.bot) return;

    //If '<prefix>linkdownload' is typed
    if (message.content.startsWith(Config.prefix + "linkdownload")) {

        //Require args
        let args = message.content.split(' ').slice(1);

        //If no args is provided
        if (!args[0]) return message.channel.send(`⛔ | ${message.author}, Vas-y met une lien ou un titre batard !`);

        //New infos & stream
        let infos;
        let stream;

        try {
            //The bot is trying to find the music provided
            stream = YTDL(args.join(" "), { encoderArgs: ['-af', 'dynaudnorm=f=200'], fmt: 'mp3', opusEncoded: false });
            infos = await ScrapeYt.search(args.join(" "));
        } catch (e) {
            //If the music is not found
            return message.channel.send(`⛔ | ${message.author}, Je n'ai rien trouvé pour : ${args.join(" ")} !`);
        }

        try {
            //Confirmation message
            message.channel.send(`:notes: | ${message.author},  Je vais essayer d'envoyer ${infos[0].title} quand le téléchargement sera terminé...`);

            //Saving the file in the folder 'download'
            stream.pipe(createWriteStream(__dirname + `/download/${infos[0].title}.mp3`)).on('finish', () => {

                //Sending the mp3 file
                try {
                    message.channel.send(`🎵 | ${message.author}, music : ${infos[0].title} in mp3.`, new Discord.MessageAttachment(__dirname + `/download/${infos[0].title}.mp3`, `${infos[0].title}.mp3`))
                } catch (e) {
                    return message.channel.send(`⛔ | ${message.author}, Je n'ai pas réussi à envoyer la musique... peut-être est-elle trop lourde pour Discord ? Ou peut-être que je n'ai pas les permissions requises pour télécharger ce type de fichier sur ce serveur...`);
                }

            })
        } catch (e) {
            //If the music is not found
            return message.channel.send(`⛔ | ${message.author}, Je n'ai rien trouvé pour : ${args.join(" ")} ! Peut-être est-il impossible de récupérer cette musique...`);
        }
    }

});

//Client login
Client.login(Config.token);