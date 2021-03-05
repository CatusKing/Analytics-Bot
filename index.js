const Discord = require('discord.js');
const fs = require('fs');
const token = require('./general/token.json');
const data = require('./general/data.json');
const client = new Discord.Client();
var total_minutes = data.total_minutes;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  function check() {
    const channel = client.guilds.cache.get('787210175442190356').channels.cache.get('787210175442190363');
    if (channel.members.has('576154421579481090') && channel.members.has('473110112844644372')) {
      let tempTotalMinutes = total_minutes + 5;
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
      client.user.setActivity(`Hours: ${tempHours}`);
    }
  }
  setInterval(check, 300000);
});

client.login(token.discord);