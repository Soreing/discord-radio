//####################### Dependencies #######################//
require('dotenv').config();

const { Client, Intents, MessageSelectMenu } = require('discord.js');
const client = new Client({ intents: [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_VOICE_STATES] 
});


//####################### Gloval Vars ########################//

var ready  = false;
var prefix = ".";

//######################## Functions #########################//

// Returns a timestamp in the format "[MM/DD/YYYY hh:mm:ss]"
function timeStamp(time)
{
    var now = (time === undefined ? new Date() : time);
    return "["+(now.getMonth()+1)+'/'+now.getDate()+'/'+now.getFullYear()+" "+now.getHours()+':'+ (now.getMinutes() < 10 ? '0'+ now.getMinutes() : now.getMinutes()) + "]";
}

//########################## Events ##########################//

// Event that executes when the client is ready
async function onReady()
{
	ready = true;
	console.log("\x1b[33m" + timeStamp() + " Radio-Bot Started!\x1b[0m");
}

// Event that executes when the client detects a message created
// The message is tokenized into uniformly lowercase elements to be used for commands
async function onMessageCreate(msg)
{
	var ltokens = msg.content.toLowerCase().split(" ");

	if(ltokens.length>0)
	{	switch(ltokens[0])
		{	case prefix+"ping" : msg.channel.send("pong"); break;
		}
	}	
}

client.on("ready",   onReady);
client.on("messageCreate",   onMessageCreate);

client.login(process.env.BOT_TOKEN);