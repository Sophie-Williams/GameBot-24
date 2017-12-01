/*
 * GameBot
 * 
 * WARNING: This app is in a *very* early alpha stage.
 * It is most likely unstable and should NOT BE USED.
 * Have a nice day.
 */
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");

client.on("ready", () => {
	console.log("GameBot started.");
});

client.on("message", (message) => {
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	if (talkedRecently.has(message.author.id)) return;

	// Adds the user to the set so that they can't talk for 2.5 seconds
	talkedRecently.add(message.author.id);
	
	setTimeout(() => {
		talkedRecently.delete(message.author.id);
	}, 2500);
	
	if(command === "ping")
	{
		message.channel.sendMessage("YO WASSUP");
	}
});

client.on("guildMemberAdd", (member) => {
  console.log(`New user "${member.user.username}" has joined "${member.guild.name}"` );
  member.guild.channels.get("welcome").send(`"Welcome, ${member.user.username}!"`);
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

if(config.debug == 1) client.on("debug", (e) => console.info(e));

client.login(config.token);
