var cleverbot = require("cleverbot.io"),
    cleverbot = new cleverbot('API_USER', 'API_KEY');
cleverbot.setNick("YOUR NAME");
cleverbot.create(function(err, session) {
    if (err) {
        console.log('cleverbot create fail.');
    } else {
        console.log('cleverbot create success.');
    }
});

var Botkit = require('botkit')
var request = require('request-promise');
var controller = Botkit.slackbot({debug: true})
const slackToken = 'SLACK_TOKEN';
const youtubeKey = 'YOUTUBE_KEY';
controller.spawn({token: slackToken}).startRTM()

controller.on('channel_join', function(bot, message) {
    bot.reply(message, "Hi, I'm Mikah's bot. Welcome to the Mikah channel!");
});

// Enable Clever Bot
// controller.hears('', 'direct_message,direct_mention,mention', function(bot, message) {
//     var msg = message.text;
//     cleverbot.ask(msg, function(err, response) {
//         if (!err) {
//             bot.reply(message, response);
//         }
//     });
// })
controller.hears([
    'hello', 'hi', 'hey'
], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face'
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!')
        } else {
            bot.reply(message, 'Hello!')
        }
    })
})
controller.hears([
    'I love you', 'Love you'
], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'heart'
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    controller.storage.users.get(message.user, function(err, user) {
        bot.reply(message, 'I love you too babe <3')
    })
});
controller.hears([
    'Do you love me?', 'How much do you love me?'
], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'heart'
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    controller.storage.users.get(message.user, function(err, user) {
        bot.reply(message, 'I love you more than anything babe <3\n' + 'https://youtu.be/3JWTaaS7LdU')
    })
});
controller.hears([
    'your name', "what's your name?", 'who are you?', 'what is your name?'
], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {

        bot.reply(message, `My name is ${bot.identity.name}`)
    })
})

controller.hears([
    'what is my name', 'who am i'
], 'direct_message,direct_mention,mention', function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    convo.next();
                                }
                            }, {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    convo.stop();
                                }
                            }, {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);
                        convo.next();
                    }, {'key': 'nickname'});
                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');
                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });

                        } else {
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});

controller.hears(['You can call me (.*)'], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    var name = message.match[1]
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user
            }
        }
        user.name = name
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Sure, Master ' + user.name)
        })
    })
})
controller.hears([
    "play (.*)", "Play (.*)", "!play (.*)"
], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    var searchTerm = message.match[1];
    var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${searchTerm}&key=${youtubeKey}`
    let videoURL;
    request(url).then(function(data) {
        data = JSON.parse(data).items[0].id.videoId;
        videoURL = `https://www.youtube.com/watch?v=${data}`;
        controller.storage.users.get(message.user, function(err, user) {
            bot.reply(message, 'This is what I found: ' + videoURL)
        })
    })

})
