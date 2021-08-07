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

    // Displays an error message
	info: function info(color, text)
	{
		var embed = new MessageEmbed()
            .setColor(color)
		    .setDescription("**✅ " + text + "**");

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
        var tracks="";
        for(var i=0; i<queue.length; i++)
        {   tracks += "["+(i+1)+"] - " + queue[i] + "\n";
        }

        var embed = new MessageEmbed()
            .setColor(color)
		    .setDescription("**✅ List of Music Tracks in the Queue**\n"+tracks);

		return embed;
    }
	
};