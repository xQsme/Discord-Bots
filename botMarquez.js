var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');
var fs = require('fs');
//Blackjack
var started=false;
var joinable=false;
var players={};
var deck=[];
var current = 1;
var totalPlayers = 1;
let currentEmojis = [];
let savedEmojis = [];
//Bot
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
    bot.setPresence({game:{	name: "Watching IASIP!"}});
    let server;
    for(let key in bot.servers){
        server = bot.servers[key];
        break;
    }
    for(let key in server.emojis)
    {
        currentEmojis.push({"id": server.emojis[key].id});
    }
    console.log(currentEmojis);
});
bot.on('disconnect', function(){
	setInterval(function(){
		client.connect();
	}, 10000)
});
var quotes = [ 
'*You gotta pay the troll toll, if you wanna get into that boy’s hole*',
'Okay, Mr. Mayor. Feast your ears on that Spin Doctors mix',
'And you know what happens with Tokyo drifting? It leads to bickering. Which, of course, leads to karate',
'Any amount of cheese before a date is too much cheese',
'Taked baby. Meet at later bar, night or day sometime',
'Yeah, well, you’ve never once seen me wash my testicles either, but that doesn’t mean I don’t do it every Friday',
'Oh, look at me! The millionaire who goes to see doctors!',
'Then start breakin’ bricks, wet nips!',
'That’s Tammy, Trey’s ex-girlfriend. This is classic Tammy. Trey broke up with Tammy because Maureen Kinallen said that she saw Tammy flirting with Walt Timby at a party. But she was only doing it to make Trey jealous because, you know, she thought that Trey secretly liked Erin Hannabry. But Trey didn’t like Erin Hannabry. It was all a bunch of bull',
'Well, I don’t know how many years on this Earth I got left. I’m gonna get real weird with it',
'Here’s a confession: I’m in love with a man. What? I’m in love with a man. A man called God. Does that make me gay? Am I gay for God? You betcha!',
'Hi. Um, I’m a recovering crackhead. This is my retarded sister that I take care of. I’d like some welfare, please',
'Then, I’ll just regress, because I feel I made myself perfectly redundant',
'Hello fellow American. This you should vote me. I leave power. Good. Thank you. Thank you. If you vote me, I’m hot.” What? “Taxes. They’ll be lower. Son. The democratic vote for me is right thing to do, Philadelphia. So do',
'It’s fetish-fetish shit! I like to bind. I like to BE bound!',
'This bar runs on trash, dude. This bar is totally green that way',
' Oh, get a job? Just get a job? Why don’t I strap on my job helmet and squeeze down into a job cannon and fire off into job land, where jobs grow on jobbies?!',
'*I got the Lord. I got the Lord. I got the good Lord, he’s goin’ down on me*',
'I’m not fat. I’m cultivating mass',
'You should have seen how passionate he got when I showed him the dick flyer',
'It involves pulling up our bootstraps, oiling up a couple of asses and doing a little plowing of our own. Pow!…Not gay sex',
'Cat in the wall, eh?! Okay, now you’re talking my language',
'Oh, shit. Look at that door, dude. See that door right there? The one marked “pirate?” You think a pirate lives in there?',
'Later, boners',
'I’m a…full-on rapist, you know? Uh, Africans, dyslexics, children, that sort of thing',
'Who am I supposed to vote for? Am I supposed to vote for the Democrat who’s gonna blast me in the ass or the Republican who’s blasting my ass?',
'I eat stickers all the time, dude!',
'I’m not gonna be buried in a grave. When I’m dead, just throw me in the trash',
'THIS ISN’T OVER UNTIL I SAY IT’S OVER!',
'If you’re in my room, you’re always being filmed',
'Cause if the girl said no, then the answer obviously is no. But the thing is, is she’s not gonna say no. She would never say no, because of the implication',
'I got my Magnum condoms; I got my wad of hundreds. I’m ready to plow',
'Can I stop you, though? You keep using this word “jabroni.” And…it’s awesome!',
'I’m gonna rise up. I’m gonna kick a little ass. Gonna kick some ass in the U.S.A. Gonna climb a mountain. Gonna sew a flag. Gonna fly on an eagle. I’m gonna kick some butt. I’m gonna drive a big truck. I’m gonna rule this world. I’m gonna kick some ass. I’m gonna rise up. I’m gonna kick a little ass. ROCK, FLAG AND EAGLE!',
'Wildcard, bitches! Yee-haw!',
'Dayman, fighter of the Nightman, champion of the, sun, you’re a master of karate, and friendship, for everyone, Dayman, Aaaah',
'If I was looking for safe, I wouldn’t be sticking my dick through a wall',
'Hey-o! What’s up, bitches!',
'Hello, Charlie Kelly here, local business owner and cat enthusiast. Is your cat making too much noise all the time? Is your cat constantly stomping around driving you crazy? Is your cat clawing at your furnitures? Think there’s no answer? You’re so stupid! There is! Kitten Mittens. Finally, there is an elegant, comfortable mitten for cats…. I couldn’t hear anything! Is your cat one-legged? Is your cat fat, skinny, or an in-between? That doesn’t matter! Cause one size fits all! Kitten Mittens! You’ll be smitten! So come on down to Paddy’s Pub. We’re the home of the original Kitten Mittens. Meeeeeeeeeeowwwww!',
'Oh whoops, I dropped my monster condom that I use for my magnum dong'
];

var marquez = [];
fs.readFile('database.json', (err, data) => {  
    marquez = JSON.parse(data);
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
                    message: '<@' + userID + '>\n`!8ball <question>` An answer to you question\n`!b` Blackjack!\n`!imdb <movie title>` Not working atm\n`!sunny` A random It’s Always Sunny In Philadelphia Quote\n`!marquez` A random #thingsMarquezSays\n`!addquote <quote>` Add a Marquez Quote\n`!sunnygif` A random sunny GIF\n`!spank` If I misbehave use this to put me back on track\n`!joke` A random joke\n`!chuck` Chuck Norris!\n`!jukes <@someone>` Try it!'
                });
            break;
            case '8ball':
                if(message.substr(message.length - 1) == '?' && message.length > 9){
                    if(message.indexOf("naughty") != -1 && message.indexOf("@") != -1){
                        var index=message.indexOf("@")-1;
                        var person=message.substring(index).split(' ')[0];
                        bot.sendMessage({
                            to: channelID,
                            message: person + " You are a naughty boy!"
                        });
                    }else if(message.indexOf("noob") != -1 && message.indexOf("@") != -1){
                        var index=message.indexOf("@")-1;
                        var person=message.substring(index).split(' ')[0];
                        bot.sendMessage({
                            to: channelID,
                            message: person + ' is 1337!\n' + '<@' + userID + '> is a N008!'
                        });
                    }else if(message.indexOf("win") != -1){
                        bot.sendMessage({
                            to: channelID,
                            message: '<@' + userID + '> Win? You can barely pass the tutorial!'
                        });
                    }else if(message.indexOf("sunny") != -1 && message.indexOf("awesome") != -1){
                        bot.sendMessage({
                            to: channelID,
                            message: '<@' + userID + '> Damn right bro! https://imgur.com/HxNGHdL'
				            });
                    }else if(message.indexOf("fail") != -1 && message.indexOf("will") != -1){
                        bot.sendMessage({
                            to: channelID,
                            message: '<@' + userID + '> You cant fail because you don’t even try!'
                        });
                    }else{
                        bot.sendMessage({
                            to: channelID,
                            message: '<@' + userID + '> What a stupid question!'
                        });
                    }
                }else{
                    bot.sendMessage({
                            to: channelID,
                            message: '<@' + userID + '> I don’t think that’s a question'
                    });
                }
            break;
            case 'sunny':
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '> '+ quotes[Math.round(Math.random() * (quotes.length-1))]
                });
            break;
            case 'sunnydump':
                var message="";
                for(var i = 0; i<10; i++){
                    message+= '<@' + userID + '> '+ quotes[Math.round(Math.random() * (quotes.length-1))] + '\n'
                }
                bot.sendMessage({
                    to: channelID,
                    message: message
                });
            break;
            case 'imdb':
            var url = "http://www.omdbapi.com/?apikey=17c59968&t=";
            if(args.length >= 1){
                for(var n = 0; n<args.length; n++){
                    url += args[n];
                    if(n != args.length-1){
                        url += '+';
                    }
                }
                request({
                    url: url,
                    json: true
                }, function (error, response, body) {
                    try{
                        if (!error && response.statusCode === 200) {
                            if(similarity(body.data.name, message.substring(6)) > 0.35 || body.data.name.substring(0, message.substring(6).length).toLowerCase() == message.substring(6).toLowerCase()){
                                bot.sendMessage({
                                    to: channelID,
                                    message: '<@' + userID + '>\nRating for "' +  body.data.name + '": ' + body.data.rating + "\nDirector: " + body.data.director + "\nGenre: " + body.data.genre
                                });
                            }else{
                                bot.sendMessage({
                                    to: channelID,
                                    message: '<@' + userID + '> Sorry Jabroni, ' + message.substring(6) + ' not found!'
                                });
                            }
                        }else{
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> Sorry Jabroni, ' + message.substring(6) + ' not found!'
                            });
                        }
                    }catch(err){
                        bot.sendMessage({
                            to: channelID,
                            message: '<@' + userID + '> Sorry Jabroni, ' + message.substring(6) + ' not found!'
                        });
                    }
                })
            }else{
                bot.sendMessage({
                    to: channelID,
                    message: 'Sorry Jabroni, please ask something worth my time'
                });
            }
            break;
            case 'marquez':
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '> '+ marquez[Math.round(Math.random() * (marquez.length-1))] + ' :ok_hand:'
                });
            break;
            case 'addquote':
                for(var i = 0; i < marquez.length; i++){
                    if(marquez[i].toLowerCase() == args.join(" ").toLowerCase()){
                        bot.sendMessage({
                            to: channelID,
                            message: '<@' + userID + '> Quote `' + args.join(" ") + '` already exists'
                        });
                        return;
                    }
                }
                marquez.push(args.join(" "));
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '> Quote `' + args.join(" ") + '` added to the "database" :ok_hand:'
                });
                fs.writeFile('database.json', JSON.stringify(marquez), (err) => {});
            break;
            case 'delquote':
                for(var i = 0; i < marquez.length; i++){
                    if(marquez[i].toLowerCase() == args.join(" ").toLowerCase()){
                        marquez.splice(i, 1);
                        fs.writeFile('database.json', JSON.stringify(marquez), (err) => {});
                        bot.sendMessage({
                            to: channelID,
                            message: '<@' + userID + '> Quote `' + args.join(" ") + '` deleted from the "database" :ok_hand:'
                        });
                        return;
                    }
                }
                bot.sendMessage({
                    to: channelID,
                    message: '<@' + userID + '> Quote `' + args.join(" ") + '` does not exist :ok_hand:'
                });
                
            break;
            case 'spank':
            if(Math.random() > 0.2){
                bot.sendMessage({
                    to: channelID,
                    message: 'Ouch!'
                });
            }else{
                bot.sendMessage({
                    to: channelID,
                    message: '<@431547637423013899> slaps <@' + userID + '> in the face, get Shrekt m8!'
                });
            }
            break;
            case 'blackjack':
            case 'black':
            case 'b':
                if(message == '.b' || message == '.black' || message == '.blackjack'){
                    bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '>\n`.b balance` Check your current balance\n`.b new` Create a new game\n`.b join` Join the current game\n`.b start` Start the current game\n`.b end` End the current game\n`.b refill` Refill your balance'
                    });
                    
                }
                switch(args[0]){
                	case 'quit':
                        if(user in players && started && !joinable){
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + players[user].id + '> Quit! Total: ' +  (players[user].total+players[user].bet) + '\n'
                            });
                            delete players[user];
                            if(players.length > 0){
	                            nextPlayer(channelID);
	                            if(current != 1 && !hasBlackjack(channelID)){
	                                bot.sendMessage({
	                                        to: channelID,
	                                        message: gameState() + askChoice()
	                                });
	                            }
	                        }else{
	                        	started=false;
	                        	joinable=false;
	                        }
                        }
                    break;
                    case 'new':
                        if(!started){
                            started=true;
                            joinable=true;
                            newGame();
                            bot.sendMessage({
                                to: channelID,
                                message: 'New game of blackjack\n`.b join` to join'
                            });
                        }
                    break;
                    case 'start':
                        if(user in players && started && joinable){
                            joinable=false;
                            currentPlayer().turn=true;
                            bot.sendMessage({
                                to: channelID,
                                message: "New Hand Starting\n" + missingBets()
                            });
                        }
                    break;
                    case 'end':
                        if(user in players){
                        started=false;
                        bot.sendMessage({
                            to: channelID,
                            message: balances()
                        });
                        players={};
                        totalPlayers=1;
                        }
                    break;
                    case 'join':
                        if(started && joinable){
                            if(players[user] == null){
                                players[user]={id: userID, total: 1000, bet: 0, turn:false, gz: false, cards: []};
                                totalPlayers++;
                                bot.sendMessage({
                                    to: channelID,
                                    message: '<@' + userID + '> has joined'
                                });
                            }else{
                                bot.sendMessage({
                                    to: channelID,
                                    message: '<@' + userID + '> has already joined'
                                });
                            }
                        }else{
                            bot.sendMessage({
                                to: channelID,
                                message: 'Cannot join game at this time'
                            });
                        }
                    break;
                    case 'bet':
                        if(user in players && players[user].bet == 0 && args[1] == parseInt(args[1]) && players[user].total >= parseInt(args[1])){
                            players[user].total -= parseInt(args[1])
                            players[user].bet = parseInt(args[1]);
                            if(allBet()){
                                newHand();
                                if(!hasBlackjack(channelID)){
	                                bot.sendMessage({
	                                    to: channelID,
	                                    message: '<@' + userID + '> has bet ' + args[1] + '\n' + gameState() + askChoice()
	                                });
                                }
                            }else{
                                bot.sendMessage({
	                                to: channelID,
	                                message: '<@' + userID + '> has bet ' + args[1] + '\n' + missingBets()
	                            });
                            }
                        }else if(user in players && players[user].bet == 0 && args[1] == parseInt(args[1]) && players[user].total < parseInt(args[1])){
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> insuficient funds, current funds: ' + players[user].total
                            });
                        }
                    break;
                    case 'hitme':
                        if(user in players && players[user].turn){
                            var random = Math.round(Math.random()*(deck.length-1));
                            players[user].cards[players[user].cards.length]=deck[random];
                            deck.splice(random, 1);
                            if(total(players[user].cards) < 21){
                                bot.sendMessage({
                                        to: channelID,
                                        message: gameState() + askChoice()
                                });
                            }else{
                                nextPlayer(channelID);
                                if(current != 1 && !hasBlackjack(channelID)){
                                    bot.sendMessage({
                                            to: channelID,
                                            message: gameState() + askChoice()
                                    });
                                }
                            }
                        }
                    break;
                    case 'hold':
                        if(user in players && players[user].turn && players[user].bet != 0){
                            nextPlayer(channelID);
                            if(current != 1 && !hasBlackjack(channelID)){
                                bot.sendMessage({
                                        to: channelID,
                                        message: gameState() + askChoice()
                                });
                            }
                        }
                    break;
                    case 'balance':
                        if(user in players){
                            bot.sendMessage({
                                    to: channelID,
                                    message: '<@' + userID + '>’s balance: ' + players[user].total
                            });
                        }
                    break;
                    case 'refill':
                        if(user in players){
                            players[user].total=1000;
                            bot.sendMessage({
                                    to: channelID,
                                    message: '<@' + userID + '>’s balance: ' + players[user].total
                            });
                        }
                    break;
                }
            break;
            case 'jukes':
            	if(typeof args[0] !== 'undefined' && message.indexOf("@") != -1){
		            var url = "http://api.yomomma.info";
		            var index=message.indexOf("@")-1;
                    var person=message.substring(index).split(' ')[0];
		            url=request({
	                    url: url,
	                    json: true
		                }, function (error, response, body) {
	                        if (!error && response.statusCode === 200) {
	                            bot.sendMessage({
                                    to: channelID,
                                    message: person + ' ' +  body.joke
                                });
	                        }
		            })
		        }else{
    		        bot.sendMessage({
                        to: channelID,
                        message: '<@' + userID + '> Use format `.jukes @someone`'
                    });
		        }
	        break;
	        case 'sunnygif':
	            var url = "https://api.giphy.com/v1/gifs/random?api_key=QzNNKTk1h941IKY7dWB9GuK5tQYc3OQw&tag=it's always sunny&rating=G";
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
         	case 'chuck':
	            var url = "http://api.icndb.com/jokes/random";
	            url=request({
                    url: url,
                    json: true
	                }, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '> ' +   body.value.joke
                            });
                        }
	            })
	        break;
	        case 'joke':
	            var url = "https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_joke";
	            url=request({
                    url: url,
                    json: true
	                }, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            bot.sendMessage({
                                to: channelID,
                                message: '<@' + userID + '>\n' +   body.setup + '\n' + body.punchline
                            });
                        }
	            })
	        break;
         }
     }
});

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

//Blackjack functions
function hasBlackjack(channelID){
	while(true){
		if(total(currentPlayer().cards) == 21){
			if(nextPlayer(channelID)){
				return true;
			}
		}else{
			return false;
		}
	}
}

function nextPlayer(channelID){
    currentPlayer().turn=false;
    current++;2
    if(current == totalPlayers){
        endHand(channelID);
        return true;
    }
    currentPlayer().turn=true;
    return false;
}

function newGame(){
    var sunnyBot={id: null, total: 1000, bet: 0, turn: false, gz: false, cards: []};
    players['sunnyBot']=sunnyBot;
    var current=0;
    newDeck();
}

function newDeck(){
    deck=['A','A','A','A',
        '2','2','2','2',
        '3','3','3','3',
        '4','4','4','4',
        '5','5','5','5',
        '6','6','6','6',
        '7','7','7','7',
        '8','8','8','8',
        '9','9','9','9',
        '10','10','10','10',
        'J','J','J','J',
        'Q','Q','Q','Q',
        'K','K','K','K'
    ];
}

function newHand(){
    var random;
    for(var i = 0; i<2; i++){
        for(var key in players){
            random = Math.round(Math.random()*(deck.length-1));
            players[key].cards[players[key].cards.length]=deck[random];
            deck.splice(random, 1);
        }
    }
}

function missingBets(){
    var message = "Missing Bets\n";
    for(var key in players){
        if(key != 'sunnyBot' && players[key].bet == 0){
            message += '<@' + players[key].id + '>\n';
        }
    }
    message += '`.b bet XXX` to bet';
    return message;
}


function allBet(){
    var bool = true;
    for(var key in players){
        if(key != 'sunnyBot' && players[key].bet == 0){
            bool=false;
            break;
        }
    }
    return bool;
}

function askChoice(){
    var curr=0;
    for(var key in players){
        if(curr == current){
            players[key].turn = true;
            return '<@' + players[key].id + '> `.b hitme` for another card or `.b hold`';
        }
        curr++;
    }
}

function nextBet(){
    currentPlayer().turn=false;
    current++;
    if(current == totalPlayers)
        current=1;
    currentPlayer().turn=true;
}

function endHand(channelID){
    current = 1;
    decideMoreCards();
    var message = 'Hand results\n<@374966972779200513> Cards: ' +  players['sunnyBot'].cards + ' Total: ' + total(players['sunnyBot'].cards) + '\n';
    for(var key in players){
        if(key != 'sunnyBot'){
            if(total(players[key].cards) < 22){
                if(total(players['sunnyBot'].cards) > 21 || total(players[key].cards) > total(players['sunnyBot'].cards)){
                    message += '<@' + players[key].id + '> Cards: ' +  players[key].cards + ' Total: ' + total(players[key].cards) + ' WINS!\n';
                    players[key].total+=players[key].bet*2;
                }else if(total(players[key].cards) == total(players['sunnyBot'].cards)){
                    message += '<@' + players[key].id + '> Cards: ' +  players[key].cards + ' Total: ' + total(players[key].cards) + ' TIE!\n';
                    players[key].total+=players[key].bet;
                }else{
                    message += '<@' + players[key].id + '> Cards: ' +  players[key].cards + ' Total: ' + total(players[key].cards) + ' LOST!\n';
                }
            }else{
                message += '<@' + players[key].id + '> Cards: ' +  players[key].cards + ' Total: ' + total(players[key].cards) + ' BUST!\n';
            }
            players[key].bet=0;
            players[key].cards=[];
        }
    }
    players['sunnyBot'].cards=[];
    if(deck.length < 4*totalPlayers){
        newDeck();
        message += 'A new deck was generated!\n'
    }
    for(var key in players){
        if(key != 'sunnyBot'){
            if(players[key].total >= 5000 && players[key].gz == false){
                players[key].gz=true;
                message+='Congratulations <@' + players[key].id + '> you have reached 5k credits\n';
            }
        }
    }
    currentPlayer().turn = true;
    bot.sendMessage({
        to: channelID,
        message: message + 'New Hand Starting\n' + missingBets()
    });
}

function currentPlayer(){
    var curr=0;
    for(var key in players){
        if(curr == current){
            return players[key];
        }
        curr++;
    }
}

function decideMoreCards(){
    var value = total(players['sunnyBot'].cards);
    var wins = 0;
    for(var key in players){
        if(key != 'sunnyBot'){
            if(total(players[key].cards) > 21 || (total(players['sunnyBot'].cards) < 21 && total(players[key].cards) < total(players['sunnyBot'].cards))){             
                wins++;
            }
        }
    }
    if(wins < 3/5*(totalPlayers-1) && value < 17){
        random = Math.round(Math.random()*(deck.length-1));
        players['sunnyBot'].cards[players['sunnyBot'].cards.length]=deck[random];
        deck.splice(random, 1);  
        decideMoreCards();
    }

}

function gameState(){
    var message = "Current Hand\n";
    for(var key in players){
        if(key == 'sunnyBot')
            message += '<@374966972779200513> Cards: ?,' +  players[key].cards.slice(1) + ' Total: ' + total(players[key].cards.slice(1)) + '\n';
        else
            if(total(players[key].cards) > 21)
                message += '<@' + players[key].id + '> Cards: ' +  players[key].cards + ' BUST!\n';
            else    
                message += '<@' + players[key].id + '> Cards: ' +  players[key].cards + ' Total: ' + total(players[key].cards) + '\n';
    }
    return message;
}

function balances(){
    var message = "Game Over\n";
    for(var key in players){
        if(key != 'sunnyBot')
            message += '<@' + players[key].id + '> Total: ' +  (players[key].total+players[key].bet) + '\n';
    }
    return message;
}

function total(cards){
    var total=0;
    var aces=0;
    for(var i = 0; i<cards.length; i++){
        switch(cards[i]){
            case 'A':
            total+=11;
            aces++;
            break;
            case 'J':
            case 'Q':
            case 'K':
            total+=10;
            break;
            default:
            total+=parseInt(cards[i]);
        }
        while(total > 21 && aces != 0){
            aces--;
            total-=10;
            if(total <= 21){
                break;
            }
        }
    }
    return total;
}