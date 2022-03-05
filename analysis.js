// const friends = require("./friends.json");
// const fm = require("./friends-mutual-arr.json");
const config = require("./config.json");
const token = config.token;

//console.log(friends.length);
const axios = require("axios");
const fs = require("fs");

const auth = {
  Authorization: token,
};

var friends;
var mutualFriends;
var mutualFriendsArray;
async function main() {
  friends = await downloadFriendsList();

  mutualFriends = await downloadMutualFriendsData();

  mutualFriendsArray = await calculateMutualFriendsArray();
}

async function calculateMutualFriendsArray() {
  if (!fs.existsSync("./friends-mutual-arr.json")) {
    console.log("mutual friends in array form doesn't exist, calculating");
    const mutualFriendsArray = Object.values(mutualFriends);
    fs.writeFileSync(
      "./friends-mutual-arr.json",
      JSON.stringify(mutualFriendsArray)
    );
    return mutualFriendsArray;
  }
  const mutualFriendsArray = fs.readFileSync("./friends-mutual-arr.json");
  console.log(mutualFriendsArray.toString());
  return JSON.parse(mutualFriendsArray);
}

async function downloadMutualFriendsData() {
  if (!fs.existsSync("./friends-mutuals.json")) {
    console.log(
      "mutual friends data doesn't exist, downloading mutuals for all friends"
    );
    console.log(`this operation should take about ${friends.length} seconds`);

    var newMap = {};
    async function mapMutuals(friend) {
      axios
        .get(`https://discord.com/api/v8/users/${friend.id}/relationships`, {
          headers: {
            Authorization: token,
          },
        })
        .then((e) => {
          newMap[friend.id] = {
            name: friend.user.username,
            id: friend.id,
            mutuals: e.data.map((ff) => {
              return { id: ff.id, name: ff.username };
            }),
          };
          console.log(
            `Friend ${friend.user.username} has ${
              e.data.length
            } mutual friends (${friends.indexOf(friend) + 1}/${friends.length})`
          );
        });
    }

    for (var i = 0; i < friends.length; i++) {
      var friend = friends[i];
      await mapMutuals(friend);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    fs.writeFileSync("friends-mutuals.json", JSON.stringify(newMap));
    return newMap;
  }
  return JSON.parse(fs.readFileSync("friends-mutuals.json"));
}

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

main();
