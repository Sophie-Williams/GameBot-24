/*
 * GameBot
 *
 * WARNING: This app is in a *very* early alpha stage.
 * It is most likely unstable and should NOT BE USED.
 * Have a nice day.
 */

//Load dependencies and setup some variables
const Discord = require('discord.js');
const config = require("./config.json");
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const url = config.dburl;
const client = new Discord.Client();
let prefix = config.prefix;
var secret = 0;

//Secret generation for really dangerous things
function generateSecret()
{
	secret = Math.floor((Math.random() * 1000000000) + 10000000);
}

//JSON thingies to make DB stuff easier
function blackmagic(json) {	return JSON.parse(json); }
function search(user) { return JSON.parse("{ \"uid\": \"" + user + "\"}"); }
function change(key, value) { return JSON.parse("{ \"" + key + "\": \"" + value + "\" }"); }
hp = "hp";
xp = "xp";
lvl = "lvl";
gold = "gold";

//Database functions that kinda work?
function addUser(uid)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection("users").insertOne(blackmagic("{ \"uid\": \"" + uid + "\", \"hp\": 0, \"xp\": 0, \"lvl\": 0, \"gold\": 0 }"), function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

function getUserData(userid)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection("users").find(blackmagic("{ \"uid\": \"" + userid + "\" }")).toArray(function(err, result) {
			if (err) throw err;
			if(result[0] == undefined) console.log("User " + userid + "does not exist."); //Make sure user exists before trying to print data.
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
		db.collection("users").updateOne(search(uid), change(hp, nhp), function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

function changeUserXP(uid, nxp)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection("users").updateOne(search(uid), change(xp, nxp), function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

function changeUserLevel(uid, nlvl)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection("users").updateOne(search(uid), change(lvl, nlvl), function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

function changeUserGold(uid, ngold)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db.collection("users").updateOne(search(uid), change(gold, ngold), function(err, res) {
			if (err) throw err;
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
