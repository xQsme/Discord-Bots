var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');
var fs = require('fs');

var images;

fs.readFile('database.json', (err, data) => {  
    images = JSON.parse(data);
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
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    bot.setPresence({game:{	name: "Googling Memes!"}});
});
bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            case 'commands':
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '>\n`!img <keyword>` Shows the image you selected.\n`!addimg <keyword> <image url>` Add an image to the "database".\n`!delimg <keyword>` Delete an image from the "database".\n`!listimg` List the available images.\n`!randimg` A random image.\n`!gif <topic>` A random gif about your topic.'
                });
            break;
            case 'img':
                if(args.length!= 1){
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> invalid arguments. (`!img <keyword>`)'
                    });
                }else{
                    for(var key in images){
                        if(key == args[0]){
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
                if(args.length != 2){
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> invalid arguments. (`!addimg <keyword> <image url>`)'
                    });
                }else{
                    for(var key in images){
                        if(key == args[0]){
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> Sorry jabroni, image "' + args[0] + '" already exists!'
                            });
                            return;
                        }
                    }
                    images[args[0]]=args[1];
                    writeToFile();
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> Image "' + args[0] + '" added to the "database"!'
                    });
                }
            break;
            case 'delimg':
                if(args.length != 1){
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> invalid arguments. (`!delimg <keyword>`)'
                    });
                }else{
                    for(var key in images){
                        if(key == args[0]){
                            delete images[args[0]];
                            writeToFile();
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> Image "' + args[0] + '" deleted!'
                            });
                            return;
                        }
                    }
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> Sorry jabroni, image "' + args[1] + '" not found!'
                    });
                }
            break;
            case 'listimg':
            var keys=[];
                for(var key in images){
                    keys.push(key);
                }
                keys.sort(function(a,b){
                    return a.localeCompare(b);
                })
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '> Available images:\n' + keys.join(" ")
                });
            break;
            case 'randimg':
                var keys = Object.keys(images)
                var key = keys[ keys.length * Math.random() << 0];
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
    fs.writeFile('database.json', JSON.stringify(images), (err) => {  
    });
}