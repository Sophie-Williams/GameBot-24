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
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient;
const url = config.dburl;

//Database functions
function getUserData(uid)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var query = { id: uid };
		db.collection("users").find(query).toArray(function(err, result) {
			if (err) throw err;
			return(result);
			db.close();
		});
	}); 
}

function changeUserHP(uid, nhp)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		userquery = { id: uid };
		update = { hp: nhp };
		db.collection("users").updateOne(userquery, update, function(err, res) {
			if (err) throw err;
			console.log("Changed ${uid}'s HP to ${nhp}.");
			db.close();
		});
	}); 
}

function changeUserXP(uid, nxp)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		userquery = { id: uid };
		update = { xp: nxp };
		db.collection("users").updateOne(userquery, update, function(err, res) {
			if (err) throw err;
			console.log("Changed ${uid}'s XP to ${nxp}.");
			db.close();
		});
	}); 
}

function addUser(uid)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var userdata = { id: uid, hp: 0, xp: 0, lvl: 0, gold: 0 };
		db.collection("users").insertOne(userdata, function(err, res) {
			if (err) throw err;
			console.log("Added User ID ${uid} to users.");
			db.close();
		});
	}); 
}

function changeUserLevel(uid, nlvl)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		userquery = { id: uid };
		update = { lvl: nlvl };
		db.collection("users").updateOne(userquery, update, function(err, res) {
			if (err) throw err;
			console.log("Changed ${uid}'s HP to ${nlvl}.");
			db.close();
		});
	}); 
}

function changeUserGold(uid, ngold)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		userquery = { id: uid };
		update = { gold: ngold };
		db.collection("users").updateOne(userquery, update, function(err, res) {
			if (err) throw err;
			console.log("Changed ${uid}'s HP to ${ngold}.");
			db.close();
		});
	}); 
}

client.on("ready", () => {
	console.log("GameBot started.");
});

client.on("message", (message) => {
	//Get the args
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	//Get user data from database
	var user = getUserData(message.author.id);
	
	//Commands
	if(command === "ping")
	{
		message.channel.sendMessage("YO WASSUP");
	}
	
});

//Run when someone joins
client.on("guildMemberAdd", (member) => {
  console.log(`New user "${member.user.username}" has joined "${member.guild.name}"` );
  member.guild.channels.get("welcome").send(`"Welcome, ${member.user.username}!"`);
  addUser(member.user.id);
});

//Error printing
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

if(config.debug == 1) client.on("debug", (e) => console.info(e));

client.login(config.token);
