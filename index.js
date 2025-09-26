import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import fetch from "node-fetch";

// Discord client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Env variables from Railway (set in Variables tab)
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const ADMIN_KEY = process.env.ADMIN_KEY;
const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL;

// Express app (keeps bot alive for Railway health checks)
const app = express();
app.get("/", (req, res) => res.send("✅ Discord bot is running!"));
app.listen(process.env.PORT || 3000);

// When bot is ready
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Listen for messages
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Command: !generate @user
  if (message.content.startsWith("!generate")) {
    if (
      !message.member.roles.cache.some(
        (role) => role.name === "✮ I Founder" || role.name === "Admin"
      )
    ) {
      return message.reply("⛔ You don’t have permission to generate codes.");
    }

    const mention = message.mentions.users.first();
    if (!mention) {
      return message.reply("⚠️ Please mention a user. Example: `!generate @user`");
    }

    try {
      const res = await fetch(${process.env.AUTH_URL}/generate, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
       adminKey: process.env.ADMIN_KEY,
       userId: userId
  }),
});

      const data = await res.json();
      if (data.error) {
        return message.reply(`❌ Error: ${data.error}`);
      }

      await mention.send(`🔑 Your LSFUT code is: **${data.code}** (valid for 2 minutes)`);
      message.reply(`✅ Code sent to ${mention.tag}`);
    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to contact auth server.");
    }
  }
});

client.login(DISCORD_TOKEN);
