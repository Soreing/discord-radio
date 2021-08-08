# discord-radio

# Description
discord-radio is a simple radio bot for Discord that plays music from a queue uintill it's stopped. Music is loaded locally from the drive. Files can be sent to the bot as attachments to put it in the music folder. **Most commands are set to only work if you have the MOVE_MEMBER permission!**

# Installation
discord-radio uses [discord.js v13](https://discord.js.org/#/) and must have `Node.js v16.6.0` or higher.  

The following packages are also required to operate the bot: `dotenv`, `libsodium-wrappers` `ffmpeg-static`, `@discordjs/opus`, `@discordjs/rest`, `@discordjs/voice`.  

Create a `.env` file in the root directory and put your bot's token in there as a variable
```
BOT_TOKEN1=ODcffgh383.D5vbnxcdfgnfgRVe9pD2Ks
```
# Usage
## Setup and Customization
You can edit the following variables at the top of `index.js` to customize how your bot behaves by default. You can change the commands' prefix, the color of the message embeds and the local folder where the music files are taken from.
```js
var prefix = "-";
var color  = '#FF0000'
var musicFolder = "./Music/";
var musicQueue = [];
```
You can also set some default music tracks in the queue if you don't want to add them every time you start the bot.
```js
var musicQueue = [
    "Touhou_Hisouten.ogg",
    "Shoujo_Misshitsu.ogg",
    "Reigin_Kansui.ogg",
];
```

## Adding and Removing Music
You can see which music tracks have been added to the queue with the `list` command. Each music track has an ID from 1 to N.  

You can add a new music track to the queue with the `add` command. You need to include the name of the file in the music folder, and optionally, an ID where the song should be inserted into the queue
```
-add Bucuresti_no_Ningyoushi.ogg 2
// Inserts the music track at ID 2
```
  

You can delete tracks from the music queue by using the `remove` command. You need to specify a song by ID or name.
```
// Either command will work
-remove Bucuresti_no_Ningyoushi.ogg
-remove 2
```

## Playing Music
When you start the bot, first you need to make it join a Voice Channel. You need to join a voice channel and use the `connect` command to make the bot join the channel you are in.  

Once the bot has connected, you can use the `play` command to start playing tracks in the music queue, assuming there is any. You can stop the music with the `pause` command and continue it with `resume`.  

To make the bot leave the channel, use the `disconnect` command.

## Track Control
You can change between tracks with a variety of commands. The `next` command will play the next track. The `goto` command will skip to a specific track with the ID you provide. `restartTrack` will replay the current song immediately, while `restartQueue` starts the queue at ID 0 immediately.  

There are 3 options for controlling how the music is played from the queue. `LoopQueue` will make sure that the queue starts at ID 0 after it reached the end. `LoopTrack` will repeat the current track indefinitely. `Shuffle` will pick a random track to play next.  

You can turn these options On or Off with the commands
```
-loopqueue On
-looptrack On
-shuffle On
```
## Downloading Songs
Send any `.ogg` file in the same channel as the bot with the command `download`. The bot will download the file and place it in the music folder. After it finished, you need to manually add it to the queue.