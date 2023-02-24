const config = require("./config.json");
const token = config.token;

const axios = require("axios");
const Eris = require("eris");
const WAIT = 600;

// Start deleting messages before this ID
const startingMessageId = "1063250172903178332";

// Target channel
const channel = "951301187334983691";

// Only delete messages by this author
const targetAuthorId = "255950165200994307";

const client = new Eris.Client(token);
async function main() {
  var c = 0;
  var id = startingMessageId;
  while (c < 100) {
    var r = await deleteBeforeAndIncluding(id);
    c += r.messages;
    id = r.next;
    if (r.messages === -1) {
      break;
    }
  }
}

async function deleteBeforeAndIncluding(id, csize = 100) {
  const block = await client.getMessages(channel, { before: id, limit: csize });
  console.log(`opening block ${id} with blocksize ${block.length}`);

  const e = block.filter((e) => e.author.id === targetAuthorId);

  console.log(`reading ${e.length} messages from author..`);
  const newid = block[block.length - 1];
  if (!newid) {
    console.log("reached end of channel, or invalid message id. ending");
    return { next: null, messages: -1 };
  }

  var time = Date.now();
  for (var i = 0; i < e.length; i++) {
    var msg = e[i];
    await client.deleteMessage(channel, msg.id);
    console.log(
      `deleted ${msg.id} - ${i + 1} messages deleted from current block`
    );
  }
  console.log(
    `block finished, moving to ${newid.id} - deleted ${i + 1} messages in ${
      Date.now() - time
    }msec`
  );
  return { next: newid.id, messages: e.length };
}

main();
