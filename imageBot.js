var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');
var fs = require('fs');

var images;
var replacements;
let currentEmojis = {};
let savedEmojis = {};

fs.readFile('emojis.json', (err, data) => {  
    savedEmojis = JSON.parse(data);
});

fs.readFile('database.json', (err, data) => {  
    images = JSON.parse(data);
});
fs.readFile('replacements.json', (err, data) => {  
    replacements = JSON.parse(data);
});

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('messageReactionAdd', (stuff) => {
    if(currentEmojis[stuff.d.emoji.id] !=  null)
    {
        currentEmojis[stuff.d.emoji.id].count++;
        saveEmojis();
    }
});

bot.on('messageReactionRemove', (stuff) => {
    if(currentEmojis[stuff.d.emoji.id] !=  null)
    {
        currentEmojis[stuff.d.emoji.id].count--;
        saveEmojis();
    }
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    bot.setPresence({game:{	name: "Googling Memes!"}});
    let server;
    for(let key in bot.servers){
        server = bot.servers[key];
        break;
    }
    for(let key in server.emojis)
    {
        let match=false;
        for(let emoji in savedEmojis)
        {
            if(emoji == server.emojis[key].id)
            {
                match=true;
                currentEmojis[server.emojis[key].id]={"count": savedEmojis[emoji].count, "name": savedEmojis[emoji].name};
                break;
            }
        }
        if(!match){
            currentEmojis[server.emojis[key].id]={"count": 0, "name": server.emojis[key].name};
        }
    }
});

bot.on('guildEmojisUpdate', function(lixo) { 
    let server;
    for(let key in bot.servers){
        server = bot.servers[key];
        break;
    }
    for(let key in server.emojis)
    {
        if(currentEmojis[key] == null)
        {
            currentEmojis[key]={"count":0, "name":server.emojis[key].name};
        }
        else if(currentEmojis[key].name != server.emojis[key].name)
        {
            currentEmojis[key].name = server.emojis[key].name;
        }
    }
    for(let key in currentEmojis)
    {
        if(server.emojis[key] == null)
        {
            delete currentEmojis[key];
        }
    }
    saveEmojis();
});

bot.on('message', function (user, userID, channelID, message, evt) {

    if(userID != bot.id)
    {
        for(let key in currentEmojis)
        {
            if(message.includes(key)){
                currentEmojis[key].count++;
                saveEmojis();
            }
        }
    }
    
  if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            case 'count':
                let string = "";
                var keys = Object.keys(currentEmojis);
                keys.sort((a,b) => {
                    return currentEmojis[b].count - currentEmojis[a].count;
                });
                keys.forEach(key => {
                    string+='<:' + currentEmojis[key].name + ":" + key + ">\t" + currentEmojis[key].count + "\t";
                });
                string+="";
                bot.sendMessage({
                    to: channelID,
                    message: string
                });
            break;
            case 'commands':
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '>\n`!img <keyword>` Shows the image you selected.\n`!addimg <keyword> <image url>` Add an image to the "database".\n`!delimg <keyword>` Delete an image from the "database".\n`!listimg <optional=start>` List the available images.\n`!randimg` A random image.\n`!gif <topic>` A random gif about your topic.\n`!count` Emoji usage data.'
                });
            break;
            case 'img':
                if(args.length < 1){
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> invalid arguments. (`!img <keyword>`)'
                    });
                }else{
                    for(var key in images){
                        if(key.toLowerCase() == args[0].toLowerCase()){
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> ' + images[key]
                            });
                            return;
                        }
                    }
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> Sorry jabroni, image "' + args[0] + '" not found!'
                    });
                }
            break;
            case 'addimg':
            	if(valid(args)){
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> invalid arguments. (`!addimg <keyword> <image url>`)'
                    });
                }else{
                    for(var key in images){
                        if(key.toLowerCase() == args[0].toLowerCase()){
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> Sorry jabroni, image "' + args[0] + '" already exists!'
                            });
                            return;
                        }
                    }
                    if(args.length == 3 && args[0].includes("@")){
                    	images[args[0]]=args[2];
                    	replacements[args[0]]=args[1];
                    	bot.sendMessage({
	                        to: channelID,
	                        message: '<@' + userID + '> Image "' + args[1] + '" added to the "database"!'
	                    });
                    }else if(args.length == 2 && !args[0].includes("@")){
                    	images[args[0]]=args[1];
                    	bot.sendMessage({
	                        to: channelID,
	                        message: '<@' + userID + '> Image "' + args[0] + '" added to the "database"!'
	                    });
                    }else{
                    	bot.sendMessage({
	                        to: channelID,
	                        message: '<@' + userID + '> invalid arguments. (`!addimg <@keyword> <replacement> <image url>`)'
	                    });
                    }
                    writeToFile();
                }
            break;
            case 'delimg':
                if(args.length != 1){
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> invalid arguments. (`!delimg <keyword>`)'
                    });
                }else{
                    var i=0;
                    for(var key in images){
                        if(key.toLowerCase() == args[0].toLowerCase()){
                            delete images[key];
                            writeToFile();
                            var j = 0;
                            for(var key2 in replacements){
							    if(key2 == args[0]){
    	                            bot.sendMessage({
		                                to: channelID,
		                                message: '<@' + userID + '> Image "' + replacements[key2] + '" deleted!'
		                            });
							        delete replacements[key2];
							        writeToFile();
							        return;
							    }
                                j++;
							}
					    	bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> Image "' + key + '" deleted!'
                            });
                            return;
                        }
                        i++;
                    }
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> Sorry jabroni, image "' + args[0] + '" not found!'
                    });
                }
            break;
            case 'listimg':
            	if(args.length == 0){
	            	var keys=[];
	                for(var key in images){
	                	if(key.includes("@")){
	                		for(var code in replacements){
	                			if(code == key){
	                				keys.push("@" + replacements[code]);
	                				break;
	                			}
	                		}
	                	}else{
	                    	keys.push(key);
	                	}
	                }
	                keys.sort(function(a,b){
	                    return a.localeCompare(b);
	                })
	                bot.sendMessage({
	                    to: channelID,
	                    message: '<@' + userID + '> Available images:\n' + keys.join(" ")
	                });
	            }else{
	            	var keys=[];
	                for(var key in images){
	                	if(key.toLowerCase().startsWith(args[0].toLowerCase()) && key.includes("@")){
	                		for(var code in replacements){
	                			if(code == key){
	                				keys.push("@" + replacements[code]);
	                				break;
	                			}
	                		}
	                	}else if(key.toLowerCase().startsWith(args[0].toLowerCase())){
	                    	keys.push(key);
	                	}
	                }
	                keys.sort(function(a,b){
	                    return a.localeCompare(b);
	                })
	                bot.sendMessage({
	                    to: channelID,
	                    message: '<@' + userID + '> Available images starting with `' + args[0] + '`:\n' + keys.join(" ")
	                });
	            }
            break;
            case 'randimg':
                var keys = Object.keys(images)
                var key = keys[Math.floor(keys.length * Math.random())];
    	        for(var code in replacements){
        			if(code == key){
		        		bot.sendMessage({
		                    to: channelID,
		                    message: '<@' + userID + '> Image ' + replacements[code] + ': ' + images[key]
		                });
        				return;
        			}
        		}
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '> Image ' + key + ': ' + images[key]
                });
            break;
            case 'gif':
                var url = "https://api.giphy.com/v1/gifs/random?api_key=QzNNKTk1h941IKY7dWB9GuK5tQYc3OQw&tag=" + args.join(' ') + "&rating=G";
                url=request({
                    url: url,
                    json: true
                    }, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> ' +  body.data.embed_url
                            });
                        }
                })
            break;
         }
     }
});


function writeToFile(){
    fs.writeFile('database.json', JSON.stringify(images), (err) => {});
    fs.writeFile('replacements.json', JSON.stringify(replacements), (err) => {});
}

function saveEmojis(){
    fs.writeFile('emojis.json', JSON.stringify(currentEmojis), (err) => {});
}

function valid(args){
    if(args.length != 2){
		if(args.length != 3 || !args[0].includes("@")){
			return true;
		}
	}
	return false;
}
