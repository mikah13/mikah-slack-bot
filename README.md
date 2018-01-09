<h1 align="center" font-size="30">MIKAH SLACK BOT</h1>

### Overview

This repo contains a set of short tutorials with code snippets describing the process of creating a small and simple bot for Slack.

Slack is a great tool that helps us, the developers, to communicate and work things easier and more convenient. Compared to other tools we used to use such as Skype, Slack is a way better application in terms of its stability, compatibility on mobile and desktop. More importantly, Slack support tons of applications such as Trello, GitHub,...

Slack Bot is another application that we can have on Slack which helps us do things faster and more efficient. The Bot that we are going to create will mostly serve our entertaining purpose, however, you can always improve it to make it meet your needs.


# Table of Contents

* [Install Node.js](#install-node.js)
* [BotKit](#botkit)
* [Implement Functions](#implement-functions)
* [Add Cleverbot](#add-cleverbot)

## Install Node.js
You can find the latest version Node.js for your Operating System <a href="https://nodejs.org/en/">here</a>

After installing Node.js, you are also recommended to install Node Version Manager (nvm) which basically helps you to have multiple versions of Node.js in your system. However, this step is optional.

To check the your current version of Node, enter the following in your Terminal (UNIX,LINUX) or Command Line (Window):

```console
$ node -v
```

This should return you a version later than 5.6.0. Also, to check the current version of npm, enter the following:

```console
$ npm -v
```
After this point, your have successfully installed Node.js. Let's get into the next step.

## BotKit
You need to have a folder for your project. Let's make a folder called SlackBot and change directory into the folder

```console
$ mkdir SlackBot
$ cd SlackBot
```

To create a Node.js project, simply type the following:

```console
$ npm init
```

If you follow the above steps, in the SlackBot folder you will see a node_modules folder which stores all the built-in modules that Node already prepared for you. Don't worry about this folder yet, you won't have to touch this folder. You should also a file named package.json. This file will store any information of your application. You can leave it as default if you wish.

Now, let's install a library called BotKit which helps to quickly build a bot for Slack. You can find the documentary for the BotKit API <a href="https://github.com/howdyai/botkit">here</a>. To install BotKit, type the following:

```console
$ npm install --save botkit
```

Once your botkit module is ready, you can now begin the fun part

## Implement Functions

Let's create an index.js inside the SlackBot folder. This is the file where we will implement our bot's functions and behaviours. To initialize our bot, put the folling code inside index.js:

```javascript
var Botkit = require('botkit')

var controller = Botkit.slackbot({
  debug: true
})

controller.spawn({
  token: 'your api token',
}).startRTM()
```

Notice that there is an API token missing in the snippet. Our bot will use this token to interact with users in your Slack workspace using something called <a href="https://api.slack.com/rtm">Real Time Messaging API</a>. In order to get the API token, following the instruction <a href="https://my.slack.com/services/new/bot">here</a> and then you will see something like this: 

<img src="https://raw.githubusercontent.com/mikah13/mikah-slack-bot/master/api_token_img.png"/>
## Add Cleverbot
