const Discord = require('discord.js');
const fs = require('fs');
const token = require('./general/token.json');
const data = require('./general/data.json');
const config = require('./general/config.json');
const dataMsg = require('./general/messages.json');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const client = new Discord.Client();
var total_minutes = data.total_minutes;
var hours = data.hours;
var minutes = data.minutes;
var thomasMsg = dataMsg.thomas;
var joannaMsg = dataMsg.joanna;
var statusCycle = 1;
var commandRateLimit = 0;

//Started Tracking on 3/4/2021

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  function rateLimit() {
    if (commandRateLimit < config.command_max_rate_limit) commandRateLimit += 1;
  }
  setInterval(rateLimit, 1000 * config.command_cooldown);
  function status() {
    if (statusCycle == 1) {
      statusCycle = 2;
      client.user.setActivity(`${joannaMsg} messages from Joanna`);
    } else if (statusCycle == 2) {
      statusCycle = 3;
      client.user.setActivity(`${thomasMsg} messages from Thomas`);
    } else if (statusCycle == 3) {
      statusCycle = 1;
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
  client.api.applications(client.user.id).commands.post({
    data: {
      name: "messages",
      description: "Shows how many messages either Thomas or Joanna has sent",
      // possible options here e.g. options: [{...}]
    }
  });
  client.api.applications(client.user.id).commands.post({
    data: {
      name: "vc",
      description: "Shows how many hours and minutues Thomas and Joanna have spent together",
    }
  });
  client.api.applications(client.user.id).commands.post({
    data: {
      name: "tos",
      description: "Sends the current TOS",
    }
  })
  client.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;

    function send(msg) {
      if (commandRateLimit <= 0) return;
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: msg
          }
        }
      })
      commandRateLimit -= 1;
    }
    switch (command) {
      case 'messages':
        let joannaMsgRounded = (Math.floor(joannaMsg / 100)) * 100;
        let thomasMsgRounded = (Math.floor(thomasMsg / 100)) * 100;
        send(`Joanna has sent ${joannaMsgRounded} messages and Thomas has sent ${thomasMsgRounded} messages\n*Data collection was started on 3/4/2021 for* ***ONLY THOMAS AND JOANNA***\nNew TOS do /tos`);
        break;
      case 'vc':
        send(`Joanna and Thomas have spent ${hours} hours together in vc\n*Data collection was started on 3/4/2021 for* ***ONLY THOMAS AND JOANNA***\nNew TOS do /tos`);
        break;
      case 'tos':
        send(`Hi so privacy is a thing so we are asking that\n1. You do not use the bot in a way that will get you information about us that isn't already publically avalible.\n2. You dont use the information provided in any way other than observation.\n3. We ask that you don't use this information in a stalker way. ie trying to figure out what we are doing by spamming the command.\n**If you are found breaking the TOS or abusing the bot you will be banned from the servers that contain the bot.**`);
        break;
    }
  });
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