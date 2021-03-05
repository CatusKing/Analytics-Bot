const Discord = require('discord.js');
const fs = require('fs');
const token = require('./general/token.json');
const data = require('./general/data.json');
const config = require('./general/config.json');
const dataMsg = require('./general/messages.json');
const client = new Discord.Client();
var total_minutes = data.total_minutes;
var hours = data.hours;
var minutes = data.minutes;
var thomasMsg = dataMsg.thomas;
var joannaMsg = dataMsg.joanna;
var cycle = 1;

//Started Tracking on 3/4/2021

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  function status() {
    if (cycle == 1) {
      cycle = 2;
      client.user.setActivity(`${joannaMsg} messages from Joanna`);
    } else if (cycle == 2) {
      cycle = 3;
      client.user.setActivity(`${thomasMsg} messages from Thomas`);
    } else if (cycle == 3) {
      cycle = 1;
      client.user.setActivity(`${hours} hours and ${minutes} minutes`);
    }
  }
  status();
  setInterval(status, 60000 * config.status_interval)
  function check() {
    for(let i = 0; i < config.guild_id.length; ++i) {
      for(let j = 0; j < config.channel_id.length; ++j) {
        if (!client.guilds.cache.has(config.guild_id[i])) continue;
        if (!client.guilds.cache.get(config.guild_id[i]).channels.cache.has(config.channel_id[j])) continue;
        const channel = client.guilds.cache.get(config.guild_id[i]).channels.cache.get(config.channel_id[j]);
        if (channel.members.has('576154421579481090') && channel.members.has('473110112844644372')) {
          let tempTotalMinutes = total_minutes + config.check_interval;
          let tempHours = Math.floor(tempTotalMinutes / 60);
          let tempMinutes = tempTotalMinutes % 60;
          var tempData = {
            hours: tempHours,
            minutes: tempMinutes,
            total_minutes: tempTotalMinutes
          };
          let json = JSON.stringify(tempData);
          total_minutes = tempTotalMinutes;
          hours = tempHours;
          minutes = tempMinutes;
          fs.writeFileSync('general/data.json', json);
          console.log(`${tempHours} hours and ${tempMinutes} minutes`);
          return;
        }
      }
    }
  }
  setInterval(check, 60000 * config.check_interval);
});

client.on('message', msg => {
  //Joanna
  if (msg.author.id == '576154421579481090') {
    let tempJoannaMsg = joannaMsg + 1;
    var tempData = {
      thomas: thomasMsg,
      joanna: tempJoannaMsg
    };
    let json = JSON.stringify(tempData);
    joannaMsg = tempJoannaMsg;
    fs.writeFileSync('general/messages.json', json);
    console.log(`Joanna: ${tempJoannaMsg} messages`);
    return;
  } else if (msg.author.id == '473110112844644372') {
    let tempThomasMsg = thomasMsg + 1;
    var tempData = {
      thomas: tempThomasMsg,
      joanna: joannaMsg
    };
    let json = JSON.stringify(tempData);
    thomasMsg = tempThomasMsg;
    fs.writeFileSync('general/messages.json', json);
    console.log(`Thomas: ${tempThomasMsg} messages`);
    return;
  }
});

client.login(token.discord);