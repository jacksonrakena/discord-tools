const config = require("./config.json");
const token = config.token;

//console.log(friends.length);
const axios = require("axios");
const fs = require("fs");

const auth = {
  Authorization: token,
};

async function downloadFriendsList() {
  if (!fs.existsSync("./friends.json")) {
    console.log("[friends.json] friends list doesn't exist, downloading");
    var response = await axios.default.get(
      "https://discord.com/api/v8/users/@me/relationships",
      {
        headers: auth,
      }
    );
    console.log(
      `finished downloading friends, downloaded ${response.data.length} friends`
    );
    fs.writeFileSync("./friends.json", JSON.stringify(response.data));
    return response.data;
  }
  return JSON.parse(fs.readFileSync("./friends.json"));
}

var knownguilds = {};
var knownguilds_named = {};
async function downloadFriendsWithMutualGuilds() {
  if (!fs.existsSync("./friends-guilds.json")) {
    console.log(
      "[friends-guilds.json] friends-guilds list doesn't exist, downloading"
    );
    var _mguilds = {};
    for (var i = 0; i < friends.length; i++) {
      var friend = friends[i];
      var response = await axios.default.get(
        `https://discord.com/api/v9/users/${friend.id}/profile?with_mutual_guilds=true`,
        { headers: auth }
      );
      response = response.data;
      console.log(
        `friend ${friend.user.username} has ${response.mutual_guilds?.length} mutual guilds`
      );
      for (var mgi = 0; mgi < response.mutual_guilds.length; mgi++) {
        if (Object.keys(knownguilds).includes(response.mutual_guilds[mgi].id)) {
          knownguilds[response.mutual_guilds[mgi].id].push(
            friend.user.username
          );
        } else {
          knownguilds[response.mutual_guilds[mgi].id] = [friend.user.username];
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log(
      `finished downloading friends w/ guilds, downloaded ${knownguilds.length} friends`
    );
    fs.writeFileSync("./friends-guilds.json", JSON.stringify(knownguilds));
  } else {
    knownguilds = JSON.parse(fs.readFileSync("./friends-guilds.json"));
  }
  for (var kgi = 0; kgi < Object.keys(knownguilds).length; kgi++) {
    var knownGuildId = Object.keys(knownguilds)[kgi];
    var response = (
      await axios.default.get(
        `https://discord.com/api/v8/guilds/${knownGuildId}`,
        { headers: auth }
      )
    ).data;

    console.log(`${knownGuildId}=${response.name}`);
    knownguilds_named[response.name] = knownguilds[knownGuildId];
  }
  fs.writeFileSync(
    "./friends-guilds-named.json",
    JSON.stringify(knownguilds_named)
  );
  return JSON.parse(fs.readFileSync("./friends-guilds.json"));
}
var friends;
var mguilds;
async function main() {
  friends = await downloadFriendsList();
  mguilds = await downloadFriendsWithMutualGuilds();
}

main();
