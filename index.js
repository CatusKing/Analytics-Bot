const Discord = require('discord.js');
const fs = require('fs');
const token = require('./general/token.json');
const data = require('./general/data.json');
const config = require('./general/config.json');
const client = new Discord.Client();
var total_minutes = data.total_minutes;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  function check() {
    for(let i = 0; i < config.guild_id.length; ++i) {
      for(let j = 0; j < config.channel_id.length; ++j) {
        if (!client.guilds.cache.has(config.guild_id[i])) continue;
        if (!client.guilds.cache.get(config.guild_id[i]).channels.cache.has(config.channel_id[j])) continue;
        const channel = client.guilds.cache.get(config.guild_id[i]).channels.cache.get(config.channel_id[j]);
        if (channel.members.has('576154421579481090') && channel.members.has('473110112844644372')) {
          let tempTotalMinutes = total_minutes + config.interval;
          let tempHours = Math.floor(tempTotalMinutes / 60);
          let tempMinutes = tempTotalMinutes % 60;
          var tempData = {
            hours: tempHours,
            minutes: tempMinutes,
            total_minutes: tempTotalMinutes
          };
          let json = JSON.stringify(tempData);
          total_minutes = tempTotalMinutes;
          fs.writeFileSync('general/data.json', json);
          client.user.setActivity(`${tempHours} hours and ${tempMinutes} minutes`);
          return;
        }
      }
    }
  }
  setInterval(check, 60000 * config.interval);
});

client.login(token.discord);