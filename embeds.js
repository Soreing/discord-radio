const { Client, RichEmbed,  MessageEmbed} = require('discord.js');

module.exports = {
	
	// Displays an error message
	error: function error(color, text)
	{
		var embed = new MessageEmbed()
            .setColor(color)
		    .setDescription("**🛑 " + text + "**");

		return embed;
	},

    // Displays a normal message
	info: function info(color, text)
	{
		var embed = new MessageEmbed()
            .setColor(color)
		    .setDescription("**✅ " + text + "**");

		return embed;
	},

    // Displays a warning message
	warning: function warning(color, text)
	{
		var embed = new MessageEmbed()
            .setColor(color)
		    .setDescription("**⚠️ " + text + "**");

		return embed;
	},

    // Displays information with a specific track
    trackInfo: function trackInfo(color, text, id, name)
    {
        var embed = new MessageEmbed()
            .setColor(color)
		    .setDescription("**✅ " + text + "**\n["+(id)+"] - " + name);

		return embed;
    },

    // Displays information with a specific track
    settings: function settings(color, option, value)
    {
        var embed = new MessageEmbed()
            .setColor(color)
		    .setDescription("**⚠️ Changed settings option**\n["+option+"]:  **" +value.toUpperCase()+"**");

		return embed;
    },

    // Displays all tracks in the queue
    listQueue: function listQueue(color, queue)
    {
        if(queue.length === 0) {
            var embed = new MessageEmbed()
            .setColor(color)
		    .setDescription("**❌ No Music Tracks in the Queue**");
        }
        else {
            var tracks="";
            for(var i=0; i<queue.length; i++)
            {   tracks += "["+(i+1)+"] - " + queue[i] + "\n";
            }
    
            var embed = new MessageEmbed()
                .setColor(color)
                .setDescription("**✅ List of Music Tracks in the Queue**\n"+tracks);
        }

		return embed;
    },

    // Displays help information
    help: function help(color)
    {
        var vc  = "`connect`, `disconnect`";
        var trk = "`play`, `pause`, `resume`, `next`, `goto`, `restartTrack`, `restartQueue`";
        var que = "`list`, `add`, `remove`";
        var opt = "`loopQueue`, `loopTrack`, `shuffle`"

        var embed = new MessageEmbed()
            .setColor(color)
            .setTitle("**❔ Radio Bot**")
		    .setDescription("RadioBot plays music for you 24/7 in a Voice Channel.\n Add tracks to the queue and let it play.\n​")
            .addField("Voice Channel Joning", vc)
            .addField("Music Tracks", trk)
            .addField("Queue Manipulation", que)
            .addField("Settings", opt)

		return embed;
    },

    // Displays radio information
    status: function status(color, id, queue, lq, lt, shuf)
    {
        var vc  = "`connect`, `disconnect`";
        var trk = "`play`, `pause`, `resume`, `next`, `goto`, `restartTrack`, `restartQueue`";
        var que = "`list`, `add`, `remove`";
        var opt = "`loopQueue`, `loopTrack`, `shuffle`"

        var embed = new MessageEmbed()
            .setColor(color)
            .setDescription("**ℹ️ Status Information**\n"+
                "Currently Playing:\n"+ (id >= 0 ? ("["+(id+1)+"] - " + queue[id]) : "--- Nothing ---")+
                "\n\nNumber of Tracks in the Queue: **"+ queue.length+ "**\n" +
                "[Loop Queue]:  **" + (lq ? "ON" : "OFF")+"**\n" +
                "[Loop Current Track]:  **" + (lt ? "ON" : "OFF")+"**\n" +
                "[Shuffle Tracks]:  **" + (shuf ? "ON" : "OFF")+"**\n"
            )

		return embed;
    },
	
};