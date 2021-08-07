//####################### Dependencies #######################//
require("dotenv").config();

const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const { createAudioResource, StreamType } = require("@discordjs/voice");
const { createAudioPlayer } = require("@discordjs/voice");
const { AudioPlayerStatus } = require("@discordjs/voice");

const { Client, Intents, MessageSelectMenu } = require("discord.js");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

const fs = require("fs");
const https = require("https");

//####################### Gloval Vars ########################//

var ready = false;
var prefix = ".";

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
function timeStamp(time) {
  var now = time === undefined ? new Date() : time;
  return (
    "[" +
    (now.getMonth() + 1) +
    "/" +
    now.getDate() +
    "/" +
    now.getFullYear() +
    " " +
    now.getHours() +
    ":" +
    (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) +
    "]"
  );
}

// Connects to the same voice channel where the user is
// Errors can arise when the user is not in a channel or when the bot has no join permission
function connectChannel(msg) {
  var usrVoiceState = msg.guild.voiceStates.cache.find((id) => {
    return id == msg.author.id;
  });

  if (usrVoiceState !== undefined) {
    if (usrVoiceState.channel.joinable) {
      var connection = joinVoiceChannel({
        channelId: usrVoiceState.channel.id,
        guildId: usrVoiceState.guild.id,
        adapterCreator: usrVoiceState.guild.voiceAdapterCreator,
      });
    } else {
      console.log("NO JOIN PERMISSION");
    }
  } else {
    console.log("NOT IN VOICE CHANNEL");
  }
}

// Disconnects from the voice channel if already connected to one
// Errors can arise when the bot is not in any voice channels
function disconnectChannel(msg) {
  var botVoiceState = msg.guild.voiceStates.cache.find((id) => {
    return id == client.user.id;
  });

  if (botVoiceState !== undefined) {
    var connection = getVoiceConnection(msg.guild.id);
    if (connection !== undefined) {
      connection.destroy();
    }
  } else {
    console.log("NOT IN VOICE CHANNEL");
  }
}

// Gets the next track from the Music Queue based on settings
// If no track is left, undefined is returned
function getNextTrack() {
  if (musicQueue.length == 0) {
    return undefined;
  }

  console.log(" LoopTrack is " + (loopTrack ? "On" : "Off"));
  console.log(" Shuffle is " + (shuffle ? "On" : "Off"));
  console.log(" LoopQueue is " + (loopQueue ? "On" : "Off"));

  if (loopTrack) {
    if (queueIdx < 0) {
      queueIdx = 0;
    }
    return musicQueue[queueIdx];
  }

  if (shuffle) {
    var rnd = queueIdx;
    while (rnd == queueIdx) {
      rnd = Math.floor(Math.random() * musicQueue.length);
    }

    queueIdx = Math.floor(rnd);
    return musicQueue[queueIdx];
  }

  queueIdx++;
  if (queueIdx == musicQueue.length) {
    if (!loopQueue) {
      return undefined;
    }
    queueIdx = 0;
  }

  return musicQueue[queueIdx];
}

// Gets the current track from the Music Queue
// If the player finished or hasn't started, undefined is returned
function getCurentTrack() {
  return queueIdx < 0 || queueIdx >= musicQueue.length
    ? undefined
    : musicQueue[queueIdx];
}

// Starts playing music in the channel where the bot is connected
// Errors can arise when the bot is not in any voice channels
function playMusic(msg) {
  var botVoiceState = msg.guild.voiceStates.cache.find((id) => {
    return id == client.user.id;
  });

  if (botVoiceState !== undefined) {
    var connection = getVoiceConnection(msg.guild.id);
    if (connection !== undefined) {
      var track = getNextTrack();
      if (track !== undefined) {
        var resource = createAudioResource(musicFolder + track, {
          inputType: StreamType.OggOpus,
        });
        player.play(resource);
        connection.subscribe(player);
      }
    }
  } else {
    console.log("NOT IN VOICE CHANNEL");
  }
}

// Play next track when idle
player.on(AudioPlayerStatus.Idle, () => {
  var track = getNextTrack();
  if (track !== undefined) {
    var resource = createAudioResource(musicFolder + track, {
      inputType: StreamType.OggOpus,
    });

    player.play(resource);
  }
});

// Restarts playing the current track
function restartTrack() {
  var track = getCurentTrack();
  if (track !== undefined) {
    var resource = createAudioResource(musicFolder + track, {
      inputType: StreamType.OggOpus,
    });

    player.play(resource);
  }
}

// Restarts the queue at track 0 and starts playing it
function restartQueue() {
  queueIdx = -1;
  var track = getNextTrack();
  if (track !== undefined) {
    var resource = createAudioResource(musicFolder + track, {
      inputType: StreamType.OggOpus,
    });

    player.play(resource);
  }
}

// Restarts the queue at track 0 and starts playing it
function nextTrack() {
  var track = getNextTrack();
  if (track !== undefined) {
    var resource = createAudioResource(musicFolder + track, {
      inputType: StreamType.OggOpus,
    });

    player.play(resource);
  }
}

// Restarts the queue at track 0 and starts playing it
function gotoTrack(tokens) {
  if (tokens.length > 1) {
    var trackNo = parseInt(tokens[1]);
    if (trackNo >= 0 && trackNo < musicQueue.length) {
      var track = musicQueue[trackNo];
      var resource = createAudioResource(musicFolder + track, {
        inputType: StreamType.OggOpus,
      });

      player.play(resource);
    }
  }
}

// Toggles music track shuffling On/Off
function toggleShuffle(tokens) {
  if (tokens.length > 1) {
    switch (tokens[1]) {
      case "on":
        shuffle = true;
        break;
      case "off":
        shuffle = false;
        break;
      default:
        console.log("INVALIID OPTION");
    }
  }
}

// Toggles music track looping On/Off
function toggleLoopTrack(tokens) {
  if (tokens.length > 1) {
    switch (tokens[1]) {
      case "on":
        loopQueue = true;
        break;
      case "off":
        loopQueue = false;
        break;
      default:
        console.log("INVALIID OPTION");
    }
  }
}

// Toggles music queue looping On/Off
function toggleLoopQueue(tokens) {
  if (tokens.length > 1) {
    switch (tokens[1]) {
      case "on":
        loopTrack = true;
        break;
      case "off":
        loopTrack = false;
        break;
      default:
        console.log("INVALIID OPTION");
    }
  }
}

function addMusic(msg) {
  var attachments = msg.attachments;

  // If msg has no attachments, exit function
  if (!attachments) return console.log("no attachments detected in msg");

  var oggAttachment = attachments.find(
    (attachment) => attachment.contentType == "audio/ogg"
  );

  // If msg has no ogg attachments, exit function
  if (!oggAttachment) return console.log("no ogg attachments detected in msg");

  const file = fs.createWriteStream(musicFolder + "/" + oggAttachment.name);
  const request = https.get(oggAttachment.url, function (res) {
    res.pipe(file);
  });
}

//########################## Events ##########################//

// Event that executes when the client is ready
async function onReady() {
  ready = true;
  console.log("\x1b[33m" + timeStamp() + " Radio-Bot Started!\x1b[0m");
}

// Event that executes when the client detects a message created
// The message is tokenized into uniformly lowercase elements to be used for commands
async function onMessageCreate(msg) {
  var ltokens = msg.content.toLowerCase().split(" ");

  if (ltokens.length > 0) {
    switch (ltokens[0]) {
      case prefix + "connect":
        connectChannel(msg);
        break; //OK
      case prefix + "disconnect":
        disconnectChannel(msg);
        break; //OK
      case prefix + "play":
        playMusic(msg);
        break; //OK
      case prefix + "pause":
        player.pause();
        break; //OK
      case prefix + "resume":
        player.unpause();
        break; //OK
      case prefix + "restartqueue":
        restartQueue();
        break; //OK
      case prefix + "restarttrack":
        restartTrack();
        break; //OK
      case prefix + "next":
        nextTrack();
        break; //OK
      case prefix + "goto":
        gotoTrack(ltokens);
        break; //OK

      case prefix + "loopqueue":
        toggleLoopQueue(ltokens);
        break;
      case prefix + "looptrack":
        toggleLoopTrack(ltokens);
        break;
      case prefix + "shuffle":
        toggleShuffle(ltokens);
        break; //OK

      case prefix + "addmusic":
        addMusic(msg);
        break;
    }
  }
}

client.on("ready", onReady);
client.on("messageCreate", onMessageCreate);

client.login(process.env.BOT_TOKEN);
