const config = require("./config.json");
const token = config.token;

//console.log(friends.length);
const axios = require("axios");
const fs = require("fs");
const Eris = require("eris");

const auth = {
  Authorization: token,
};

const std = require("./common")();
const client = std.client;

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

async function downloadFriendsWithMutualGuilds(friends) {
  if (!fs.existsSync("./friends-guilds.json")) {
    console.log(
      "[friends-guilds.json] friends-guilds list doesn't exist, downloading"
    );

    var knownguilds = {};
    var knownguilds_named = {};

    for (var i = 0; i < friends.length; i++) {
      var friend = friends[i];
      var response = await client.requestHandler.request(
        "GET",
        `/users/${friend.id}/profile`,
        true,
        { with_mutual_guilds: true }
      );
      console.log(
        `${i + 1}/${friends.length} - friend ${friend.user.username} has ${
          response.mutual_guilds?.length
        } mutual guilds`
      );
      for (let mutualGuild of response.mutual_guilds) {
        if (knownguilds[mutualGuild.id]) {
          knownguilds[mutualGuild.id].push(friend.user.username);
        } else knownguilds[mutualGuild.id] = [friend.user.username];
      }
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
async function main() {
  var friends = await downloadFriendsList();
  var mguilds = await downloadFriendsWithMutualGuilds(friends);
}

main();
