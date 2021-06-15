const Discord = require('discord.js');
const fs = require('fs');
const token = require('./general/token.json');
const data = require('./general/data.json');
const config = require('./general/config.json');
const dataMsg = require('./general/messages.json');
const { uptime } = require('process');
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
  rateLimit();
  setInterval(rateLimit, 1000 * config.command_cooldown);
  function status() {
    let joannaMsgRounded = (Math.floor(joannaMsg / 100)) / 10;
    let thomasMsgRounded = (Math.floor(thomasMsg / 100)) / 10;
    if (statusCycle == 1) {
      statusCycle = 2;
      client.user.setActivity(`${joannaMsgRounded}k messages from Joanna`);
    } else if (statusCycle == 2) {
      statusCycle = 3;
      client.user.setActivity(`${thomasMsgRounded}k messages from Thomas`);
    } else if (statusCycle == 3) {
      statusCycle = 1;
      client.user.setActivity(`${hours} hours in vc`);
    }
  }
  status();
  setInterval(status, 60000 * config.status_interval)
  function check() {
    var guild_id = [];
    client.guilds.cache.forEach(g => {
      guild_id.push(g.id);
    });
    var channel_id = [];
    client.channels.cache.forEach(ch => {
      if (ch.type == 'voice') channel_id.push(ch.id);
    });
    for(let i = 0; i < guild_id.length; ++i) {
      for(let j = 0; j < channel_id.length; ++j) {
        if (!client.guilds.cache.has(guild_id[i])) continue;
        if (!client.guilds.cache.get(guild_id[i]).channels.cache.has(channel_id[j])) continue;
        const channel = client.guilds.cache.get(guild_id[i]).channels.cache.get(channel_id[j]);
        if (channel.members.has('576154421579481090') && channel.members.has('473110112844644372')) {
          let tempTotalMinutes = total_minutes + 1;
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
  setInterval(check, 60000);
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
      description: "Shows how many hours and minutes Thomas and Joanna have spent together",
    }
  });
  client.api.applications(client.user.id).commands.post({
    data: {
      name: "tos",
      description: "Sends the current TOS",
    }
  });
  client.api.applications(client.user.id).commands.post({
    data: {
      name: "rl",
      description: "Describes how rate limiting works for this bot",
    }
  });
  client.ws.on('INTERACTION_CREATE', async interaction => {
    const command = interaction.data.name.toLowerCase();
    let banned = false;
    let admin = false;
    const member = new Discord.GuildMember(client, interaction.member, client.guilds.cache.get(interaction.guild_id));
    for(let i = 0; i < config.banlist.length; ++i) {
      if (member.id == config.banlist[i]) {
        console.log(`${member.user.tag} just tried to run a command was denied due to an id ban`);
        banned = true;
      }
    }
    if (banned) {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: `Sorry you have been id banned :/\nIf you think this is a mistake contact CactusKing101#2624`
          }
        }
      });
      return;
    }
    for(let i = 0; i < config.admins.length; ++i) {
      if (member.id == config.admins[i]) {
        admin = true;
        break;
      }
    }

    let no = false;
    if (command == 'tos') {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: `Hi so privacy is a thing so we are asking that\n1. You do not use the bot in a way that will get you information about us that isn't already publicly available.\n2. You don't use the information provided in any way other than observation.\n3. We ask that you don't use this information in a stalker way. ie trying to figure out what we are doing by spamming the command.\n**If you are found breaking the TOS or abusing the bot you will be banned from using the bot.**`
          }
        }
      });
      no = true;
    } else if (command == 'rl') {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: `Hey so this is a quick explanation on how the rate limit is setup. Ok to start right now the ratelimit is at ${commandRateLimit}. Which means only ${commandRateLimit} command(s) can be run right now before it blocks you. This number slowly regenerates over time. Currently it adds 1 every ${config.command_cooldown} seconds. Not to mention this number is set to max at ${config.command_max_rate_limit}. Also all rate limiting is global. If you have anymore questions contact CactusKing101#2624`
          }
        }
      });
      no = true;
    }
    if (no) return;
    
    let anotherNo = false;
    if (commandRateLimit <= 0) {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: `Hey so funky thing you were just rate limited\nThis rate limit was added so that people cant spam and figure out what we are doing atm\nTo find out more about the rate limit do /rl`
          }
        }
      });
      anotherNo = true;
    }
    if (anotherNo) return;

    if (command == 'messages') {
      let joannaMsgRounded = (Math.floor(joannaMsg / 100)) / 10;
      let thomasMsgRounded = (Math.floor(thomasMsg / 100)) / 10;
      let content = '';
      if (admin) content = `Joanna has sent ${joannaMsgRounded}k(${joannaMsg}) messages and Thomas has sent ${thomasMsgRounded}k(${thomasMsg}) messages\n*Data collection was started on 3/4/2021 for* ***ONLY THOMAS AND JOANNA***`;
      else content = `Joanna has sent ${joannaMsgRounded}k messages and Thomas has sent ${thomasMsgRounded}k messages\n*Data collection was started on 3/4/2021 for* ***ONLY THOMAS AND JOANNA***`;
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: content
          }
        }
      });
      if (!admin) commandRateLimit -= 1;
    } else if (command == 'vc') {
      let content = '';
      if (admin) content = `Joanna and Thomas have spent ${hours} hours and ${minutes} minutes together in vc\n*Data collection was started on 3/4/2021 for* ***ONLY THOMAS AND JOANNA***`;
      else content = `Joanna and Thomas have spent ${hours} hours together in vc\n*Data collection was started on 3/4/2021 for* ***ONLY THOMAS AND JOANNA***`;
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: content
          }
        }
      });
      if (!admin) commandRateLimit -= 1;
    }
  });
});

client.on('message', msg => {
  if (msg.channel.type == 'dm' && (msg.author.id == '473110112844644372' || msg.author.id == '576154421579481090') && msg.content == '!debug') {
    let message = '';
    message += `total_minutes: ${total_minutes}\n`;
    message += `hours: ${hours}\n`;
    message += `minutes: ${minutes}\n`;
    message += `thomasMsg: ${thomasMsg}\n`;
    message += `joannaMsg: ${joannaMsg}\n`;
    message += `statusCycle: ${statusCycle}\n`;
    message += `commandRateLimit: ${commandRateLimit}\n`
    message += `uptime: ${uptime()}\n`
    msg.channel.send(message);
    return;
  }
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