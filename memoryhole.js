const config = require("./config.json");
const token = config.token;

const axios = require("axios");

const startingMessageId = "957980313605255179";
const channel = "895938036083355679";
const targetAuthorId = "255950165200994307";

async function main() {
  var c = 0;
  while (c < 100) {
    var r = await deleteBefore(startingMessageId);
    c += r.messages;
    id = r.next;
    if (r.messages === 0) {
      break;
    }
  }
}

async function deleteBefore(id) {
  const m = await axios.get(
    `https://discord.com/api/v8/channels/${channel}/messages?before=${id}&limit=100`,
    {
      headers: {
        Authorization: token,
      },
    }
  );

  const e = m.data.filter((e) => e.author.id === targetAuthorId);
  const newid = e[e.length - 1];

  for (var i = 0; i < e.length; i++) {
    var msg = e[i];
    await axios.delete(
      `https://discord.com/api/v8/channels/${channel}/messages/${msg.id}`,
      { headers: { Authorization: token } }
    );
    console.log("deleted " + msg.id);
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  console.log(newid.id);
  return { next: newid.id, messages: e.length };
}

main();
