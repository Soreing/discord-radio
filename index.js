//####################### Dependencies #######################//
require('dotenv').config();

const Embeds = require('./embeds.js');

const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const { createAudioPlayer} = require('@discordjs/voice');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');

const { Client, Intents, MessageSelectMenu, MessageFlags } = require('discord.js');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_VOICE_STATES] 
});

const fs = require("fs");
const https = require("https");

//####################### Gloval Vars ########################//

var ready = false;
var prefix = ".";
var color  = '#FF0000'

var shuffle = false;
var loopQueue = false;
var loopTrack = false;

var queueIdx = -1;
var musicFolder = "./Music/";
var musicQueue = [
  "Touhou_Hisouten.ogg",
  "Shoujo_Misshitsu.ogg",
  "Reigin_Kansui.ogg",
];

const player = createAudioPlayer();

//######################## Functions #########################//

// Returns a timestamp in the format "[MM/DD/YYYY hh:mm:ss]"
function timeStamp(time) 
{
    var now = time === undefined ? new Date() : time;
    return ( "[" + (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear() + " " + now.getHours() + ":" + (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) + "]");
}

// Connects to the same voice channel where the user is
// Errors can arise when the user is not in a channel or when the bot has no join permission
function connectChannel(msg)
{
    var usrVoiceState = msg.guild.voiceStates.cache.find((id)=>{
        return id == msg.author.id; 
    });

    if(usrVoiceState !== undefined)
    {
        if(usrVoiceState.channel.joinable)
        {   
            var connection = joinVoiceChannel({
                channelId: usrVoiceState.channel.id,
                guildId: usrVoiceState.guild.id,
                adapterCreator: usrVoiceState.guild.voiceAdapterCreator,
            });

            msg.channel.send({embeds: [Embeds.info(color, "Joined your Voice Channel!")]});
        }
        else
        {   msg.channel.send({embeds: [Embeds.error(color, "Don't have permission to join your Voice Channel!")]});
        }
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Need to be in a Voice Channel to use this command!")]});
    }
}

// Disconnects from the voice channel if already connected to one
// Errors can arise when the bot is not in any voice channels
function disconnectChannel(msg)
{
    var botVoiceState = msg.guild.voiceStates.cache.find((id)=>{
        return id == client.user.id; 
    });

    if(botVoiceState !== undefined)
    {
        var connection = getVoiceConnection(msg.guild.id);
        if(connection !== undefined)
        {   connection.destroy();
        }

        msg.channel.send({embeds: [Embeds.info(color, "Left the Voice Channel!")]});
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Not in any Voice Channels to leave!")]});
    }
}

// Gets the next track from the Music Queue based on settings
// If no track is left, undefined is returned
function getNextTrack()
{
    if(musicQueue.length == 0)
    {   return undefined;
    }

    if(loopTrack)
    {   if(queueIdx < 0) {queueIdx = 0;}
        return musicQueue[queueIdx];
    }

    if(shuffle)
    {   var rnd = queueIdx;
        while(rnd == queueIdx)
        {   rnd =  Math.floor(Math.random() * musicQueue.length);
        }
        
        queueIdx = Math.floor(rnd);
        return musicQueue[queueIdx];
    }

    queueIdx++;
    if(queueIdx > musicQueue.length)
    {   if(!loopQueue)
        {   return undefined;
        }
        queueIdx = 0;
    }

    return musicQueue[queueIdx];
}
// Gets the current track from the Music Queue
// If the player finished or hasn't started, undefined is returned
function getCurentTrack() 
{
    return queueIdx < 0 || queueIdx >= musicQueue.length ? undefined : musicQueue[queueIdx];
}

// Starts playing music in the channel where the bot is connected
// Errors can arise when the bot is not in any voice channels

function playMusic(msg)
{
    var botVoiceState = msg.guild.voiceStates.cache.find((id)=>{
        return id == client.user.id; 
    });

    if(botVoiceState !== undefined)
    {
        var connection = getVoiceConnection(msg.guild.id);
        if(connection !== undefined)
        {   var track = getNextTrack();
            if(track !== undefined)
            {   var resource = createAudioResource(musicFolder+track, {
                    inputType: StreamType.OggOpus,
                });
                player.play(resource);
                connection.subscribe(player);

                msg.channel.send({embeds: [Embeds.trackInfo(color, "Started playing track", queueIdx+1, track)]});
            }
        }
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Need to join a Voice Channel before playing music!")]});
    }
}

// Play next track when idle
player.on(AudioPlayerStatus.Idle, () => {
    var track = getNextTrack();
    if (track !== undefined) 
    {   var resource = createAudioResource(musicFolder + track, 
        {   inputType: StreamType.OggOpus,
        });

        player.play(resource);
    }
});

// Pauses the current track
function pauseTrack(msg)
{
    player.pause(msg);
    msg.channel.send({embeds: [Embeds.info(color, "Paused playing track")]});
}

// Resumes the current track
function resumeTrack(msg)
{
    player.unpause(msg);
    msg.channel.send({embeds: [Embeds.trackInfo(color, "Resuming playing track", queueIdx+1, musicQueue[queueIdx])]});
}

// Restarts playing the current track
function restartTrack(msg)
{
    var track = getCurentTrack();
    if(track !== undefined)
    {   
        var resource = createAudioResource(musicFolder+track, {
            inputType: StreamType.OggOpus,
        });
        
        player.play(resource);
        msg.channel.send({embeds: [Embeds.trackInfo(color, "Rewinding current track", queueIdx+1, track)]});
    }
}

// Restarts the queue at track 0 and starts playing it
function restartQueue(msg)
{
    queueIdx = -1;
    var track = getNextTrack();
    if(track !== undefined)
    {   
        var resource = createAudioResource(musicFolder+track, {
            inputType: StreamType.OggOpus,
        });

        player.play(resource);
        msg.channel.send({embeds: [Embeds.trackInfo(color, "Restarting queue at track", queueIdx+1, track)]});
    }
}

// Restarts the queue at track 0 and starts playing it
function nextTrack(msg)
{
    var track = getNextTrack();
    if(track !== undefined)
    {   
        var resource = createAudioResource(musicFolder+track, {
            inputType: StreamType.OggOpus,
        });

        player.play(resource);
        msg.channel.send({embeds: [Embeds.trackInfo(color, "Skipping to the next track", queueIdx+1, track)]});
    }
}

// Restarts the queue at track 0 and starts playing it
function gotoTrack(msg, tokens)
{
    if(tokens.length > 1)
    {
        var trackNo = parseInt(tokens[1])-1;
        if(trackNo >= 0 && trackNo < musicQueue.length)
        {   queueIdx = trackNo;
            var track = musicQueue[trackNo];
            var resource = createAudioResource(musicFolder+track, {
                inputType: StreamType.OggOpus,
            });

            player.play(resource);
            msg.channel.send({embeds: [Embeds.trackInfo(color, "Skipping to track", queueIdx+1, track)]});
        }
    }
}

// List the music tracks in the queue with their ID
function listQueue(msg)
{
    msg.channel.send({embeds: [Embeds.listQueue(color, musicQueue)]});
}

// Adds a new music track to the queue at a specific ID (end by default)
function addMusic(msg, tokens)
{
    var idx = musicQueue.length;
    
    if(tokens.length > 2)
    {   var id = parseInt(tokens[2])-1;
        if(id >= 0 && id < musicQueue.length)
        {   idx = id;
        }
    }

    if(tokens.length > 1)
    {   msg.channel.send({embeds: [Embeds.trackInfo(color, "Added new track to the queue", idx+1, tokens[1])]});
        
        musicQueue.splice(idx, 0, tokens[1]);
        if(queueIdx >= idx)
        {   queueIdx++
        }
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Missing File Name to add a track!")]});
    }
}

// Removes a music track from the queue by ID or name
function removeMusic(msg, tokens)
{
    if(tokens.length > 1)
    {
        var idx = -1;
        var id = parseInt(tokens[1]);

        if((id+"") == tokens[1])
        {   idx = id - 1;
        }
        else
        {   idx = musicQueue.indexOf(tokens[1]);
        }

        if(idx >= 0 && idx < musicQueue.length)
        {   var track = musicQueue[idx];
            msg.channel.send({embeds: [Embeds.trackInfo(color, "Removed a track from the queue", "-", track)]});

            musicQueue.splice(idx, 1);
            if(queueIdx > idx )
            {   queueIdx--;
            }
        }
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Missing ID or File Name to remove a track!")]});
    }
}

// Toggles music track shuffling On/Off
function toggleShuffle(msg, tokens)
{
    if(tokens.length >1)
    {   
        switch(tokens[1])
        {   case "on": shuffle = true; break;
            case "off": shuffle = false; break;
            default: msg.channel.send({embeds: [Embeds.error(color, "Invalid Option! Expected [On/Off]")]});
        }
        msg.channel.send({embeds: [Embeds.settings(color, "Shuffle Tracks", tokens[1])]});
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Missing Option! Expected [On/Off]")]});
    }
}

// Toggles music track looping On/Off
function toggleLoopTrack(msg, tokens)
{
    if(tokens.length >1)
    {   
        switch(tokens[1])
        {   case "on": loopTrack = true; break;
            case "off": loopTrack = false; break;
            default: msg.channel.send({embeds: [Embeds.error(color, "Invalid Option! Expected [On/Off]")]}); return;
        }
        msg.channel.send({embeds: [Embeds.settings(color, "Loop Current Track", tokens[1])]});
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Missing Option! Expected [On/Off]")]});
    }
}

// Toggles music queue looping On/Off
function toggleLoopQueue(msg, tokens)
{
    if(tokens.length >1)
    {   
        switch(tokens[1])
        {   case "on": loopQueue = true; break;
            case "off": loopQueue = false; break;
            default: msg.channel.send({embeds: [Embeds.error(color, "Invalid Option! Expected [On/Off]")]});
        }
        msg.channel.send({embeds: [Embeds.settings(color, "Loop Queue", tokens[1])]});
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Missing Option! Expected [On/Off]")]});
    }
}

function downloadMusic(msg) {
    var attachments = msg.attachments;

    // If msg has no attachments, exit function
    if (!attachments)
    {   msg.channel.send({embeds: [Embeds.error(color, "No Attachments Detected!")]});
        return;
    }

    var oggAttachment = attachments.find(
        (attachment) => attachment.contentType == "audio/ogg"
    );

    // If msg has no ogg attachments, exit function
    if (!oggAttachment)
    {   msg.channel.send({embeds: [Embeds.error(color, "No Attachments are audio/ogg type!")]});
        return;
    }

    const file = fs.createWriteStream(musicFolder + "/" + oggAttachment.name);
    const request = https.get(oggAttachment.url, function (res) {
        res.pipe(file);
    });
}

// Displays status information about the radio
function statusInfo(msg)
{
    var botVoiceState = msg.guild.voiceStates.cache.find((id)=>{
        return id == client.user.id; 
    });

    if(botVoiceState !== undefined)
    {   msg.channel.send({embeds: [Embeds.status(color, queueIdx, musicQueue, loopQueue, loopTrack, shuffle)]});
    }
    else
    {   msg.channel.send({embeds: [Embeds.error(color, "Currently not in any Voice Channel!")]});
    }

}

//########################## Events ##########################//

// Event that executes when the client is ready
async function onReady() {
  ready = true;
  console.log("\x1b[33m" + timeStamp() + " Radio-Bot Started!\x1b[0m");
}

// Event that executes when the client detects a message created
// The message is tokenized into uniformly lowercase elements to be used for commands

async function onMessageCreate(msg)
{
	var ltokens = msg.content.toLowerCase().split(" ");
    var utokens = msg.content.split(" ");

	if(ltokens.length>0)
	{	switch(ltokens[0])
		{	case prefix+"connect" : connectChannel(msg); break; //OK
            case prefix+"disconnect" : disconnectChannel(msg); break; //OK
            case prefix+"play" : playMusic(msg); break; //OK
            case prefix+"pause" : pauseTrack(msg); break; //OK
            case prefix+"resume" : resumeTrack(msg); break; //OK
            case prefix+"restartqueue" : restartQueue(msg); break; //OK
            case prefix+"restarttrack" : restartTrack(msg); break; //OK
            case prefix+"next" : nextTrack(msg); break; //OK
            case prefix+"goto" : gotoTrack(msg, ltokens); break; //OK
            case prefix+"list" : listQueue(msg); break; //OK
            case prefix+"add" :  addMusic(msg, utokens);break; //OK
            case prefix+"remove" : removeMusic(msg, utokens); break; //OK

            case prefix+"loopqueue" : toggleLoopQueue(msg, ltokens); break;
            case prefix+"looptrack" : toggleLoopTrack(msg, ltokens); break;
            case prefix+"shuffle" : toggleShuffle(msg, ltokens); break; //OK

            case prefix+"download": downloadMusic(msg); break;
        
            case prefix+"help" : msg.channel.send({embeds:[Embeds.help()]}); break; 
            case prefix+"status" : statusInfo(msg); break; 
		}
	}	
}

client.on("ready", onReady);
client.on("messageCreate", onMessageCreate);

client.login(process.env.BOT_TOKEN);
