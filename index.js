// let cleverbot = require("cleverbot.io"),
//     cleverbot = new cleverbot('4CbvsmdXe8zheP7d', 'zpcVvOFlaUYbYOyeqGmlx7v2ltwQdiWC');
// cleverbot.setNick("Mike");
// cleverbot.create(function(err, session) {
//     if (err) {
//         console.log('cleverbot create fail.');
//     } else {
//         console.log('cleverbot create success.');
//     }
// });
if (!process.env.SLACK_TOKEN) {
    console.log('Error: Specify SLACK_TOKEN in environment');
    process.exit(1);
}

const Botkit = require('botkit')
const request = require('request-promise');
let controller = Botkit.slackbot({debug: true})
const youtubeKey = 'AIzaSyACObD_IqVU6wHYa9uiroiraZbkXDNBwJw';
const googleMapKey = 'AIzaSyATxWJ3aqAaX-gjxrB3Niv0YpjGbQxESmM';
const weatherKey = '60174b206c1ec5ad81b665c91d64730f';
let botSpawn = controller.spawn({token: process.env.SLACK_TOKEN});
botSpawn.startRTM();

controller.setupWebserver(process.env.PORT || 3001, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, botSpawn, function() {
        // handle errors...
    });
});

controller.on('channel_join', function(bot, message) {
    bot.reply(message, "Hi, I'm Mikah's bot. Welcome to the Mikah channel!");
});

// Enable Clever Bot
// controller.hears('', 'direct_message,direct_mention,mention', function(bot, message) {
//     let msg = message.text;
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
});

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
});

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

controller.hears(["!play (.*)"], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    let searchTerm = message.match[1];
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${searchTerm}&key=${youtubeKey}`
    let videoURL;
    request(url).then(data => {
        data = JSON.parse(data).items[0].id.videoId;
        videoURL = `https://www.youtube.com/watch?v=${data}`;
        controller.storage.users.get(message.user, function(err, user) {
            bot.reply(message, 'This is what I found: ' + videoURL)
        })
    })

});

controller.hears(["!from (.*) to (.*)"], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    let location = message.match[1].split(' ').join('+');
    let destination = message.match[2].split(' ').join('+');
    let travel_mode;
    bot.startConversation(message, function(err, convo) {
        if (!err) {
            convo.say('And what type of transportations are you using?')
            convo.ask('driving, walking, transit, bicycling', function(response, convo) {
                travel_mode = response.text.toLowerCase();
                convo.next();
            });
            convo.on('end', function(convo) {
                let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${location}&destinations=${destination}&mode=${travel_mode}&language=en&key=${googleMapKey}`
                request(url).then(data => {
                    data = JSON.parse(data);
                    if (data.rows[0].elements[0].status === "OK") {
                        let location_address = data.origin_addresses[0];
                        let destination_adress = data.destination_addresses[0];
                        let distance = data.rows[0].elements[0].distance.text;
                        let duration = data.rows[0].elements[0].duration.text;
                        controller.storage.users.get(message.user, function(err, user) {
                            bot.reply(message, `Your location: ${location_address}\nYour Destination: ${destination_adress}\nDistance: ${distance}\nEstimated Travel time: ${duration}`)
                        })
                    } else {
                        controller.storage.users.get(message.user, function(err, user) {
                            bot.reply(message, `There is not available route for your destination.`)
                        })
                    }
                })
            });
        }
    });

})

controller.hears(["!weather (.*)"], [
    'direct_message', 'direction_mention', 'mention'
], function(bot, message) {
    let place = message.match[1].split(' ').join('+');
    let google_url = `https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=${googleMapKey}`;
    request(google_url).then(data => {
        data = JSON.parse(data);
        let address = data.results[0].formatted_address;
        let lat = data.results[0].geometry.location.lat;
        let lng = data.results[0].geometry.location.lng;
        let weather_url = `https://api.darksky.net/forecast/${weatherKey}/${lat},${lng}?units=si&exclude=minutely,daily,alert,flags`;
        request(weather_url).then(weatherData => {
            weatherData = JSON.parse(weatherData);
            let sunny = ":sunny:";
            let rainy = ":thunder_cloud_and_rain:";
            let cloudy = ":barely_sunny:";
            let snowy = ":snow_cloud:";

            let icon = weatherData.currently.icon.split(' ').join('_').toLowerCase();
            if (icon === "sunny") {
                icon = sunny;
            } else if (icon === "rain") {
                icon = rainy;
            } else if (icon === "snow") {
                icon = snowy;
            } else {
                icon = cloudy;
            }
            let summary = weatherData.hourly.summary;
            let temp = weatherData.currently.temperature + decodeURI("%C2%B0") + "C";
            let rain = weatherData.currently.precipProbability * 100 + "%";
            controller.storage.users.get(message.user, function(err, user) {
                bot.reply(message, `Your location: ${address}\nWeather Forecast: ${icon} ${summary}\nTemperature: ${temp}\nRain Probability: ${rain}`)
            })

        })
    })
})

controller.hears(["!game"], [
    'direct_message', 'direction_mention', 'mention'
], function(bot, message) {
    bot.startConversation(message, function(err, convo) {
        let player;
        if (!err) {
            convo.say("Let's play a rock, paper, scissor game")
            convo.ask('Which one do you pick ?', function(response, convo) {
                player = response.text.toLowerCase();
                convo.next();
            });
            convo.on('end', function(convo) {
                let options =['rock','paper','scissor'];
                controller.storage.users.get(message.user, function(err, user) {
                    let computer = options[Math.floor(Math.random()*3)];
                    let result;
                    if(computer === player){
                        result = "Draw ! :thinking_face:";
                    }
                    else if((computer === "rock" && player === "paper")||(computer === "paper" && player === "scissor")|| (computer === "scissor" && player ==="rock")){
                        result = "YOU WIN! :triumph:";
                    }
                    else{
                        result = "Sorry, I win this time :hugging_face:"
                    }
                    bot.reply(message,`I picked ${computer}.\n${result}`);
                })
            })
    }
});
})
//I tried to make a spotify API call.

// controller.hears(["!spotify (.*)"], [
//     'direct_message', 'direct_mention', 'mention'
// ], function(bot, message) {
//     let query = message.match[1];
//     let accessToken = 'BQDPkJ-88RAv3hhEHrNBBzfW-Sty9PlJiRillvIWFMIm2XJTNAj9GW3zL95V7A1tX-M898_h0EGHOzCoqhVxBmw1eGxftu9AJdCsdCmuXtL-p9TUn2xjhWbLwGgkBNAGSD1a3p81MJ_tCSGI42KZDvNaWeZTR7Ibdw'
//     let url = `https://api.spotify.com/v1/search?q=${query}&type=artist,album,track`;
//     let options = {
//         url: url,
//         headers: {
//             'Authorization': `Basic ${accessToken}`
//         }
//     }
//     request(options).then(data => {
//         data = JSON.parse(data);
//         controller.storage.users.get(message.user, function(err, user) {
//             bot.reply(message, `Here are the results from Spotify:\n Arists: ${data.artists.items[0].external_urls.spotify}\nTracks: ${data.tracks.items[0].external_urls.spotify}\nAlbums: ${data.albums.items[0].external_urls.spotify} `)
//         });
//     })
//
// })
