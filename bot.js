/*
 * GameBot
 *
 * WARNING: This app is in a *very* early alpha stage.
 * It is most likely unstable and should NOT BE USED.
 * Have a nice day.
 */

//setup
const Discord = require('discord.js');
const config = require("./config.json");
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const url = config.dburl;
const client = new Discord.Client();
let prefix = config.prefix;
var secret = 0;

//Secret generation for things.
function generateSecret()
{
	secret = Math.floor((Math.random() * 1000000000) + 10000000);
}

//Database functions that might work?
function getUserData(userid)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		q = "{ \"uid\": \"" + userid + "\" }";
		var query = JSON.parse(q);
		db.collection("users").find(query).toArray(function(err, result) {
			if (err) throw err;
			if(result[0] == undefined) console.log("User " + userid + "does not exist.");
			else console.log(result[0]);
			return(result[0]);
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
		var userdata1 = "{ \"uid\": \"" + uid + "\", \"hp\": 0, \"xp\": 0, \"lvl\": 0, \"gold\": 0 }";
		var userdata = JSON.parse(userdata1);
		db.collection("users").insertOne(userdata, function(err, res) {
			if (err) throw err;
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
			console.log("Changed ${uid}'s level to ${nlvl}.");
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
			console.log("Changed ${uid}'s gold to ${ngold}.");
			db.close();
		});
	});
}

//when the bot does a start do morning things
client.on("ready", () => {
	console.log("GameBot started.");
});

//ooh new message
client.on("message", (message) => {
	//Get the args
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	//Commands
	if(command === "ping")
	{
		message.channel.send("Pong!");
	}
	else if(command === "adduser")
	{
		console.log("Adding user: " + args[0]); //add user
		try
		{
			addUser(args[0]);
			message.channel.send("Added user " + args[0] + " to database.");
			console.log("Successfully added " + args[0]);
		}
		catch(e)
		{
			message.channel.send("Error adding " + args[0] + "to database. Check the log for more info.");
			console.log(e);
		}
	}
	else if(command === "getdata")
	{
		try
		{
			message.channel.send("Stored data for " + args[0] + " will show up in the log.");
			console.log("User data for " + args[0]);
			udata = getUserData(args[0]);
		}
		catch (e)
		{
			message.channel.send("Error getting user data. Check the log for more info.");
			console.log("Error getting user data.");
			console.log(e);
		}
	}
	else if(command === "wipeuserdata")
	{
		if(secret == 0)
		{
			message.channel.send("Are you sure? This will wipe all user data from the database and every user will need to be added manually.");
			message.channel.send("If you are 100% sure, run this command with the secret that was just added to the log.");
			generateSecret();
			console.log("Are you sure? Secret is " + secret);
		}
		else if(args[0] == secret)
		{
			message.channel.send("Deleting all user data.");
			try
			{
				MongoClient.connect(url, function(err, db) {
	  			if (err) throw err;
	  			db.collection("users").drop(function(err, delOK) {
	    			if (err) throw err;
	    			if (delOK) console.log("All user data removed.");
	    			db.close();
	  			});
				});
			}
			catch(e)
			{
				message.channel.send("Error while deleting user data. Check the log for more info.")
				console.log(e);
			}
			secret = 0;
		}
		else
		{
			message.channel.send("Invalid secret. Generating a new one.");
			generateSecret();
		}
	}
});

//Run when someone joins
client.on("guildMemberAdd", (member) => {
  console.log(`New user "${member.user.username}" has joined "${member.guild.name}"` );
  member.guild.channels.get("welcome").send(`"Welcome, ${member.user.username}!"`);
});

//Error printing and stuff
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
if(config.debug == 1) client.on("debug", (e) => console.info(e));

client.login(config.token);
