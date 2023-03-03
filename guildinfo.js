const guild = 294711283217858560;

const std = require("./common")();

std.client.getRESTGuildChannels(guild).then((guild) => {
  console.log(guild.map((e) => e.name).join(", "));
});
