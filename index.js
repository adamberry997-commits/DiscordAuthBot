import { Client, GatewayIntentBits, Partials } from "discord.js";
import fetch from "node-fetch"; // for calling your auth server
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel], // Needed so we can DM users
});

const TOKEN = process.env.DISCORD_TOKEN;      // your bot token
const ADMIN_KEY = process.env.ADMIN_KEY;      // same as in Railway
const AUTH_SERVER = process.env.AUTH_SERVER;  // your Railway URL (e.g. https://your-app.up.railway.app)

// Command prefix
const PREFIX = "!";

// Role that can run !generate
const ADMIN_ROLE = "Admin"; // change this to your actual role name

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "generate") {
    // Check for role
    if (!message.member.roles.cache.some((role) => role.name === ADMIN_ROLE)) {
      return message.reply("❌ You don’t have permission to use this command.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("❌ Please mention a user. Example: `!generate @User`");
    }

    try {
      // Call your Railway server to generate a code
      const response = await fetch(`${AUTH_SERVER}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: ADMIN_KEY,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (data.error) {
        return message.reply(`⚠️ Error: ${data.error}`);
      }

      // Send DM to user
      await user.send(
        `🔑 Your FUT Sniping Tool login code is: **${data.code}**\n\nThis code will expire in 2 minutes.`
      );

      message.reply(`✅ Code sent to ${user.tag}`);
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to generate code. Check the server logs.");
    }
  }
});

client.login(TOKEN);
