const { Client, IntentsBitField, Events, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
  ],
})

client.once(Events.ClientReady, c => {
  console.log(`Logged in as ${c.user.tag}`);

  const lookup = new SlashCommandBuilder()
    .setName("lookup")
    .setDescription("Lookup the user.")
    .addStringOption(option =>
      option
        .setName("user_id")
        .setDescription("For the lookup specified id.")
        .setRequired(true)
    );

  client.application.commands.create(lookup);
})

const scale_image_size = (url, size) => {
  let stackURL = "";

  if (url.endsWith(".webp")) {
    stackURL = url.replace(".webp", `.png?size=${String(size)}`);
  } else if (url.endsWith(".gif")) {
    stackURL = url.replace(".gif", `.gif?size=${String(size)}`);
  } else {
    console.log("ERR | (scale_image_size(url, size)) => unsupported file type. (" + url + ")");
  }

  return stackURL;
}

const handle_discord = async (user_id) => {
  let user_stats = {
    username: "",
    globalName: "",
    avatarURL: "",
    bannerURL: "",
    createDate: "",
    isBot: true,
  };

  let user = await client.users.fetch(user_id);

  user_stats.username = user.username;
  user_stats.globalName = user.globalName;
  user_stats.avatarURL = user.avatarURL() != undefined ? scale_image_size(user.avatarURL(), 1024) : "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png";
  user_stats.bannerURL = user.bannerURL() != undefined ? scale_image_size(user.bannerURL(), 1024) : "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png";
  user_stats.createDate = String(user.createdAt);
  user_stats.isBot = user.bot;

  return user_stats;
}

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "lookup") {
    const user_id = interaction.options.getString("user_id");

    let stat_data = {
      username: "",
      globalName: "",
      avatarURL: "",
      bannerURL: "",
      createDate: "",
      isBot: true,
    }

    try {
      stat_data = await handle_discord(user_id);
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${stat_data.username} (${stat_data.globalName})`, iconURL: stat_data.avatarURL })
        .setThumbnail(stat_data.avatarURL)
        .addFields(
          { name: "Account Create Date", value: stat_data.createDate },
          { name: "\u200B", value: "\u200B" },
          { name: "Is Bot?", value: String(stat_data.isBot), inline: true },
        )
        .setImage(stat_data.bannerURL)
        .setFooter({ text: interaction.user.username, iconURL: scale_image_size(interaction.user.avatarURL(), 512) });

      interaction.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      interaction.reply(`User Not Found`);
    }

  }
})

client.login(process.env.DISCORD_BOT_TOKEN);
